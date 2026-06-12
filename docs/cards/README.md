# Neo Dashboard Kit — Karten

Alle Karten werden über die Wrapper-Karte `custom:neo-card` verwendet. Im visuellen
Editor wählst du den **Kartentyp** über ein Dropdown; per YAML über das Feld `card_type`.

```yaml
type: custom:neo-card
card_type: <kartentyp>
# ... kartenspezifische Optionen
```

## Übersicht

| Karte | Kartentyp | Doku |
|---|---|---|
| Hero / Begrüßung | `neo-hero-card` | [hero.md](hero.md) |
| Status-Leiste | `neo-status-card` | [status.md](status.md) |
| Wetter *(Premium-Modul)* | `neo-weather-card` | [weather.md](weather.md) |
| Licht | `neo-light-card` | [light.md](light.md) |
| Sensor | `neo-sensor-card` | [sensor.md](sensor.md) |
| Szene | `neo-scene-card` | [scene.md](scene.md) |
| Schnellaktion | `neo-quick-action-card` | [quick-action.md](quick-action.md) |

## Gemeinsame Konzepte

### Akzentfarben
Viele Karten haben eine Option `accent`:

`blue` · `amber` · `mint` · `violet` · `rose`

### Icons
Karten mit Icon-Auswahl nutzen das eingebaute SVG-Icon-Set (im Editor als Dropdown).
Beispiele: `lightbulb`, `thermo`, `lock`, `blinds`, `calendar`, `bell`, `sun`, `leaf` …

### Eigene Karten (Community)
Eigene Karten lassen sich registrieren und erscheinen automatisch im Dropdown —
siehe [../plugin-development.md](../plugin-development.md).
