# Karten

🇩🇪 Deutsch · [🇬🇧 English](../en/cards.md) · [← Übersicht](README.md)

Es gibt **drei** Karten. Du wählst eine, suchst deine **Entität** — der Rest
passt sich automatisch an. Alle laufen über die Wrapper-Karte `custom:neo-card`.

```yaml
type: custom:neo-card
card_type: neo-control-card
entity: climate.wohnzimmer
```

## 🎛️ Neo Steuerung — `neo-control-card`
Eine Karte für **alle steuerbaren Geräte**. Sie erkennt die Art der Entität und
zeigt die passende Bedienung:

| Gerät | Bedienung auf der Karte |
|---|---|
| Licht / Schalter | Ein-/Aus-Schalter (dimmbares Licht zusätzlich Helligkeit) |
| Ventilator | Schalter + Stufe + Voreinstellungen, Oszillation, Richtung |
| Rollladen | Auf / Stopp / Zu + Position + Neigung |
| Klima/Thermostat | Temperatur − / + + Modi + Voreinstellungen (optional Lüftung/Schwenken/Luftfeuchte) |
| Media-Player | ⏮ ⏯ ⏭ + Lautstärke, Stumm (optional Quelle, Power) |
| Schloss | Ver-/Entriegeln |
| Alarmanlage | Zuhause / Abwesend ↔ Unscharf |
| Szene / Skript / Taster | Tippen löst aus (`scene.turn_on` / `script.turn_on` / `button.press`) |
| Licht-Gruppe | mehrere Lichter zusammen (Feld `entities`) |

> **Capability-aware:** Es werden nur Bedienelemente gezeigt, die die Entität
> tatsächlich unterstützt — ein nicht dimmbares Licht bekommt keinen
> Helligkeits-Slider, ein Cover ohne Positions-Funktion keinen Positions-Slider
> usw. **`unknown`/`unavailable`** wird sauber als „Nicht verfügbar" / „—"
> dargestellt (kein irreführender Aktiv-Zustand, keine kaputten Buttons);
> More-Info bleibt verfügbar, solange eine `entity` gesetzt ist.

**Optionen:** `entity` (oder `entities` für Gruppen), `name`, `sub`
(Untertitel), `icon`, `accent` (Farbe), `layout`.
*Fortgeschritten (YAML):* `step` (Klima-Schrittweite), `code` (Alarm-Code).

> **Icons:** Das `icon`-Feld akzeptiert die **mitgelieferten Neo-Icons**
> (Namen ohne Präfix, z. B. `lightbulb`, `bell`, `search` — im Editor als
> Auswahlliste) **oder** jedes HA-Icon mit Präfix (z. B. `mdi:sofa`), das
> sich frei in dasselbe Feld eintippen lässt.

### Sichtbarkeit von Bedienelementen
Alle Schalter sind standardmäßig **an** (außer den unten markierten) und nur
wirksam, wenn die Entität die Funktion unterstützt.

| Option | Default | Gilt für |
|---|---|---|
| `show_toggle` | `true` | Licht, Schalter, Ventilator, Schloss, Licht-Gruppe |
| `show_brightness` | `true` | Licht, Licht-Gruppe (nur dimmbar) |
| `show_percentage` | `true` | Ventilator |
| `show_fan_presets` | `true` | Ventilator |
| `show_fan_oscillate` | `true` | Ventilator |
| `show_fan_direction` | `true` | Ventilator |
| `show_cover_controls` | `true` | Cover (Auf/Stopp/Zu) |
| `show_cover_position` | `true` | Cover |
| `show_cover_tilt` | `true` | Cover |
| `show_temperature_controls` | `true` | Klima |
| `show_hvac_modes` | `true` | Klima |
| `show_climate_presets` | `true` | Klima |
| `show_climate_fan_modes` | `false` | Klima |
| `show_climate_swing_modes` | `false` | Klima |
| `show_humidity` | `false` | Klima |
| `show_media_controls` | `true` | Media |
| `show_volume` | `true` | Media |
| `show_mute` | `true` | Media |
| `show_source` | `false` | Media |
| `show_media_power` | `false` | Media |
| `show_alarm_controls` | `true` | Alarm |

Bei Cover bestimmt die `device_class` (z. B. `garage`, `door`, `gate`,
`window`, `shutter`, `blind`, `curtain`, `awning`, `shade`) sinnvolles Icon und
Label.

### Beispiele

```yaml
# Licht (dimmbar) – Tap öffnet More-Info, langes Drücken schaltet
type: custom:neo-card
card_type: neo-control-card
device_type: light
entity: light.wohnzimmer
show_toggle: true
show_brightness: true
tap_action:
  action: more-info
hold_action:
  action: toggle
```

```yaml
# Ventilator
type: custom:neo-card
card_type: neo-control-card
device_type: fan
entity: fan.schlafzimmer
show_percentage: true
show_fan_presets: true
show_fan_oscillate: true
```

```yaml
# Cover
type: custom:neo-card
card_type: neo-control-card
device_type: cover
entity: cover.rollladen_wohnzimmer
show_cover_position: true
show_cover_tilt: false
```

```yaml
# Klima
type: custom:neo-card
card_type: neo-control-card
device_type: climate
entity: climate.wohnzimmer
show_hvac_modes: true
show_climate_presets: true
show_climate_fan_modes: false
```

```yaml
# Media
type: custom:neo-card
card_type: neo-control-card
device_type: media_player
entity: media_player.wohnzimmer
show_volume: true
show_mute: true
show_source: false
```

