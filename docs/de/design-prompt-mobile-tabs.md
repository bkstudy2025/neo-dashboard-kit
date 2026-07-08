# Design-Prompt — Mobile Tabs (Server · Kalender · Raum)

> **Zweck:** Diese Datei legt die visuelle Richtung fest, in die wir für die
> **Mobile-Ansicht** gehen. Sie beschreibt die Design-DNA aus den Referenz-
> Screenshots und übersetzt sie in konkrete Vorgaben für den **Server-Tab**,
> den **Kalender-Tab** und den **Raum-Tab** – inklusive **aller Geräte**, die
> dort auftauchen. Am Ende jedes Kapitels steht ein **copy-paste-fertiger
> Prompt-Block** für Design-Tools (Figma Make, v0, KI-Mockups).
>
> **Scope:** ausschließlich **Mobile** (≤ 640 px, ein-spaltig, `env(safe-area-*)`).
> Tablet/Desktop bleiben bewusst außen vor.
>
> Alle Werte sind auf die bestehenden Neo-Tokens (`src/core/tokens.js`)
> abgestimmt – nichts hier erfindet ein zweites, konkurrierendes System.

---

## 0. Design-DNA in einem Satz

> **Ruhiges, dunkles Glas-Interface mit vollflächigen Raum-Fotos, weichem
> Tiefen-Blur und einem einzigen Akzent pro Kontext** – Zahlen groß und
> selbstbewusst, Sekundär-Info leise, Steuerung immer nur einen Daumen entfernt.

Was die Referenz-Screenshots gemeinsam haben und was wir übernehmen:

- **Dunkler, blaustichiger Hintergrund**, oben mit atmosphärischem Bild
  (Nachthimmel / Raum-Foto) und weichem Dunkel-Verlauf nach unten.
- **Glaskarten**: sehr transparente weiße Füllung, hauchdünne helle Kante,
  starker Blur. Radius **24 px**, großzügige Abstände.
- **Ein Akzent je Zustand** statt Farbrausch: Amber = warm/aktiv (Licht,
  Rollladen), Mint = alles gut / anwesend, Blau = Medien/Roboter, Violett =
  Marke/KI, Rosé = Problem/Aus.
- **Pillen & Chips** für Status und Schnellsteuerung (voll gerundet).
- **Große Werte** (Temperatur, kWh) fett; Einheiten & Labels gedämpft.
- **Abschnittskopf + „Alle anzeigen ›"** in Violett, darunter **horizontale
  Foto-Scroller** (Szenen, Räume).
- **Status-Punkte**: grün = ok, rot = Problem. **Badges** violett für Zähler.
- **Bottom-Nav** mit erhöhtem, leuchtendem Mittel-Button.

---

## 1. Design-Tokens (verbindlich)

Direkt aus `src/core/tokens.js` – **nicht abweichen**, sondern referenzieren.

### Flächen & Linien (Glas)
```
--neo-fill0   rgba(255,255,255,0.02)   /* fast leer, große Flächen        */
--neo-fill1   rgba(255,255,255,0.04)   /* Standard-Kartenfüllung          */
--neo-fill2   rgba(255,255,255,0.055)  /* gehobene Fläche / aktiver Chip   */
--neo-line1…6 rgba(255,255,255,0.06 … 0.16)  /* Kanten, aufsteigend      */
--neo-blur    blur(24px) saturate(140%)
--neo-radius  24px
```

### Text
```
--neo-text1   #F4F6FB              /* primär: Werte, Titel     */
--neo-text2   rgba(244,246,251,.72) /* sekundär: Labels        */
--neo-text3   rgba(244,246,251,.50) /* tertiär: Meta/Einheit    */
--neo-font    -apple-system, "SF Pro Display", "Inter", system-ui, sans-serif
```

### Akzente (`NEO_ACCENTS`) — genau **einer** pro Karte/Kontext
| Token   | Farbe     | Semantik im UI                                   |
|---------|-----------|--------------------------------------------------|
| blue    | `#7C9CFF` | Medien, Roboter, Netzwerk, aktive Navigation     |
| amber   | `#FFB26B` | Licht/Rollladen aktiv, „scharf", Warm-Zustände   |
| mint    | `#5EDCB8` | „alles gut", online, anwesend, Sicherheit ok     |
| violet  | `#C084FC` | Marke, KI-Empfehlung, Zähler-Badges, Links       |
| rose    | `#F87171` | Problem, Fehler, offline, „Aus"-Szene, kritisch  |

