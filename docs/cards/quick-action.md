# Neo Schnellaktion (`neo-quick-action-card`)

Schalt-Kachel mit Toggle für beliebige schaltbare Entitäten (switch, light, input_boolean …).

## Beispiel

```yaml
type: custom:neo-card
card_type: neo-quick-action-card
entity: switch.steckdose_wohnzimmer
name: Steckdose
sub: ""              # optional, sonst An/Aus
icon: plug
accent: blue
```

## Optionen

| Option | Typ | Standard | Beschreibung |
|---|---|---|---|
| `entity` | entity | – | schaltbare Entity |
| `name` | string | friendly_name | Anzeigename |
| `sub` | string | „An" / „Aus" | Untertitel |
| `icon` | icon-name | `plug` | Icon aus dem Neo-Set |
| `accent` | accent | `blue` | Akzentfarbe |

## Verhalten
- **Tap** schaltet die Entity (`turn_on`/`turn_off` je nach Domain).
- Aktiver Zustand färbt Karte + Toggle im Akzent.
