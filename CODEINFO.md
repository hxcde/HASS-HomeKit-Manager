# CODEINFO — HomeKit Manager

Code-Struktur und Aufbau. Bei strukturellen Änderungen aktualisieren.

## Überblick

Custom Integration für Home Assistant (Python, Domain `homekit_manager`) plus ein Sidebar-Panel (TypeScript, Lit, gebündelt mit Vite). Die Integration implementiert kein HomeKit-Protokoll, sondern legt Config-Entries der Core-Integration `homekit` an und schreibt deren Optionen (Entity-Filter, `entity_config`). Das Panel spricht ausschließlich über eine eigene Websocket-API (nur Admins) mit dem Backend. Verteilung über den HA-Marketplace/HACS (`hacs.json`).

## Verzeichnislayout

```
custom_components/homekit_manager/   Integration (wird so installiert)
  __init__.py          Setup: Websocket-API, statische Dateien, Panel-Registrierung
  manifest.json        Integrations-Manifest (version = Release-Tag)
  config_flow.py       Einrichtung (erste Bridge) + Optionen (Titel/Icon der Seitenleiste)
  bridge.py            BridgeManager: alle Operationen auf Core-HomeKit-Entries
  accessory_types.py   Vorhersage des HomeKit-Gerätetyps (Spiegel von core get_accessory)
  websocket_api.py     Websocket-Befehle homekit_manager/*
  compat.py            probatio/voluptuous-Kompatibilität (HA ≥ 2026.11 vs. älter)
  const.py             Konstanten
  translations/        en.json, de.json (kein strings.json, Marketplace-Vorgabe)
  brand/               icon.png, icon@2x.png
  frontend/            gebautes Panel-Bundle homekit-manager-panel.js (eingecheckt)
frontend/              Quellcode des Panels
  src/panel.ts         Hauptkomponente <homekit-manager-panel>: Zustand, Layout, Aktionen
  src/dialogs.ts       Dialoge: Entität, Bridge anlegen/Einstellungen, Bestätigung,
                       Auswahl Bridge/Einzelgerät, Einzelgerät-Auswahl
  src/api.ts           Typen + Websocket-Aufrufe
  src/meta.ts          Kategorien, Icons, Beschriftung der HomeKit-Typen
  src/i18n.ts          Texte de/en
  src/styles.ts        Design-Tokens (aus HA-Theme), Buttons, Switches, Chips
  vite.config.ts       Build nach custom_components/homekit_manager/frontend/
tests/                 pytest (pytest-homeassistant-custom-component)
script/core_requirements.py  gibt Pip-Requirements der benötigten Core-Integrationen aus
docs/images/           Screenshots für README
.github/workflows/     validate (hassfest, HACS-Action), tests, release
```

## Module & Zuständigkeiten

- **`bridge.py` / `BridgeManager`**
  - `async_create(name, port)`: startet den Core-Config-Flow `homekit` (Quelle `user`, Domain `demo` damit der erste Start nichts freigibt), wartet auf den Start und setzt Name, `exclude_accessory_mode=False` und einen expliziten Filter.
  - `async_create_accessory(entity_id, name, remove_from_bridges)`: Core-Flow mit Quelle `accessory` (Zubehör-Modus, eine Entität pro Instanz); entfernt die Entität optional aus allen verwalteten Bridges.
  - `async_set_entities(entry_id, ids, entity_config)`: ersetzt `filter.include_entities`, patcht `name`/`type` in `entity_config`; Typwechsel bestehender Geräte → Core-Service `homekit.reset_accessory` im Hintergrund.
  - `async_adopt`: wandelt Domain-/Glob-Filter in eine explizite Liste (laufende Accessories bzw. Filterauswertung).
  - `async_update_settings`, `async_restart`, `async_unpair` (Core-Service `homekit.unpair`), `async_delete`, `async_pairing` (PIN, Setup-URI, QR als SVG-Data-URL via `pyqrcode`).
  - `async_describe` / `async_list` / `async_entities`: JSON für das Panel.
  - Pro Entry ein `asyncio.Lock`; nach jeder Änderung `async_wait_started()` bis die neu geladene HomeKit-Instanz läuft (verhindert Port-Konflikte durch überlappende Reloads).
- **Filter-Konvention**: Eine Bridge gilt als „verwaltet“, wenn ihr Filter nur `include_entities` enthält. Leere Auswahl = `exclude_entity_globs: ["*"]` (ein komplett leerer Filter würde in Core *alle* Entitäten freigeben).
- **`accessory_types.py`**: `resolve_accessory_type()` spiegelt die Typentscheidung von `homekit.accessories.get_accessory`; Ergebnis wird gegen die in Core registrierten Typen geprüft. `entity_type_options()` liest `SWITCH_TYPES`/`FAN_TYPES`/`CLIMATE_TYPES` aus Core.
- **`websocket_api.py`**: Befehle `bridges`, `entities`, `pairing`, `bridge/create|settings|assign|adopt|restart|unpair|delete`, `accessory/create`; alle `require_admin`. `BridgeError.code` wird als Fehlercode ans Panel gegeben.
- **Panel (`panel.ts`)**: lädt Bridges + Entitäten, hält Änderungen als Entwurf (`_draft`, `_draftConfig`) bis „Übernehmen“, pollt alle 5 s den Bridge-Status (Kopplung, PIN-Wechsel nach Neustart), drosselt `hass`-Updates auf 1/s. Nutzt `ha-menu-button`, `ha-state-icon` (mit Fallback) und HA-Events `hass-notification`/`hass-more-info`.

## Zusammenspiel / Datenfluss

```
Panel (Browser) ──websocket homekit_manager/*──▶ websocket_api ──▶ BridgeManager
                                                                   │
                       config_entries.flow (homekit: user/accessory)│ async_update_entry(options)
                                                                   ▼
                                       Core-Integration homekit (Update-Listener → Reload)
                                                                   │
                                       HAP-Server (HAP-python) ◀── Apple Home / iPhone
```

Build: `frontend/src/*.ts` → `npm run build` (tsc-Check + Vite) → `custom_components/homekit_manager/frontend/homekit-manager-panel.js`. Das Bundle wird von `__init__.py` unter `/homekit_manager_static/` ausgeliefert und als Custom Panel `homekit-manager` registriert (Cache-Busting über `?v=<version>-<mtime>`).

## Wichtige Einstiegspunkte

- `custom_components/homekit_manager/__init__.py` — `async_setup`, `async_setup_entry`
- `custom_components/homekit_manager/bridge.py` — `BridgeManager`
- `custom_components/homekit_manager/websocket_api.py` — `async_register`
- `frontend/src/panel.ts` — `<homekit-manager-panel>`
- `tests/conftest.py` — Fixture `mock_homekit_runtime` (HomeKit ohne Netzwerk)
