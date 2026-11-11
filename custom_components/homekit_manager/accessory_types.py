"""Predict how the core HomeKit integration will expose an entity.

This mirrors ``homeassistant.components.homekit.accessories.get_accessory``
without instantiating any accessory, so the panel can show which HomeKit
accessory type an entity becomes and whether it is supported at all.
"""

from __future__ import annotations

from typing import Any

from homeassistant.const import (
    ATTR_DEVICE_CLASS,
    ATTR_SUPPORTED_FEATURES,
    ATTR_UNIT_OF_MEASUREMENT,
    LIGHT_LUX,
    PERCENTAGE,
    UnitOfTemperature,
)
from homeassistant.core import State

from .const import EC_TYPE

try:  # Prefer the list maintained by core, fall back to a snapshot
    from homeassistant.components.homekit.config_flow import (
        SUPPORTED_DOMAINS as _CORE_SUPPORTED_DOMAINS,
    )
except ImportError:  # pragma: no cover - depends on core version
    _CORE_SUPPORTED_DOMAINS = []

_FALLBACK_SUPPORTED_DOMAINS = [
    "alarm_control_panel",
    "automation",
    "binary_sensor",
    "button",
    "camera",
    "climate",
    "cover",
    "device_tracker",
    "fan",
    "humidifier",
    "input_boolean",
    "input_button",
    "input_select",
    "lawn_mower",
    "light",
    "lock",
    "media_player",
    "person",
    "remote",
    "scene",
    "script",
    "select",
    "sensor",
    "switch",
    "vacuum",
    "valve",
    "water_heater",
]

SUPPORTED_DOMAINS: frozenset[str] = frozenset(
    _CORE_SUPPORTED_DOMAINS or _FALLBACK_SUPPORTED_DOMAINS
) - {"demo"}

# Feature bits (kept local to avoid importing every entity component)
_COVER_OPEN = 1
_COVER_CLOSE = 2
_COVER_SET_POSITION = 4
_COVER_SET_TILT_POSITION = 128
_REMOTE_ACTIVITY = 4
_LAWN_MOWER_START_MOWING = 1
_LAWN_MOWER_DOCK = 4

# Media player features HomeKit can map to switches
_MP_TURN_ON = 128
_MP_TURN_OFF = 256
_MP_PLAY = 16384
_MP_PAUSE = 1
_MP_STOP = 4096
_MP_VOLUME_MUTE = 8

_SWITCH_TYPE_MAP = {
    "faucet": "ValveSwitch",
    "outlet": "Outlet",
    "shower": "ValveSwitch",
    "sprinkler": "ValveSwitch",
    "switch": "Switch",
    "valve": "ValveSwitch",
}
_FAN_TYPE_MAP = {"air_purifier": "AirPurifier", "fan": "Fan"}
_CLIMATE_TYPE_MAP = {"heater_cooler": "HeaterCooler", "thermostat": "Thermostat"}
_TV_DEVICE_CLASSES = ("tv", "projector")


def _core_type_keys(name: str) -> tuple[str, ...] | None:
    """Return the keys of a type map of the installed core HomeKit, if present."""
    try:
        from homeassistant.components.homekit import accessories  # noqa: PLC0415
    except ImportError:  # pragma: no cover - homekit is a dependency
        return None
    mapping = getattr(accessories, name, None)
    return tuple(mapping) if isinstance(mapping, dict) else None


def entity_type_options() -> dict[str, tuple[str, ...]]:
    """Selectable accessory types per domain, as supported by this core version."""
    options: dict[str, tuple[str, ...]] = {
        "switch": ("switch", "outlet", "valve", "faucet", "shower", "sprinkler"),
        "fan": ("fan", "air_purifier"),
    }
    preferred = {**options, "climate": ("thermostat", "heater_cooler")}
    for domain, name in (
        ("switch", "SWITCH_TYPES"),
        ("fan", "FAN_TYPES"),
        ("climate", "CLIMATE_TYPES"),
    ):
        if keys := _core_type_keys(name):
            # Keep a stable, friendly order: known values first
            known = preferred.get(domain, ())
            options[domain] = tuple(k for k in known if k in keys) + tuple(
                sorted(k for k in keys if k not in known)
            )
    return options


def _features(state: State) -> int:
    try:
        return int(state.attributes.get(ATTR_SUPPORTED_FEATURES) or 0)
    except (TypeError, ValueError):
        return 0


def _cover_type(state: State, features: int) -> str | None:
    device_class = state.attributes.get(ATTR_DEVICE_CLASS)
    open_close = features & (_COVER_OPEN | _COVER_CLOSE)
    if device_class in ("garage", "gate") and open_close:
        return "GarageDoorOpener"
    if device_class == "window" and features & _COVER_SET_POSITION:
        return "Window"
    if device_class == "door" and features & _COVER_SET_POSITION:
        return "Door"
    if features & _COVER_SET_POSITION:
        return "WindowCovering"
    if open_close:
        return "WindowCoveringBasic"
    if features & _COVER_SET_TILT_POSITION:
        return "WindowCovering"
    return None