Jeder Akzent hat ein `glow` (35 % Alpha) für den Karten-Schatten
(`--neo-glow` / mobil `--neo-glow-m`).

### Elevation & Motion
```
Schatten (mobil):  var(--neo-glow-m, 0 8px 22px -14px rgba(0,0,0,.55))
Press-Feedback:    [role="button"]:active → scale(0.97)
Übergang:          all 240ms cubic-bezier(.2,.8,.2,1)
```

### Icons
Ausschließlich das Inline-SVG-Set aus `src/core/icons.js`
(`home, rooms, devices, energy, scenes, settings, lightbulb, thermo, blinds,
speaker, vacuum, plug, wifi, bell, calendar, shield, shieldOk, warning,
solar, camera, lock, sun, moon, cloud, rain, …`). **Keine Emoji, keine
Fremd-Icon-Packs.**

---

## 2. Mobile-Layout-System

- **Viewport:** ein-spaltig, max. **640 px**, volle Breite bis nah an den Rand.
- **Seitenabstand:** 16 px links/rechts. Karten dürfen fast randlos sitzen –
  deshalb mobil der **engere Schatten** (`--neo-glow-m`), damit der Glow nicht
  über die Bildschirmkante „abgeschnitten" wirkt.
- **Safe Areas:** oben `env(safe-area-inset-top)`, unten
  `env(safe-area-inset-bottom)` respektieren (Notch / Home-Indicator).
- **Vertikaler Rhythmus:** Abschnitte 24–28 px Abstand, Karten im Grid 12 px.
- **Karten mobil:** `padding:10px`, `min-height:96px` (aus Tokens).
- **Scroll:** Sektionen wie „Szenen"/„Räume" sind **horizontale Scroller**
  (Snap, Foto-Kacheln ~150×120 px), Rest scrollt vertikal.
- **Kein Hover-Design** – alles auf Touch (44 px Trefferflächen, Press-Scale).

### Wiederkehrende Bausteine (überall gleich)
1. **Top-Bar** (kontextuell): links Zurück-Pill oder Avatar, Titel, rechts
   Icon-Buttons (Kalender mit Badge, Glocke mit Punkt).
2. **Hero** (Raum/Detail): vollflächiges Foto, Dunkel-Verlauf unten, Titel +
   Subtitle darüber.
3. **Stat-Pille:** Glas-Pille, Icon + großer Wert + kleines Label
   (`🌡 23 °C Temperatur`).
4. **Control-Chip:** voll gerundeter Chip, Icon + Zustand + Gerätename,
   Akzent-Füllung wenn aktiv, sonst `--neo-fill1` + `--neo-line2`.
5. **Glaskarte:** Standard-Container, Radius 24, Blur, ein Akzent.
6. **Abschnittskopf:** fette Überschrift links, „Alle anzeigen ›" (violet)
   rechts.
7. **Status-Punkt / Badge:** 8 px Punkt (grün/rot), bzw. violette Zähler-Pille.
8. **Bottom-Nav:** 5 Slots, Mitte erhöht + Blau-Glow, aktives Icon leuchtet.

---

## 3. Server-Tab (System & Serverstatus)

**Ziel:** Auf einen Blick beantworten „Läuft mein Zuhause / mein Server
gesund?" – Health oben, Details darunter, Aktionen zum Schluss. Der Server-Tab
ist der **ruhigste, sachlichste** Tab: viele Zahlen, wenig Deko.

### Aufbau (von oben nach unten)
1. **Top-Bar:** Titel „Server", rechts Refresh-Icon + Status-Punkt
   (grün = alles online).
2. **Health-Hero-Karte** (volle Breite): großes Ampel-Signal
   – Mint „Alles läuft" / Amber „Hinweise" / Rosé „Probleme". Darunter drei
   Kern-KPIs als Mini-Pillen: **Uptime**, **HA-Version**, **letztes Backup**.
