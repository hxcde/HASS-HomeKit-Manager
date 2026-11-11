"""End-to-end tests: config flow, websocket API and core HomeKit entries."""

from __future__ import annotations

from typing import Any

from custom_components.homekit_manager.const import DOMAIN, PANEL_URL_PATH
from homeassistant import config_entries
from homeassistant.components.frontend import DATA_PANELS
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers.entityfilter import FILTER_SCHEMA
from homeassistant.setup import async_setup_component


def _homekit_entries(hass: HomeAssistant) -> list[config_entries.ConfigEntry]:
    return hass.config_entries.async_entries("homekit")


async def _setup(hass: HomeAssistant, bridge_name: str | None = "Wohnung") -> None:
    hass.states.async_set("light.kitchen", "on", {"friendly_name": "Kitchen"})
    hass.states.async_set("switch.plug", "off", {"friendly_name": "Plug"})
    hass.states.async_set(
        "sensor.temperature",
        "21",
        {"device_class": "temperature", "unit_of_measurement": "°C"},
    )
    hass.states.async_set("sensor.power", "5", {"unit_of_measurement": "W"})
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {"create_bridge": bridge_name is not None, "bridge_name": bridge_name or "x"},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()


async def _ws(client, msg: dict[str, Any]) -> dict[str, Any]:
    await client.send_json_auto_id(msg)
    return await client.receive_json()


async def test_config_flow_creates_empty_bridge(hass: HomeAssistant) -> None:
    """The first bridge is created with a filter that exposes nothing."""
    await _setup(hass)

    entries = _homekit_entries(hass)
    assert len(entries) == 1
    entry = entries[0]
    assert entry.source == config_entries.SOURCE_USER
    assert entry.data["name"] == "Wohnung"
    assert entry.data["exclude_accessory_mode"] is False
    assert entry.title == f"Wohnung:{entry.data['port']}"
    entity_filter = FILTER_SCHEMA(entry.options["filter"])
    assert not entity_filter("light.kitchen")
    assert PANEL_URL_PATH in hass.data[DATA_PANELS]


async def test_single_instance(hass: HomeAssistant) -> None:
    """Only one HomeKit Manager entry is allowed."""
    await _setup(hass)
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.ABORT


async def test_assign_entities(hass: HomeAssistant, hass_ws_client) -> None:
    """Assigning entities writes an explicit include list and entity options."""
    await _setup(hass)
    entry = _homekit_entries(hass)[0]
    client = await hass_ws_client(hass)

    bridges = await _ws(client, {"type": "homekit_manager/bridges"})
    assert bridges["success"]
    bridge = bridges["result"]["bridges"][0]
    assert bridge["manageable"] is True
    assert bridge["entities"] == []
    assert bridge["status"] == "running"

    entities = await _ws(client, {"type": "homekit_manager/entities"})
    by_id = {e["entity_id"]: e for e in entities["result"]["entities"]}
    assert by_id["sensor.temperature"]["supported"] is True
    assert by_id["sensor.power"]["supported"] is False
    assert by_id["switch.plug"]["accessory_type"] == "Switch"

    result = await _ws(
        client,
        {
            "type": "homekit_manager/bridge/assign",
            "entry_id": entry.entry_id,
            "entities": ["light.kitchen", "switch.plug"],
            "entity_config": {"switch.plug": {"type": "outlet", "name": "Steckdose"}},
        },
    )
    assert result["success"], result
    assert result["result"]["bridge"]["entities"] == ["light.kitchen", "switch.plug"]
    await hass.async_block_till_done()

    entry = hass.config_entries.async_get_entry(entry.entry_id)
    assert entry.options["filter"]["include_entities"] == [
        "light.kitchen",
        "switch.plug",
    ]
    assert entry.options["filter"]["exclude_entity_globs"] == []
    assert entry.options["entity_config"]["switch.plug"] == {
        "type": "outlet",
        "name": "Steckdose",
    }

    # Clearing options removes them again, an empty list exposes nothing
    result = await _ws(
        client,
        {
            "type": "homekit_manager/bridge/assign",
            "entry_id": entry.entry_id,
            "entities": [],
            "entity_config": {"switch.plug": {"type": None, "name": ""}},
        },
    )
    assert result["success"], result
    await hass.async_block_till_done()
    entry = hass.config_entries.async_get_entry(entry.entry_id)
    assert "switch.plug" not in entry.options["entity_config"]
    assert not FILTER_SCHEMA(entry.options["filter"])("light.kitchen")


