"""Keep HomeKit instances in line with the entity registry.

- Entity id renames are followed immediately.
- Deleted entities raise a repair issue.
- Bridges with an automatic rule pick up new or changed entities.

Rule syncs and issue checks only start after a grace period following the
Home Assistant start, so integrations that load late are not mistaken for
deleted entities.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime
import logging
from typing import Any

from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
)
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.start import async_at_started

from .bridge import BridgeManager
from .const import MISSING_CHECK_COOLDOWN, RULES_SYNC_COOLDOWN, STARTUP_GRACE

_LOGGER = logging.getLogger(__name__)


def _optional_event(module_name: str, attr: str) -> Any | None:
    try:
        module = __import__(f"homeassistant.helpers.{module_name}", fromlist=[attr])
    except ImportError:  # pragma: no cover
        return None
    return getattr(module, attr, None)


@callback
def _is_new_entity(event_data: Any) -> bool:
    return event_data["old_state"] is None


class EntitySync:
    """Registry listeners driving renames, repair issues and rules."""

    def __init__(
        self,
        hass: HomeAssistant,
        manager: BridgeManager,
        grace: float = STARTUP_GRACE,
    ) -> None:
        """Initialize."""
        self.hass = hass
        self.manager = manager
        self._grace = grace
        self._ready = False
        self._unsubs: list[Callable[[], None]] = []
        self._rules_debouncer = Debouncer(
            hass,
            _LOGGER,
            cooldown=RULES_SYNC_COOLDOWN,
            immediate=False,
            function=self._async_sync_rules,
        )
        self._issues_debouncer = Debouncer(
            hass,
            _LOGGER,
            cooldown=MISSING_CHECK_COOLDOWN,
            immediate=False,
            function=self._async_check_issues,
        )

    @callback
    def async_start(self) -> None:
        """Register listeners."""
        bus = self.hass.bus
        self._unsubs.append(
            bus.async_listen(
                er.EVENT_ENTITY_REGISTRY_UPDATED, self._entity_registry_updated
            )
        )
        for event_type in (
            dr.EVENT_DEVICE_REGISTRY_UPDATED,
            ar.EVENT_AREA_REGISTRY_UPDATED,
            _optional_event("label_registry", "EVENT_LABEL_REGISTRY_UPDATED"),
            _optional_event("floor_registry", "EVENT_FLOOR_REGISTRY_UPDATED"),
        ):
            if event_type is not None:
                self._unsubs.append(
                    bus.async_listen(event_type, self._registry_changed)
                )
        self._unsubs.append(
            bus.async_listen(
                EVENT_STATE_CHANGED,
                self._entity_added,
                event_filter=_is_new_entity,
            )
        )
        self._unsubs.append(async_at_started(self.hass, self._async_started))

    @callback
    def async_stop(self) -> None:
        """Remove listeners."""
        while self._unsubs:
            self._unsubs.pop()()
        self._rules_debouncer.async_shutdown()
        self._issues_debouncer.async_shutdown()

    async def _async_started(self, hass: HomeAssistant) -> None:
        self._unsubs.append(async_call_later(hass, self._grace, self._grace_over))

    @callback
    def _grace_over(self, _now: datetime) -> None:
        self._ready = True
        self.manager.issues_enabled = True
        self.manager.async_update_issues()
        self.async_schedule_rules()

    @callback
    def async_schedule_rules(self) -> None:
        """Run the rule sync soon (debounced)."""
        if self._ready and self.manager.rules and self.manager.rules.active():
            self._rules_debouncer.async_schedule_call()

    @callback
    def _schedule_issue_check(self) -> None:
        if self._ready:
            self._issues_debouncer.async_schedule_call()

    @callback
    def _entity_registry_updated(self, event: Event) -> None:
        data = event.data
        old = data.get("old_entity_id")
        if data.get("action") == "update" and old and old != data.get("entity_id"):
            self.hass.async_create_task(
                self._async_rename(old, data["entity_id"]),
                f"homekit_manager rename {old}",
            )
        if data.get("action") == "remove":
            self._schedule_issue_check()
        self.async_schedule_rules()

    @callback
    def _registry_changed(self, event: Event) -> None:
        self.async_schedule_rules()

    @callback
    def _entity_added(self, event: Event) -> None:
        self._schedule_issue_check()
        self.async_schedule_rules()

    async def _async_rename(self, old: str, new: str) -> None:
        try:
            await self.manager.async_rename_entity(old, new)
        except HomeAssistantError as err:
            _LOGGER.warning("Could not follow rename %s -> %s: %s", old, new, err)

    async def _async_sync_rules(self) -> None:
        try:
            await self.manager.async_sync_rules()
        except HomeAssistantError as err:
            _LOGGER.warning("Automatic HomeKit assignment failed: %s", err)

    async def _async_check_issues(self) -> None:
        self.manager.async_update_issues()
