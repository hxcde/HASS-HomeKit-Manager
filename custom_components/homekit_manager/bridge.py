"""Manage HomeKit Bridge config entries of the core ``homekit`` integration.

HomeKit Manager does not implement the HomeKit Accessory Protocol itself.
It creates and configures bridges of Home Assistant's built-in HomeKit
integration and keeps their entity filter as an explicit list of entities.
That way pairing, accessory types, cameras etc. are handled by core.
"""

from __future__ import annotations

import asyncio
import base64
from collections import defaultdict
from collections.abc import Iterable
from copy import deepcopy
import io
import logging
import re
import time
from typing import Any

from homeassistant.config_entries import (
    SOURCE_IGNORE,
    SOURCE_IMPORT,
    SOURCE_USER,
    ConfigEntry,
    ConfigEntryState,
)
from homeassistant.const import CONF_ENTITY_ID, CONF_NAME, CONF_PORT
from homeassistant.core import CoreState, HomeAssistant, State, callback
from homeassistant.data_entry_flow import FlowResultType, InvalidData
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import (
    area_registry as ar,
    config_validation as cv,
    device_registry as dr,
    entity_registry as er,
)
from homeassistant.helpers.entityfilter import FILTER_SCHEMA, EntityFilter

from .accessory_types import (
    SUPPORTED_DOMAINS,
    entity_type_options,
    needs_accessory_mode,
    resolve_accessory_type,
)
from .const import (
    BRIDGE_START_TIMEOUT,
    EC_NAME,
    EC_TYPE,
    EXCLUDE_ALL_GLOB,
    HK_CONF_ENTITY_CONFIG,
    HK_CONF_EXCLUDE_ACCESSORY_MODE,
    HK_CONF_FILTER,
    HK_CONF_MODE,
    HK_MODE_ACCESSORY,
    HK_MODE_BRIDGE,
    HOMEKIT_DOMAIN,
    MANAGED_ENTITY_CONFIG_KEYS,
    MAX_BRIDGED_ACCESSORIES,
)

_LOGGER = logging.getLogger(__name__)

# Status values of homekit.HomeKit.status
STATUS_READY = 0
STATUS_RUNNING = 1
STATUS_STOPPED = 2
STATUS_WAIT = 3

_FILTER_KEYS = (
    "include_domains",
    "include_entities",
    "include_entity_globs",
    "exclude_domains",
    "exclude_entities",
    "exclude_entity_globs",
)

DEFAULT_CONFIG_FLOW_PORT = 21064
SOURCE_ACCESSORY = "accessory"

# HomeKit names end up in mDNS records; core only allows A-Z, 0-9 and spaces.
_TRANSLITERATION = str.maketrans(
    {"ä": "ae", "ö": "oe", "ü": "ue", "Ä": "Ae", "Ö": "Oe", "Ü": "Ue", "ß": "ss"}
)

NAME_MIN_LENGTH = 3
NAME_MAX_LENGTH = 25
ENTITY_NAME_MAX_LENGTH = 64
PORT_MIN = 1024
PORT_MAX = 65535


class BridgeError(HomeAssistantError):
    """Error raised for invalid bridge operations; ``code`` is sent to the UI."""

    def __init__(self, code: str, message: str) -> None:
        """Initialize the error."""
        super().__init__(message)
        self.code = code


# --------------------------------------------------------------------------
# Filter helpers
# --------------------------------------------------------------------------


def build_filter(entity_ids: Iterable[str]) -> dict[str, list[str]]:
    """Return an entity filter that includes exactly ``entity_ids``.

    An empty filter would include *every* entity, so an empty selection is
    expressed as "exclude everything".
    """
    entity_filter: dict[str, list[str]] = {key: [] for key in _FILTER_KEYS}
    if ids := sorted(set(entity_ids)):
        entity_filter["include_entities"] = ids
    else:
        entity_filter["exclude_entity_globs"] = [EXCLUDE_ALL_GLOB]
    return entity_filter


def _filter_dict(entry: ConfigEntry) -> dict[str, list[str]]:
    raw = entry.options.get(HK_CONF_FILTER, entry.data.get(HK_CONF_FILTER)) or {}
    return {key: list(raw.get(key) or []) for key in _FILTER_KEYS}