3. **KPI-Grid 2×2** (Glas-Badges, große Zahl + Ring/Sparkline):
   - **CPU-Last** %  (Akzent nach Schwelle: <70 mint, <90 amber, sonst rose)
   - **RAM** % / GB
   - **Speicher** frei/gesamt
   - **CPU-Temperatur** °C
4. **Integrationen & Add-ons** (Liste in Glaskarte): Name · Status-Punkt ·
   Zustand („läuft"/„Fehler"). Fehlerhafte nach oben, rot markiert.
5. **Netzwerk**-Karte: Internet up/down, LAN/WLAN-Clients, `wifi`-Icon.
6. **Updates**-Karte: Anzahl verfügbarer Updates als violette Badge, Liste
   Core/OS/Add-ons mit „Aktualisieren"-Button (amber, sekundär).
7. **Backups**-Karte: letztes/nächstes Backup, „Jetzt sichern".
8. **Log / Ereignisse:** die letzten Warnungen/Fehler, `warning`-Icon, rot.

### Geräte / Entitäten, die hier auftauchen
> Alle als **Sensor-/Status-Kacheln** (Muster: `neo-display-card`, mode
> `sensor`/`badge`/`status`).

- **System-Sensoren:** `sensor.processor_use`, `sensor.memory_use_percent`,
  `sensor.disk_use_percent`, `sensor.processor_temperature`,
  `sensor.last_boot` (Uptime).
- **HA-Meta:** `update.home_assistant_core_update`,
  `update.home_assistant_operating_system_update`, Supervisor/Add-on-Updates.
- **Add-ons / Integrationen:** `binary_sensor.*_running`, Add-on-Status.
- **Netzwerk:** `sensor.speedtest_download/upload`, Router-`device_tracker`
  (Client-Zahl), `binary_sensor.internet_connectivity`.
- **Backup:** `sensor.backup_state` / letztes Backup-Datum.
- **Diagnose:** `binary_sensor.*_problem`, `sensor.*_battery` (schwache
  Batterien als Warnliste).

### Zustände
- **Gesund:** dominanter Mint-Hero, KPIs neutral (`--neo-text1` auf Glas).
- **Hinweis:** Amber-Hero, betroffene KPI amber umrandet.
- **Problem:** Rosé-Hero + rote Punkte, Fehlerzeilen nach oben sortiert.
- **Lädt / offline:** Skeleton-Schimmer (`@keyframes pulse`), Werte als „—".

### Prompt-Block — Server-Tab
```
Entwirf einen MOBILE Server-/System-Status-Screen für ein Smart-Home-Dashboard
im "Neo"-Stil: dunkler blaustichiger Hintergrund, Glaskarten (weiße Füllung
2–6 %, 1px helle Kante, blur 24px saturate 140%, Radius 24px), Font SF Pro
Display/Inter, ein Akzent je Zustand (mint=gesund #5EDCB8, amber=Hinweis
#FFB26B, rose=Problem #F87171, blau=Netzwerk #7C9CFF, violett=Badges #C084FC).
Von oben: Top-Bar "Server" + Refresh + grüner Status-Punkt; große Health-Hero-
Karte mit Ampel-Text "Alles läuft" und drei Mini-Pillen (Uptime, HA-Version,
letztes Backup); 2×2 KPI-Grid (CPU %, RAM %, Speicher, CPU-Temp) als Glas-
Badges mit großer Zahl und Ring/Sparkline; Liste Integrationen/Add-ons mit
Status-Punkt; Netzwerk-Karte (Down/Up, Clients); Updates-Karte mit violetter
Zähler-Badge und amber "Aktualisieren"-Button; Backup-Karte; unten letzte
Warnungen rot. Nur Inline-Line-Icons, keine Emoji. Volle Breite ≤640px,
Safe-Area unten, erhöhte Bottom-Nav mit blau leuchtendem Mittel-Button. Zahlen
groß und fett, Labels gedämpft (72 %/50 % Weiß). Deutsch.
```

---

## 4. Kalender-Tab (Termine & Zeit)

**Ziel:** „Was steht an?" – der nächste Termin sofort präsent, dann die Agenda.
Referenz: die **Kalender-Ikone oben rechts mit Badge „2"** aus dem Home-Screen
– hier ausgebaut zum vollen Tab. Bewusst **Agenda-first**, keine überladene
Monats-Matrix als Startbild.

