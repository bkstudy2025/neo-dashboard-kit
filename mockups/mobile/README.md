# Neo Dashboard — Mobile Screens (Design-Set)

Drei zusammengehörige **Mobile-Screens** (iPhone-Hochformat, ein-spaltig,
≤ 640 px) im „Neo"-Look mit **identischer Design-Sprache** und **gemeinsamer
Bottom-Navigation**:

| Screen | Datei | Fokus |
|--------|-------|-------|
| **Server** | [`server.html`](server.html) | ruhig & sachlich — Health-Hero, KPI-Grid, Integrationen, Netzwerk, Updates, Backup, Warnungen |
| **Kalender** | [`calendar.html`](calendar.html) | Agenda-first — „Nächster Termin"-Hero, Wochenstreifen, gruppierte Agenda, Kalender-Filter |
| **Wohnzimmer** | [`room.html`](room.html) | der wichtigste Screen — Raum-Foto, Stat-Pillen, Schnellsteuerung, Szenen-Scroller, Geräte nach Gruppen |

**Vorschau:** [`index.html`](index.html) zeigt alle drei Screens nebeneinander.

## Design-Sprache

Die Tokens spiegeln [`src/core/tokens.js`](../../src/core/tokens.js):

- **Hintergrund** dunkel & blaustichig (fast Schwarz), oben atmosphärisches
  Verlaufs-„Foto" mit weichem Dunkel-Fade nach unten.
- **Glaskarten** — sehr transparente Füllung (2–6 %), hauchdünne helle Kante,
  `blur(24px) saturate(140%)`, Radius `24px`, weicher tiefer Schatten.
- **Typo** SF Pro Display / Inter — Werte fett `#F4F6FB`, Labels 72 %, Meta 50 %.
- **Genau ein Akzent je Kontext**, semantisch:
  `amber #FFB26B` Licht/Rollladen · `mint #5EDCB8` online/anwesend ·
  `blau #7C9CFF` Medien/Roboter/Netzwerk/Navigation · `violett #C084FC`
  Marke/KI/Badges/Links · `rosé #F87171` Problem/Fehler/Aus.
- **Bausteine** Status-Pillen, Steuerungs-Chips, 8px-Status-Punkte, violette
  Zähler-Badges, „Alle anzeigen ›", horizontale Foto-Scroller.
- Nur schlichte **Inline-Line-Icons** (aus dem Projekt-Icon-Set), keine Emoji.
  Touch-first (44px Trefferflächen, Press-Feedback), Safe-Area oben & unten.
- **Bottom-Nav** auf allen Screens identisch: Übersicht · Server · **Home**
  (erhöht, blau leuchtend) · Energie · Einstellungen.

## Aufbau

Alles wird aus **einer Quelle** generiert, damit die drei Screens garantiert
dieselbe Design-Sprache teilen:

```
neo-mobile.css   → das geteilte Design-System (Single Source of Truth)
icons.json       → Projekt-Icon-Pfade (aus src/core/icons.js)
build.mjs        → baut Icon-Sprite + Screens, inlined CSS → self-contained HTML
```

Die generierten `*.html` sind **eigenständig** (kein Server, keine externen
Requests) und lassen sich direkt im Browser öffnen.

```bash
node build.mjs
```

> Generierte Dateien (`server.html`, `calendar.html`, `room.html`,
> `index.html`, `artifact.html`) sind Build-Artefakte — Änderungen bitte in
> `neo-mobile.css` / `build.mjs` vornehmen und neu bauen.