def _sensor_type(state: State) -> str | None:
    device_class = state.attributes.get(ATTR_DEVICE_CLASS)
    unit = state.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
    entity_id = state.entity_id
    if device_class == "temperature" or unit in (
        UnitOfTemperature.CELSIUS,
        UnitOfTemperature.FAHRENHEIT,
    ):
        return "TemperatureSensor"
    if device_class == "humidity" and unit == PERCENTAGE:
        return "HumiditySensor"
    by_class = {
        "pm10": "PM10Sensor",
        "pm25": "PM25Sensor",
        "nitrogen_dioxide": "NitrogenDioxideSensor",
        "volatile_organic_compounds": "VolatileOrganicCompoundsSensor",
        "gas": "AirQualitySensor",
        "carbon_monoxide": "CarbonMonoxideSensor",
        "carbon_dioxide": "CarbonDioxideSensor",
        "illuminance": "LightSensor",
        "ozone": "OzoneSensor",
        "sulphur_dioxide": "SulphurDioxideSensor",
    }
    if device_class in by_class:
        return by_class[device_class]
    if unit == LIGHT_LUX:
        return "LightSensor"
    for needle, a_type in (
        ("pm10", "PM10Sensor"),
        ("pm25", "PM25Sensor"),
        ("gas", "AirQualitySensor"),
        ("co2", "CarbonDioxideSensor"),
    ):
        if needle in entity_id:
            return a_type
    return None


def _media_player_type(state: State, features: int) -> str | None:
    device_class = state.attributes.get(ATTR_DEVICE_CLASS)
    if device_class == "receiver":
        return "ReceiverMediaPlayer"
    if device_class in _TV_DEVICE_CLASSES:
        return "TelevisionMediaPlayer"
    on_off = features & (_MP_TURN_ON | _MP_TURN_OFF)
    play = features & (_MP_PLAY | _MP_PAUSE | _MP_STOP)
    if on_off or play or features & _MP_VOLUME_MUTE:
        return "MediaPlayer"
    return None


def _core_accessory_types() -> frozenset[str]:
    """Accessory classes registered by the installed core HomeKit."""
    try:
        from homeassistant.components.homekit.accessories import TYPES  # noqa: PLC0415
    except ImportError:  # pragma: no cover - homekit is a dependency
        return frozenset()
    return frozenset(TYPES)


def resolve_accessory_type(state: State, config: dict[str, Any] | None) -> str | None:
    """Return the HomeKit accessory type name or None if unsupported."""
    a_type = _resolve(state, config)
    # Only report types this core version actually knows (if it told us)
    core_types = _core_accessory_types()
    if a_type and core_types and a_type not in core_types:
        return None
    return a_type


def _resolve(state: State, config: dict[str, Any] | None) -> str | None:
    config = config or {}
    domain = state.domain
    features = _features(state)

    if domain not in SUPPORTED_DOMAINS:
        return None

    match domain:
        case "alarm_control_panel":
            return "SecuritySystem"
        case "binary_sensor" | "device_tracker" | "person":
            return "BinarySensor"
        case "climate":
            return _CLIMATE_TYPE_MAP.get(config.get(EC_TYPE) or "", "Thermostat")
        case "cover":
            return _cover_type(state, features)
        case "fan":
            return _FAN_TYPE_MAP.get(config.get(EC_TYPE) or "fan", "Fan")
        case "humidifier":
            return "HumidifierDehumidifier"
        case "light":
            return "Light"
        case "lock":
            return "Lock"
        case "media_player":
            return _media_player_type(state, features)
        case "sensor":
            return _sensor_type(state)
        case "switch":
            if switch_type := config.get(EC_TYPE):
                return _SWITCH_TYPE_MAP.get(switch_type, "Switch")
            if state.attributes.get(ATTR_DEVICE_CLASS) == "outlet":
                return "Outlet"
            return "Switch"
        case "valve":
            return "Valve"
        case "vacuum":
            return "Vacuum"
        case "lawn_mower":
            if features & _LAWN_MOWER_DOCK and features & _LAWN_MOWER_START_MOWING:
                return "LawnMower"
            return None
        case "remote":
            if features & _REMOTE_ACTIVITY:
                return "ActivityRemote"
            return "Switch"
        case (
            "automation"
            | "button"
            | "input_boolean"
            | "input_button"
            | "scene"
            | "script"
        ):
            return "Switch"
        case "input_select" | "select":
            return "SelectSwitch"
        case "water_heater":
            return "WaterHeater"
        case "camera":
            return "Camera"
    return None


def needs_accessory_mode(state: State) -> bool:
    """Return True if HomeKit recommends a dedicated accessory-mode instance."""
    if state.domain in ("camera", "lock"):
        return True
    if state.domain == "media_player" and state.attributes.get(ATTR_DEVICE_CLASS) in (
        "tv",
        "projector",
        "receiver",
    ):
        return True
    return state.domain == "remote" and bool(_features(state) & _REMOTE_ACTIVITY)
