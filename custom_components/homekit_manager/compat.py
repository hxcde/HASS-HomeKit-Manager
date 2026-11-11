"""Compatibility helpers across Home Assistant versions."""

from __future__ import annotations

from homeassistant.helpers import config_validation as cv

# Home Assistant 2026.11 replaced voluptuous with the API compatible probatio.
# Use whatever the running core uses, so schemas and errors match.
if hasattr(cv, "probatio"):
    import probatio as vol
else:  # pragma: no cover - Home Assistant before 2026.11
    import voluptuous as vol

_invalid: list[type[Exception]] = [vol.Invalid]
try:
    import voluptuous as _voluptuous

    if _voluptuous.Invalid not in _invalid:
        _invalid.append(_voluptuous.Invalid)
except ImportError:  # pragma: no cover
    pass

INVALID_ERRORS: tuple[type[Exception], ...] = tuple(_invalid)

__all__ = ["INVALID_ERRORS", "vol"]