async def test_assign_validation(hass: HomeAssistant, hass_ws_client) -> None:
    """Invalid types and unknown bridges are rejected."""
    await _setup(hass)
    entry = _homekit_entries(hass)[0]
    client = await hass_ws_client(hass)

    result = await _ws(
        client,
        {
            "type": "homekit_manager/bridge/assign",
            "entry_id": entry.entry_id,
            "entities": ["light.kitchen"],
            "entity_config": {"light.kitchen": {"type": "outlet"}},
        },
    )
    assert not result["success"]
    assert result["error"]["code"] == "invalid_type"

    result = await _ws(
        client,
        {"type": "homekit_manager/bridge/assign", "entry_id": "nope", "entities": []},
    )
    assert result["error"]["code"] == "not_found"


async def test_create_rename_delete(hass: HomeAssistant, hass_ws_client) -> None:
    """Bridges can be created, renamed and deleted from the panel."""
    await _setup(hass, bridge_name=None)
    assert _homekit_entries(hass) == []
    client = await hass_ws_client(hass)

    result = await _ws(
        client, {"type": "homekit_manager/bridge/create", "name": "Garten"}
    )
    assert result["success"], result
    entry_id = result["result"]["bridge"]["entry_id"]

    # Names are unique
    result = await _ws(
        client, {"type": "homekit_manager/bridge/create", "name": "Garten"}
    )
    assert result["result"]["bridge"]["name"] == "Garten 2"

    result = await _ws(
        client,
        {
            "type": "homekit_manager/bridge/settings",
            "entry_id": entry_id,
            "name": "Terrasse",
        },
    )
    assert result["success"], result
    entry = hass.config_entries.async_get_entry(entry_id)
    assert entry.data["name"] == "Terrasse"
    assert entry.title.startswith("Terrasse:")

    result = await _ws(
        client,
        {"type": "homekit_manager/bridge/settings", "entry_id": entry_id, "name": "x"},
    )
    assert result["error"]["code"] == "invalid_name"

    result = await _ws(
        client, {"type": "homekit_manager/bridge/delete", "entry_id": entry_id}
    )
    assert result["success"], result
    await hass.async_block_till_done()
    assert hass.config_entries.async_get_entry(entry_id) is None


async def test_adopt_domain_filter_bridge(hass: HomeAssistant, hass_ws_client) -> None:
    """A bridge created with the core dialog is converted to an entity list."""
    await _setup(hass, bridge_name=None)
    assert await async_setup_component(hass, "homekit", {})
    result = await hass.config_entries.flow.async_init(
        "homekit", context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"include_domains": ["light"]}
    )
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    entry = result["result"]
    await hass.async_block_till_done()

    client = await hass_ws_client(hass)
    bridges = (await _ws(client, {"type": "homekit_manager/bridges"}))["result"][
        "bridges"
    ]
    assert bridges[0]["manageable"] is False

    result = await _ws(
        client,
        {
            "type": "homekit_manager/bridge/assign",
            "entry_id": entry.entry_id,
            "entities": ["switch.plug"],
        },
    )
    assert result["error"]["code"] == "not_managed"

    result = await _ws(
        client, {"type": "homekit_manager/bridge/adopt", "entry_id": entry.entry_id}
    )
    assert result["success"], result
    assert result["result"]["bridge"]["manageable"] is True
    entry = hass.config_entries.async_get_entry(entry.entry_id)
    assert entry.options["filter"]["include_entities"] == ["light.kitchen"]
    assert entry.options["filter"]["include_domains"] == []


