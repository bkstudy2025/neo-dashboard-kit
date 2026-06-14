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
| `layout` | `auto`·`mobile`·`tablet`·`desktop` | `auto` | Geräte-Layout (siehe unten) |
| `columns` | 1–4 | automatisch | Kacheln pro Ansicht (leer = je Layout: Desktop 2, Tablet/Mobil 3) |
| `tile_height` | px | automatisch | Kachelhöhe (leer = je Layout: Mobil 94, Tablet 120, Desktop 150) |
| `show_toggle` | bool | `true` | Toggle anzeigen (im Mobil-Layout immer aus → zentriertes Icon) |
| `show_arrows` | bool | `true` | Pfeile (Touch: dauerhaft wenn scrollbar · Maus: bei Hover) |
| `show_dots` | bool | `true` | Indikator-Punkte (ab 2 Seiten) |
| `items` | Liste | – | Aktions-Kacheln |

> **Responsives Layout:** `layout: auto` richtet sich nach der Bildschirmbreite
> (Mobil ≤640 px, Tablet ≤1024 px, sonst Desktop). Für ein festes Mobil-/Tablet-
> Dashboard kann man `layout` hart setzen. Mobil = sehr kompakt (zentriertes Icon,
> 3 Spalten); Tablet = kompakt mit Toggle; Desktop = volle Größe, 2 Spalten.
> `columns`/`tile_height` überschreiben die Automatik. (`compact_mode` aus älteren
> Versionen wird weiterhin gelesen.)

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