def is_explicit_filter(entity_filter: dict[str, list[str]]) -> bool:
    """Return True if the filter is a plain list of entities (or "nothing")."""
    if any(
        entity_filter[key]
        for key in (
            "include_domains",
            "include_entity_globs",
            "exclude_domains",
            "exclude_entities",
        )
    ):
        return False
    include = entity_filter["include_entities"]
    exclude_globs = entity_filter["exclude_entity_globs"]
    if include:
        return not exclude_globs
    return exclude_globs == [EXCLUDE_ALL_GLOB]


def _compiled_filter(entity_filter: dict[str, list[str]]) -> EntityFilter:
    return FILTER_SCHEMA(deepcopy(entity_filter))


# --------------------------------------------------------------------------
# Accessors for core HomeKit config entries / runtime objects
# --------------------------------------------------------------------------


def _entry_mode(entry: ConfigEntry) -> str:
    return entry.options.get(HK_CONF_MODE, entry.data.get(HK_CONF_MODE, HK_MODE_BRIDGE))


def homekit_entries(hass: HomeAssistant) -> list[ConfigEntry]:
    """Return all HomeKit config entries that are not ignored."""
    return [
        entry
        for entry in hass.config_entries.async_entries(HOMEKIT_DOMAIN)
        if entry.source != SOURCE_IGNORE
    ]


def _runtime_homekit(hass: HomeAssistant, entry: ConfigEntry) -> Any | None:
    """Return the running ``homekit.HomeKit`` object of an entry, if any."""
    if entry.state is not ConfigEntryState.LOADED:
        return None
    runtime = getattr(entry, "runtime_data", None)
    if (homekit := getattr(runtime, "homekit", None)) is not None:
        return homekit
    # Older core versions kept the object in hass.data
    legacy = hass.data.get(HOMEKIT_DOMAIN)
    if isinstance(legacy, dict) and isinstance(legacy.get(entry.entry_id), dict):
        return legacy[entry.entry_id].get("homekit")
    return None


def _status_name(entry: ConfigEntry, homekit: Any | None) -> str:
    if entry.disabled_by is not None:
        return "disabled"
    if entry.state is ConfigEntryState.SETUP_IN_PROGRESS:
        return "starting"
    if entry.state is ConfigEntryState.SETUP_RETRY:
        return "retry"
    if entry.state in (
        ConfigEntryState.SETUP_ERROR,
        ConfigEntryState.MIGRATION_ERROR,
        ConfigEntryState.FAILED_UNLOAD,
    ):
        return "error"
    if entry.state is not ConfigEntryState.LOADED:
        return "not_loaded"
    if homekit is None:
        return "not_loaded"
    status = getattr(homekit, "status", None)
    return {
        STATUS_READY: "starting",
        STATUS_WAIT: "starting",
        STATUS_RUNNING: "running",
        STATUS_STOPPED: "stopped",
    }.get(status, "unknown")


def _paired(homekit: Any | None) -> bool | None:
    driver = getattr(homekit, "driver", None)
    if driver is None:
        return None
    try:
        return bool(driver.state.paired)
    except AttributeError:
        return None


def _paired_clients(homekit: Any | None) -> int:
    driver = getattr(homekit, "driver", None)
    try:
        return len(driver.state.paired_clients) if driver else 0
    except AttributeError:
        return 0


def _pin(homekit: Any | None) -> str | None:
    driver = getattr(homekit, "driver", None)
    try:
        pin = driver.state.pincode if driver else None
    except AttributeError:
        return None
    if pin is None:
        return None
    return _format_pin(pin.decode() if isinstance(pin, bytes) else str(pin))


def _accessory_entity_ids(homekit: Any | None) -> set[str] | None:
    bridge = getattr(homekit, "bridge", None)
    if bridge is None:
        return None
    return {
        entity_id
        for acc in list(bridge.accessories.values())
        if (entity_id := getattr(acc, "entity_id", None))
    }


def _qr_data_url(uri: str) -> str | None:
    """Render the HomeKit setup URI as a QR code (pyqrcode ships with homekit)."""
    try:
        import pyqrcode  # noqa: PLC0415
    except ImportError:  # pragma: no cover - homekit requirement
        return None
    buffer = io.BytesIO()
    pyqrcode.create(uri).svg(
        buffer, scale=6, module_color="#000", background="#FFF", xmldecl=False
    )
    return "data:image/svg+xml;base64," + base64.b64encode(buffer.getvalue()).decode()


