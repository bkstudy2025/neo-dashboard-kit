# Neo Status-Leiste (`neo-status-card`)

Horizontale Leiste aus Status-„Pills", die sich wie ein **Karussell** verhält:
Bei mehr Pills als Platz erscheinen **Pfeil-Buttons** zum Scrollen (links/rechts).
Jede Pill zeigt Icon + Text und kann beim Tap den Info-Dialog öffnen.

## Beispiel (Editor-Slots)

```yaml
type: custom:neo-card
card_type: neo-status-card
pill1:
  icon: shieldOk
  name: Armed
  accent: mint
  entity: alarm_control_panel.home   # optional, für Tap-Dialog
pill2:
  icon: leaf
  entity: sensor.power               # Text = Status + Einheit
  accent: mint
pill3:
  icon: rooms
  name: "2 home"
  accent: blue
```

## Beispiel (YAML-Liste, unbegrenzt)

```yaml
type: custom:neo-card
card_type: neo-status-card
pills:
  - { icon: shieldOk, name: Armed, accent: mint }
  - { icon: leaf, entity: sensor.power, accent: mint }
  - { icon: rooms, name: "2 home", accent: blue }
  - { icon: thermo, entity: sensor.temperatur_kueche_temperature, accent: amber }
```

## Pill-Optionen

| Option | Typ | Beschreibung |
|---|---|---|
| `show` | bool | Pill anzeigen (Editor-Slots; Standard `true`) |
| `icon` | icon-name | Icon aus dem Neo-Set |
| `name` | string | Statischer Text. Leer → zeigt den Entity-Status (+ Einheit) |
| `entity` | entity | Quelle für Text (wenn `name` leer) und Tap-Dialog |
| `accent` | accent | Farbe des Icons (`blue`/`amber`/`mint`/`violet`/`rose`) |

## Verhalten
- **Karussell:** horizontal scrollbar; Pfeile erscheinen nur bei Überlauf und
  blenden am Anfang/Ende aus.
- **Tap** auf eine Pill mit `entity` öffnet den HA-Info-Dialog.
- Scrollposition bleibt bei Status-Updates erhalten.

## Konfiguration
- **Editor:** bis zu 6 Pill-Slots (einklappbar).
- **YAML:** beliebig viele über die `pills:`-Liste (hat Vorrang vor den Slots).
