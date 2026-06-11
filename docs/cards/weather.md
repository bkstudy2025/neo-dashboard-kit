# Neo Wetter (`neo-weather-card`)

Wetter-Banner mit zustandsabhängigem Icon, Temperatur, gefühlter Temperatur,
Sonnenuntergang und Luftfeuchtigkeit. Tap öffnet den HA-Info-Dialog.

## Beispiel

```yaml
type: custom:neo-card
card_type: neo-weather-card
entity: weather.forecast_home
sunset_entity: sensor.sun_next_setting
```

## Optionen

| Option | Typ | Standard | Beschreibung |
|---|---|---|---|
| `entity` | entity (`weather`) | `weather.forecast_home` | Wetter-Integration |
| `sunset_entity` | entity (`sensor`) | `sensor.sun_next_setting` | Sonnenuntergangs-Zeit |

## Verhalten
- **Icon** wechselt automatisch je Wetterzustand (Sonne, Mond, Wolke, Regen, Schnee, Gewitter, Nebel …) mit passender Farbe.
- **Untertitel** zeigt – sofern verfügbar – „Gefühlt X° · Sonnenuntergang HH:MM · Luftfeuchtigkeit Y%".
- Werte stammen aus den Attributen der `weather`-Entity (`temperature`, `apparent_temperature`, `humidity`).
