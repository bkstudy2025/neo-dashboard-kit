# Phase 3 — Review (Stand nach Schritt 3.B)

Dieses Dokument bilanziert den Stand von Phase 3 nach den Schritten
3.A (neo-sensor-card) und 3.B (NeoCardEditor). Es legt Entscheidungen
fest, bevor weitere Cards entstehen oder bestehende Cards refactored
werden.

> Stand: Nach Schritt 3.B. Phase 3 ist noch offen (3.C, 3.D-implement,
> 3.E sind ausstehend). Dieses Review ist explizit Schritt 3.D —
> die Migrations-Entscheidung zur Header-Card.

---

## 1. Was Phase 3 bisher erreicht hat

### 1.1 neo-sensor-card als erste produktive Reference-Card (Schritt 3.A)

In `src/cards/neo-sensor-card.js`:

- Pflichtfeld `entity` plus optionale Felder `name`, `icon`, `unit`,
  `decimals`, `secondary_info`, `layout`, `tap_action`, `hold_action`,
  `double_tap_action`.
- Zwei Layout-Modi: `compact` (Mushroom-Style) und `large`
  (prominenter Wert).
- Drei Status-Modi im View-Model: `ok`, `missing`, `muted` —
  jeweils mit gedämpfter visueller Darstellung bei Problemen.
- Vollständige Card-Logik in pure Helper-Funktionen ausgelagert
  (`validateSensorConfig`, `formatSensorValue`, `resolveSensorViewModel`,
  `formatRelativeTime`, `resolveSecondaryInfo`), wodurch die Card
  ohne happy-dom testbar ist.
- 56 Tests in `tests/cards/neo-sensor-card.test.js`.

### 1.2 Anwendung der Architektur aus Phase 2

Die Sensor-Card setzt erstmals alle Patterns aus Phase 2 in der
Praxis ein:

- **`_validateConfig(config)`** — prüft entity, decimals, layout
  und secondary_info. Wirft sprechende Fehler im Format
  `NeoSensorCard: '{feldname}' {was los ist}`.
- **`_watchedEntities()`** — gibt `[this._config.entity]` zurück.
  Card rendert nur bei Änderungen der konfigurierten Entity neu.
- **`handleAction()`** — komplett delegiert an den Action-Helper
  aus `actions.js`. Tap, Hold und Double-Tap werden über
  Pointer-Events erkannt und an `handleAction` weitergegeben.
- **Entity-Helper** — `entityState`, `stateText`, `unitOf`,
  `friendlyName`, `stateIcon`, `lastChanged`, `domainOf` werden
  konsequent genutzt. Kein direkter Zugriff auf `hass.states`.

### 1.3 NeoCardEditor mit Schema-Pattern (Schritt 3.B)

In `src/editors/neo-card-editor.js`:

- Generische Editor-Komponente, die ein Schema-Array entgegennimmt
  und mit HA's `<ha-form>` rendert.
- Übersetzt `value-changed`-Events von `<ha-form>` in das
  HA-Standard-`config-changed`-Format.
- Defensiv gegen fehlendes Schema oder fehlende Config.
- Pure Helper für Tests: `normalizeSchema`, `prepareConfigChangedDetail`.

### 1.4 Sensor-Card als erster echter Schema-Konsument

- `static getConfigSchema()` definiert 10 Felder mit passenden
  HA-Selectoren (Entity-Picker mit Domain-Filter, Icon-Picker,
  Number-Selector, Select-Selectoren, ui_action-Selectoren).
- `static getConfigElement()` erzeugt einen `neo-card-editor` und
  setzt das Schema auf ihn.
- Visuell in HA verifiziert: Editor öffnet sich, alle Felder
  rendern, Live-Vorschau aktualisiert sich.

### 1.5 Tests

- 9 Test-Files, 244 Tests grün.
- 56 neue Tests für die Sensor-Card-Logik.
- 24 neue Tests für den NeoCardEditor und das Sensor-Schema.
- Bestehende Foundation-Tests aus Phase 1 und 2 unverändert grün.

---

## 2. Bewertung von neo-sensor-card als Reference-Implementation

### 2.1 Was gut funktioniert

- **Architektur-Patterns greifen wie geplant.** `_validateConfig`,
  `_watchedEntities` und `handleAction` lassen sich sauber an die
  Card binden, ohne die Render-Logik zu verkomplizieren.
