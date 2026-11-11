"""Thermostats regulated by Better Thermostat / Versatile Thermostat."""

from __future__ import annotations

from typing import Any

from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.homekit_manager.const import DOMAIN
from custom_components.homekit_manager.controllers import (
    async_controlled_by,
    async_controllers,
)
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar, entity_registry as er

CLIMATE_ATTRS = {
    "hvac_modes": ["off", "heat"],
    "current_temperature": 20.5,
    "temperature": 21,
    "min_temp": 5,
    "max_temp": 30,
    "supported_features": 1,
}


async def _setup(hass: HomeAssistant) -> str:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    await hass.config_entries.flow.async_configure(
        result["flow_id"], {"create_bridge": True, "bridge_name": "Wohnung"}
    )
    await hass.async_block_till_done()
    return hass.config_entries.async_entries("homekit")[0].entry_id


async def _ws(client, msg: dict[str, Any]) -> dict[str, Any]:
    await client.send_json_auto_id(msg)
    return await client.receive_json()


def _climate(
    hass: HomeAssistant, object_id: str, platform: str = "test", entry=None
) -> str:
    reg = er.async_get(hass).async_get_or_create(
        "climate",
        platform,
        object_id,
        suggested_object_id=object_id,
        config_entry=entry,
    )
    hass.states.async_set(reg.entity_id, "heat", CLIMATE_ATTRS)
    return reg.entity_id


def _better_thermostat(hass: HomeAssistant, name: str, trvs: list[str]) -> str:
    """A Better Thermostat entry (1.9 data layout) with its climate entity."""
    entry = MockConfigEntry(
        domain="better_thermostat",
        title=name,
        data={
            "name": name,
            "thermostat": [
                {"trv": trv, "integration": "mqtt", "advanced": {}} for trv in trvs
            ],
            "temperature_sensor": "sensor.vindstyrka_temperature",
            "humidity_sensor": "sensor.vindstyrka_humidity",
            "window_sensors": "binary_sensor.fenster",
            "cooler": None,
        },
    )
    entry.add_to_hass(hass)
    return _climate(hass, f"bt_{name.lower()}", "better_thermostat", entry)


async def test_detect_controllers(hass: HomeAssistant) -> None:
    """Regulated thermostats are read from the controllers' config entries."""
    trv = _climate(hass, "heizkoerper_wohnzimmer")
    trv2 = _climate(hass, "heizkoerper_fenster")
    bt = _better_thermostat(hass, "Wohnzimmer", [trv, trv2])

    # Versatile Thermostat "over climate" (plain list of entity ids)
    trv3 = _climate(hass, "heizkoerper_bad")
    vt_entry = MockConfigEntry(
        domain="versatile_thermostat",
        data={
            "name": "Bad",
            "thermostat_type": "thermostat_over_climate",
            "underlying_entity_ids": [trv3],
            "temperature_sensor_entity_id": "sensor.bad_temperatur",
        },
    )
    vt_entry.add_to_hass(hass)
    vt = _climate(hass, "vtherm_bad", "versatile_thermostat", vt_entry)

    # Central configuration entries have no climate entity of their own
    MockConfigEntry(
        domain="versatile_thermostat", data={"underlying_entity_ids": [trv3]}
    ).add_to_hass(hass)

    # A controller that is not loaded (no state) is ignored
    gone = _climate(hass, "heizkoerper_keller")
    gone_bt = _better_thermostat(hass, "Keller", [gone])
    hass.states.async_remove(gone_bt)

    controllers = async_controllers(hass)
    assert set(controllers) == {bt, vt}
    assert controllers[bt].controls == tuple(sorted([trv, trv2]))
    assert controllers[bt].title == "Better Thermostat"
    assert controllers[vt].controls == (trv3,)
    assert async_controlled_by(hass) == {trv: bt, trv2: bt, trv3: vt}


async def test_entities_report_controller(hass: HomeAssistant, hass_ws_client) -> None:
    """The panel learns which entity regulates a thermostat."""
    trv = _climate(hass, "heizkoerper_wohnzimmer")
    bt = _better_thermostat(hass, "Wohnzimmer", [trv])
    await _setup(hass)
    client = await hass_ws_client(hass)

    result = await _ws(client, {"type": "homekit_manager/entities"})
    assert result["success"], result
    data = result["result"]
    by_id = {e["entity_id"]: e for e in data["entities"]}
    assert by_id[trv]["controlled_by"] == bt
    assert by_id[bt]["controlled_by"] is None
    assert data["controllers"] == {
        bt: {
            "integration": "better_thermostat",
            "title": "Better Thermostat",
            "controls": [trv],
        }
    }


async def test_rules_prefer_controller(hass: HomeAssistant, hass_ws_client) -> None:
    """Rules add the regulating entity instead of the real thermostat."""
    area = ar.async_get(hass).async_create("Wohnzimmer")
    ent_reg = er.async_get(hass)
    trv = _climate(hass, "heizkoerper_wohnzimmer")
    plain = _climate(hass, "klima_wohnzimmer")
    # The Better Thermostat device usually has no area: it must still join
    bt = _better_thermostat(hass, "Wohnzimmer", [trv])
    for entity_id in (trv, plain):
        ent_reg.async_update_entity(entity_id, area_id=area.id)
    entry_id = await _setup(hass)
    client = await hass_ws_client(hass)

    preview = await _ws(
        client,
        {
            "type": "homekit_manager/rules/preview",
            "entry_id": entry_id,
            "areas": [area.id],
        },
    )
    assert preview["result"]["entities"] == sorted([bt, plain])

    result = await _ws(
        client,
        {
            "type": "homekit_manager/rules/set",
            "entry_id": entry_id,
            "enabled": True,
            "areas": [area.id],
        },
    )
    assert result["success"], result
    await hass.async_block_till_done()
    entry = hass.config_entries.async_get_entry(entry_id)
    assert entry.options["filter"]["include_entities"] == sorted([bt, plain])
