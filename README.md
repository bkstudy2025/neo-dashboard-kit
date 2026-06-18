<p align="center">
  <img src="https://raw.githubusercontent.com/bkstudy2025/neo-dashboard-kit/main/logo.png" width="170" alt="Neo Dashboard Kit" />
</p>

<h1 align="center">Neo Dashboard Kit</h1>

A glassmorphism-style Home Assistant dashboard with a community plugin system.

![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)
![Version](https://img.shields.io/github/v/release/bkstudy2025/neo-dashboard-kit?include_prereleases)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## Voraussetzungen / Prerequisites

Vor der Installation müssen folgende HACS-Plugins installiert sein:

| Plugin | HACS-Kategorie | Pflicht |
|---|---|---|
| [Card Mod](https://github.com/thomasloven/lovelace-card-mod) | Frontend | ✅ Ja — für Mobile-Header und Dialog-Styles |
| [Neo Dashboard Tools](https://github.com/bkstudy2025/neo-dashboard-tools) | Integration | ⭐ Empfohlen — server-seitiger Modul-Speicher (saubere Config). Ohne sie werden Module in der Karten-Config gespeichert. |

---

## Installation

### Schritt 1 — Card Mod installieren

1. HACS → Frontend → Suche **"Card Mod"**
2. Installieren → HA neu starten

### Schritt 2 — Neo Dashboard Kit installieren

1. HACS → Frontend → ⋮ → Benutzerdefinierte Repositories
2. URL: `https://github.com/bkstudy2025/neo-dashboard-kit` — Kategorie: **Plugin**
3. **Neo Dashboard Kit** installieren
4. HA neu starten

### Schritt 3 — Theme einrichten

1. Datei `themes/neo-dashboard.yaml` aus diesem Repo nach `config/themes/neo-dashboard.yaml` kopieren
2. In `configuration.yaml` sicherstellen dass folgendes steht:

```yaml
frontend:
  themes: !include_dir_merge_named themes
```

3. HA neu starten

### Schritt 4 — Theme aktivieren

Profil (Avatar unten links) → **Theme** → **Neo Dashboard** auswählen

> Das Theme wechselt automatisch zwischen Dark und Light je nach Betriebssystem-Einstellung.

---

## Karten verwenden

Alle Karten laufen über **eine** Karte: `custom:neo-card`. Den Kartentyp wählst du
im **visuellen Editor** über das Dropdown **„Kartentyp"** — oder per YAML mit `card_type`.

> **Karte hinzufügen** → nach **„Neo Card"** suchen → im Editor den Kartentyp wählen.

Beispiel (YAML):
```yaml
type: custom:neo-card
card_type: neo-button-card
entity: light.wohnzimmer
button_type: light
accent: amber
```

### Verfügbare Karten

| Kartentyp | Beschreibung |
|---|---|
| `neo-button-card` | Universelle Kachel: Schalter · Licht · Szene · Skript |
| `neo-sensor-card` | Sensorwert als Glas-Kachel |
| `neo-climate-card` | Thermostat mit − / + Temperatursteuerung |
| `neo-cover-card` | Rollladen mit Auf / Stopp / Zu |
| `neo-media-card` | Media-Player mit Transport (⏮ ⏯ ⏭) |
| `neo-header-card` | Überschrift / Trenner (Layout-Baustein) |

→ Details & gemeinsame Optionen: **[docs/cards/](docs/cards/README.md)**

> **Prinzip:** Nur die wichtigste Steuerung liegt direkt auf der Karte — der
> **volle** Funktionsumfang ist per **Tap → More-Info** erreichbar. So bleibt
> jede Karte schlank.

### Module & Store

Karten lassen sich mit **Modulen** erweitern — kleine Bausteine, die eine Karte um
Funktionen/Optik ergänzen (z. B. Status-Badge, Glow, eigene Tap-Aktion). Im Editor:
**Module → ➕ Modul hinzufügen → Store** (kuratierter Katalog, nach Karte gefiltert)
oder **Code einfügen** (z. B. Patreon). Mehr: **[docs/modules.md](docs/modules.md)**.

---

## Community Plugins

Jeder kann eigene Neo Dashboard Karten als separates HACS-Repo bauen.

Siehe **[docs/plugin-development.md](docs/plugin-development.md)** für die vollständige Anleitung.

Schnellbeispiel:
```js
class MyCustomCard extends HTMLElement {
  setConfig(config) { this._config = config; }
  set hass(hass) { this._hass = hass; }
  getCardSize() { return 2; }
}

// Bei Neo Dashboard registrieren
window.NeoDashboard.registerCard("neo-my-card", MyCustomCard);
```

---

## Design Tokens

Alle Karten nutzen CSS Custom Properties — können im Theme überschrieben werden:

| Variable | Dark Default | Beschreibung |
|---|---|---|
| `--neo-fill0` | `rgba(255,255,255,0.02)` | Dunkelste Oberfläche |
| `--neo-fill1` | `rgba(255,255,255,0.04)` | Karten-Hintergrund |
| `--neo-fill2` | `rgba(255,255,255,0.055)` | Erhöhte Oberfläche |
| `--neo-text1` | `#F4F6FB` | Primärer Text |
| `--neo-text2` | `rgba(244,246,251,0.72)` | Sekundärer Text |
| `--neo-text3` | `rgba(244,246,251,0.50)` | Labels / Tertiary |
| `--neo-blur` | `blur(24px) saturate(140%)` | Backdrop Filter |
| `--neo-radius` | `24px` | Karten-Eckenradius |
| `--neo-accent-blue` | `#7C9CFF` | Akzentfarbe Blau |
| `--neo-accent-amber` | `#FFB26B` | Akzentfarbe Amber |
| `--neo-accent-mint` | `#5EDCB8` | Akzentfarbe Mint |
| `--neo-accent-violet` | `#C084FC` | Akzentfarbe Violet |
| `--neo-accent-rose` | `#F87171` | Akzentfarbe Rose |

---

## Mitwirken / Contributing

PRs willkommen! Bitte zuerst [CONTRIBUTING.md](CONTRIBUTING.md) lesen.

---

## Lizenz / License

MIT © [Neo Dashboard Kit Contributors](https://github.com/bkstudy2025/neo-dashboard-kit)
