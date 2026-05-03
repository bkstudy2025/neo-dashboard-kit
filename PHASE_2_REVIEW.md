# Phase 2 — Review

Dieses Dokument bilanziert das Ende von Phase 2 (Architektur).
Es hält Entscheidungen fest, die für den Übergang zu Phase 3
relevant sind. Es ist eine Momentaufnahme, kein Vertragsdokument —
die langfristigen Regeln stehen in `ARCHITECTURE.md`.

> Stand: Abschluss Phase 2. Ohne Implementierung von 2.E (NeoCardEditor).

---

## 1. Was Phase 2 erreicht hat

### 1.1 ARCHITECTURE.md (Schritt 2.A)

Vertrag für die Library: Ordnerstruktur, Namenskonventionen,
Validierungsstrategie, Entity-Zugriff, Performance-Strategie,
Action-Strategie, Design-System-Regeln, Editor-Strategie,
Teststrategie und Roadmap. Verbindlich für alle neuen Cards.

### 1.2 NeoElement-Erweiterungen (Schritt 2.B)

In `src/core/neo-element.js`:

- Hook `_watchedEntities()` für deklarative Entity-Beobachtung.
  Default: `null` → Cards verhalten sich wie bisher.
- `shouldUpdate(changedProps)` filtert reine `hass`-Updates und
  rendert nur, wenn sich mindestens eine watched Entity geändert hat.
- Andere Property-Änderungen (z. B. `_config`, `_now`) triggern wie
  immer einen Render.
- Voll abwärtskompatibel: Bestehende Cards funktionieren unverändert.

### 1.3 hass.js-Erweiterungen (Schritt 2.C)

In `src/core/helpers/hass.js`:

- `domainOf(entityId)` — extrahiert die Domain aus einer Entity-ID,
  defensiv gegen ungültige Eingaben.
- `stateIcon(hass, entityId)` — drei-Stufen-Icon-Auflösung:
  user-icon → Domain-Default → `mdi:help-circle-outline`.
  Bewusst statisch, keine state-abhängige HA-Logik.
- `lastChanged(hass, entityId)` — Date-Objekt aus `last_changed`
  oder `undefined` bei ungültigem Datum.

### 1.4 actions.js Helper (Schritt 2.D)

Neuer Helper `src/core/helpers/actions.js` mit `handleAction`:

- Unterstützt `none`, `more-info`, `toggle`, `navigate`, `url`,
  `call-service`.
- Default-Fallback `more-info`, wenn keine Action konfiguriert ist
  und eine Entity vorhanden ist.
- `actionType` wählt zwischen `tap_action`, `hold_action`,
  `double_tap_action`.
- Defensiv gegen fehlendes hass / element / config.
- `call-service` aktuell nur im String-Format (`"light.turn_on"`).
  Object-Format kann später ergänzt werden.

### 1.5 Tests

- 7 Test-Files, 164 Tests grün.
- Helper sind vollständig abgedeckt, einschließlich Edge-Cases.
- `NeoElement` ist über Mock-this getestet (Node-Umgebung).
- Keine Card-Render-Tests in Phase 2 — kommt mit Phase 3.

---

## 2. Architektur-Entscheidungen

### 2.1 Config-Validierung über _validateConfig(config)

Cards überschreiben den Hook in der Basisklasse, um Pflichtfelder
und Typen zu prüfen. Atomar: bei Wurf bleibt die alte Config erhalten.
Fehlermeldung folgt dem Format
`{CardKlassenname}: '{feldname}' {was los ist}`.

### 2.2 Entity-Zugriff nur über Helper

Kein direkter Zugriff auf `this.hass.states[id]` in Cards.
Stattdessen über `entityState`, `stateText`, `friendlyName`,
`isEntityOn`, `stateIcon`, `lastChanged`. Vorteil: einheitliche
`undefined`-Toleranz, zentrale Erweiterbarkeit, bessere Testbarkeit.

### 2.3 Zentrale Action-Behandlung über actions.js

