# Neo Dashboard Kit — Karten

Alle Karten laufen über **eine** Wrapper-Karte: `custom:neo-card`. Im visuellen
Editor wählst du den **Kartentyp**; per YAML über `card_type`.

```yaml
type: custom:neo-card
card_type: neo-control-card
entity: climate.wohnzimmer
```

> **Prinzip:** Drei Karten statt vieler Typen — du wählst eine, suchst deine
> **Entität**, die Karte passt sich an. Nur die wichtigste Steuerung liegt auf der
> Karte; der **volle** Funktionsumfang ist über **Tap → More-Info** erreichbar.
> Alles Weitere kommt über **Module** ([../modules.md](../modules.md)).

## Die drei Karten

### Neo Steuerung — `neo-control-card`
Eine Karte für **alle steuerbaren Geräte**. Erkennt die Domain der Entität und
zeigt automatisch die passende Bedienung:

| Domain | Inline-Steuerung |
|---|---|
| `light` / `switch` / `input_boolean` | Toggle (Licht zusätzlich Helligkeit) |
| `fan` | Toggle + Stufe |
| `cover` | Auf / Stopp / Zu |
| `climate` | Zieltemperatur − / + |
| `media_player` | ⏮ ⏯ ⏭ |
| `lock` | Ver-/Entriegeln |
| `alarm_control_panel` | Zuhause / Abwesend ↔ Unscharf |
| `scene` / `script` / `button` | Tap löst aus |
| mehrere Lichter (`entities`) | Gruppen-Toggle + Sammel-Helligkeit |

Optionen: `entity` (oder `entities` für Licht-Gruppe), `name`, `sub`, `icon`,
`accent`, `layout`. Erweitert (YAML): `step` (Klima), `code` (Alarm).

### Neo Anzeige — `neo-display-card`
Reine Darstellung; Tap → More-Info.

| Domain | Anzeige |
|---|---|
| `sensor` / `binary_sensor` / `number` / `input_number` | Wert + Einheit |
| `camera` | Snapshot-Kachel (Live über More-Info) |

Optionen: `entity`, `name`, `sub`, `icon`, `unit`, `accent`, `layout`.

### Neo Header — `neo-header-card`
Layout-Baustein (ohne Entity). `variant`: `header` (Icon + Titel + Untertitel)
oder `divider` (Linie mit Label). Optionen: `title`, `subtitle`, `icon`, `accent`.

## Gemeinsame Konzepte

### Akzentfarben (`accent`)
`blue` · `amber` · `mint` · `violet` · `rose`

### Layout / Gerät (`layout`)
`auto · mobil · tablet · desktop` — `auto` richtet sich nach der Bildschirmbreite.

### Module
Jede Karte ist mit **Modulen** erweiterbar (Badge, Glow, eigene Tap-Aktion …).
Siehe [../modules.md](../modules.md).

## Kompatibilität
Ältere Einzeltypen (`neo-button-card`, `neo-sensor-card`, `neo-climate-card`,
`neo-cover-card`, `neo-media-card`, `neo-camera-card`, `neo-fan-card`,
`neo-alarm-card`, `neo-light-group-card`) bleiben als **versteckte Aliasse**
erhalten und rendern bestehende Dashboards weiter.

## Eigene Karten (Community)
Eigene Karten registrieren — siehe [../plugin-development.md](../plugin-development.md).
