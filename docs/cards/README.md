# Neo Dashboard Kit — Karten

Alle Karten laufen über **eine** Wrapper-Karte: `custom:neo-card`. Im visuellen
Editor wählst du den **Kartentyp** über ein Dropdown; per YAML über `card_type`.

```yaml
type: custom:neo-card
card_type: <kartentyp>
# ... kartenspezifische Optionen
```

> **Prinzip:** Die Karte hält die Oberfläche schlank — nur die wichtigste
> Steuerung liegt direkt auf der Karte. Der **volle** Funktionsumfang ist über
> **Tap → More-Info** (HA-Dialog) erreichbar. Zusätzliches kommt über **Module**
> (siehe [../modules.md](../modules.md)) oder Premium (Patreon).

## Karten

| Karte | Kartentyp | Kern-Steuerung (inline) |
|---|---|---|
| Button | `neo-button-card` | Toggle / Helligkeits-Slider / Aktion |
| Sensor | `neo-sensor-card` | Wert-Anzeige (Tap → More-Info) |
| Klima | `neo-climate-card` | Zieltemperatur − / + |
| Cover | `neo-cover-card` | Auf / Stopp / Zu |
| Media | `neo-media-card` | ⏮ ⏯ ⏭ Transport |
| Header | `neo-header-card` | Überschrift / Trenner (kein Entity) |

### Button — `neo-button-card`
Universelle Tasten-/Kachel-Karte. `button_type`: `switch` · `light` · `scene` · `script`.
Bei `light` mit Helligkeits-Slider. Optionen: `entity`, `name`, `sub`, `icon`,
`accent`, `layout`.

### Sensor — `neo-sensor-card`
Sensorwert als Glas-Kachel. Optionen: `entity`, `name`, `sub`, `icon`, `unit`,
`accent`, `layout`. Tap öffnet More-Info.

### Klima — `neo-climate-card`
Thermostat mit − / + (`climate.set_temperature`, auf min/max begrenzt). Zeigt
Ist-Temperatur + Modus/Aktion. Optionen: `entity`, `name`, `icon`, `accent`,
`step`, `layout`.

### Cover — `neo-cover-card`
Rollladen/Jalousie mit Auf / Stopp / Zu und Positions-Anzeige. Optionen:
`entity`, `name`, `icon`, `accent`, `layout`. Detail (Position/Tilt) über More-Info.

### Media — `neo-media-card`
Media-Player mit Transport (⏮ ⏯ ⏭), Titel + Interpret. Optionen: `entity`,
`name`, `icon`, `accent`, `layout`. Quelle/Lautstärke über More-Info.

### Header — `neo-header-card`
Reiner Layout-Baustein (ohne Entity). `variant`: `header` (Icon + Titel +
Untertitel) oder `divider` (Linie mit optionalem Label). Optionen: `title`,
`subtitle`, `icon`, `accent`.

## Gemeinsame Konzepte

### Akzentfarben (`accent`)
`blue` · `amber` · `mint` · `violet` · `rose`

### Icons (`icon`)
Eingebautes SVG-Icon-Set (im Editor als Dropdown). Beispiele: `lightbulb`,
`thermo`, `lock`, `blinds`, `speaker`, `bell`, `sun`, `snowflake` …

### Layout / Gerät (`layout`)
Jede Karte (außer Header) hat **Layout / Gerät**: `auto · mobil · tablet · desktop`.

- `auto` (Standard) richtet sich nach der Bildschirmbreite — Mobil ≤640 px,
  Tablet ≤1024 px, sonst Desktop — und passt sich automatisch an.
- Feste Werte erzwingen ein Layout, z. B. `layout: tablet`.

### Module
Jede Karte kann mit **Modulen** erweitert werden (Status-Badge, Glow, eigene
Tap-Aktion …). Im Editor unter **Module**. Siehe [../modules.md](../modules.md).

## Eigene Karten (Community)
Eigene Karten lassen sich registrieren und erscheinen automatisch im Dropdown —
siehe [../plugin-development.md](../plugin-development.md).
