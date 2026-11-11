"""Shared fixtures for HomeKit Manager tests."""

from __future__ import annotations

from collections.abc import Generator
from itertools import count
from unittest.mock import patch

import pytest

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(
    mock_homekit_runtime: None, enable_custom_integrations: None
) -> None:
    """Allow loading custom_components/ in every test.

    ``mock_homekit_runtime`` comes first so its patches are applied before
    and removed after ``hass``: newer cores unload all entries on teardown.
    """


@pytest.fixture
def mock_homekit_runtime() -> Generator[None]:
    """Run core HomeKit bridges without network access (no HAP server)."""
    # Import so the patch targets below exist
    import homeassistant.components.homekit  # noqa: PLC0415
    import homeassistant.components.homekit.config_flow  # noqa: F401, PLC0415

    ports = count(21064)

    async def _start(self, *args) -> None:
        self.status = 1  # STATUS_RUNNING

    async def _stop(self, *args) -> None:
        self.status = 2  # STATUS_STOPPED

    with (
        patch("homeassistant.components.homekit.HomeKit.async_start", _start),
        patch("homeassistant.components.homekit.HomeKit.async_stop", _stop),
        patch(
            "homeassistant.components.homekit.async_port_is_available",
            return_value=True,
        ),
        patch(
            "homeassistant.components.homekit.util.async_port_is_available",
            return_value=True,
        ),
        patch(
            "homeassistant.components.homekit.config_flow.async_find_next_available_port",
            side_effect=lambda hass, start: next(ports),
        ),
        patch(
            "homeassistant.components.homekit.util.async_find_next_available_port",
            side_effect=lambda hass, start: next(ports),
        ),
    ):
        yield