Cards rufen `handleAction(hass, this, this._config, "tap")`
statt eigene Action-Logik zu implementieren. Vorteil: einheitliche
Standardfelder `tap_action` / `hold_action` / `double_tap_action`
über alle Cards hinweg, weniger Boilerplate, einfache Wartbarkeit.

### 2.4 Editor-Pattern generisch und schema-basiert

Cards definieren ein deklaratives Schema und delegieren das Rendering
an eine gemeinsame `NeoCardEditor`-Basisklasse, die intern HA's
`<ha-form>` nutzt. Eigener Editor pro Card nur bei nachweislich
nicht abdeckbaren UI-Anforderungen (z. B. Drag&Drop-Listen).

### 2.5 NeoCardEditor wird erst in Phase 3 implementiert

Bewusste Verschiebung. Begründung: Eine Editor-Basisklasse ohne
echte konsumierende Card ist Infrastruktur auf Vorrat. Mit der
ersten produktiven Card sehen wir sofort, ob das Schema-Pattern
in der Praxis trägt — und können die Basisklasse in einem Schritt
mit dem ersten echten Use-Case entwerfen.

---

## 3. Review von neo-demo-card

### 3.1 Aktueller Zustand

`neo-demo-card` ist eine minimalistische Karte ohne Entity-Interaktion.
Sie zeigt einen Titel und einen Beschreibungstext und dient bisher
als Smoke-Test, dass Build, Bundling und Theme-System funktionieren.

### 3.2 Bewertung

- ✅ Erfüllt ihren Zweck als Smoke-Test heute.
- ✅ Nutzt geteilte Tokens und `<ha-card>` korrekt.
- ⚠️ Hat keine Validierung, keine Entity-Logik, keine Actions.
  Das ist okay, weil es eine Demo-Card ist, nicht eine produktive.

### 3.3 Empfehlung

- **Sie bleibt unverändert** als Smoke-Test-Card.
- Sie wird **nicht** auf die neuen Patterns migriert, weil sie
  keine Entities und keine Actions hat — eine Migration wäre
  reiner Kosmetik.
- **Spätere Rolle:** Sie überlebt mindestens bis Ende Phase 3
  als Build-Verifikation. Wenn Phase 4 (Beispiele) startet,
  wird entschieden, ob sie aus dem Bundle entfernt und nach
  `examples/` verschoben wird.

---

## 4. Review von neo-header-card

### 4.1 Aktueller Zustand

`neo-header-card` ist die einzige produktive Card im Repo. Sie
nutzt:

- DEFAULT_CONFIG-Merge in `setConfig`.
- `_clockTimer` über `setInterval` (30 s) in `connectedCallback`.
- `findUserMapping` aus dem users-Helper.
- `entityState`, `friendlyName`, `safe`, `greeting`, `formatDate`,
  `formatTime`.
- Kein `_validateConfig`, kein `_watchedEntities`, keine Actions.

### 4.2 Entspricht sie schon der Architektur?

Teilweise. Was passt:

- ✅ Nutzt `NeoElement` als Basisklasse.
- ✅ Nutzt geteilte Tokens und `<ha-card>`.
- ✅ Greift auf Entities ausschließlich über Helper zu.
- ✅ Naming und Datei-Struktur entsprechen den Konventionen.

Was nicht passt:

- ⚠️ Kein `_validateConfig`. Aktuell unkritisch, weil keine
  Pflichtfelder.
- ⚠️ Kein `_watchedEntities`. Card rendert bei jedem hass-Update
  neu. Da sie aber `hass` nur für die Person-Entity braucht,
  könnte sie das deklarieren.
- ⚠️ Keine Action-Felder. Eine Header-Card könnte sinnvoll auf
  `tap_action` reagieren (z. B. Sprung zum User-Profil).
- ⚠️ Das `_clockTimer`-Pattern funktioniert, ist aber unsauber:
  ein Timer auf einer state-Property statt einer cleanen
  ClockSubscription. Mehrere Header-Cards auf einer Seite hätten
  jeweils eigene Timer.

### 4.3 Empfehlung