- **View-Model-Pattern.** Die Trennung in eine pure Funktion
  `resolveSensorViewModel(hass, config)` und eine reine Render-Funktion
  hält die Card testbar und lesbar. Das ist die Pattern-Vorlage für
  alle weiteren Cards.
- **Pure Helper sind das Test-Vehikel.** Solange wir kein happy-dom
  haben, sind exportierte pure Funktionen die einzige saubere Art,
  Card-Logik zu testen. Funktioniert für die Sensor-Card hervorragend
  (56 Tests, alle grün).
- **Schema-Editor in HA ohne eigenes UI-File.** Die Card kommt mit
  einem 10-Felder-Schema aus, ohne eine einzige Zeile Editor-Code
  pro Card. Der Mehrwert des generischen Patterns ist sofort sichtbar.
- **Drei-Status-Konzept (`ok`, `missing`, `muted`).** Macht das
  Verhalten bei Problemen deklarativ und CSS-getrieben. Lässt sich
  in andere Cards übernehmen.

### 2.2 Patterns für weitere Cards

Diese Bausteine werden künftig in jeder Card wiederverwendet:

| Pattern                                  | Wo                              |
|------------------------------------------|----------------------------------|
| Pure Validierungsfunktion                | `validate{Card}Config(config)`  |
| Pure View-Model-Funktion                 | `resolve{Card}ViewModel(hass, config)` |
| `_watchedEntities()` mit Card-Entity     | jede Card mit Entity            |
| `handleAction()` für Tap/Hold/Double-Tap | jede interaktive Card           |
| Status-Klassen (`is-muted`, `is-missing`)| jede Card mit Entity-Anzeige    |
| `static getConfigSchema()`               | jede Card, die Editor-Support will |
| `static getConfigElement()` mit `neo-card-editor` | identisch in jeder Card |

### 2.3 Offene Punkte

- **Hold/Double-Tap-Erkennung.** Funktioniert, ist aber in der Card
  selbst implementiert. Wenn die nächste Card (z. B. Tile-Card oder
  Button-Card) auch Hold/Double-Tap braucht, wandert diese Logik
  in einen Helper (`pointerActions.js` oder ähnlich). Bis dahin
  duplizieren wir bewusst.
- **Card-Icon im Lovelace-Picker.** Aktuell zeigt HA `{}` als
  Default-Icon. Wir könnten `static get iconPath()` ergänzen.
  Klein, kosmetisch, später.
- **Deutsche Labels im Editor.** `<ha-form>` nutzt aktuell die
  technischen Feldnamen als Labels. Über einen `computeLabel`-Callback
  ließe sich das auf Deutsch lokalisieren. Klein, kosmetisch, später.
- **Schema-Felder in Sektionen gruppieren.** Aktuell werden alle 10
  Felder hintereinander gerendert. HA unterstützt Sektionen
  (`type: "expandable"`), die wir später nutzen könnten.

Keiner dieser Punkte blockiert weitere Cards.

---

## 3. Review von neo-header-card

### 3.1 Architektur-Konformität

| Aspekt                              | Stand                  |
|-------------------------------------|------------------------|
| Erbt von `NeoElement`               | ✅ ja                  |
| Nutzt `<ha-card>` als Wrapper       | ✅ ja                  |
| Nutzt geteilte Tokens               | ✅ ja                  |
| Naming und Datei-Struktur           | ✅ ja                  |
| `_validateConfig`                   | ❌ fehlt                |
| `_watchedEntities`                  | ❌ fehlt                |
| `handleAction`                      | ❌ keine Actions konfigurierbar |
| Entity-Zugriff über Helper          | ✅ ja (entityState, friendlyName etc.) |
| Schema/Editor-Anbindung             | ❌ kein Editor          |

### 3.2 Bewertung der Einzelaspekte

**`_validateConfig` fehlt.**
Aktuell unkritisch, da die Card keine Pflichtfelder hat
(`person_entity` ist optional, `users` ist optional). Eine
Migration würde Type-Checks für `users` (muss Array sein) und
optional `person_entity` (muss String sein) ergänzen.

**`_watchedEntities` fehlt.**
Die Card rendert bei jedem hass-Update neu. Da sie nur die
person_entity konsumiert, könnte sie deklarieren:
`return [this._config.person_entity].filter(Boolean)`. Der
Performance-Gewinn ist klein, aber nicht null — bei Dashboards
mit vielen Entities lohnt es sich.

