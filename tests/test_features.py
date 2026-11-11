"""Tests for renames, deleted entities, rules and entity options."""

from __future__ import annotations

from typing import Any

from custom_components.homekit_manager.const import DOMAIN
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    area_registry as ar,
    entity_registry as er,
    issue_registry as ir,
)


async def _setup(hass: HomeAssistant) -> str:
    """Set up HomeKit Manager with one bridge, return its entry id."""
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


def _registered(hass: HomeAssistant, domain: str, object_id: str, **kwargs) -> str:
    entry = er.async_get(hass).async_get_or_create(
        domain, "test", object_id, suggested_object_id=object_id, **kwargs
    )
    return entry.entity_id


def _filter(hass: HomeAssistant, entry_id: str) -> list[str]:
    entry = hass.config_entries.async_get_entry(entry_id)
    return entry.options["filter"]["include_entities"]


async def test_follow_entity_id_rename(hass: HomeAssistant, hass_ws_client) -> None:
    """Renaming an entity id keeps it in HomeKit with its options."""
    light = _registered(hass, "light", "lampe")
    battery = _registered(hass, "sensor", "lampe_batterie")
    hass.states.async_set(light, "on")
    hass.states.async_set(battery, "50", {"device_class": "battery"})
    entry_id = await _setup(hass)
    client = await hass_ws_client(hass)
    result = await _ws(
        client,
        {
            "type": "homekit_manager/bridge/assign",
            "entry_id": entry_id,
            "entities": [light],
            "entity_config": {
                light: {"name": "Decke", "linked_battery_sensor": battery}
            },
        },
    )
    assert result["success"], result

    ent_reg = er.async_get(hass)
    ent_reg.async_update_entity(light, new_entity_id="light.wohnzimmer_decke")
    ent_reg.async_update_entity(battery, new_entity_id="sensor.decke_batterie")
    await hass.async_block_till_done()

    entry = hass.config_entries.async_get_entry(entry_id)
    assert entry.options["filter"]["include_entities"] == ["light.wohnzimmer_decke"]
    conf = entry.options["entity_config"]["light.wohnzimmer_decke"]
    assert conf["name"] == "Decke"
    assert conf["linked_battery_sensor"] == "sensor.decke_batterie"
    assert light not in entry.options["entity_config"]


