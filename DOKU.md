# DOKU — HomeKit Manager

Admin- und Wartungsdoku.

## Voraussetzungen

- Home Assistant **2026.2+** (getestet: 2026.2.3 / Python 3.13, 2026.10.4 und 2026.11.1 / Python 3.14).
- Die Core-Integration **HomeKit Bridge** (`homekit`) wird als Abhängigkeit automatisch geladen; keine zusätzlichen Pakete.
- Netzwerk: iPhone/Home-Hub und Home Assistant im selben Netz, **mDNS/Bonjour** (UDP 5353) muss durchkommen. Pro Bridge/Einzelgerät ein TCP-Port ab **21064** (wird automatisch vergeben, im Panel sichtbar).
- Home Assistant **Container**: `network_mode: host` verwenden, sonst funktionieren mDNS und die HAP-Ports nicht zuverlässig.
- Entwicklung: Node.js 22 (Panel-Build), Python 3.13/3.14 für Tests.

## Konfiguration

Keine Umgebungsvariablen, keine Secrets.

| Ort | Inhalt |
|---|---|
| Integration HomeKit Manager → *Konfigurieren* | Titel und Icon der Seitenleiste |
| Panel *HomeKit* | Bridges/Einzelgeräte anlegen, umbenennen, Port, Entitäten, Name/Typ in HomeKit |
| `.storage/core.config_entries` | Die eigentlichen Daten liegen in den `homekit`-Config-Entries (Optionen `filter`, `entity_config`, `mode`) |
| `.storage/homekit.<entry_id>.*` | Kopplungszustand/Accessory-IDs (verwaltet von Core) |

Hinweise:
- Bridge-Namen werden mDNS-tauglich gemacht (A–Z, Ziffern, Leerzeichen; ä→ae usw., 3–25 Zeichen).
- Max. 149 Geräte pro Bridge (HomeKit-Limit 150 inkl. Bridge).
- Per YAML (`homekit:` in `configuration.yaml`) definierte Bridges werden nur angezeigt, nicht verändert.
- Bridges aus dem HomeKit-Standarddialog (Domain-Filter) müssen im Panel einmal **übernommen** werden; danach werden neue Entitäten nicht mehr automatisch freigegeben.
- Die HomeKit-Optionen einer verwalteten Bridge nicht parallel über *HomeKit Bridge → Konfigurieren* ändern – dieser Dialog schreibt wieder Domain-Filter.

## Deployment

Release (Marketplace/HACS verlangt passende Version):
1. `version` in `custom_components/homekit_manager/manifest.json` und `frontend/package.json` erhöhen.
2. Panel bauen: `cd frontend && npm ci && npm run build` – das Bundle unter `custom_components/homekit_manager/frontend/` wird mit eingecheckt.
3. Commit, Tag `vX.Y.Z` bzw. `X.Y.Z` = Manifest-Version, GitHub-Release veröffentlichen. Workflow `release.yml` prüft Tag ↔ Manifest und hängt `homekit_manager.zip` an.
4. Für die Aufnahme in den Katalog (hacs/default): Repo öffentlich, Beschreibung und Topics gesetzt, Issues aktiviert, Workflows `validate.yml` (hassfest + HACS-Action) grün.

CI:
- `validate.yml`: hassfest, HACS-Action (`category: integration`), täglich und bei Push/PR.
- `tests.yml`: ruff + pytest auf Python 3.13 und 3.14, Panel-Build und Prüfung, dass das eingecheckte Bundle aktuell ist.

Lokal testen:
```bash
pip install pytest-homeassistant-custom-component ruff
pip install $(python script/core_requirements.py)
pytest -q
ruff check custom_components tests script
```

## Betrieb & Wartung

- **Koppeln:** Panel → Bridge/Einzelgerät → QR-Code in der Home-App scannen oder Setup-Code eingeben. Der Setup-Code wird bei jedem Neustart neu erzeugt, solange nicht gekoppelt ist (Core-Verhalten); das Panel aktualisiert ihn automatisch.
- **Änderungen übernehmen** startet die Bridge kurz neu (wenige Sekunden nicht erreichbar). Kopplung, Räume und Szenen bleiben erhalten; Accessory-IDs sind stabil.
- **Typ ändern** (z. B. Schalter → Steckdose) erzeugt das Gerät in Apple Home neu (Core-Service `homekit.reset_accessory`, ca. 10 s); Raum/Szenen ggf. neu zuweisen.
- **Kopplung zurücksetzen** entfernt alle Apple-Geräte von der Bridge; danach neu koppeln.
- **Löschen** entfernt die Core-Entry inkl. Kopplungsdaten – Geräte verschwinden aus Apple Home.
- **Integration entfernen** entfernt nur das Panel; Bridges laufen weiter und bleiben über *HomeKit Bridge* in Home Assistant erhalten.
- **Logs:** `logger: logs: custom_components.homekit_manager: debug` und `homeassistant.components.homekit: debug`.
- **Updates von Home Assistant:** HomeKit Manager nutzt öffentliche Core-Flows/Services, aber auch einige interne Strukturen der HomeKit-Integration (Runtime-Objekt, Typ-Tabellen). Nach größeren HA-Updates CI (`tests.yml`) gegen die neue Version laufen lassen.

## Troubleshooting

| Problem | Diagnose | Lösung |
|---|---|---|
| Bridge bleibt auf „Startet…“ | Log `homeassistant.components.homekit` | Port belegt? Im Panel unter *Einstellungen* anderen Port setzen, *Neu starten*. |
| Home-App findet die Bridge nicht | mDNS blockiert (VLANs, Docker ohne Host-Netz, Firewall) | Host-Netzwerk, mDNS-Reflector zwischen VLANs, TCP-Port der Bridge freigeben. |
| Entität erscheint nicht in Apple Home | Badge „nicht unterstützt“ im Panel | HomeKit kennt keinen passenden Typ (z. B. Leistungssensoren). Für Sensoren: Device-Class Temperatur/Feuchte/Luftqualität/CO/CO₂/Helligkeit. |
| Fernseher/Kamera nur als Schalter oder ohne Bild | in Bridge statt Einzelgerät | Im Panel *Als Einzelgerät koppeln*, dann neuen Setup-Code in der Home-App scannen. |
| Bridge zeigt „Diese Bridge nutzt Domain-Filter“ | angelegt/geändert über den Core-Dialog | *Bridge übernehmen*. |
| Panel zeigt „Fehler: unauthorized“ | Benutzer ist kein Admin | Panel und API sind nur für Administratoren. |
| Nach Update alte Panel-Version | Browser-Cache | Seite neu laden (Strg+F5); URL enthält Version + Datei-Zeitstempel. |