**`handleAction` wird nicht genutzt.**
Die Header-Card ist aktuell nicht interaktiv. Eine sinnvolle
Erweiterung wäre `tap_action` auf den Avatar (z. B. `more-info`
auf person_entity oder Navigation zum User-Profil). Nicht zwingend.

**Entity-Helper sauber genutzt.**
`entityState`, `friendlyName`, `safe`, `findUserMapping` werden
konsequent eingesetzt. Kein direkter `hass.states`-Zugriff.

**`_clockTimer`.**
Funktional korrekt, sauber im `connectedCallback` aufgesetzt und
im `disconnectedCallback` wieder abgebaut. Akzeptabel im
aktuellen Stand. Ein zentralisiertes Clock-Subscription-Pattern
würde sich erst lohnen, wenn mehrere Cards eine Live-Uhr brauchen
(aktuell nur die Header-Card).

### 3.3 Breaking-Change-Risiken bei einer Migration

| Risiko                                          | Bewertung |
|-------------------------------------------------|-----------|
| Bestehende YAML-Konfigurationen brechen         | gering — nur additiv ergänzen, keine Felder entfernen |
| Visuelle Regression durch Style-Refactoring     | mittel — wenn Glassmorphism/Avatar-Glow eingebaut wird |
| Verhalten bei fehlender person_entity ändert sich | gering — wenn `_validateConfig` zu streng wird |
| Tests fehlen — Migration ohne Sicherheitsnetz   | hoch — keine Tests für die Header-Card, also keine Regression-Erkennung |

Das größte Risiko ist die **fehlende Test-Abdeckung**. Eine
Migration sollte mit Tests beginnen, nicht mit Refactoring.

---

## 4. Entscheidung zur neo-header-card

**Empfehlung: Jetzt nicht migrieren.**

### Begründung

1. **Sensor-Card muss sich erst als stabile Vorlage bewähren.**
   Wir haben sie eine Iteration in HA gesehen, aber noch nicht
   gegen mehrere echte Use-Cases erprobt. Eine Migration der
   Header-Card auf ein Pattern, das selbst noch jung ist, doppelt
   das Risiko.

2. **Die Header-Card funktioniert.**
   Sie rendert in HA korrekt, hat keine bekannten Bugs, das
   `_clockTimer`-Pattern ist akzeptabel. Es gibt kein dringendes
   Problem zu lösen.

3. **Fehlendes Test-Sicherheitsnetz.**
   Eine Migration ohne Tests ist riskant. Tests jetzt zu schreiben,
   nur um sie nach der Migration wieder anzupassen, ist
   uneffizient.

4. **Migration darf nicht mit anderen Themen vermischt werden.**
   Wenn wir migrieren, dann als **eigener Schritt** (3.D-implement
   oder Phase 4.x), nicht parallel zu einer neuen Card. Zwei
   gleichzeitige Refactorings produzieren zwei gleichzeitige Risiken.

### Konkret

- Header-Card bleibt vorerst **funktionsfähig wie sie ist**.
- Sie wird **nicht** mit Phase 3 zusammen migriert.
- Eine spätere Migration ist optional und wird **als eigener
  Schritt** gestartet (potenziell Phase 4.x oder Phase 5).

---

## 5. Review des experiment/header-card-editor-Branches

### 5.1 Wertvolle Ideen (Kandidaten für spätere Übernahme)

- **Avatar-Glow** über radialen Gradienten, aktiv bei
  `state === "home"`. Visuell stark, passt zum Glassmorphism-Ziel.
- **Notification-Bell mit Badge** als touchfreundlicher Icon-Button.
  Passt zum Tablet-/Wallpanel-Use-Case.
- **Responsive Header** mit Media-Query-Block für Tablet-Größen,
  passt Avatar-Größe und Schriftgrößen automatisch an.
- **`use_first_name_only`** als Config-Option für lange Namen.
  Pragmatische UX-Verbesserung.
- **`nothing` aus Lit** statt leerer Strings für bedingte Templates.
  Sauberes Idiom, kann in allen Cards eingesetzt werden.

### 5.2 Was nicht 1:1 übernommen werden sollte

- **Entfernen des `<ha-card>`-Wrappers.** Bricht das geteilte
  Card-Styling und macht die Header-Card visuell zur Ausnahme.
  Falls ein „nackter" Header gewünscht ist, müsste das systematisch
  über eine Style-Variante in `neo-shared.css.js` gelöst werden,
  nicht ad-hoc pro Card.
