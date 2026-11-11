"""Print the pip requirements of the core integrations HomeKit Manager depends on.

Usage: pip install $(python script/core_requirements.py)
The versions come from the installed Home Assistant, so tests run against
exactly the libraries that Home Assistant release ships with.
"""

import json
from pathlib import Path

from homeassistant import components

DOMAINS = (
    "camera",
    "ffmpeg",
    "frontend",
    "homekit",
    "http",
    "network",
    "stream",
    "zeroconf",
)

base = Path(components.__path__[0])
requirements: list[str] = []
for domain in DOMAINS:
    manifest = json.loads((base / domain / "manifest.json").read_text())
    requirements.extend(manifest.get("requirements", []))
print(" ".join(sorted(set(requirements))))
