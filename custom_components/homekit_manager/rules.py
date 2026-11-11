"""Automatic assignment rules: labels, areas, floors and entity types.

A rule adds every matching entity to its bridge. Entities a user removes by
hand while they match end up in ``exclude``; entities that stop matching are
removed again, but only if the rule added them (``members``). Entities that
were added by hand are never touched.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
)
from homeassistant.helpers.storage import Store

from .accessory_types import SUPPORTED_DOMAINS, resolve_accessory_type
from .const import RULES_STORAGE_KEY, RULES_STORAGE_VERSION
from .controllers import async_controlled_by


@dataclass
class Rule:
    """Assignment rule of one bridge."""

    enabled: bool = False
    labels: list[str] = field(default_factory=list)
    areas: list[str] = field(default_factory=list)
    floors: list[str] = field(default_factory=list)
    domains: list[str] = field(default_factory=list)
    exclude: list[str] = field(default_factory=list)
    members: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> Rule:
        """Create from stored data, ignoring unknown keys."""
        data = data or {}
        return cls(
            enabled=bool(data.get("enabled", False)),
            **{
                key: sorted({str(v) for v in data.get(key) or []})
                for key in (
                    "labels",
                    "areas",
                    "floors",
                    "domains",
                    "exclude",
                    "members",
                )
            },
        )

    def as_dict(self) -> dict[str, Any]:
        """Serialize."""
        return asdict(self)

    @property
    def has_criteria(self) -> bool:
        """True if the rule selects anything at all."""
        return bool(self.labels or self.areas or self.floors or self.domains)


class RulesStore:
    """Persist rules per HomeKit config entry."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize."""
        self._store: Store[dict[str, Any]] = Store(
            hass, RULES_STORAGE_VERSION, RULES_STORAGE_KEY
        )
        self._rules: dict[str, Rule] = {}

    async def async_load(self) -> None:
        """Load rules from disk."""
        data = await self._store.async_load() or {}
        self._rules = {
            entry_id: Rule.from_dict(raw)
            for entry_id, raw in (data.get("bridges") or {}).items()
        }

    @callback
    def _schedule_save(self) -> None:
        self._store.async_delay_save(
            lambda: {
                "bridges": {
                    entry_id: rule.as_dict() for entry_id, rule in self._rules.items()
                }
            },
            1,
        )

    def get(self, entry_id: str) -> Rule:
        """Return the rule of a bridge (a disabled default if none)."""
        return self._rules.get(entry_id) or Rule()

    def has(self, entry_id: str) -> bool:
        """Return True if the bridge has a stored rule."""
        return entry_id in self._rules

    def active(self) -> dict[str, Rule]:
        """Enabled rules by entry id."""
        return {k: r for k, r in self._rules.items() if r.enabled and r.has_criteria}

    @callback
    def set(self, entry_id: str, rule: Rule) -> None:
        """Store a rule."""
        self._rules[entry_id] = rule
        self._schedule_save()

    @callback
    def remove(self, entry_id: str) -> None:
        """Forget the rule of a deleted bridge."""
        if self._rules.pop(entry_id, None) is not None:
            self._schedule_save()

    @callback
    def rename_entity(self, old: str, new: str) -> None:
        """Follow an entity id rename in exclude/member lists."""
        changed = False
        for rule in self._rules.values():
            for attr in ("exclude", "members"):
                values: list[str] = getattr(rule, attr)
                if old in values:
                    setattr(
                        rule, attr, sorted({new if v == old else v for v in values})
                    )
                    changed = True
        if changed:
            self._schedule_save()


@callback
def evaluate_rule(hass: HomeAssistant, rule: Rule, taken: set[str]) -> set[str]:
    """Entities matching ``rule`` (before exclusions).

    ``taken`` are entities paired as standalone accessory; they never join a
    bridge automatically. Hidden and diagnostic entities only match by label.
    A thermostat regulated by e.g. Better Thermostat is replaced by the
    regulating entity, so HomeKit does not bypass the regulation; an
    original the user excluded keeps its regulating entity out as well.
    """
    if not rule.has_criteria:
        return set()
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    area_reg = ar.async_get(hass)
    labels = set(rule.labels)
    areas = set(rule.areas)
    floors = set(rule.floors)
    domains = set(rule.domains)
    place_rule = bool(labels or areas or floors)
    controlled_by = async_controlled_by(hass)
    excluded = set(rule.exclude)

    def _labels(reg: er.RegistryEntry | None) -> set[str]:
        device = dev_reg.async_get(reg.device_id) if reg and reg.device_id else None
        return set(reg.labels if reg else ()) | set(device.labels if device else ())

    def _controller_eligible(controller: str) -> bool:
        """The regulating entity joins regardless of its own area, but a
        hidden/diagnostic one still only through a matching label."""
        if controller in taken:
            return False
        state = hass.states.get(controller)
        if state is None or resolve_accessory_type(state, None) is None:
            return False
        reg = ent_reg.async_get(controller)
        if reg and (reg.entity_category or reg.hidden_by):
            return bool(labels & _labels(reg))
        return True

    result: set[str] = set()
    for state in hass.states.async_all():
        entity_id = state.entity_id
        domain = state.domain
        if domain not in SUPPORTED_DOMAINS or entity_id in taken:
            continue
        if domains and domain not in domains:
            continue
        if resolve_accessory_type(state, None) is None:
            continue
        reg = ent_reg.async_get(entity_id)
        device = dev_reg.async_get(reg.device_id) if reg and reg.device_id else None
        label_match = bool(labels & _labels(reg))
        if place_rule and not label_match:
            area_id = (reg.area_id if reg else None) or (
                device.area_id if device else None
            )
            area = area_reg.async_get_area(area_id) if area_id else None
            if not (
                (area_id and area_id in areas)
                or (area and area.floor_id and area.floor_id in floors)
            ):
                continue
        if reg and (reg.entity_category or reg.hidden_by) and not label_match:
            continue
        if (controller := controlled_by.get(entity_id)) is not None:
            if entity_id not in excluded and _controller_eligible(controller):
                result.add(controller)
            continue
        result.add(entity_id)
    return result