## 📊 Neo Anzeige — `neo-display-card`
Zeigt Werte an, ohne zu schalten. Tippen öffnet den Geräte-Dialog.

| Gerät | Anzeige |
|---|---|
| Sensor / Binärsensor / Zahl | Wert + Einheit |
| Kamera | Standbild (Live per Tippen) |

**Optionen:** `entity`, `name`, `sub`, `icon`, `unit` (Einheit), `accent`, `layout`.

**Aktionen:** `tap_action` (Default `more-info`), `hold_action`, `double_tap_action`.
`toggle` wirkt nur, wenn die Entität schaltbar ist; andernfalls wird es ignoriert.
Vorschau für Markdown, Kamera, Badge, Wetter und Kalender bleibt stabil.

## 🔖 Neo Header — `neo-header-card`
Reiner Layout-Baustein (kein Gerät) zum Strukturieren.
- `variant: header` — Icon + Titel + Untertitel
- `variant: divider` — Trennlinie mit optionalem Text

**Optionen:** `title`, `subtitle`, `icon`, `accent`.

**Aktionen:** `tap_action` (Default `none`), `hold_action`, `double_tap_action`
(`navigate` · `url` · `call-service` · `none`). Ohne konfigurierte Aktion bleiben
Überschrift und Trenner reine Layout-Elemente.

---

## Aktionen (`tap_action` · `hold_action` · `double_tap_action`)

Alle drei Karten unterstützen ein Home-Assistant-übliches Aktions-System —
konfigurierbar **im visuellen Editor** *und* per **YAML**.

**Im Editor:** Abschnitt **Aktionen** → **Tippen** / **Halten** /
**Doppeltippen**. Dort wählst du die Aktion und die passenden Felder erscheinen
automatisch (Navigationspfad, URL, Service mit Ziel/Daten). Es ist der native
Home-Assistant-Aktions-Editor. **„Standard"** entfernt die Aktion wieder
(Karten-Standardverhalten greift).

**Unterstützte Aktionen:** `more-info` · `toggle` · `navigate` · `url` ·
`call-service` (HA: `perform-action`) · `none`.

**Defaults:**

| Karte | `tap_action` | `hold_action` | `double_tap_action` |
|---|---|---|---|
| Neo Steuerung | Domain-Standard¹ | `none` | `none` |
| Neo Anzeige | `more-info` | `none` | `none` |
| Neo Header | `none` | `none` | `none` |

¹ Domain-Standard der Steuerung: Szene → `scene.turn_on`, Skript →
`script.turn_on`, Taster → `button.press`, Licht-Gruppe → umschalten, alle
anderen entity-basierten Typen → `more-info`. Eine eigene `tap_action`
**überschreibt** den Domain-Standard.

```yaml
# URL öffnen (nur relative HA-Pfade sowie http/https; ungültige URLs werden ignoriert)
tap_action:
  action: url
  url_path: https://example.com
```

```yaml
# Navigieren
tap_action:
  action: navigate
  navigation_path: /lovelace/licht
```

```yaml
# Dienst aufrufen — mit Bestätigung
tap_action:
  action: call-service
  service: light.turn_on
  target:
    entity_id: light.wohnzimmer
  data:
    brightness_pct: 50
  confirmation:
    text: Lichtszene starten?
```

```yaml
# Alle drei Gesten an einer Karte
type: custom:neo-card
card_type: neo-control-card
device_type: light
entity: light.wohnzimmer
tap_action:
  action: more-info
hold_action:
  action: toggle
double_tap_action:
  action: navigate
  navigation_path: /lovelace/licht
```

```yaml
# Header als Navigations-Element
type: custom:neo-card
card_type: neo-header-card
variant: header
title: Wohnzimmer
tap_action:
  action: navigate
  navigation_path: /lovelace/wohnzimmer
```

**Bestätigung:** `confirmation: true` zeigt einen generischen Text
(„Aktion wirklich ausführen?"), `confirmation.text` einen eigenen. Vor der
Ausführung erscheint ein `window.confirm` — bei Abbruch passiert nichts.
*Hinweis:* Wie im Home-Assistant-Kern hat der Aktions-Editor kein eigenes
Feld dafür — `confirmation` wird per **YAML** gesetzt und bleibt bei
Editor-Änderungen erhalten.

**`call-service`:** `service: "domain.service"`, optional `target`, `data`
(bzw. `service_data` als Alias).

**Sicherheit (`url`):** Die URL wird über den `safeUrl()`-Helfer geprüft; erlaubt
sind nur **relative HA-Pfade** (`/lovelace/...`) sowie **`http`/`https`**.
Ungültige URLs werden ignoriert (kein Absturz).

---

## Gemeinsame Optionen

**Farbe (`accent`):** `blue` · `amber` · `mint` · `violet` · `rose`

**Layout (`layout`):** `auto` (Standard, richtet sich nach der Bildschirmbreite)
· `mobil` · `tablet` · `desktop`

**Module:** Jede Karte lässt sich mit Modulen erweitern (z. B. Status-Badge,
Leuchtrahmen). Siehe **[Module & Store](module.md)**.

> Hinweis: Es gibt bewusst **nur diese drei** Karten. Gerätespezifisches
> (Licht, Klima, Rollladen, Media …) übernimmt die **Steuerung**-Karte
> automatisch je nach Entität. Zusätzliche Kartentypen kommen über den
> **Store** oder **Premium**.
