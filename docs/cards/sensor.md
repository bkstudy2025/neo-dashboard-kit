# Neo Sensor (`neo-sensor-card`)

Kompakte Kachel für einen einzelnen Sensorwert mit Icon und Einheit.

## Beispiel

```yaml
type: custom:neo-card
card_type: neo-sensor-card
entity: sensor.temperatur_kueche_temperature
name: Küche
icon: thermo
unit: "°C"
accent: mint
```

## Optionen

| Option | Typ | Standard | Beschreibung |
|---|---|---|---|
| `entity` | entity (`sensor`) | – | der Sensor |
| `name` | string | friendly_name | Anzeigename |
| `icon` | icon-name | `thermo` | Icon aus dem Neo-Set |
| `unit` | string | Einheit der Entity | Einheit überschreiben |
| `accent` | accent | `mint` | Akzentfarbe |

## Verhalten
- Zeigt den aktuellen Status der Entity groß an, daneben die Einheit.
- Aktualisiert sich automatisch bei Wertänderung.
