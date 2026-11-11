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

# Entity config keys managed by the panel
EC_NAME: Final = "name"
EC_TYPE: Final = "type"
MANAGED_ENTITY_CONFIG_KEYS: Final = (EC_NAME, EC_TYPE)

# HomeKit limits: 150 accessories per bridge including the bridge itself
MAX_BRIDGED_ACCESSORIES: Final = 149

# Glob that matches nothing-but-everything: used to express "no entities" in
# an entity filter (an entirely empty filter would expose ALL entities).
EXCLUDE_ALL_GLOB: Final = "*"

# Time to wait for a HomeKit bridge to (re)start after a change
BRIDGE_START_TIMEOUT: Final = 45.0