def _format_pin(pin: str) -> str:
    digits = pin.replace("-", "")
    if len(digits) == 8:
        return f"{digits[:3]}-{digits[3:5]}-{digits[5:]}"
    return pin


# --------------------------------------------------------------------------
# Manager
# --------------------------------------------------------------------------


class BridgeManager:
    """High level operations on HomeKit bridges."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the manager."""
        self.hass = hass
        self._locks: defaultdict[str, asyncio.Lock] = defaultdict(asyncio.Lock)
        self._create_lock = asyncio.Lock()

    # ---------------------------------------------------------------- read

    def _get_entry(self, entry_id: str) -> ConfigEntry:
        entry = self.hass.config_entries.async_get_entry(entry_id)
        if entry is None or entry.domain != HOMEKIT_DOMAIN:
            raise BridgeError("not_found", f"HomeKit bridge {entry_id} not found")
        return entry

    def _get_editable(self, entry_id: str) -> ConfigEntry:
        entry = self._get_entry(entry_id)
        if entry.source == SOURCE_IMPORT:
            raise BridgeError(
                "yaml_managed", "This HomeKit instance is configured in YAML"
            )
        return entry

    def _get_bridge(self, entry_id: str, *, manageable: bool = True) -> ConfigEntry:
        entry = self._get_entry(entry_id)
        if _entry_mode(entry) != HK_MODE_BRIDGE:
            raise BridgeError("not_a_bridge", "This HomeKit instance is not a bridge")
        if entry.source == SOURCE_IMPORT:
            raise BridgeError(
                "yaml_managed", "This bridge is configured in YAML and is read-only"
            )
        if manageable and not is_explicit_filter(_filter_dict(entry)):
            raise BridgeError(
                "not_managed", "Adopt the bridge before assigning entities"
            )
        return entry

    @callback
    def async_describe(self, entry: ConfigEntry) -> dict[str, Any]:
        """Return a JSON serialisable description of a HomeKit instance."""
        homekit = _runtime_homekit(self.hass, entry)
        entity_filter = _filter_dict(entry)
        explicit = is_explicit_filter(entity_filter)
        entity_config = entry.options.get(HK_CONF_ENTITY_CONFIG) or {}
        accessories = _accessory_entity_ids(homekit)
        return {
            "entry_id": entry.entry_id,
            "title": entry.title,
            "name": entry.data.get(CONF_NAME, entry.title),
            "port": entry.data.get(CONF_PORT),
            "mode": _entry_mode(entry),
            # The single entity of an accessory-mode instance
            "entity_id": (
                entity_filter["include_entities"][0]
                if _entry_mode(entry) == HK_MODE_ACCESSORY
                and entity_filter["include_entities"]
                else None
            ),
            "yaml": entry.source == SOURCE_IMPORT,
            "manageable": explicit and entry.source != SOURCE_IMPORT,
            "status": _status_name(entry, homekit),
            "paired": _paired(homekit),
            "paired_clients": _paired_clients(homekit),
            # The setup code changes on every restart until the bridge is paired
            "pin": _pin(homekit),
            "entities": sorted(entity_filter["include_entities"]) if explicit else [],
            "accessory_entities": sorted(accessories)
            if accessories is not None
            else None,
            "entity_config": {
                entity_id: {
                    key: value
                    for key, value in conf.items()
                    if key in MANAGED_ENTITY_CONFIG_KEYS
                }
                for entity_id, conf in entity_config.items()
                if isinstance(conf, dict)
            },
            "filter": None if explicit else entity_filter,
            "exclude_accessory_mode": bool(
                entry.data.get(HK_CONF_EXCLUDE_ACCESSORY_MODE, False)
            ),
            "disabled": entry.disabled_by is not None,
        }

    @callback
    def async_list(self) -> list[dict[str, Any]]:
        """Describe all HomeKit instances, bridges first."""
        described = [self.async_describe(entry) for entry in homekit_entries(self.hass)]
        return sorted(
            described,
            key=lambda item: (item["mode"] != HK_MODE_BRIDGE, item["name"].lower()),
        )

    async def async_pairing(self, entry_id: str) -> dict[str, Any]:
        """Return pairing information (setup code and QR code)."""
        entry = self._get_entry(entry_id)
        homekit = _runtime_homekit(self.hass, entry)
        driver = getattr(homekit, "driver", None)
        if driver is None:
            return {"available": False, "paired": None}
        uri = driver.accessory.xhm_uri()
        qr = await self.hass.async_add_executor_job(_qr_data_url, uri)
        return {
            "available": True,
            "paired": _paired(homekit),
            "paired_clients": _paired_clients(homekit),
            "pin": _pin(homekit),
            "setup_uri": uri,
            "qr": qr,
        }

    @callback
    def async_entities(self) -> dict[str, Any]:
        """Return all entities HomeKit can (potentially) expose."""
        hass = self.hass
        ent_reg = er.async_get(hass)
        dev_reg = dr.async_get(hass)
        area_reg = ar.async_get(hass)

        # Pre-compute membership per HomeKit instance
        memberships: list[tuple[str, Any]] = []
        for entry in homekit_entries(hass):
            entity_filter = _filter_dict(entry)
            if is_explicit_filter(entity_filter):
                members = set(entity_filter["include_entities"])
                memberships.append((entry.entry_id, members.__contains__))
            else:
                compiled = _compiled_filter(entity_filter)
                memberships.append(
                    (entry.entry_id, self._implicit_member_check(compiled))
                )

        entities: list[dict[str, Any]] = []
        for state in hass.states.async_all():
            if state.domain not in SUPPORTED_DOMAINS:
                continue
            entities.append(
                self._describe_entity(state, ent_reg, dev_reg, area_reg, memberships)
            )

        entities.sort(key=lambda item: (item["name"] or item["entity_id"]).lower())
        return {
            "entities": entities,
            "areas": {
                area.id: area.name
                for area in sorted(area_reg.async_list_areas(), key=lambda a: a.name)
            },
            "type_options": {k: list(v) for k, v in entity_type_options().items()},
            "max_accessories": MAX_BRIDGED_ACCESSORIES,
        }

    def _implicit_member_check(self, compiled: EntityFilter):
        ent_reg = er.async_get(self.hass)

        def _check(entity_id: str) -> bool:
            if not compiled(entity_id):
                return False
            if (reg := ent_reg.async_get(entity_id)) and (
                reg.entity_category is not None or reg.hidden_by is not None
            ):
                return compiled.explicitly_included(entity_id)
            return True

        return _check

    @staticmethod
    def _describe_entity(
        state: State,
        ent_reg: er.EntityRegistry,
        dev_reg: dr.DeviceRegistry,
        area_reg: ar.AreaRegistry,
        memberships: list[tuple[str, Any]],
    ) -> dict[str, Any]:
        entity_id = state.entity_id
        reg = ent_reg.async_get(entity_id)
        device = dev_reg.async_get(reg.device_id) if reg and reg.device_id else None
        area_id = (reg.area_id if reg else None) or (device.area_id if device else None)
        area = area_reg.async_get_area(area_id) if area_id else None
        accessory_type = resolve_accessory_type(state, None)
        return {
            "entity_id": entity_id,
            "name": state.name,
            "domain": state.domain,
            "device_class": state.attributes.get("device_class"),
            "icon": state.attributes.get("icon"),
            "area_id": area.id if area else None,
            "area": area.name if area else None,
            "device": (device.name_by_user or device.name) if device else None,
            "platform": reg.platform if reg else None,
            "entity_category": (
                str(reg.entity_category) if reg and reg.entity_category else None
            ),
            "hidden": bool(reg and reg.hidden_by),
            "accessory_type": accessory_type,
            "supported": accessory_type is not None,
            "needs_accessory_mode": needs_accessory_mode(state),
            "bridges": [
                entry_id for entry_id, member in memberships if member(entity_id)
            ],
        }

    # --------------------------------------------------------------- write

    async def async_wait_started(
        self,
        entry_id: str,
        previous: Any | None = None,
        timeout: float = BRIDGE_START_TIMEOUT,
    ) -> bool:
        """Wait until a (new) HomeKit instance of ``entry_id`` has started."""
        if self.hass.state is not CoreState.running:
            return False
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            entry = self.hass.config_entries.async_get_entry(entry_id)
            if entry is None or entry.disabled_by is not None:
                return False
            homekit = _runtime_homekit(self.hass, entry)
            if (
                homekit is not None
                and homekit is not previous
                and getattr(homekit, "status", None) in (STATUS_RUNNING, STATUS_STOPPED)
            ):
                return True
            if entry.state in (
                ConfigEntryState.SETUP_ERROR,
                ConfigEntryState.MIGRATION_ERROR,
                ConfigEntryState.FAILED_UNLOAD,
            ):
                return False
            await asyncio.sleep(0.25)
        _LOGGER.warning("HomeKit bridge %s did not start within %ss", entry_id, timeout)
        return False

    async def _async_apply(
        self,
        entry: ConfigEntry,
        *,
        data: dict[str, Any] | None = None,
        options: dict[str, Any] | None = None,
        title: str | None = None,
    ) -> bool:
        """Update the core entry and wait for the bridge to restart."""
        previous = _runtime_homekit(self.hass, entry)
        kwargs: dict[str, Any] = {}
        if data is not None:
            kwargs["data"] = data
        if options is not None:
            kwargs["options"] = options
        if title is not None:
            kwargs["title"] = title
        if not self.hass.config_entries.async_update_entry(entry, **kwargs):
            return False
        if entry.disabled_by is not None:
            return True
        # Core's update listener reloads the entry; imported entries are skipped
        # by that listener so reload them ourselves.
        if entry.source == SOURCE_IMPORT:
            await self.hass.config_entries.async_reload(entry.entry_id)
        await self.async_wait_started(entry.entry_id, previous)
        return True

    def _unique_name(self, requested: str, exclude_entry_id: str | None) -> str:
        used = {
            entry.data.get(CONF_NAME)
            for entry in homekit_entries(self.hass)
            if entry.entry_id != exclude_entry_id
        }
        if requested not in used:
            return requested
        for suffix in range(2, 100):
            candidate = f"{requested[: NAME_MAX_LENGTH - 3]} {suffix}"
            if candidate not in used:
                return candidate
        raise BridgeError("name_in_use", "Bridge name already in use")

    @staticmethod
    def _validate_name(name: str) -> str:
        name = re.sub("[^A-Za-z0-9 ]+", " ", str(name).translate(_TRANSLITERATION))
        name = " ".join(name.split())
        if not NAME_MIN_LENGTH <= len(name) <= NAME_MAX_LENGTH:
            raise BridgeError(
                "invalid_name",
                f"Name must be {NAME_MIN_LENGTH}-{NAME_MAX_LENGTH} characters",
            )
        return name

    def _validate_port(self, port: int, entry_id: str | None) -> int:
        if not PORT_MIN <= port <= PORT_MAX:
            raise BridgeError("invalid_port", f"Port must be {PORT_MIN}-{PORT_MAX}")
        for entry in homekit_entries(self.hass):
            if entry.entry_id != entry_id and entry.data.get(CONF_PORT) == port:
                raise BridgeError(
                    "port_in_use", f"Port {port} is used by {entry.title}"
                )
        try:
            from homeassistant.components.homekit.util import (  # noqa: PLC0415
                async_port_is_available,
            )
        except ImportError:  # pragma: no cover
            return port
        if not async_port_is_available(port):
            raise BridgeError("port_in_use", f"Port {port} is not available")
        return port

    async def _async_run_core_user_flow(self) -> ConfigEntry:
        """Create a HomeKit bridge entry through the core config flow."""
        flow = self.hass.config_entries.flow
        # "demo" is a domain no entity lives in, so the very first start of the
        # bridge exposes nothing until our explicit filter is written.
        for domains in (["demo"], []):
            result = await flow.async_init(
                HOMEKIT_DOMAIN, context={"source": SOURCE_USER}
            )
            try:
                for _ in range(5):
                    if result["type"] is FlowResultType.CREATE_ENTRY:
                        return result["result"]
                    if result["type"] is not FlowResultType.FORM:
                        raise BridgeError(
                            "create_failed",
                            f"HomeKit setup aborted: {result.get('reason')}",
                        )
                    step = result["step_id"]
                    if step == "user":
                        user_input: dict[str, Any] = {"include_domains": domains}
                    elif step == "pairing":
                        user_input = {}
                    else:
                        flow.async_abort(result["flow_id"])
                        raise BridgeError(
                            "create_failed", f"Unexpected HomeKit setup step {step}"
                        )
                    result = await flow.async_configure(result["flow_id"], user_input)
                flow.async_abort(result["flow_id"])
                raise BridgeError("create_failed", "HomeKit setup did not finish")
            except InvalidData:
                _LOGGER.debug("HomeKit flow rejected domains %s, retrying", domains)
                if result.get("flow_id") in {
                    progress["flow_id"] for progress in flow.async_progress()
                }:
                    flow.async_abort(result["flow_id"])
                continue
        raise BridgeError("create_failed", "Could not create a HomeKit bridge")

    async def async_create(self, name: str, port: int | None = None) -> dict[str, Any]:
        """Create a new, empty HomeKit bridge."""
        name = self._validate_name(name)
        async with self._create_lock:
            entry = await self._async_run_core_user_flow()
            async with self._locks[entry.entry_id]:
                await self.async_wait_started(entry.entry_id)
                name = self._unique_name(name, entry.entry_id)
                data = dict(entry.data)
                data[CONF_NAME] = name
                data[HK_CONF_EXCLUDE_ACCESSORY_MODE] = False
                if port is not None:
                    data[CONF_PORT] = self._validate_port(port, entry.entry_id)
                options = dict(entry.options)
                options[HK_CONF_MODE] = HK_MODE_BRIDGE
                options[HK_CONF_FILTER] = build_filter([])
                options[HK_CONF_ENTITY_CONFIG] = {}
                await self._async_apply(
                    entry,
                    data=data,
                    options=options,
                    title=f"{name}:{data[CONF_PORT]}",
                )
        _LOGGER.info("Created HomeKit bridge %s (%s)", name, entry.entry_id)
        return self.async_describe(entry)

    def _accessory_mode_entities(self) -> set[str]:
        return {
            entity_id
            for entry in homekit_entries(self.hass)
            if _entry_mode(entry) == HK_MODE_ACCESSORY
            for entity_id in _filter_dict(entry)["include_entities"]
        }

    def _next_free_port(self) -> int:
        try:
            from homeassistant.components.homekit.util import (  # noqa: PLC0415
                async_find_next_available_port,
            )
        except ImportError:  # pragma: no cover
            used = [e.data.get(CONF_PORT) or 0 for e in homekit_entries(self.hass)]
            return max([DEFAULT_CONFIG_FLOW_PORT - 1, *used]) + 1
        return async_find_next_available_port(self.hass, DEFAULT_CONFIG_FLOW_PORT)

    async def async_create_accessory(
        self,
        entity_id: str,
        name: str | None = None,
        remove_from_bridges: bool = True,
    ) -> dict[str, Any]:
        """Expose one entity as its own HomeKit accessory (accessory mode).

        Apple requires this for TVs, receivers, projectors, cameras, locks and
        activity remotes to get their full feature set in the Home app.
        """
        entity_id = cv.entity_id(entity_id)
        if (state := self.hass.states.get(entity_id)) is None:
            raise BridgeError("entity_not_found", f"Entity {entity_id} not found")
        if resolve_accessory_type(state, None) is None:
            raise BridgeError(
                "unsupported", f"HomeKit does not support {entity_id} as accessory"
            )
        if entity_id in self._accessory_mode_entities():
            raise BridgeError(
                "already_accessory", f"{entity_id} already is a HomeKit accessory"
            )
        if name is not None:
            name = self._validate_name(name)

        flow = self.hass.config_entries.flow
        async with self._create_lock:
            result = await flow.async_init(
                HOMEKIT_DOMAIN,
                context={"source": SOURCE_ACCESSORY},
                data={CONF_ENTITY_ID: entity_id, CONF_PORT: self._next_free_port()},
            )
            if result["type"] is not FlowResultType.CREATE_ENTRY:
                raise BridgeError(
                    "create_failed", f"HomeKit setup aborted: {result.get('reason')}"
                )
            entry: ConfigEntry = result["result"]
            async with self._locks[entry.entry_id]:
                await self.async_wait_started(entry.entry_id)
                if name and name != entry.data.get(CONF_NAME):
                    data = dict(entry.data)
                    data[CONF_NAME] = self._unique_name(name, entry.entry_id)
                    await self._async_apply(
                        entry,
                        data=data,
                        title=f"{data[CONF_NAME]}:{data[CONF_PORT]}",
                    )

        if remove_from_bridges:
            for bridge in homekit_entries(self.hass):
                entity_filter = _filter_dict(bridge)
                if (
                    _entry_mode(bridge) == HK_MODE_BRIDGE
                    and bridge.source != SOURCE_IMPORT
                    and is_explicit_filter(entity_filter)
                    and entity_id in entity_filter["include_entities"]
                ):
                    await self.async_set_entities(
                        bridge.entry_id,
                        [
                            other
                            for other in entity_filter["include_entities"]
                            if other != entity_id
                        ],
                    )
        _LOGGER.info("Created HomeKit accessory for %s (%s)", entity_id, entry.entry_id)
        return self.async_describe(entry)

    async def async_update_settings(
        self, entry_id: str, name: str | None = None, port: int | None = None
    ) -> dict[str, Any]:
        """Rename a bridge/accessory or change its port."""
        entry = self._get_editable(entry_id)
        async with self._locks[entry_id]:
            data = dict(entry.data)
            if name is not None:
                data[CONF_NAME] = self._unique_name(self._validate_name(name), entry_id)
            if port is not None and port != entry.data.get(CONF_PORT):
                data[CONF_PORT] = self._validate_port(port, entry_id)
            if data != dict(entry.data):
                await self._async_apply(
                    entry, data=data, title=f"{data[CONF_NAME]}:{data[CONF_PORT]}"
                )
        return self.async_describe(entry)

    async def async_set_entities(
        self,
        entry_id: str,
        entity_ids: list[str],
        entity_config: dict[str, dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """Replace the entity list of a bridge and patch per-entity options."""
        entry = self._get_bridge(entry_id)
        ids = sorted({cv.entity_id(entity_id) for entity_id in entity_ids})
        current = set(_filter_dict(entry)["include_entities"])
        if len(ids) > MAX_BRIDGED_ACCESSORIES and len(ids) > len(current):
            raise BridgeError(
                "too_many",
                f"A HomeKit bridge supports at most {MAX_BRIDGED_ACCESSORIES} accessories",
            )

        async with self._locks[entry_id]:
            options = deepcopy(dict(entry.options))
            options[HK_CONF_FILTER] = build_filter(ids)
            new_config: dict[str, dict[str, Any]] = deepcopy(
                dict(options.get(HK_CONF_ENTITY_CONFIG) or {})
            )
            type_changed: list[str] = []
            for raw_entity_id, patch in (entity_config or {}).items():
                entity_id = cv.entity_id(raw_entity_id)
                conf = dict(new_config.get(entity_id) or {})
                old_type = conf.get(EC_TYPE)
                for key in MANAGED_ENTITY_CONFIG_KEYS:
                    if key not in patch:
                        continue
                    if (
                        value := self._validate_entity_option(
                            entity_id, key, patch[key]
                        )
                    ) is None:
                        conf.pop(key, None)
                    else:
                        conf[key] = value
                # Accessories that already exist in Apple Home must be reset
                # when their type changes; new ones are created fresh anyway.
                if (
                    conf.get(EC_TYPE) != old_type
                    and entity_id in ids
                    and entity_id in current
                ):
                    type_changed.append(entity_id)
                if conf:
                    new_config[entity_id] = conf
                else:
                    new_config.pop(entity_id, None)
            options[HK_CONF_ENTITY_CONFIG] = new_config

            changed = await self._async_apply(entry, options=options)
            if changed and type_changed:
                # A reset takes ~10 s in core; do not block the UI on it.
                self.hass.async_create_task(
                    self._async_reset_accessories(type_changed),
                    f"homekit_manager reset {entry.entry_id}",
                )
        return self.async_describe(entry)

    @staticmethod
    def _validate_entity_option(entity_id: str, key: str, value: Any) -> Any:
        if value is None or (isinstance(value, str) and not value.strip()):
            return None
        if key == EC_NAME:
            value = " ".join(str(value).split())
            if len(value) > ENTITY_NAME_MAX_LENGTH:
                raise BridgeError("invalid_name", f"Name for {entity_id} is too long")
            return value
        if key == EC_TYPE:
            domain = entity_id.split(".", 1)[0]
            if value not in entity_type_options().get(domain, ()):
                raise BridgeError(
                    "invalid_type", f"Type {value} not valid for {entity_id}"
                )
            return value
        return None  # pragma: no cover

    async def _async_reset_accessories(self, entity_ids: list[str]) -> None:
        """Force HomeKit to rebuild accessories whose type changed."""
        if not self.hass.services.has_service(HOMEKIT_DOMAIN, "reset_accessory"):
            return
        try:
            await self.hass.services.async_call(
                HOMEKIT_DOMAIN,
                "reset_accessory",
                {"entity_id": entity_ids},
                blocking=True,
            )
        except HomeAssistantError as err:
            _LOGGER.warning("Could not reset accessories %s: %s", entity_ids, err)

    def _effective_entities(self, entry: ConfigEntry) -> list[str]:
        """Entities currently exposed by a bridge with an arbitrary filter."""
        if (
            running := _accessory_entity_ids(_runtime_homekit(self.hass, entry))
        ) is not None:
            return sorted(running)
        compiled = _compiled_filter(_filter_dict(entry))
        check = self._implicit_member_check(compiled)
        exclude_acc_mode = entry.data.get(HK_CONF_EXCLUDE_ACCESSORY_MODE, False)
        result = []
        for state in self.hass.states.async_all():
            if state.domain not in SUPPORTED_DOMAINS or not check(state.entity_id):
                continue
            if exclude_acc_mode and needs_accessory_mode(state):
                continue
            result.append(state.entity_id)
        return sorted(result)

    async def async_adopt(self, entry_id: str) -> dict[str, Any]:
        """Convert a bridge with domain/glob filters into an explicit entity list."""
        entry = self._get_bridge(entry_id, manageable=False)
        async with self._locks[entry_id]:
            if not is_explicit_filter(_filter_dict(entry)):
                ids = self._effective_entities(entry)
                options = deepcopy(dict(entry.options))
                options[HK_CONF_FILTER] = build_filter(ids)
                data = dict(entry.data)
                data[HK_CONF_EXCLUDE_ACCESSORY_MODE] = False
                await self._async_apply(entry, data=data, options=options)
                _LOGGER.info(
                    "Adopted HomeKit bridge %s with %s entities", entry.title, len(ids)
                )
        return self.async_describe(entry)

    async def async_restart(self, entry_id: str) -> dict[str, Any]:
        """Reload a HomeKit instance."""
        entry = self._get_entry(entry_id)
        async with self._locks[entry_id]:
            previous = _runtime_homekit(self.hass, entry)
            await self.hass.config_entries.async_reload(entry_id)
            await self.async_wait_started(entry_id, previous)
        return self.async_describe(entry)

    async def async_unpair(self, entry_id: str) -> dict[str, Any]:
        """Remove all pairings so the bridge can be paired again."""
        entry = self._get_entry(entry_id)
        homekit = _runtime_homekit(self.hass, entry)
        if homekit is None or getattr(homekit, "driver", None) is None:
            raise BridgeError("not_running", "The bridge is not running")
        device_id = self._bridge_device_id(entry)
        if device_id and self.hass.services.has_service(HOMEKIT_DOMAIN, "unpair"):
            await self.hass.services.async_call(
                HOMEKIT_DOMAIN, "unpair", {"device_id": device_id}, blocking=True
            )
        else:
            homekit.async_unpair()
        return self.async_describe(entry)

    def _bridge_device_id(self, entry: ConfigEntry) -> str | None:
        dev_reg = dr.async_get(self.hass)
        for device in dr.async_entries_for_config_entry(dev_reg, entry.entry_id):
            if any(
                ident[0] == HOMEKIT_DOMAIN and entry.entry_id in ident
                for ident in device.identifiers
            ):
                return device.id
        return None

    async def async_delete(self, entry_id: str) -> None:
        """Delete a HomeKit bridge (this removes it from Apple Home as well)."""
        entry = self._get_entry(entry_id)
        if entry.source == SOURCE_IMPORT:
            raise BridgeError(
                "yaml_managed", "Remove the bridge from configuration.yaml instead"
            )
        async with self._locks[entry_id]:
            await self.hass.config_entries.async_remove(entry_id)
        self._locks.pop(entry_id, None)