### Aufbau (von oben nach unten)
1. **Top-Bar:** Titel „Kalender", rechts „Heute"-Pille (springt zum Tag) +
   Ansichts-Umschalter (Tag / Woche / Monat).
2. **Nächster-Termin-Hero** (Glas, violet-Akzent): großer Titel des nächsten
   Events, Zeit + „in 40 Min", Ort/Kalendername als Chip, farbiger Kalender-
   Punkt. Das ist die visuelle Übersetzung der `_renderCalendar`-Logik
   (Titel + Zeitpunkt, **kein** Listen-Wust).
3. **Datums-Streifen** (horizontaler Scroller): Wochentage als Pillen, aktiver
   Tag violett gefüllt, Tage mit Terminen tragen unter der Zahl einen Punkt.
4. **Agenda-Liste** gruppiert nach Tag („Heute", „Morgen", Datum):
   Zeitspalte links, Event-Karte rechts mit **farbigem Kalender-Streifen**
   (pro Kalender eine Akzentfarbe), Titel, Ort, Teilnehmer-Avatare.
   Ganztägige Events als volle Pille oben.
5. **Kalender-Filter** (Chips): Familie · Arbeit · Müllabfuhr · Geburtstage –
   je ein Farbpunkt, an/aus tippbar.
6. **Leerzustand:** freundlich, `calendar`-Icon gedämpft, „Keine Termine".

### Geräte / Entitäten, die hier auftauchen
- **Kalender:** alle `calendar.*`-Entitäten (Google, CalDAV, lokal, Feiertage,
  Müllabfuhr). Jede bekommt eine feste Akzentfarbe → Streifen/Punkt.
- **Zeit-nahe Helfer (optional als Chips oben):** nächster Wecker
  (`sensor.next_alarm`), Müll-Sensor (`sensor.*_collection`), Countdown/Timer.
- **Anwesenheit-Kontext:** `person.*` als Teilnehmer-Avatare am Event
  (wiederverwendetes Avatar-Chip-Muster vom Home-Screen).

### Zustände
- **Terminreich:** volle Agenda, Datums-Streifen mit vielen Punkten.
- **Nächster Termin bald:** Hero pulsiert dezent, „in X Min" amber.
- **Ganztägig / mehrtägig:** Balken über mehrere Tage im Streifen.
- **Leer:** siehe Leerzustand oben.

### Prompt-Block — Kalender-Tab
```
Entwirf einen MOBILE Kalender-/Agenda-Screen im "Neo"-Stil (dunkel, Glaskarten
Radius 24px, blur 24px, Font SF Pro Display/Inter, Akzente: violett #C084FC =
Marke/Heute, amber #FFB26B = "bald", je Kalender eine eigene Farbe für Streifen
und Punkte). Von oben: Top-Bar "Kalender" + "Heute"-Pille + Umschalter Tag/
Woche/Monat; großer "Nächster Termin"-Hero (Glas, violett) mit Event-Titel,
Uhrzeit, "in 40 Min", Ort-Chip und farbigem Kalender-Punkt; horizontaler
Wochen-Datumsstreifen als Pillen, aktiver Tag violett gefüllt, Tage mit
Terminen mit Punkt darunter; darunter Agenda-Liste gruppiert nach "Heute/
Morgen/Datum" – links Zeitspalte, rechts Event-Karte mit farbigem Kalender-
Streifen, Titel, Ort und runden Teilnehmer-Avataren; ganztägige Events als
volle Pille; unten Filter-Chips pro Kalender mit Farbpunkt. Nur Inline-Line-
Icons (calendar, bell), keine Emoji. Volle Breite ≤640px, Safe-Areas, erhöhte
Bottom-Nav mit blauem Mittel-Button. Große Titel, gedämpfte Meta-Zeit. Deutsch.
```

---

## 5. Raum-Tab (Raum-Detail & alle Geräte)

