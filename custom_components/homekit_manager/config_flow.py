"""Config flow for HomeKit Manager."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers import selector

from .bridge import NAME_MAX_LENGTH, BridgeError, BridgeManager, homekit_entries
from .compat import vol
from .const import (
    CONF_BRIDGE_NAME,
    CONF_SIDEBAR_ICON,
    CONF_SIDEBAR_TITLE,
    DEFAULT_BRIDGE_NAME,
    DEFAULT_SIDEBAR_ICON,
    DEFAULT_SIDEBAR_TITLE,
    DOMAIN,
    HK_MODE_BRIDGE,
)

_LOGGER = logging.getLogger(__name__)

CONF_CREATE_BRIDGE = "create_bridge"


class HomeKitManagerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Set up HomeKit Manager and create the first bridge."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Ask for the name of the first bridge."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        errors: dict[str, str] = {}
        existing = [
            entry
            for entry in homekit_entries(self.hass)
            if entry.options.get("mode", entry.data.get("mode", HK_MODE_BRIDGE))
            == HK_MODE_BRIDGE
        ]

        if user_input is not None:
            if user_input.get(CONF_CREATE_BRIDGE, True):
                try:
                    await BridgeManager(self.hass).async_create(
                        user_input[CONF_BRIDGE_NAME]
                    )
                except BridgeError as err:
                    _LOGGER.warning("Creating the HomeKit bridge failed: %s", err)
                    errors["base"] = (
                        err.code if err.code in ("invalid_name",) else "create_failed"
                    )
            if not errors:
                return self.async_create_entry(
                    title="HomeKit Manager",
                    data={},
                    options={
                        CONF_SIDEBAR_TITLE: DEFAULT_SIDEBAR_TITLE,
                        CONF_SIDEBAR_ICON: DEFAULT_SIDEBAR_ICON,
                    },
                )

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_CREATE_BRIDGE, default=not existing
                ): selector.BooleanSelector(),
                vol.Required(
                    CONF_BRIDGE_NAME,
                    default=(user_input or {}).get(
                        CONF_BRIDGE_NAME, DEFAULT_BRIDGE_NAME
                    ),
                ): selector.TextSelector(),
            }
        )
        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
            description_placeholders={
                "existing": str(len(existing)),
                "max_length": str(NAME_MAX_LENGTH),
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow."""
        return HomeKitManagerOptionsFlow()


class HomeKitManagerOptionsFlow(OptionsFlow):
    """Sidebar options."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Edit sidebar title and icon."""
        if user_input is not None:
            return self.async_create_entry(data=user_input)

        options = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_SIDEBAR_TITLE,
                    default=options.get(CONF_SIDEBAR_TITLE, DEFAULT_SIDEBAR_TITLE),
                ): selector.TextSelector(),
                vol.Required(
                    CONF_SIDEBAR_ICON,
                    default=options.get(CONF_SIDEBAR_ICON, DEFAULT_SIDEBAR_ICON),
                ): selector.IconSelector(),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