- **Wird jetzt nicht refactored.**
- Begründung: `neo-sensor-card` wird in Phase 3 als Reference-
  Implementation aller neuen Patterns gebaut. Erst dann ist klar,
  wie das Idealbild einer Neo-Card aussieht. Eine Migration der
  Header-Card vor diesem Zeitpunkt würde mit hoher
  Wahrscheinlichkeit nochmal angefasst werden.
- **Nach Phase 3.A** (Sensor-Card steht): Entscheidung
  „Header-Card migrieren ja/nein". Wahrscheinliche Antwort: ja,
  dann mit `_validateConfig` (Type-Checks für `users` und `title`),
  `_watchedEntities` (Person-Entity-Watch), `handleAction` (Tap auf
  Avatar oder Card) und ggf. einer cleanen Clock-Subscription.

### 4.4 Bewertung der Einzelaspekte

| Aspekt              | Bewertung    | Plan                                              |
|---------------------|--------------|---------------------------------------------------|
| `_clockTimer`       | funktional, unsauber | Bei Migration: zentrale Subscription oder akzeptierte Karten-lokale Lösung |
| `_validateConfig`   | fehlt        | Bei Migration ergänzen                            |
| `_watchedEntities`  | fehlt        | Bei Migration ergänzen, watcht person_entity      |
| Actions             | fehlt        | Bei Migration: optional `tap_action` einführen    |

---

## 5. Review von fireAction() in NeoElement

### 5.1 Aktueller Zustand

`NeoElement.fireAction(actionConfig)` existiert seit Phase 1 als
einfache Action-Methode, die ein `hass-action`-Event feuert.
Mit Phase 2.D existiert parallel `handleAction(hass, element, config,
actionType)` als vollwertiger Action-Helper.

### 5.2 Bewertung

- Beide existieren parallel. Das ist temporär okay, langfristig
  unsauber.
- `fireAction` ist nicht Teil der Architektur-Vorgaben aus
  `ARCHITECTURE.md` Abschnitt 8 — `handleAction` ist das
  Soll-Pattern.
- Aktuell ruft keine Card `fireAction` aus dem Bundle auf.
  Die Methode ist also derzeit toter Code, der jederzeit
  reaktiviert werden könnte.

### 5.3 Empfehlung

- **Bleibt vorerst stehen** als Legacy.
- **Wird nicht entfernt** in dieser Phase, weil bestehende Cards
  hypothetisch darauf zugreifen könnten und ein Entfernen
  unsichtbare Brüche verursachen würde.
- **Migrationsplan:** Spätestens am Ende von Phase 3 entfernen.
  Wenn dann keine Card im Repo `fireAction` benutzt — und das
  ist der erwartete Zustand — kann die Methode gelöscht werden.
- Bis dahin gilt: **Neue Cards nutzen `handleAction`,
  niemals `fireAction`.**

---

## 6. Review des experiment/header-card-editor-Branches

### 6.1 Hintergrund

Der Branch `experiment/header-card-editor` enthält einen früheren
Entwurf einer überarbeiteten Header-Card mit Custom-Editor. Er wurde
als Backup gesichert und in Phase 1 bewusst nicht angewandt.

### 6.2 Wertvolle Ideen (Kandidaten für spätere Übernahme)

- **Avatar-Glow.** Status-Indikator über radialen Gradienten,
  aktiv bei `state === "home"`. Visuell stark und konsistent
  mit dem Glassmorphism-Ziel.
- **Notification-Bell mit Badge.** Touchfreundlicher Icon-Button
  für Benachrichtigungen, optional mit numerischem Badge.
  Passt zum Tablet-/Wallpanel-Use-Case.
- **Responsive Header.** Media-Query-Block für Tablet-Größen,
  passt Avatar-Größe und Schriftgrößen automatisch an.
- **`nothing` aus Lit statt leerer Strings.** Kleines, sauberes
  Idiom für bedingte Templates.
- **`use_first_name_only` als Config-Option.** Pragmatische
  UX-Verbesserung für lange volle Namen.

### 6.3 Was nicht 1:1 übernommen werden sollte

- **Entfernen des `<ha-card>`-Wrappers.** Bricht das geteilte
  Card-Styling und macht die Header-Card visuell zur Ausnahme
  in der Library. Falls ein „nackter" Header gewünscht ist,
  müsste das systematisch über eine Style-Variante in
  `neo-shared.css.js` gelöst werden, nicht ad-hoc pro Card.
