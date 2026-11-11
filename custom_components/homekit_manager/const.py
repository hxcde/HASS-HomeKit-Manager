"""Constants for HomeKit Manager."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "homekit_manager"
HOMEKIT_DOMAIN: Final = "homekit"

# Sidebar panel
PANEL_URL_PATH: Final = "homekit-manager"
PANEL_ELEMENT: Final = "homekit-manager-panel"
PANEL_FILENAME: Final = "homekit-manager-panel.js"
STATIC_URL: Final = "/homekit_manager_static"
DEFAULT_SIDEBAR_TITLE: Final = "HomeKit"
DEFAULT_SIDEBAR_ICON: Final = "mdi:home-import-outline"

# Config entry keys
CONF_BRIDGE_NAME: Final = "bridge_name"
CONF_SIDEBAR_TITLE: Final = "sidebar_title"
CONF_SIDEBAR_ICON: Final = "sidebar_icon"
DEFAULT_BRIDGE_NAME: Final = "HA Bridge"

# Keys used inside the options of a core HomeKit config entry
HK_CONF_FILTER: Final = "filter"
HK_CONF_ENTITY_CONFIG: Final = "entity_config"
HK_CONF_MODE: Final = "mode"
HK_CONF_EXCLUDE_ACCESSORY_MODE: Final = "exclude_accessory_mode"
HK_MODE_BRIDGE: Final = "bridge"
HK_MODE_ACCESSORY: Final = "accessory"

# Entity config keys managed by the panel (same keys as core HomeKit YAML)
EC_NAME: Final = "name"
EC_TYPE: Final = "type"
EC_CODE: Final = "code"
EC_FEATURE_LIST: Final = "feature_list"
EC_LOW_BATTERY_THRESHOLD: Final = "low_battery_threshold"

# Media player functions HomeKit can expose as switches
MEDIA_PLAYER_FEATURES: Final = ("on_off", "play_pause", "play_stop", "toggle_mute")

# Domains where HomeKit can use a code to arm/disarm or lock/unlock
CODE_DOMAINS: Final = ("alarm_control_panel", "lock")


class LinkField:
    """A sensor HomeKit can link to an accessory (entity_config key)."""

    def __init__(
        self,
        domains: tuple[str, ...],
        device_classes: tuple[str, ...] = (),
        applies_to: tuple[str, ...] | None = None,
        requires_type: str | None = None,
    ) -> None:
        """Describe a link: allowed domains, preferred classes, target domains."""
        self.domains = domains
        self.device_classes = device_classes
        self.applies_to = applies_to
        self.requires_type = requires_type

    def as_dict(self) -> dict:
        """Serialize for the panel."""
        return {
            "domains": list(self.domains),
            "device_classes": list(self.device_classes),
            "applies_to": list(self.applies_to) if self.applies_to else None,
            "requires_type": self.requires_type,
        }


LINK_FIELDS: Final[dict[str, LinkField]] = {
    "linked_battery_sensor": LinkField(("sensor",), ("battery",)),
    "linked_battery_charging_sensor": LinkField(
        ("binary_sensor",), ("battery_charging",)
    ),
    "linked_motion_sensor": LinkField(
        ("binary_sensor", "event"), ("motion", "occupancy", "presence"), ("camera",)
    ),
    "linked_doorbell_sensor": LinkField(
        ("binary_sensor", "event"), ("doorbell",), ("camera", "lock")
    ),
    "linked_humidity_sensor": LinkField(
        ("sensor",), ("humidity",), ("humidifier", "fan")
    ),
    "linked_pm25_sensor": LinkField(("sensor",), ("pm25",), ("fan",), "air_purifier"),
    "linked_temperature_sensor": LinkField(
        ("sensor",), ("temperature",), ("fan",), "air_purifier"
    ),
    "linked_filter_change_indication_binary_sensor": LinkField(
        ("binary_sensor",), ("problem",), ("fan",), "air_purifier"
    ),
    "linked_filter_life_level_sensor": LinkField(
        ("sensor",), (), ("fan",), "air_purifier"
    ),
    "linked_obstruction_sensor": LinkField(
        ("binary_sensor",), ("problem",), ("cover",)
    ),
}

MANAGED_ENTITY_CONFIG_KEYS: Final = (
    EC_NAME,
    EC_TYPE,
    EC_CODE,
    EC_FEATURE_LIST,
    EC_LOW_BATTERY_THRESHOLD,
    *LINK_FIELDS,
)

# Storage of the automatic assignment rules
RULES_STORAGE_KEY: Final = f"{DOMAIN}.rules"
RULES_STORAGE_VERSION: Final = 1
# Delays before automatic maintenance runs
RULES_SYNC_COOLDOWN: Final = 15.0
MISSING_CHECK_COOLDOWN: Final = 30.0
STARTUP_GRACE: Final = 120.0

# HomeKit limits: 150 accessories per bridge including the bridge itself
MAX_BRIDGED_ACCESSORIES: Final = 149

# Glob that matches nothing-but-everything: used to express "no entities" in
# an entity filter (an entirely empty filter would expose ALL entities).
EXCLUDE_ALL_GLOB: Final = "*"

# Time to wait for a HomeKit bridge to (re)start after a change
BRIDGE_START_TIMEOUT: Final = 45.0
