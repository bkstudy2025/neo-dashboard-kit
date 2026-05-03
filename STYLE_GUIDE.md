# Neo Dashboard Kit — Visual Style Guide

## 1. Design-Ziel

Neo Dashboard Kit soll ein modernes Home-Assistant-Dashboard-System für Tablet, Wallpanel und Mobile sein.

Der visuelle Stil orientiert sich an:

- Neo Dark
- Glassmorphism
- ruhigen Flächen
- klaren Zuständen
- großen Touch-Zielen
- reduzierter, hochwertiger UI

Das Ziel ist kein überladenes Dashboard, sondern eine klare Oberfläche, die auf einen Blick verständlich ist und sich angenehm bedienen lässt.

Neo Cards sollen wirken wie ein zusammenhängendes System, nicht wie viele unabhängige Einzelkarten.

---

## 2. Grundprinzipien

### Große Touch-Flächen

Cards und interaktive Elemente müssen auf Tablet und Smartphone gut bedienbar sein.

Richtwert:

- Buttons und Icon-Flächen mindestens `44px`
- aktive Hauptflächen eher `52px` bis `64px`
- genügend Abstand zwischen interaktiven Elementen

### Klare Hierarchie

Jede Card soll sofort zeigen:

1. Was ist das Objekt?
2. Was ist der aktuelle Zustand?
3. Kann ich damit interagieren?
4. Was passiert beim Tippen?

Titel, Wert, Status und Secondary Info müssen optisch klar unterscheidbar sein.

### Wenig visuelles Rauschen

Neo UI soll ruhig bleiben.

Vermeiden:

- zu viele Farben
- zu starke Schatten
- zu viele Linien
- zu viele Icons pro Card
- harte Kontraste
- dauerhaft aggressive Animationen

### Konsistente Icon-Container

Icons sind ein zentrales visuelles Element.

Grundregel:

- Icons sitzen in runden Containern
- aktive Icons nutzen Accent Color
- inaktive Icons sind muted
- unavailable/missing States sind sichtbar gedämpft

### Aktive Zustände sofort erkennbar

Aktive Geräte, Szenen oder Modi müssen auf einen Blick erkennbar sein.

Aktive Zustände nutzen:

- Accent Color
- dezente Accent-Fläche
- optional leichten Glow
- keine übertriebene Neon-Wirkung

### Dezente Animationen

Animationen sollen Feedback geben, aber nicht ablenken.

Erlaubt:

- leichte Scale-Animation bei Tap
- weicher Hover/Active-Übergang
- sanfter Glow-Wechsel
- kurze Transition von ca. `150ms` bis `250ms`

Nicht erwünscht:

- dauerhafte Bewegung
- Bounce-Effekte
- starke Rotation
- hektische Statusanimationen

---

## 3. Card-Aufbau

### `ha-card` bleibt Wrapper

Jede sichtbare Card behält `ha-card` als äußeren Wrapper.

Warum:

- Home Assistant erwartet dieses Pattern
- Theme-Kompatibilität bleibt erhalten
- gemeinsame Neo-Styles greifen konsistent
- spätere Layout- und Shadow-Regeln bleiben zentral steuerbar

Cards sollen nicht ohne `ha-card` gerendert werden, außer es gibt einen sehr bewussten Spezialfall.

### Padding

Cards nutzen großzügiges, aber nicht übertriebenes Padding.

Richtwerte:

- compact: `var(--neo-space-md)` bis `var(--neo-space-lg)`
- large: `var(--neo-space-lg)`
- sehr kleine Elemente vermeiden

### Radius

Alle Cards nutzen Neo-Radius-Tokens.

Ziel:

- weich
- modern
- konsistent
- nicht eckig

Bevorzugt:

```css
border-radius: var(--neo-radius-lg);

oder über den globalen ha-card Style aus neo-shared.css.js.

Shadow

Schatten sollen Tiefe geben, aber nicht schwer wirken.

Standard:

weicher Shadow für normale Cards
Glow nur bei aktiven oder fokussierten Elementen
keine harten schwarzen Schatten
Glass-Effekt

Glassmorphism ist Teil der Neo-Richtung, aber dezent.

Regeln:

Glass-Effekt nicht erzwingen, wenn Browser/Theme ihn nicht gut unterstützt
immer Fallback über Surface-Farbe
backdrop-filter nur über zentrale Tokens/Utility-Klassen
keine Lesbarkeit opfern
Compact vs. Large

Jede produktive Card sollte, wenn sinnvoll, zwei Layoutgrößen unterstützen:

compact

Für Listen, Grids und mobile Layouts.

Eigenschaften:

kompakte Höhe
Icon links
Text rechts
sekundäre Infos klein
viele Cards untereinander möglich
large

Für wichtige Informationen oder zentrale Aktionen.

Eigenschaften:

größere Fläche
stärkerer Fokus
größere Werte oder Icons
besser geeignet für Tablet/Wallpanel
Responsive Verhalten

Cards müssen auf Mobile und Tablet funktionieren.

Regeln:

keine festen Breiten
Text immer mit Ellipsis absichern
Grids müssen schmal funktionieren
large Layout darf nicht auf kleinen Geräten brechen
4. Farben und Tokens

Alle Farben sollen primär über neo-shared.css.js und CSS-Variablen kommen.

Keine hartcodierten Farben, außer als sichere Fallbacks.

Wichtige Tokens

Zu bevorzugende Tokens:

--neo-color-accent
--neo-color-surface
--neo-color-surface-alt
--neo-color-surface-hover
--neo-color-surface-active
--neo-color-text
--neo-color-text-muted
--neo-glow
--neo-shadow-soft
--neo-shadow-glow
--neo-border-glass
--neo-transition
Accent Color

Die Accent Color ist die wichtigste Interaktionsfarbe.

Verwendung:

aktive Icons
aktive Icon-Container
ausgewählte Elemente
dezenter Glow
Fokus auf wichtige Werte

Nicht verwenden für:

normalen Text
zu viele Statuswerte gleichzeitig
große Flächen ohne Grund
Surface

Surface ist die Hauptfläche einer Card.

Sie soll ruhig, dunkel und gut lesbar sein.

Surface Alt

Surface Alt wird für sekundäre Flächen genutzt:

Icon-Container
kleine Badge-Flächen
inaktive Controls
dezente Abtrennung innerhalb einer Card
Muted Text

Muted Text wird genutzt für:

Secondary Info
Einheiten
Statuszeilen
unavailable/unknown
weniger wichtige Labels
Glow

Glow ist ein Akzentmittel, kein Standard.

Verwendung:

aktive Tile Card
aktiver Button
ausgewählter Quick Picker
wichtige aktive Szene

Regel:

Glow muss sichtbar, aber ruhig sein.

Hover / Active States

Interaktive Cards sollen Feedback geben.

Desktop:

Hover darf Surface leicht verändern

Touch:

Active darf leicht skalieren
keine übertriebenen Effekte
5. Icon-System
Runde Icon-Container

Standard-Icon-Container sind rund.

Compact:

ca. 44px bis 52px

Large:

ca. 56px bis 72px
Aktive Icons

Aktive Icons nutzen:

--neo-color-accent
dezente Accent-Fläche
optional --neo-shadow-glow
Inaktive Icons

Inaktive Icons nutzen:

--neo-color-text-muted
neutrale Surface-Alt-Fläche
kein Glow
Unavailable / Missing

Unavailable, unknown oder missing Entities werden gedämpft dargestellt.

Regeln:

Icon opacity reduziert
Text muted
kein Glow
Wert zeigt — oder den State-Text
Card crasht niemals
Icon-Größen

Richtwerte:

compact icon container: 44–52px
compact icon: 22–28px

large icon container: 56–72px
large icon: 30–36px
6. Zustände

Jede Card soll ihre Zustände klar behandeln.

ok

Normale, gültige Entity.

Darstellung:

normaler Text
normales Icon
normale Surface
active

Aktive Entity, zum Beispiel Licht an oder Switch on.

Darstellung:

Accent Icon
Accent-Tönung
optional Glow
Status gut sichtbar
inactive

Gültige Entity, aber nicht aktiv.

Darstellung:

muted Icon
neutrale Fläche
kein Glow
muted

Für States wie:

unavailable
unknown
""

Darstellung:

gedämpfte Farbe
kein Glow
Status weiterhin sichtbar
kein Crash
missing

Entity existiert nicht in hass.states.

Darstellung:

Wert —
Icon fallback
Name aus Config oder Entity-ID
deutlich gedämpft
kein Crash
7. Typografie

Typografie soll klar und ruhig bleiben.

Titel

Verwendung:

Card-Name
Entity-Name
Raumname

Eigenschaften:

mittlere bis starke Gewichtung
nicht zu groß
immer ellipsis-fähig
Wert

Verwendung:

Sensorwert
Hauptstatus
große Zahl im large Layout

Eigenschaften:

bei Sensoren prominent
tabular numbers, wenn sinnvoll
Einheiten kleiner als Wert
Secondary Info

Verwendung:

last_changed
entity_id
Zusatzstatus

Eigenschaften:

kleiner
muted
nicht dominant
optional ausblendbar
Große Werte im Large Layout

Large Layout darf Werte stärker hervorheben.

Richtwerte:

Wert: var(--neo-font-xl) oder größer
Einheit: kleiner und muted
Name untergeordnet, aber sichtbar
8. Layout-Regeln
Compact Layout

Compact ist der Standard für viele Cards.

Typisch:

[ Icon ] [ Titel        ]
         [ Wert/Status  ]
         [ Secondary    ]

Verwendung:

Listen
mobile Dashboards
Grids mit mehreren Cards
Sensoren
Tiles
Large Layout

Large ist für wichtige Elemente.

Typisch:

[ Großer Wert / großes Icon ]
[ Titel                     ]
[ Secondary                 ]

oder:

[ Icon ] [ Titel      ]
         [ Status     ]
         [ Secondary  ]

Verwendung:

zentrale Sensoren
wichtige Lichter
Szenen
große Buttons
Mobile

Mobile-first bedeutet:

Cards dürfen nicht zu breit denken
Text muss umbrechen oder abgeschnitten werden
Touch-Flächen bleiben groß
keine komplexen Mehrspalten innerhalb kleiner Cards
Tablet / Wallpanel

Tablet und Wallpanel dürfen stärker visuell arbeiten:

large Cards
mehr Glow
größere Icons
Raumgruppen
Quick Picker
klare Szenensteuerung
Grid-Verhalten

Cards sollen in Home-Assistant-Grids sauber funktionieren.

Regeln:

keine festen Breiten
getCardSize() sinnvoll setzen
Layout Options nur bewusst nutzen
large Cards dürfen mehr Höhe beanspruchen
9. Regeln für neue Cards

Jede neue Card folgt diesen Regeln:

Basis
nutzt NeoElement
nutzt NeoElement.styles
behält ha-card
nutzt gemeinsame Helper aus core/helpers
nutzt zentrale Design Tokens
Config
nutzt _validateConfig(config)
Pflichtfelder werden klar geprüft
Fehler sind sprechend
Config-Felder folgen Home-Assistant-Konventionen mit snake_case
Entities

Datenbasierte Cards:

nutzen Entity-Helper
greifen nicht direkt wild auf hass.states[...] zu
unterstützen _watchedEntities()
behandeln missing/unavailable/unknown defensiv
Actions

Interaktive Cards:

nutzen handleAction()
implementieren keine eigene Service-Logik, wenn vermeidbar
unterstützen tap_action, optional hold_action, optional double_tap_action
States

Jede Card muss definieren:

ok
active, falls relevant
inactive, falls relevant
muted
missing
Editor

Neue Cards sollen bevorzugt das generische Schema-Editor-Pattern nutzen.

Eigener Spezial-Editor nur, wenn das Schema-Pattern nicht ausreicht.

Referenz-Cards

Neue Cards orientieren sich zuerst an:

neo-sensor-card
neo-tile-card

Diese Cards sind die aktuelle Reference-Implementation.

10. Roadmap für neue Cards
neo-button-card

Große Aktionskarte für Touch-Bedienung.

Use Cases:

Licht toggeln
Szene starten
Script starten
Automation triggern
Modus aktivieren

Wichtige Merkmale:

großer Icon-Kreis
klarer aktiver Zustand
sehr touchfreundlich
optional large-only Layout
neo-room-card

Raumkarte für eine kompakte Raumübersicht.

Mögliche Inhalte:

Raumname
Temperatur
Luftfeuchtigkeit
Lichtstatus
Fensterstatus
1–3 Quick Actions

Ziel:

Dashboard auf Raumebene strukturieren
weniger Einzelkarten nötig machen
neo-quick-picker-card

Picker für schnelle Auswahl, inspiriert von modernen Bubble-/Carousel-Patterns.

Ziel-Design:

Titel oben
großer aktiver Kreis in der Mitte
Accent Ring / Glow
aktives Label darunter
Nachbar-Icons links und rechts teilweise sichtbar

Use Cases:

Räume wechseln
Szenen auswählen
Modi auswählen
Medienquellen wählen
Header-Card-Migration

Die bestehende neo-header-card bleibt vorerst stabil.

Spätere Migration:

_validateConfig()
_watchedEntities()
handleAction(), falls Aktionen dazukommen
optional Avatar-Glow
optional Notification-Bell
optional responsive modernes Header-Layout
11. Was noch nicht final ist

Folgende Themen sind bewusst noch nicht final:

Release-Dokumentation
Screenshots
HACS final
finale Theme-Tokens
visuelle Feinschliffe
vollständige Card-Options-Dokumentation
Render-Tests mit happy-dom
finale Header-Card-Migration
state-abhängige Icon-Logik für Spezialdomains
zusätzliche Cards nach neo-sensor-card und neo-tile-card

Das Projekt bleibt bis zur visuellen Stabilisierung im Status:

Development / early preview

Erst wenn Cards, Style und Dashboard-Komposition stimmig sind, sollte ein stabiler Release vorbereitet werden.