- **Custom-Editor pro Card zu früh.** Architektur-Vorgabe ist das
  schema-basierte Pattern. Ein eigener Editor nur, wenn das Schema
  nicht reicht. Eine Header-Card erfüllt diesen Spezialfall nicht.
- **Zu viele Änderungen in einem Commit.** Der Branch enthält
  UI-Redesign, neue Features, Editor-Code und Architektur-Sprung
  in einem. Bei Übernahme zerlegen wir die Änderungen in einzelne,
  isolierte Commits.

### 5.3 Welche Teile später gezielt übernommen werden könnten

| Idee                          | Wann                                  |
|-------------------------------|---------------------------------------|
| `nothing`-Idiom               | sofort in jeder neuen Card nutzbar    |
| Avatar-Glow                   | bei Header-Card-Migration             |
| Notification-Bell             | bei Header-Card-Migration oder als eigene Mini-Card |
| Responsive-Block              | bei Header-Card-Migration             |
| `use_first_name_only`         | bei Header-Card-Migration             |

Der Branch bleibt als **Referenz und Ideenspeicher** erhalten.
Er wird **nicht gemerged**.

---

## 6. Entscheidung zur Verschiebung von 3.C (Render-Tests / happy-dom)

**Empfehlung: 3.C bleibt vorerst aufgeschoben.**

### Begründung

- Die Sensor-Card und der Editor sind in HA **visuell verifiziert**.
- Logik ist über pure Helper getestet (56 Tests für die Card,
  24 für den Editor + Schema).
- happy-dom als Dependency lohnt sich erst, wenn echte
  Render-Tests einen konkreten Mehrwert bringen — z. B. um
  CSS-Klassen, Strukturen oder Event-Handling zu prüfen, das
  nicht über Helper-Tests abgedeckt ist.

### Wann 3.C sinnvoll wird

- Wenn wir komplexere Cards bauen, deren Render-Verhalten von
  Helper-Tests nicht mehr ausreichend abgedeckt ist.
- Wenn ein subtiler Render-Bug auftaucht, dessen Reproduktion
  in einem Test stabilisiert werden soll.
- Vor einem größeren Refactoring (z. B. der Header-Card-Migration),
  als Sicherheitsnetz.

Keiner dieser Punkte ist aktuell akut. **3.C bleibt offen, aber
kein Blocker.**

---

## 7. Empfehlung für den nächsten Schritt nach 3.D

Zwei Optionen sind aktuell sinnvoll:

### Option A — 3.C (Render-Tests)
Wenn Refactoring-Sicherheit das wichtigste Ziel ist. happy-dom
einführen, Render-Tests für die Sensor-Card schreiben, dann
weiter zu 3.E.

### Option B — 3.E (zweite Card, neo-tile-card)
Wenn Produktfortschritt das wichtigste Ziel ist. Direkt eine
zweite Card bauen, die die Sensor-Card-Patterns wiederverwendet.
Das ist gleichzeitig der **Praxistest** für die Reference-These:
Wenn die zweite Card schnell und sauber rauskommt, ist Phase 2
wirklich solide.

### Präferenz

**Option B — `neo-tile-card` als zweite Card.**

Begründung: Solange keine Render-Test-Lücke einen konkreten Schaden
verursacht, bringt eine zweite Card mehr Erkenntnisgewinn (die
Patterns aus 3.A werden erstmals wiederverwendet) als zusätzliche
Test-Infrastruktur. Falls beim Bau der Tile-Card eine Render-Lücke
auffällt, wird 3.C an genau dieser Stelle fällig.

---

## 8. Abschlussentscheidung

- **3.D ist reine Doku.** Kein Code wird geändert, keine Tests,
  keine Cards.
- **Keine bestehende Card wird jetzt refactored.**
- **`neo-header-card` bleibt stabil** in ihrem aktuellen Zustand.
- **`experiment/header-card-editor`** bleibt als Referenz und
  Ideenspeicher erhalten, wird nicht gemerged.
- **`neo-tile-card`** wird als nächste produktive Card in
  Schritt 3.E gebaut, sofern keine Einwände bestehen.
- **3.C (happy-dom + Render-Tests)** bleibt offen und wird
  fällig, wenn ein konkreter Bedarf entsteht.
