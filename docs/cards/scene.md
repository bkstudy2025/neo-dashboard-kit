# Neo Szene (`neo-scene-card`)

Kachel zum Aktivieren einer Szene per Tap. Aktive Szene leuchtet im Akzent.

## Beispiel

```yaml
type: custom:neo-card
card_type: neo-scene-card
entity: scene.film_abend
name: Film Abend
sub: "6 Geräte"
icon: sparkle
accent: violet
```

## Optionen

| Option | Typ | Standard | Beschreibung |
|---|---|---|---|
| `entity` | entity (`scene`) | – | die Szene |
| `name` | string | friendly_name | Anzeigename |
| `sub` | string | – | Untertitel (z.B. Geräteanzahl) |
| `icon` | icon-name | `sparkle` | Icon aus dem Neo-Set |
| `accent` | accent | `violet` | Akzentfarbe |

## Verhalten
- **Tap** ruft `scene.turn_on` für die Entity auf.