- **Custom-Editor pro Card zu früh.** Das Architektur-Dokument
  legt fest: Schema-basiertes generisches Editor-Pattern als
  Default. Ein eigener Editor nur bei begründetem Spezialfall.
  Eine Header-Card erfüllt diesen Spezialfall nicht.
- **Zu viele Änderungen in einem Schritt.** Der Branch enthielt
  UI-Redesign + neue Features + Editor + Architektur-Sprung
  in einem. Bei Übernahme einzeln zerlegen und testen.

### 6.4 Empfehlung

- Branch **nicht mergen**.
- Branch **als Referenz behalten** (`experiment/header-card-editor`).
- Bei der Header-Card-Migration nach Phase 3.A einzelne Ideen
  gezielt rosinenpicken: Avatar-Glow, Bell, Responsive-Block,
  `nothing`-Idiom, Vornamen-Option. Jeweils mit Tests und einem
  einzelnen Commit.

---

## 7. Empfehlung für Phase 3

### 7.1 Erste produktive Card

**`neo-sensor-card`** als Reference-Implementation. Sie ist klein
genug, um sauber zu bleiben, und groß genug, um alle
Architektur-Entscheidungen aus Phase 2 mindestens einmal anzuwenden.

### 7.2 Was die Sensor-Card vorführen soll

- `_validateConfig(config)` mit Pflichtfeld-Prüfung (`entity`).
- `_watchedEntities()` mit der konfigurierten Entity.
- `handleAction(hass, this, this._config, "tap")` als einzige
  Action-Logik.
- Entity-Zugriff über `entityState`, `stateText`, `unitOf`,
  `friendlyName`, `stateIcon`.
- Behandlung von `unavailable` / `unknown` als sichtbarer,
  dezenter Fehlerzustand.
- Glassmorphism-Tokens und Touch-Konventionen aus
  `neo-shared.css.js`.

### 7.3 Editor-Basisklasse (Schritt 2.E nachgeholt)

Mit der Sensor-Card wird auch `NeoCardEditor` implementiert,
inklusive eines ersten Schemas direkt am Beispiel der Sensor-Card.
Tests für die Schema-Verarbeitung (Defaults, Validierung,
config-changed-Events).

### 7.4 happy-dom

Wird nur eingeführt, wenn die Sensor-Card echte Render-Tests
braucht (z. B. um zu prüfen, dass das Icon bei `unavailable`
korrekt gedimmt wird). Wenn die Logik durch Helper-Tests und
NeoElement-Tests ausreichend abgedeckt ist, bleibt happy-dom
weiter aufgeschoben.

### 7.5 Reihenfolge in Phase 3

| Schritt | Was                                                      |
|---------|----------------------------------------------------------|
| 3.A     | `neo-sensor-card` als Reference-Implementation           |
| 3.B     | `NeoCardEditor`-Basisklasse + Schema für Sensor-Card     |
| 3.C     | happy-dom + erste Card-Render-Tests, falls nötig         |
| 3.D     | Migrations-Entscheidung für `neo-header-card`            |
| 3.E     | Weitere Cards (`neo-tile-card`, `neo-button-card`, …)    |

---

## 8. Abschlussentscheidung

- **Phase 2 ist abgeschlossen.**
- Schritt **2.E (NeoCardEditor) wird bewusst nach Phase 3
  verschoben** und dort gemeinsam mit `neo-sensor-card` umgesetzt.
- Die **bestehenden Cards werden in Phase 2 nicht refactored**.
- **`neo-sensor-card` wird zuerst gebaut** (Phase 3.A).
- **Erst danach** wird entschieden, ob und wie `neo-header-card`
  auf die neuen Patterns migriert wird.
- **`fireAction()`** bleibt als Legacy bis spätestens Ende Phase 3
  bestehen und wird dann entfernt, sofern keine Card sie nutzt.
- Der Branch **`experiment/header-card-editor`** bleibt als
  Referenz erhalten, wird aber nicht gemerged.