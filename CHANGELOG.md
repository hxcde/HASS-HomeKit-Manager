# Changelog

Alle nennenswerten Änderungen. Versionen folgen [SemVer](https://semver.org/lang/de/); der Tag eines Releases entspricht der `version` in `custom_components/homekit_manager/manifest.json`.

## 0.2.1 – 2026-11-11

### Behoben
- Kopfleiste in der iPhone-/Android-App: Der Titel überlappt nicht mehr mit der Statusleiste bzw. der Trennlinie. Das Panel berücksichtigt die Safe-Area (Statusleiste, Notch, Home-Indikator) jetzt selbst; die Leiste „Übernehmen“ bleibt über dem Home-Indikator.

## 0.2.0 – 2026-11-11

Erste veröffentlichte Version.

### Funktionen
- **HomeKit-Seite in der Seitenleiste** zum Verwalten von HomeKit Bridges, ganz ohne YAML.
- **Bridges** anlegen (auch direkt beim Einrichten der Integration), umbenennen, Port ändern, neu starten, Kopplung zurücksetzen, löschen. QR- und Setup-Code im Panel, Kopplungsstatus live.
- **Entitäten zuweisen** per Schalter, gruppiert nach Bereich oder Typ, mit Suche und Filtern. Änderungen werden gesammelt und mit „Übernehmen“ gespeichert; das Limit von 149 Geräten pro Bridge wird überwacht.
- **Einzelgeräte** (Zubehör-Modus) für Fernseher, Receiver, Projektoren, Kameras, Schlösser und Aktivitäts-Fernbedienungen, jeweils mit eigenem Setup-Code.
- **Automatisch zuweisen** per Label, Etage, Bereich und Typ mit Live-Vorschau. Von Hand entfernte Treffer bleiben ausgeschlossen, von Hand zugewiesene Entitäten werden nie automatisch entfernt.
- **Geräteoptionen**: Name in HomeKit, Gerätetyp, verknüpfte Sensoren, Batterie (nur bei Geräten mit Batterie), Code für Alarmanlage und Schloss, Mediaplayer-Funktionen.
- **Wartung**: umbenannte Entitäts-IDs werden nachgezogen; gelöschte Entitäten erscheinen im Panel und als behebbare Reparatur in Home Assistant.
- **Bestehende Bridges übernehmen**, die mit dem HomeKit-Standarddialog (Domain-Filter) angelegt wurden.
- Deutsch und Englisch, Hell-/Dunkelmodus, Mobilansicht. Panel und API nur für Administratoren.

### Kompatibilität
- Home Assistant 2026.2 oder neuer, getestet mit 2026.2, 2026.10 und 2026.11.
