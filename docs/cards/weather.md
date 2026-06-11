# Neo Wetter (`neo-weather-card`)

Wetter-Banner mit **animiertem, wetterabhängigem Hintergrund** (Verlauf je Zustand,
Tag/Nacht) und passenden Animationen (Regen, Schnee, Sterne, fotorealistische Wolken,
Nebel, Sonne, Blitz, Hagel, Glut). Tap öffnet den HA-Info-Dialog.

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
| `animated_background` | bool | `true` | Verlauf-Hintergrund je Zustand |
| `animations` | bool | `true` | Partikel/Wolken-Animationen |
| `cloud_image` | string (URL) | mitgeliefertes PNG | eigenes Wolken-PNG |

## Animationen je Zustand

| Zustand | Effekt |
|---|---|
| `sunny` / `clear` | Sonnen-Glow (Tag) / Sterne (Nacht) |
| `partlycloudy` | wenige Wolken |
| `cloudy` | dichte Wolken |
| `rainy` / `pouring` | Regen (schräg) + Wolken |
| `snowy` / `snowy-rainy` | Schnee |
| `lightning` / `lightning-rainy` | Blitz + Wolken (+ Regen) |
| `fog` | Nebelschwaden |
| `windy-variant` | dichte Wolken |
| `hail` | Hagelkörner |
| `exceptional` | aufsteigende Glut-Funken |

Nachts werden Hintergründe dunkler und Wolken bläulich getönt (über `sun.sun`
oder `-night`-Zustände).

## Verhalten & Performance
- Alle Effekte laufen über **CSS** (keine Canvas-/JS-Schleife) → GPU-freundlich.
- Wolken nutzen eine echte PNG-Textur (mehrere driften in Tiefe).
- Respektiert `prefers-reduced-motion` (System-Einstellung „Bewegung reduzieren").

## Test-Tipp
Eine Test-Entity per `input_select` + Template-Wetter anlegen, um alle Zustände
bequem über ein Dropdown durchzuschalten (siehe README / Diskussionen).

## Bildnachweis
Wolken-Textur aus [Bubble Card](https://github.com/Clooos/Bubble-Card) (Clooos, MIT).
