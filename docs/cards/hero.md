# Neo Hero / Begrüßung (`neo-hero-card`)

Begrüßung mit Name, Anwesenheitsstatus und bis zu drei konfigurierbaren Action-Buttons.

## Beispiel

```yaml
type: custom:neo-card
card_type: neo-hero-card
name: ""                       # leer = angemeldeter HA-Benutzer
person_entity: person.marcel   # Status Zuhause/Unterwegs
name_color: [124, 156, 255]    # optional: Namensfarbe
name_color2: [192, 132, 252]   # optional: 2. Farbe = Verlauf
button1:
  show: true
  icon: search
  action: quickbar
button2:
  show: true
  icon: calendar
  action: navigate
  path: /lovelace/kalender
  badge_entity: sensor.kalender_heute
button3:
  show: true
  icon: bell
  action: navigate
  path: /lovelace/benachrichtigungen
  badge_entity: sensor.benachrichtigungen
```

## Optionen

| Option | Typ | Standard | Beschreibung |
|---|---|---|---|
| `name` | string | angemeldeter Benutzer | Anzeigename in der Begrüßung |
| `greeting_text` | string | automatisch nach Uhrzeit | z.B. „Guten Morgen" |
| `person_entity` | entity (`person`) | – | Quelle für Status Zuhause/Unterwegs |
| `show_status_dot` | bool | `true` | farbigen Status-Punkt anzeigen |
| `name_color` | RGB | – | Farbe des Namens |
| `name_color2` | RGB | – | 2. Farbe → Verlauf (nur mit `name_color`) |
| `button1`–`button3` | objekt | s.u. | die drei Buttons |

### Button-Optionen (`button1`, `button2`, `button3`)

| Option | Typ | Standard | Beschreibung |
|---|---|---|---|
| `show` | bool | `true` | Button anzeigen |
| `icon` | icon-name | `search` / `calendar` / `bell` | Icon |
| `action` | string | `quickbar` (B1) / `navigate` | siehe unten |
| `path` | string | – | Ziel bei `action: navigate` |
| `badge_entity` | entity | – | steuert Badge (siehe unten) |
| `accent` | accent | rose/violet | Akzentfarbe bei aktivem Badge |
| `highlight` | bool | `true` | Button bei Meldung einfärben |

### Aktionen (`action`)

| Wert | Funktion |
|---|---|
| `quickbar` | HA Schnellsuche (Entitäten) öffnen |
| `quickbar_commands` | HA Befehls-Palette öffnen |
| `navigate` | zu `path` navigieren |
| `more_info` | Info-Dialog der `badge_entity` öffnen |
| `none` | keine Aktion |

### Badge-Logik (`badge_entity`)

| Entity-Status | Badge |
|---|---|
| Zahl > 0 | Zähler-Bubble (z.B. „3") |
| `on` | farbiger Punkt |
| sonst | kein Badge |

## Voraussetzung
Damit der Status (Zuhause/Unterwegs) wechselt, braucht es eine `person`-Entity.
Für Badges eignen sich Template-Sensoren, die z.B. heutige Termine oder offene
Benachrichtigungen zählen.
