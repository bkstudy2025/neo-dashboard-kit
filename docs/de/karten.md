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
| Licht / Schalter | Ein-/Aus-Schalter (Licht zusätzlich Helligkeit) |
| Ventilator | Schalter + Stufe |
| Rollladen | Auf / Stopp / Zu |
| Klima/Thermostat | Temperatur − / + |
| Media-Player | ⏮ ⏯ ⏭ |
| Schloss | Ver-/Entriegeln |
| Alarmanlage | Zuhause / Abwesend ↔ Unscharf |
| Szene / Skript | Tippen löst aus |
| Licht-Gruppe | mehrere Lichter zusammen (Feld `entities`) |

**Optionen:** `entity` (oder `entities` für Gruppen), `name`, `sub`
(Untertitel), `icon`, `accent` (Farbe), `layout`.
*Fortgeschritten (YAML):* `step` (Klima-Schrittweite), `code` (Alarm-Code).

## 📊 Neo Anzeige — `neo-display-card`
Zeigt Werte an, ohne zu schalten. Tippen öffnet den Geräte-Dialog.

| Gerät | Anzeige |
|---|---|
| Sensor / Binärsensor / Zahl | Wert + Einheit |
| Kamera | Standbild (Live per Tippen) |

**Optionen:** `entity`, `name`, `sub`, `icon`, `unit` (Einheit), `accent`, `layout`.

## 🔖 Neo Header — `neo-header-card`
Reiner Layout-Baustein (kein Gerät) zum Strukturieren.
- `variant: header` — Icon + Titel + Untertitel
- `variant: divider` — Trennlinie mit optionalem Text

**Optionen:** `title`, `subtitle`, `icon`, `accent`.

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
