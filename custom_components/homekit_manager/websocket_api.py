"""Websocket API used by the HomeKit Manager panel."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from functools import wraps
import logging
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .bridge import BridgeError, BridgeManager
from .compat import INVALID_ERRORS, vol
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PREFIX = f"{DOMAIN}/"

type _Handler = Callable[
    [HomeAssistant, websocket_api.ActiveConnection, dict[str, Any], BridgeManager],
    Awaitable[None],
]


def _manager(hass: HomeAssistant) -> BridgeManager | None:
    data = hass.data.get(DOMAIN)
    return data.get("manager") if isinstance(data, dict) else None


def _with_manager(func: _Handler):
    """Resolve the manager and translate errors for the frontend."""

    @wraps(func)
    async def _wrapper(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        if (manager := _manager(hass)) is None:
            connection.send_error(
                msg["id"], "not_loaded", "HomeKit Manager is not loaded"
            )
            return
        try:
            await func(hass, connection, msg, manager)
        except BridgeError as err:
            connection.send_error(msg["id"], err.code, str(err))
        except INVALID_ERRORS as err:
            connection.send_error(msg["id"], "invalid_format", str(err))

    return _wrapper


@websocket_api.websocket_command({vol.Required("type"): PREFIX + "bridges"})
@websocket_api.require_admin
@websocket_api.async_response
@_with_manager
async def ws_bridges(hass, connection, msg, manager: BridgeManager) -> None:
    """List HomeKit bridges."""
    connection.send_result(msg["id"], {"bridges": manager.async_list()})


@websocket_api.websocket_command({vol.Required("type"): PREFIX + "entities"})
@websocket_api.require_admin
@websocket_api.async_response
@_with_manager
async def ws_entities(hass, connection, msg, manager: BridgeManager) -> None:
    """List entities that can be exposed to HomeKit."""
    connection.send_result(msg["id"], manager.async_entities())


@websocket_api.websocket_command(
    {vol.Required("type"): PREFIX + "pairing", vol.Required("entry_id"): str}
)
@websocket_api.require_admin
@websocket_api.async_response
@_with_manager
async def ws_pairing(hass, connection, msg, manager: BridgeManager) -> None:
    """Return the setup code and QR code of a bridge."""
    connection.send_result(msg["id"], await manager.async_pairing(msg["entry_id"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): PREFIX + "bridge/create",
        vol.Required("name"): str,
        vol.Optional("port"): vol.Coerce(int),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@_with_manager
async def ws_create(hass, connection, msg, manager: BridgeManager) -> None:
    """Create a new bridge."""
    bridge = await manager.async_create(msg["name"], msg.get("port"))
    connection.send_result(msg["id"], {"bridge": bridge})


@websocket_api.websocket_command(
    {
        vol.Required("type"): PREFIX + "bridge/settings",
        vol.Required("entry_id"): str,
        vol.Optional("name"): str,
        vol.Optional("port"): vol.Coerce(int),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@_with_manager
async def ws_settings(hass, connection, msg, manager: BridgeManager) -> None:
    """Rename a bridge or change its port."""
    bridge = await manager.async_update_settings(
        msg["entry_id"], msg.get("name"), msg.get("port")
    )
    connection.send_result(msg["id"], {"bridge": bridge})


@websocket_api.websocket_command(
    {
        vol.Required("type"): PREFIX + "accessory/create",
        vol.Required("entity_id"): str,
        vol.Optional("name"): str,
        vol.Optional("remove_from_bridges", default=True): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@_with_manager
async def ws_create_accessory(hass, connection, msg, manager: BridgeManager) -> None:
    """Create a HomeKit instance in accessory mode for one entity."""
    bridge = await manager.async_create_accessory(
        msg["entity_id"], msg.get("name"), msg["remove_from_bridges"]
    )
    connection.send_result(msg["id"], {"bridge": bridge})


_ENTITY_CONFIG_SCHEMA = vol.Schema(
    {
        str: vol.Schema(
            {
                vol.Optional("name"): vol.Any(None, str),
                vol.Optional("type"): vol.Any(None, str),
            }
        )
    }
)


@websocket_api.websocket_command(
    {
        vol.Required("type"): PREFIX + "bridge/assign",
        vol.Required("entry_id"): str,
        vol.Required("entities"): [str],
        vol.Optional("entity_config", default={}): _ENTITY_CONFIG_SCHEMA,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@_with_manager
async def ws_assign(hass, connection, msg, manager: BridgeManager) -> None:
    """Set the entities of a bridge."""
    bridge = await manager.async_set_entities(
        msg["entry_id"], msg["entities"], msg["entity_config"]
    )
    connection.send_result(msg["id"], {"bridge": bridge})


def _simple_bridge_command(command: str, method: str) -> Callable:
    @websocket_api.websocket_command(
        {vol.Required("type"): PREFIX + command, vol.Required("entry_id"): str}
    )
    @websocket_api.require_admin
    @websocket_api.async_response
    @_with_manager
    async def _handler(hass, connection, msg, manager: BridgeManager) -> None:
        result = await getattr(manager, method)(msg["entry_id"])
        connection.send_result(msg["id"], {"bridge": result})

    _handler.__name__ = f"ws_{command.replace('/', '_')}"
    return _handler


ws_adopt = _simple_bridge_command("bridge/adopt", "async_adopt")
ws_restart = _simple_bridge_command("bridge/restart", "async_restart")
ws_unpair = _simple_bridge_command("bridge/unpair", "async_unpair")
ws_delete = _simple_bridge_command("bridge/delete", "async_delete")


@callback
def async_register(hass: HomeAssistant) -> None:
    """Register all websocket commands (once per Home Assistant run)."""
    for handler in (
        ws_bridges,
        ws_entities,
        ws_pairing,
        ws_create,
        ws_create_accessory,
        ws_settings,
        ws_assign,
        ws_adopt,
        ws_restart,
        ws_unpair,
        ws_delete,
    ):
        websocket_api.async_register_command(hass, handler)
