"""Repair flows for HomeKit Manager."""

from __future__ import annotations

from typing import Any

from homeassistant.components.repairs import RepairsFlow
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import issue_registry as ir

from .compat import vol
from .const import DOMAIN


class MissingEntitiesRepairFlow(RepairsFlow):
    """Remove deleted entities from a HomeKit bridge or accessory."""

    def __init__(self, issue_id: str, entry_id: str) -> None:
        """Initialize."""
        self._issue_id = issue_id
        self._entry_id = entry_id

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Start the flow."""
        return await self.async_step_confirm()

    async def async_step_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Confirm and clean up."""
        if user_input is not None:
            manager = (self.hass.data.get(DOMAIN) or {}).get("manager")
            if manager is not None:
                await manager.async_remove_missing(self._entry_id)
            ir.async_delete_issue(self.hass, DOMAIN, self._issue_id)
            return self.async_create_entry(data={})

        issue = ir.async_get(self.hass).async_get_issue(DOMAIN, self._issue_id)
        placeholders = dict(issue.translation_placeholders or {}) if issue else {}
        return self.async_show_form(
            step_id="confirm",
            data_schema=vol.Schema({}),
            description_placeholders=placeholders,
        )


async def async_create_fix_flow(
    hass: HomeAssistant, issue_id: str, data: dict[str, Any] | None
) -> RepairsFlow:
    """Create the fix flow for an issue."""
    return MissingEntitiesRepairFlow(issue_id, (data or {}).get("entry_id", ""))
