"""Tests for the HomeKit accessory type prediction."""

from __future__ import annotations

import pytest

from custom_components.homekit_manager.accessory_types import (
    needs_accessory_mode,
    resolve_accessory_type,
)
from homeassistant.core import State


@pytest.mark.parametrize(
    ("entity_id", "attrs", "config", "expected"),
    [
        ("light.kitchen", {}, None, "Light"),
        ("switch.plug", {"device_class": "outlet"}, None, "Outlet"),
        ("switch.plug", {}, None, "Switch"),
        ("switch.pump", {}, {"type": "sprinkler"}, "ValveSwitch"),
        ("switch.plug", {}, {"type": "outlet"}, "Outlet"),
        ("fan.purifier", {}, {"type": "air_purifier"}, "AirPurifier"),
        ("fan.ceiling", {}, None, "Fan"),
        (
            "sensor.temp",
            {"device_class": "temperature", "unit_of_measurement": "°C"},
            None,
            "TemperatureSensor",
        ),
        (
            "sensor.humidity",
            {"device_class": "humidity", "unit_of_measurement": "%"},
            None,
            "HumiditySensor",
        ),
        (
            "sensor.power",
            {"device_class": "power", "unit_of_measurement": "W"},
            None,
            None,
        ),
        ("sensor.living_co2", {}, None, "CarbonDioxideSensor"),
        ("sensor.lux", {"unit_of_measurement": "lx"}, None, "LightSensor"),
        (
            "cover.garage",
            {"device_class": "garage", "supported_features": 3},
            None,
            "GarageDoorOpener",
        ),
        ("cover.blind", {"supported_features": 7}, None, "WindowCovering"),
        ("cover.basic", {"supported_features": 3}, None, "WindowCoveringBasic"),
        ("cover.none", {"supported_features": 0}, None, None),
        ("media_player.tv", {"device_class": "tv"}, None, "TelevisionMediaPlayer"),
        (
            "media_player.speaker",
            {"supported_features": 16384 | 1},
            None,
            "MediaPlayer",
        ),
        ("media_player.dumb", {"supported_features": 0}, None, None),
        ("remote.hub", {"supported_features": 4}, None, "ActivityRemote"),
        ("remote.ir", {"supported_features": 0}, None, "Switch"),
        ("lawn_mower.bob", {"supported_features": 5}, None, "LawnMower"),
        ("lawn_mower.bob", {"supported_features": 1}, None, None),
        ("binary_sensor.door", {"device_class": "door"}, None, "BinarySensor"),
        ("person.anna", {}, None, "BinarySensor"),
        ("script.goodnight", {}, None, "Switch"),
        ("select.mode", {}, None, "SelectSwitch"),
        ("sun.sun", {}, None, None),
        ("weather.home", {}, None, None),
    ],
)
def test_resolve_accessory_type(entity_id, attrs, config, expected) -> None:
    """Accessory types match the core HomeKit mapping."""
    assert resolve_accessory_type(State(entity_id, "on", attrs), config) == expected


@pytest.mark.parametrize(
    ("entity_id", "attrs", "expected"),
    [
        ("camera.door", {}, True),
        ("lock.front", {}, True),
        ("media_player.tv", {"device_class": "tv"}, True),
        ("media_player.speaker", {"device_class": "speaker"}, False),
        ("remote.hub", {"supported_features": 4}, True),
        ("light.kitchen", {}, False),
    ],
)
def test_needs_accessory_mode(entity_id, attrs, expected) -> None:
    """Entities Apple wants as standalone accessories are flagged."""
    assert needs_accessory_mode(State(entity_id, "on", attrs)) is expected