async def test_requires_admin(
    hass: HomeAssistant, hass_ws_client, hass_read_only_access_token
) -> None:
    """Non-admin users cannot use the API."""
    await _setup(hass)
    client = await hass_ws_client(hass, hass_read_only_access_token)
    result = await _ws(client, {"type": "homekit_manager/bridges"})
    assert not result["success"]
    assert result["error"]["code"] == "unauthorized"


async def test_unload_removes_panel(hass: HomeAssistant) -> None:
    """Unloading removes the sidebar panel but keeps the bridges."""
    await _setup(hass)
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert PANEL_URL_PATH not in hass.data[DATA_PANELS]
    assert len(_homekit_entries(hass)) == 1


async def test_accessory_mode_for_tv(hass: HomeAssistant, hass_ws_client) -> None:
    """A TV gets its own accessory-mode instance and leaves the bridge."""
    await _setup(hass)
    hass.states.async_set(
        "media_player.tv",
        "on",
        {"friendly_name": "Fernseher", "device_class": "tv", "supported_features": 0},
    )
    bridge = _homekit_entries(hass)[0]
    client = await hass_ws_client(hass)
    result = await _ws(
        client,
        {
            "type": "homekit_manager/bridge/assign",
            "entry_id": bridge.entry_id,
            "entities": ["light.kitchen", "media_player.tv"],
        },
    )
    assert result["success"], result

    entities = await _ws(client, {"type": "homekit_manager/entities"})
    tv = next(
        e for e in entities["result"]["entities"] if e["entity_id"] == "media_player.tv"
    )
    assert tv["needs_accessory_mode"] is True
    assert tv["accessory_type"] == "TelevisionMediaPlayer"

    result = await _ws(
        client,
        {
            "type": "homekit_manager/accessory/create",
            "entity_id": "media_player.tv",
            "name": "Wohnzimmer TV",
        },
    )
    assert result["success"], result
    accessory = result["result"]["bridge"]
    assert accessory["mode"] == "accessory"
    assert accessory["entity_id"] == "media_player.tv"
    assert accessory["name"] == "Wohnzimmer TV"
    await hass.async_block_till_done()

    entry = hass.config_entries.async_get_entry(accessory["entry_id"])
    assert entry.options["mode"] == "accessory"
    assert entry.options["filter"]["include_entities"] == ["media_player.tv"]
    # Removed from the bridge so it does not show up twice in Apple Home
    bridge = hass.config_entries.async_get_entry(bridge.entry_id)
    assert bridge.options["filter"]["include_entities"] == ["light.kitchen"]

    # Only one accessory instance per entity
    result = await _ws(
        client,
        {"type": "homekit_manager/accessory/create", "entity_id": "media_player.tv"},
    )
    assert result["error"]["code"] == "already_accessory"

    # Accessory instances are not bridges
    result = await _ws(
        client,
        {
            "type": "homekit_manager/bridge/assign",
            "entry_id": accessory["entry_id"],
            "entities": [],
        },
    )
    assert result["error"]["code"] == "not_a_bridge"

    result = await _ws(
        client,
        {"type": "homekit_manager/bridge/delete", "entry_id": accessory["entry_id"]},
    )
    assert result["success"], result


async def test_names_are_mdns_safe(hass: HomeAssistant, hass_ws_client) -> None:
    """Umlauts are transliterated and special characters removed."""
    await _setup(hass, bridge_name=None)
    client = await hass_ws_client(hass)
    result = await _ws(
        client, {"type": "homekit_manager/bridge/create", "name": "Küche & Bad!"}
    )
    assert result["result"]["bridge"]["name"] == "Kueche Bad"
