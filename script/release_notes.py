"""Print the CHANGELOG.md section of a version (used by the release workflow).

Usage: python script/release_notes.py 0.2.0
"""

from pathlib import Path
import re
import sys

version = sys.argv[1]
text = Path(__file__).resolve().parent.parent.joinpath("CHANGELOG.md").read_text()
heading = re.compile(r"^## \[?v?(?P<version>[^\]\s]+)\]?", re.MULTILINE)
sections = list(heading.finditer(text))
for index, match in enumerate(sections):
    if match.group("version") == version:
        end = sections[index + 1].start() if index + 1 < len(sections) else len(text)
        body = text[match.end() : end].split("\n", 1)[-1].strip()
        print(body)
        break
else:
    print(f"HomeKit Manager {version}")
