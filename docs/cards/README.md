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
| Quick Actions *(Premium-Modul)* | `neo-quick-actions-card` | [quick-actions.md](quick-actions.md) |
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

### Layout / Gerät
**Jede** Karte hat im Editor die Auswahl **Layout / Gerät**: `auto · mobil · tablet · desktop`.

- `auto` (Standard) richtet sich nach der Bildschirmbreite — Mobil ≤640 px,
  Tablet ≤1024 px, sonst Desktop — und passt sich automatisch an, wenn ein
  Breakpoint überschritten wird.
- Feste Werte erzwingen ein Layout, z. B. `layout: tablet` für ein dediziertes
  Tablet-Dashboard.

In den kompakten Stufen werden die Karten enger dargestellt. Einzelne Karten
nutzen das Layout zusätzlich inhaltlich (z. B. zeigt **Wetter** ab Tablet eine
Mehrtages-Vorhersage, **Quick Actions** wird mobil zum Icon-Raster).

### Eigene Karten (Community)
Eigene Karten lassen sich registrieren und erscheinen automatisch im Dropdown —
siehe [../plugin-development.md](../plugin-development.md).