**Ziel:** Der **wichtigste** Tab – die direkte Übersetzung von Screenshot 2
(„Wohnzimmer"). Ein Raum = Foto-Hero + Klima + Schnellsteuerung + Szenen +
**alle Geräte des Raums**, nach Domäne gruppiert.

### Aufbau (von oben nach unten)
1. **Foto-Hero** (vollflächig, Dunkel-Verlauf unten): links Zurück-Pille
   „‹ 17 Geräte", rechts Problem-Indikator „● 9 Probleme" (rot, tippbar →
   filtert auf Problemgeräte).
2. **Titel-Block über dem Foto:** großer Raumname „Wohnzimmer",
   Subtitle „Szene: Hell".
3. **Klima-Stat-Pillen** (Reihe): `🌡 23 °C Temperatur`,
   `💧 61 % Luftfeuchtigkeit` – Glas-Pillen, Icon aus Set, Wert fett.
   Erweiterbar: CO₂, Helligkeit, dann horizontal scrollbar.
4. **Schnellsteuerung-Chips** (horizontale Reihe, wie im Screenshot): je Chip
   Zustand + Gerätekurzname, Akzent bei „an":
   - Licht → `Aus / Licht an` (amber)
   - Rollladen → `Offen / Rolladen` (amber)
   - Sauger → `An / Robby A…` (blau)
   - weiteres Gerät → `An / Robby C…` (blau)
5. **Szenen** (Abschnittskopf + „Alle anzeigen ›"): horizontaler Foto-Scroller.
   Aktive Szene mit **farbigem Rand** (z. B. „Alles Aus" rot umrandet, roter
   Power-Icon; „Hell" amber-Zahnrad; „Filmabend" blau). Play-/Aktivier-Button
   unten rechts je Kachel.
6. **Geräte, nach Domäne gruppiert** (je Gruppe Unterüberschrift + Grid):
   Muster = `neo-control-card`. Jede Kachel: Icon, Name, Zustand, Akzent bei
   aktiv, Tap = toggeln, Long-Press / Tap auf „…" = Detail.

### Geräte-Domänen im Raum (alle, die dazugehören)
| Gruppe        | Domäne(n)                    | Kachel zeigt                              | Aktiv-Akzent |
|---------------|------------------------------|-------------------------------------------|--------------|
| **Licht**     | `light`, `switch`, `input_boolean`, Lichtgruppe | An/Aus, Helligkeit, Farbe/Temperatur | amber |
| **Rollladen** | `cover`                      | Offen/Geschlossen, Position %, Lamellen    | amber |
| **Klima**     | `climate`                    | Ist/Soll-Temp, HVAC-Modus, Preset          | amber/blue |
| **Ventilator**| `fan`                        | An/Aus, %, Preset, Schwenken               | blue |
| **Medien**    | `media_player`               | Titel/Quelle, Play/Pause, Lautstärke       | blue |
| **Sauger**    | `vacuum` (Robby)             | Zustand, Start/Dock, Fortschritt           | blue |
| **Schloss**   | `lock`                       | Verriegelt/Offen                           | mint/amber |
| **Sicherheit**| `alarm_control_panel`        | Unscharf/Scharf (Home/Away/Night)          | mint/amber |
| **Kamera**    | `camera`                     | Live-Thumbnail, vollflächig                | – |
| **Sensoren**  | `sensor`, `binary_sensor`    | Wert/Status (Tür, Bewegung, Batterie)      | mint/rose |
| **Szene/Skript**| `scene`, `script`, `button`| Aktivieren-Kachel                          | violet |

> Zustands-Labels & Icons **aus dem Code** übernehmen: `COVER_LABEL`
> (Offen/Geschlossen/Öffnet…), `HVAC_LABEL` (Heizen/Kühlen/Auto…),
> `MEDIA_LABEL` (Spielt/Pausiert…), Alarm-States (Unscharf/Scharf ·
> Zuhause…). So bleibt Design ↔ Implementierung deckungsgleich.

### Problem-/Fehler-Behandlung
- „**9 Probleme**"-Indikator oben: rot, tippbar → Ansicht filtert auf
  betroffene Geräte (offline, schwache Batterie, offen obwohl „scharf").
- Problem-Kachel: roter Rand + `warning`-Icon, Klartext („Batterie 8 %",
  „nicht erreichbar").

### Zustände
- **Standard:** gemischte Kacheln, aktive in Akzentfarbe.
- **Alles aus:** ruhiges Glas, kaum Akzente – ablesbar „Raum schläft".
- **Szene aktiv:** Szenen-Kachel umrandet, Subtitle „Szene: …" aktualisiert.
- **Offline-Gerät:** entsättigt, gedämpft, „nicht erreichbar".

### Prompt-Block — Raum-Tab
```
Entwirf einen MOBILE Raum-Detail-Screen ("Wohnzimmer") für ein Smart-Home-
Dashboard im "Neo"-Stil. Ganz oben ein vollflächiges Raum-Foto mit Dunkel-
Verlauf nach unten; darauf links eine Glas-Pille "‹ 17 Geräte", rechts
"● 9 Probleme" (roter Punkt). Über dem Foto großer Titel "Wohnzimmer" +
Subtitle "Szene: Hell". Darunter eine Reihe Glas-Stat-Pillen: "🌡 23 °C
Temperatur", "💧 61 % Luftfeuchtigkeit" (Icons aus Line-Set, Wert fett).
Dann eine horizontale Reihe Schnellsteuerungs-Chips (voll gerundet, Icon +
Zustand + Kurzname, aktiv = Akzentfüllung): Licht "Aus/Licht an" amber,
Rollladen "Offen" amber, Sauger "An/Robby A…" blau, "An/Robby C…" blau.
Abschnitt "Szenen" mit "Alle anzeigen ›" (violett) als horizontaler Foto-
Scroller: aktive Szene farbig umrandet ("Alles Aus" rot + Power-Icon, "Hell"
amber-Zahnrad, "Filmabend" blau), je Kachel ein Play-Button unten rechts.
Darunter die Geräte nach Gruppen (Licht amber, Rollladen amber, Klima, Medien
blau, Sauger blau, Sensoren) als Glas-Kacheln mit Icon, Name, Zustand, Aktiv-
Akzent, Tap zum Schalten. Stil: dunkel blaustichig, Glas (Füllung 2–6 %, 1px
Kante, blur 24px), Radius 24px, Font SF Pro Display/Inter, ein Akzent pro
Kontext (amber #FFB26B, mint #5EDCB8, blau #7C9CFF, violett #C084FC, rose
#F87171). Nur Inline-Line-Icons, keine Emoji im Endprodukt. Volle Breite
≤640px, Safe-Areas, erhöhte Bottom-Nav mit blau leuchtendem Mittel-Button.
Deutsch.
```

---

## 6. Konsistenz-Checkliste (für jeden Tab)

- [ ] Ein-spaltig, ≤ 640 px, Safe-Areas oben/unten respektiert.
- [ ] Nur Neo-Tokens für Farbe/Radius/Blur/Text – keine Fremdwerte.
- [ ] Genau **ein Akzent** je Karte/Kontext, semantisch korrekt.
- [ ] Icons ausschließlich aus `src/core/icons.js`, keine Emoji im Endprodukt.
- [ ] Werte groß/fett, Labels gedämpft (72 %/50 % Weiß).
- [ ] Press-Feedback (`scale .97`) und 44 px Trefferflächen.
- [ ] Abschnittskopf + „Alle anzeigen ›" in Violett, wo es Scroller gibt.
- [ ] Zustands-Labels/Icons deckungsgleich mit Code (`COVER_LABEL`,
      `HVAC_LABEL`, `MEDIA_LABEL`, Alarm-States).
- [ ] Leer-, Lade- und Fehlerzustand mitgedacht.
- [ ] Bottom-Nav identisch über alle Tabs, aktives Icon leuchtet.

---

## 7. Wo weiter?

Diese Datei ist die **Richtungsvorgabe**, noch keine Implementierung. Nächste
Schritte, sobald der Weg bestätigt ist:

1. Mockups je Tab (mit den Prompt-Blöcken oben) erzeugen und hier verlinken.
2. Wiederkehrende Bausteine (Stat-Pille, Control-Chip, Hero, Datums-Streifen)
   als Neo-Karten/Module spezifizieren – im Einklang mit `STRUCTURE.md`.
3. Pro Tab die konkreten HA-Entitäten mappen (Server-Sensoren, `calendar.*`,
   Raum-Gerätelisten).
