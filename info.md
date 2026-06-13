<p align="center">
  <img src="https://raw.githubusercontent.com/bkstudy2025/neo-dashboard-kit/main/logo.png" width="150" alt="Neo Dashboard Kit" />
</p>

# Neo Dashboard Kit

Glassmorphism-Karten für Home Assistant mit Community-Modul-System.

## Voraussetzungen

- **Card Mod** (HACS · Frontend) — für Mobile-Header & Dialog-Stil
- **Neo Dashboard Tools** (HACS · Integration, empfohlen) — server-seitiger Modul-Speicher + Modul-Store
  → https://github.com/bkstudy2025/neo-dashboard-tools

## Installation

1. Dieses Repo über HACS installieren (Kategorie **Dashboard/Plugin**).
2. Ressource (falls nicht automatisch):
   `/hacsfiles/neo-dashboard-kit/neo-dashboard.js` · Typ **JavaScript-Modul**
3. Theme einrichten: `themes/neo-dashboard.yaml` nach `config/themes/` kopieren,
   in `configuration.yaml`:
   ```yaml
   frontend:
     themes: !include_dir_merge_named themes
   ```
   HA neu starten → Profil → Theme **Neo Dashboard**.

## Karten verwenden

Alle Karten laufen über **eine** Karte `custom:neo-card` — den Typ wählst du im
Editor über das **Kartentyp**-Dropdown.

```yaml
type: custom:neo-card
card_type: neo-light-card
entity: light.wohnzimmer
accent: amber
```

**Enthaltene Karten:** Hero/Begrüßung · Status-Leiste · Licht · Sensor · Szene · Schnellaktion

## Module & Store

Im Karten-Editor unter **🧩 Module**:
- **Meine Module** — installierte Module ansehen/bearbeiten/löschen
- **Modul-Store** — Community-Karten aus GitHub Discussions installieren

## Doku

Vollständige Dokumentation & Anleitungen:
https://github.com/bkstudy2025/neo-dashboard-kit#readme

- Karten: https://github.com/bkstudy2025/neo-dashboard-kit/tree/main/docs/cards
- Eigene/Premium-Module: https://github.com/bkstudy2025/neo-dashboard-kit/blob/main/docs/premium-modules.md

## Lizenz

MIT
