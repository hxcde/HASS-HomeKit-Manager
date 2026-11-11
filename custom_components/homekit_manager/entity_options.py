"""Per-entity HomeKit options (``entity_config`` of a core HomeKit entry).

The keys are the ones core HomeKit also accepts in YAML: name, accessory type,
linked sensors, alarm/lock code, media player features and battery threshold.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import State
from homeassistant.helpers import config_validation as cv

from .accessory_types import entity_type_options
from .compat import INVALID_ERRORS
from .const import (
    CODE_DOMAINS,
    EC_CODE,
    EC_FEATURE_LIST,
    EC_LOW_BATTERY_THRESHOLD,
    EC_NAME,
    EC_TYPE,
    LINK_FIELDS,
    MANAGED_ENTITY_CONFIG_KEYS,
    MEDIA_PLAYER_FEATURES,
    LinkField,
)

ENTITY_NAME_MAX_LENGTH = 64
CODE_MAX_LENGTH = 64

# Media player feature bits (MediaPlayerEntityFeature)
_MP_PAUSE = 1
_MP_VOLUME_MUTE = 8
_MP_TURN_ON = 128
_MP_TURN_OFF = 256
_MP_STOP = 4096
_MP_PLAY = 16384


class EntityOptionError(ValueError):
    """Invalid entity option; ``code`` is passed to the panel."""

    def __init__(self, code: str, message: str) -> None:
        """Initialize the error."""
        super().__init__(message)
        self.code = code


def available_link_fields() -> dict[str, LinkField]:
    """Linked sensor options supported by the installed core HomeKit."""
    try:
        from homeassistant.components.homekit import const as hk_const  # noqa: PLC0415
    except ImportError:  # pragma: no cover - homekit is a dependency
        return dict(LINK_FIELDS)
    known = {
        value
        for name, value in vars(hk_const).items()
        if name.startswith("CONF_LINKED_") and isinstance(value, str)
    }
    return {key: field for key, field in LINK_FIELDS.items() if key in known}


def media_player_features(state: State) -> list[str]:
    """Features of a media player HomeKit can expose (mirrors core)."""
    try:
        features = int(state.attributes.get("supported_features") or 0)
    except (TypeError, ValueError):
        features = 0
    modes = []
    if features & (_MP_TURN_ON | _MP_TURN_OFF):
        modes.append("on_off")
    if features & (_MP_PLAY | _MP_PAUSE):
        modes.append("play_pause")
    if features & (_MP_PLAY | _MP_STOP):
        modes.append("play_stop")
    if features & _MP_VOLUME_MUTE:
        modes.append("toggle_mute")
    return modes


def public_options(conf: dict[str, Any]) -> dict[str, Any]:
    """Options as sent to the panel; the code itself never leaves the server."""
    result = {
        key: value
        for key, value in conf.items()
        if key in MANAGED_ENTITY_CONFIG_KEYS and key != EC_CODE
    }
    if conf.get(EC_CODE):
        result["has_code"] = True
    return result


def _blank(value: Any) -> bool:
    return value is None or (isinstance(value, (str, list)) and not value)


def validate_option(entity_id: str, key: str, value: Any) -> Any:
    """Validate one option. Returns the value to store, None to remove it."""
    domain = entity_id.split(".", 1)[0]
    if _blank(value):
        return None

    if key == EC_NAME:
        value = " ".join(str(value).split())
        if len(value) > ENTITY_NAME_MAX_LENGTH:
            raise EntityOptionError("invalid_name", f"Name for {entity_id} is too long")
        return value

    if key == EC_TYPE:
        if value not in entity_type_options().get(domain, ()):
            raise EntityOptionError(
                "invalid_type", f"Type {value} not valid for {entity_id}"
            )
        return value

    if key == EC_CODE:
        if domain not in CODE_DOMAINS:
            raise EntityOptionError("invalid_option", f"{entity_id} has no code")
        value = str(value)
        if len(value) > CODE_MAX_LENGTH or not value.isprintable():
            raise EntityOptionError("invalid_code", "Invalid code")
        return value

    if key == EC_FEATURE_LIST:
        if domain != "media_player" or not isinstance(value, list):
            raise EntityOptionError(
                "invalid_option", f"Invalid features for {entity_id}"
            )
        if any(feature not in MEDIA_PLAYER_FEATURES for feature in value):
            raise EntityOptionError("invalid_option", "Unknown media player feature")
        return [f for f in MEDIA_PLAYER_FEATURES if f in value]

    if key == EC_LOW_BATTERY_THRESHOLD:
        try:
            threshold = int(value)
        except (TypeError, ValueError):
            raise EntityOptionError(
                "invalid_option", "Battery threshold must be a number"
            ) from None
        if not 1 <= threshold <= 99:
            raise EntityOptionError("invalid_option", "Battery threshold 1-99 %")
        return threshold

    if (field := available_link_fields().get(key)) is not None:
        if field.applies_to and domain not in field.applies_to:
            raise EntityOptionError(
                "invalid_option", f"{key} is not available for {entity_id}"
            )
        try:
            linked = cv.entity_id(value)
        except INVALID_ERRORS:
            raise EntityOptionError(
                "invalid_option", f"Invalid entity {value}"
            ) from None
        if linked.split(".", 1)[0] not in field.domains:
            raise EntityOptionError(
                "invalid_option", f"{linked} cannot be used as {key}"
            )
        return linked

    raise EntityOptionError("invalid_option", f"Unknown option {key}")


def apply_patch(
    current: dict[str, Any], entity_id: str, patch: dict[str, Any]
) -> dict[str, Any]:
    """Return a new entity config with ``patch`` applied (None removes a key)."""
    conf = dict(current)
    for key, raw in patch.items():
        if key not in MANAGED_ENTITY_CONFIG_KEYS:
            continue
        if (value := validate_option(entity_id, key, raw)) is None:
            conf.pop(key, None)
        else:
            conf[key] = value
    return conf
