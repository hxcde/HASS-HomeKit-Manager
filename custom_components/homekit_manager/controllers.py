"""Thermostats that are regulated by another climate entity.

Integrations like Better Thermostat wrap one or more real thermostats (TRVs)
in their own climate entity, which regulates by an external sensor. Exposing
the real thermostat to HomeKit would bypass that regulation, so the panel
and the rules prefer the wrapping entity.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from homeassistant.core import HomeAssistant, callback, valid_entity_id
from homeassistant.helpers import entity_registry as er

CLIMATE_DOMAIN = "climate"

# Integrations whose climate entity regulates other climate entities. The
# controlled entities are read from the config entry (data and options), so
# the exact keys do not matter: Better Thermostat ``thermostat``/``cooler``,
# Versatile Thermostat ``underlying_entity_ids`` (type "over climate").
CONTROLLER_INTEGRATIONS: dict[str, str] = {
    "better_thermostat": "Better Thermostat",
    "versatile_thermostat": "Versatile Thermostat",
}


@dataclass(frozen=True, slots=True)
class Controller:
    """A climate entity that regulates other climate entities."""

    entity_id: str
    integration: str
    title: str
    controls: tuple[str, ...]

    def as_dict(self) -> dict[str, Any]:
        """JSON for the panel."""
        return {
            "integration": self.integration,
            "title": self.title,
            "controls": list(self.controls),
        }


def _climate_ids(value: Any) -> set[str]:
    """All climate entity ids mentioned somewhere in ``value``."""
    found: set[str] = set()
    if isinstance(value, str):
        if value.startswith(f"{CLIMATE_DOMAIN}.") and valid_entity_id(value):
            found.add(value)
    elif isinstance(value, Mapping):  # config entry data is a MappingProxy
        for item in value.values():
            found |= _climate_ids(item)
    elif isinstance(value, (list, tuple, set)):
        for item in value:
            found |= _climate_ids(item)
    return found


@callback
def async_controllers(hass: HomeAssistant) -> dict[str, Controller]:
    """Controllers by entity id (only those whose entity exists)."""
    ent_reg = er.async_get(hass)
    result: dict[str, Controller] = {}
    for domain, title in CONTROLLER_INTEGRATIONS.items():
        for entry in hass.config_entries.async_entries(domain):
            own = sorted(
                reg.entity_id
                for reg in er.async_entries_for_config_entry(ent_reg, entry.entry_id)
                if reg.domain == CLIMATE_DOMAIN
            )
            # One climate entity per entry; central/default entries have none
            if len(own) != 1 or hass.states.get(own[0]) is None:
                continue
            entity_id = own[0]
            controls = (_climate_ids(entry.data) | _climate_ids(entry.options)) - {
                entity_id
            }
            if controls:
                result[entity_id] = Controller(
                    entity_id, domain, title, tuple(sorted(controls))
                )
    return result


@callback
def async_controlled_by(hass: HomeAssistant) -> dict[str, str]:
    """Map controlled climate entity -> controlling entity."""
    result: dict[str, str] = {}
    for controller in async_controllers(hass).values():
        for entity_id in controller.controls:
            result.setdefault(entity_id, controller.entity_id)
    return result
