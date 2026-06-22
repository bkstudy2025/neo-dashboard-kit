# Free vs Premium — Strategie

> 🇬🇧 English version: [`docs/en/free-vs-premium.md`](../en/free-vs-premium.md)

Dieses Dokument legt fest, was in den **öffentlichen Community Store** gehört und
was als **Premium** verteilt wird. Es ist die maßgebliche Grundlage für
Kuratierungs-Entscheidungen.

## Grundsätze

- Der **Free / Community Store ist kuratiert.** Es werden nur kleine, universelle,
  risikoarme Module gelistet.
- **Premium wird nicht über den öffentlichen Store verteilt.** Es wird über
  Patreon / private Code-Verteilung geteilt und über **„Code einfügen"** im
  Editor installiert.
- **Keine Premium-Dateien im öffentlichen Repository.**
- **Keine geheimen Tokens** irgendwo im Repo.
- **Keine externen Tracking-Skripte** in irgendeinem Modul.

## Free / Community Store

Kleine, universelle Bausteine, die auf bestehenden Neo-Karten aufsetzen:

- Kleine universelle Module
- Style-Module
- Zusatzinfo-Module
- Einfache Badges
- **Keine** großen Multi-Entity-Dashboards
- **Keine** Premium-Features im öffentlichen Store

### Empfohlene kostenlose Module

| Modul | Zweck |
|---|---|
| Neo Mini Badge | Kleines Sekundär-Badge auf einer Karte |
| Neo Glow Frame | Zustandsabhängiger Glow-/Rahmen-Effekt |
| Neo Accent Wash | Dauerhafter oder zustandsabhängiger Akzent-Verlauf |
| Neo Status Dot | Kleiner Status-Indikator-Punkt |
| Neo Secondary Info | Zweite Zeile / Zusatzinfo |
| Neo Battery Ring | Batteriestand als Ring-Indikator |
| Neo Last Changed | „Zuletzt geändert" als relative Zeit |
| Neo Presence Chip | Anwesenheits-/Belegungs-Chip |
| Neo Warning Banner | Inline-Warnbanner |
| Neo Attribute Line | Ein gewähltes Attribut als Zeile darstellen |

> ✅ Bereits im Store: **Neo Mini Badge**, **Neo Glow Frame**,
> **Neo Accent Wash**. Der Rest ist der kuratierte Backlog für den Free-Store.

## Premium / Patreon

Größere oder komplexere Bausteine:

- Größere Karten oder komplexe Module
- Mehrere Entitäten
- Fertige Dashboard-Bausteine
- Komfort-Logik
- Erweiterte Visualisierungen

### Empfohlene Premium-Module / -Karten

| Karte / Modul | Warum Premium |
|---|---|
| Neo Weather Pro | Umfangreiches Multi-Daten-Wetter |
| Neo Calendar Pro | Vollständige Kalenderansicht |
| Neo Camera Pro | Erweiterte Kamera-Karte |
| Neo Room Overview | Multi-Entity-Raum-Dashboard |
| Neo Energy Flow | Energiefluss-Visualisierung |
| Neo Media Dashboard | Vollständige Medien-Steuerfläche |
| Neo Security Panel | Alarm-/Sicherheits-Dashboard |
| Neo Vacuum Pro | Erweiterte Staubsauger-Steuerung |
| Neo Climate Scheduler | Zeitplanung + Komfort-Logik |
| Neo Scene Composer | UI zum Bauen von Szenen |
| Neo Graph / History Pro | Verlaufs-/Graph-Visualisierungen |
| Neo Device Health Center | Multi-Entity-Geräte-Übersicht |

## Wie die Verteilung funktioniert

| | Free / Community | Premium |
|---|---|---|
| Wo | Öffentlicher Store (`store/index.json`) | Patreon / privater Code |
| Installation | Store → Installieren | Editor → **Code einfügen** |
| Im öffentlichen Repo? | ✅ Ja (kuratiert) | ❌ Nein |
| Prüfung | Maintainer-kuratiert | Autor-kontrolliert |

Siehe auch: [Mitmachen](../de/mitmachen.md) und der
[Maintainer-Store-Workflow](../Neo-Dashboard-Community-Store-Workflow.md).
