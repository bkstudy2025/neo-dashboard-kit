# Neo Quick Actions (`neo-quick-actions-card`) · Premium-Modul

Swipebares Karussell aus Aktions-Kacheln (Toggle / Szene / Info-Dialog) mit Pfeilen,
optionalen Indikator-Punkten und Snap-Scrolling.

> Premium-Modul — wird über **🧩 Module** (Code einfügen oder Store) installiert,
> nicht über das Kartentyp-Dropdown ohne Installation.

## Beispiel

```yaml
type: custom:neo-card
card_type: neo-quick-actions-card
columns: 2
tile_height: 150
show_toggle: true
show_arrows: true
show_dots: true
items:
  - { entity: scene.gute_nacht, name: "Good Night", sub: "6 Geräte", icon: moon, accent: violet }
  - { entity: light.wohnzimmer, name: "Wohnzimmer", icon: lightbulb, accent: amber }
  - { entity: switch.steckdose, name: "Steckdose", icon: plug, accent: blue }
```

## Optionen

| Option | Typ | Standard | Beschreibung |
|---|---|---|---|
| `columns` | 1–4 | `2` | Kacheln pro Ansicht |
| `tile_height` | px (90–260) | `150` | Kachelhöhe |
| `show_toggle` | bool | `true` | Toggle anzeigen. Aus → zentriertes großes Icon (Quickbar-Look) |
| `show_arrows` | bool | `true` | Pfeile (Touch: dauerhaft wenn scrollbar · Maus: bei Hover) |
| `show_dots` | bool | `true` | Indikator-Punkte (ab 2 Seiten) |
| `items` | Liste | – | Aktions-Kacheln |

### Item-Felder

| Feld | Beschreibung |
|---|---|
| `entity` | Entity (switch, light, scene, …) |
| `name` | Anzeigename (sonst friendly_name) |
| `sub` | Untertitel (sonst An/Aus) |
| `icon` | Icon aus dem Neo-Set |
| `accent` | Akzentfarbe |
| `tap_action` | `auto` (Toggle/Szene), `more_info`, `scene` |

## Verhalten
- **Tap** auf die ganze Kachel schaltet/aktiviert (großes Touch-Ziel).
- Scrollposition bleibt bei Status-Updates erhalten.
- Alles CSS-animiert (kein Canvas), performant.
