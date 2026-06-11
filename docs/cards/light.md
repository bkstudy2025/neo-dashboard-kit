# Neo Licht (`neo-light-card`)

Licht-Kachel mit Ein/Aus-Toggle und Helligkeits-Slider. Unterstützt Farb-Lampen
(RGB-Farbe wird übernommen).

## Beispiel

```yaml
type: custom:neo-card
card_type: neo-light-card
entity: light.wohnzimmer
name: Wohnzimmer      # optional, sonst friendly_name
accent: amber
```

## Optionen

| Option | Typ | Standard | Beschreibung |
|---|---|---|---|
| `entity` | entity (`light`) | – | das Licht |
| `name` | string | friendly_name | Anzeigename |
| `accent` | accent | `amber` | Akzentfarbe (wenn keine RGB-Farbe) |

## Verhalten
- **Toggle** rechts oben schaltet ein/aus.
- **Slider** setzt die Helligkeit (1–100 %); Verschieben schaltet das Licht bei Bedarf ein.
- **Tap auf die Karte** schaltet ein/aus.
- Bei Farb-Lampen färbt sich Karte/Icon in der aktuellen Lichtfarbe.
