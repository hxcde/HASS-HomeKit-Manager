"""Tests for the entity filter helpers."""

from __future__ import annotations

from custom_components.homekit_manager.bridge import build_filter, is_explicit_filter
from homeassistant.helpers.entityfilter import FILTER_SCHEMA

EMPTY = {
    "include_domains": [],
    "include_entities": [],
    "include_entity_globs": [],
    "exclude_domains": [],
    "exclude_entities": [],
    "exclude_entity_globs": [],
}


def test_build_filter_includes_exactly_the_entities() -> None:
    """Only the selected entities pass the filter."""
    entity_filter = build_filter(["switch.b", "light.a", "light.a"])
    assert entity_filter["include_entities"] == ["light.a", "switch.b"]
    compiled = FILTER_SCHEMA(entity_filter)
    assert compiled("light.a")
    assert compiled("switch.b")
    assert not compiled("light.other")
    assert is_explicit_filter(entity_filter)


def test_empty_selection_exposes_nothing() -> None:
    """An empty selection must not turn into the 'include all' filter."""
    entity_filter = build_filter([])
    compiled = FILTER_SCHEMA(entity_filter)
    assert not compiled("light.a")
    assert not compiled("sensor.temperature")
    assert is_explicit_filter(entity_filter)


def test_domain_filters_are_not_explicit() -> None:
    """Filters created by the core dialog need to be adopted first."""
    assert not is_explicit_filter({**EMPTY, "include_domains": ["light"]})
    assert not is_explicit_filter(
        {**EMPTY, "include_entities": ["light.a"], "exclude_entities": ["light.b"]}
    )
    # Completely empty means "everything" in core, so it is not a plain list
    assert not is_explicit_filter(EMPTY)