async def test_deleted_entities_raise_repair(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Deleted entities are reported and can be removed."""
    hass.states.async_set("switch.old", "on")
    hass.states.async_set("switch.keep", "on")
    entry_id = await _setup(hass)
    client = await hass_ws_client(hass)
    await _ws(
        client,
        {
            "type": "homekit_manager/bridge/assign",
            "entry_id": entry_id,
            "entities": ["switch.old", "switch.keep"],
        },
    )
    await hass.async_block_till_done()
    hass.states.async_remove("switch.old")

    manager = hass.data[DOMAIN]["manager"]
    manager.issues_enabled = True
    manager.async_update_issues()
    issue_id = f"missing_entities_{entry_id}"
    assert ir.async_get(hass).async_get_issue(DOMAIN, issue_id) is not None

    bridges = (await _ws(client, {"type": "homekit_manager/bridges"}))["result"]
    assert bridges["bridges"][0]["missing"] == ["switch.old"]

    result = await _ws(
        client, {"type": "homekit_manager/bridge/remove_missing", "entry_id": entry_id}
    )
    assert result["success"], result
    await hass.async_block_till_done()
    assert _filter(hass, entry_id) == ["switch.keep"]
    assert ir.async_get(hass).async_get_issue(DOMAIN, issue_id) is None


async def test_rules_by_area(hass: HomeAssistant, hass_ws_client) -> None:
    """Rules add matching entities, respect manual removals and follow changes."""
    area = ar.async_get(hass).async_create("Wohnzimmer")
    ent_reg = er.async_get(hass)
    lamp = _registered(hass, "light", "decke")
    plug = _registered(hass, "switch", "stehlampe")
    other = _registered(hass, "light", "flur")
    diag = _registered(
        hass, "switch", "debug", entity_category=er.EntityCategory.CONFIG
    )
    for entity_id in (lamp, plug, diag):
        ent_reg.async_update_entity(entity_id, area_id=area.id)
    for entity_id in (lamp, plug, other, diag):
        hass.states.async_set(entity_id, "on")
    entry_id = await _setup(hass)
    client = await hass_ws_client(hass)
    manager = hass.data[DOMAIN]["manager"]

    preview = await _ws(
        client,
        {
            "type": "homekit_manager/rules/preview",
            "entry_id": entry_id,
            "areas": [area.id],
        },
    )
    assert preview["result"]["entities"] == [lamp, plug]

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
    assert _filter(hass, entry_id) == [lamp, plug]
    assert result["result"]["bridge"]["rule"]["members"] == [lamp, plug]

    # Manual: remove the plug, add the hallway light
    await _ws(
        client,
        {
            "type": "homekit_manager/bridge/assign",
            "entry_id": entry_id,
            "entities": [lamp, other],
        },
    )
    await hass.async_block_till_done()
    await manager.async_sync_rules()
    await hass.async_block_till_done()
    assert _filter(hass, entry_id) == [lamp, other]
    assert manager.rules.get(entry_id).exclude == [plug]

    # A new entity in the area joins, the lamp leaves when it moves
    new = _registered(hass, "fan", "ventilator")
    ent_reg.async_update_entity(new, area_id=area.id)
    hass.states.async_set(new, "off")
    ent_reg.async_update_entity(lamp, area_id=None)
    await manager.async_sync_rules()
    await hass.async_block_till_done()
    assert _filter(hass, entry_id) == [new, other]


async def test_entity_options(hass: HomeAssistant, hass_ws_client) -> None:
    """Codes, media features, linked sensors and thresholds are validated."""
    hass.states.async_set("lock.door", "locked")
    hass.states.async_set(
        "media_player.speaker", "on", {"supported_features": 16384 | 128}
    )
    hass.states.async_set("sensor.door_battery", "80", {"device_class": "battery"})
    entry_id = await _setup(hass)
    client = await hass_ws_client(hass)

    result = await _ws(
        client,
        {
            "type": "homekit_manager/bridge/assign",
            "entry_id": entry_id,
            "entities": ["lock.door", "media_player.speaker"],
            "entity_config": {
                "lock.door": {
                    "code": "1234",
                    "linked_battery_sensor": "sensor.door_battery",
                    "low_battery_threshold": 15,
                },
                "media_player.speaker": {"feature_list": ["play_pause", "on_off"]},
            },
        },
    )
    assert result["success"], result
    bridge = result["result"]["bridge"]
    # The code is stored but never sent back to the browser
    assert bridge["entity_config"]["lock.door"] == {
        "has_code": True,
        "linked_battery_sensor": "sensor.door_battery",
        "low_battery_threshold": 15,
    }
    assert bridge["entity_config"]["media_player.speaker"] == {
        "feature_list": ["on_off", "play_pause"]
    }
    entry = hass.config_entries.async_get_entry(entry_id)
    assert entry.options["entity_config"]["lock.door"]["code"] == "1234"

    entities = (await _ws(client, {"type": "homekit_manager/entities"}))["result"]
    speaker = next(
        e for e in entities["entities"] if e["entity_id"] == "media_player.speaker"
    )
    assert speaker["media_features"] == ["on_off", "play_pause", "play_stop"]
    assert "linked_battery_sensor" in entities["link_fields"]

    for options, code in (
        ({"code": "1"}, "invalid_option"),
        ({"feature_list": ["dance"]}, "invalid_option"),
        ({"linked_battery_sensor": "light.x"}, "invalid_option"),
        ({"low_battery_threshold": 150}, "invalid_option"),
    ):
        entity_id = "media_player.speaker" if "code" in options else "lock.door"
        if "feature_list" in options:
            entity_id = "lock.door"
        result = await _ws(
            client,
            {
                "type": "homekit_manager/entity/options",
                "entry_id": entry_id,
                "entity_id": entity_id,
                "options": options,
            },
        )
        assert not result["success"], options
        assert result["error"]["code"] == code

    # Removing the code via the single-entity endpoint
    result = await _ws(
        client,
        {
            "type": "homekit_manager/entity/options",
            "entry_id": entry_id,
            "entity_id": "lock.door",
            "options": {"code": None},
        },
    )
    assert result["success"], result
    assert "has_code" not in result["result"]["bridge"]["entity_config"]["lock.door"]
