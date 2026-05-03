# Architektur — Neo Dashboard Kit

Dieses Dokument beschreibt die internen Regeln und Konventionen der
Library. Es richtet sich an Entwickler, die neue Cards bauen oder
bestehende ändern. Endnutzer-Dokumentation steht in `README.md`.

> Stand: Phase 2.A. Die hier beschriebenen Regeln sind verbindlich für
> alle neuen Cards. Bestehende Cards (`neo-demo-card`, `neo-header-card`)
> werden bei nächster Gelegenheit angeglichen.

---

## 1. Ziel des Projekts

Neo Dashboard Kit ist eine Sammlung von Lovelace-Custom-Cards für Home
Assistant mit folgenden Eigenschaften:

- Modernes dunkles Design mit Glassmorphism-Optik.
- Touchfreundlich, mobile-first, Tablet- und Wallpanel-tauglich.
- Konsistente Tokens und Patterns über alle Cards hinweg.
- Verteilung als Single-Bundle über HACS.

Nicht-Ziele:
- Universelle Card-Bibliothek für jeden Use-Case (dafür gibt es
  Mushroom, Bubble Card, button-card etc.).
- Theme-Engine — wir nutzen HA-Theme-Variablen und ergänzen eigene
  Tokens, ersetzen aber kein Theme.

---

## 2. Ordnerstruktur und Verantwortlichkeiten

src/
├── cards/              UI-Komponenten, eine Datei pro Card
├── core/
│   ├── neo-element.js          Basisklasse (LitElement-Wrapper)
│   ├── neo-shared.css.js       Design-Tokens und Utility-Klassen
│   └── helpers/                Reine Funktionen, framework-frei
│       ├── strings.js
│       ├── numbers.js
│       ├── dates.js
│       ├── hass.js
│       ├── users.js
│       └── index.js            Re-Exports
├── editors/            Schema-basierte Card-Editoren (geplant)
└── index.js            Bundle-Einstiegspunkt, Card-Registrierung
tests/                  Vitest-Tests, eine Datei pro Helper-Modul
examples/               Beispiel-Lovelace-YAMLs (geplant)
docs/                   Erweiterte Dokumentation (geplant)
dist/                   Build-Output, nicht versioniert

**Regeln:**

- `cards/` enthält nur UI-Klassen. Keine Geschäftslogik außerhalb
  von Render-/Lifecycle-Methoden.
- `core/helpers/` enthält nur reine Funktionen ohne DOM- oder
  Lit-Abhängigkeiten. Sie müssen in der Node-Umgebung testbar sein.
- `core/neo-element.js` ist die einzige Stelle, an der LitElement
  importiert wird, soweit es sich vermeiden lässt. Cards erben.
- `core/neo-shared.css.js` ist die einzige Quelle für gemeinsame
  Design-Tokens und Utility-Klassen.
- `editors/` ist für Card-Editoren reserviert. Pro Card maximal eine
  Editor-Datei. Naming siehe Abschnitt 3.

---

## 3. Namenskonventionen

| Element                  | Konvention                          | Beispiel                              |
|--------------------------|--------------------------------------|---------------------------------------|
| Card-Type (Lovelace)     | `neo-{thema}-card`                   | `neo-sensor-card`                     |
| Custom Element Name      | identisch mit Card-Type              | `<neo-sensor-card>`                   |
| Card-Datei               | `src/cards/{type}.js`                | `src/cards/neo-sensor-card.js`        |
| Card-Klasse              | PascalCase                           | `class NeoSensorCard`                 |
| Editor-Type              | `{type}-editor`                      | `neo-sensor-card-editor`              |
| Editor-Datei             | `src/editors/{type}-editor.js`       | `src/editors/neo-sensor-card-editor.js` |
| Editor-Klasse            | PascalCase mit `Editor`-Suffix       | `class NeoSensorCardEditor`           |
| Helper-Datei             | thematisch, kleinbuchstabig          | `actions.js`, `hass.js`               |
| Helper-Funktion          | camelCase, sprechend                 | `formatNumber`, `findUserMapping`     |
| Config-Properties (YAML) | snake_case                           | `entity`, `show_icon`, `tap_action`   |
| Interne Card-Methoden    | `_camelCase` mit Underscore-Prefix   | `_resolveEntity()`, `_handleTap()`    |
| CSS-Custom-Properties    | `--neo-{kategorie}-{name}`           | `--neo-color-accent`, `--neo-space-md` |

**Begründung snake_case für Config:** Home Assistant nutzt durchgängig
snake_case in YAML-Konfiguration. Eine eigene Konvention hier würde
Nutzer verwirren.

---

## 4. Config-Validierungsstrategie

Validierung läuft in drei Stufen:

### Stufe 1 — Strukturell (zentral in `NeoElement.setConfig`)

Erledigt durch die Basisklasse:

- `config` muss vorhanden sein.
- `config` muss ein Plain-Object sein (kein Array, kein Primitive).

Subklassen müssen sich darum nicht kümmern.

### Stufe 2 — Pflichtfelder (pro Card via `_validateConfig`)

Jede Card überschreibt bei Bedarf `_validateConfig(config)` und prüft
ihre Pflichtfelder. Beispiel:

```js
_validateConfig(config) {
  if (!config.entity) {
    throw new Error(`${this.constructor.name}: 'entity' ist erforderlich`);
  }
}
```

### Stufe 3 — Typen-Plausibilität (pro Card via `_validateConfig`)

Wo nötig, prüft die Card auch die Typen optionaler Felder:

```js
_validateConfig(config) {
  if (config.users !== undefined && !Array.isArray(config.users)) {
    throw new Error(`${this.constructor.name}: 'users' muss ein Array sein`);
  }
}
```

**Format der Fehlermeldungen (verbindlich):**

{CardKlassenname}: '{feldname}' {was los ist}

Beispiele:
- `NeoSensorCard: 'entity' ist erforderlich`
- `NeoHeaderCard: 'users' muss ein Array sein`

**Was wir nicht machen:** Externe Schema-Bibliotheken wie Zod oder Yup.
Sie blähen das Bundle auf, ohne signifikanten Mehrwert für unsere
Kleinst-Configs zu bieten.

---

## 5. Umgang mit Home-Assistant-Entities

Cards greifen auf Entities **nur über die Helper aus `core/helpers/hass.js`**
zu, nicht direkt über `this.hass.states[id]`.

Begründung:

- Einheitliche `undefined`-Toleranz (Card crasht nicht bei fehlender Entity).
- Zentraler Punkt für späteres Caching, Throttling oder Logging.
- Bessere Testbarkeit: Helper sind in Node testbar, direkter
  `this.hass`-Zugriff nicht.

**Verfügbare Helper (Stand Phase 1):**

- `entityState(hass, entityId)` — komplettes State-Objekt oder undefined.
- `stateText(hass, entityId, fallback)` — der State als String.
- `unitOf(hass, entityId)` — `unit_of_measurement` oder leerer String.
- `friendlyName(hass, entityId, fallback)` — Friendly Name oder Fallback.
- `isEntityOn(hass, entityId)` — boolesche Aktivitätsprüfung.

**Geplante Erweiterungen (Phase 2.C):**

- `domainOf(entityId)` — Domain-Präfix (`light`, `sensor`, ...).
- `stateIcon(hass, entityId)` — passendes MDI-Icon.
- `lastChanged(hass, entityId)` — Date-Objekt der letzten Änderung.

---

## 6. Umgang mit fehlenden / unavailable Entities

Drei Szenarien, drei Verhalten:

| Szenario                         | Verhalten                                       |
|----------------------------------|--------------------------------------------------|
| Entity nicht in Config           | Card rendert sich mit sinnvollen Defaults oder dezentem Hinweis |
| Entity in Config, aber `undefined` in `hass.states` | Card rendert sichtbaren, dezenten Fehlerzustand (z. B. graues Icon mit `—`) |
| Entity vorhanden, State `unavailable` / `unknown` | Card rendert mit gedämpfter Optik und Status-Text statt Wert |

**Verbindliche Regeln:**

- Cards crashen nie bei fehlenden Daten. `render()` muss bei jedem
  hass-Zustand ein gültiges Template zurückgeben (auch ein leeres ist
  okay, wenn anders nicht sinnvoll).
- Fehlerzustände sind **sichtbar**, nicht stumm. Der Nutzer muss
  erkennen können, dass eine Konfiguration nicht (mehr) funktioniert.
- Fehlerzustände nutzen die gemeinsamen Tokens (`--neo-color-text-muted`,
  `--neo-color-error`), keine inline gefärbten Texte.

---

## 7. Performance-Strategie

**Aktueller Stand:** Cards rendern bei jedem `hass`-Update, auch wenn
sich keine relevante Entity geändert hat. Das ist bei 1–2 Cards
unproblematisch, skaliert aber nicht.

**Plan (Phase 2.B):** Optional zu überschreibende Methode in
`NeoElement`:

```js
_watchedEntities() {
  return [];  // Default: alle Updates akzeptieren
}
```

Cards überschreiben das, wenn sie nur auf bestimmte Entities reagieren
sollen:

```js
_watchedEntities() {
  return [this._config.entity, this._config.icon_entity].filter(Boolean);
}
```

`NeoElement.shouldUpdate(changedProps)` prüft dann:

- Ist eine andere Property als `hass` verändert? → ja, neu rendern.
- Ist `hass` verändert und `_watchedEntities()` leer? → ja, neu rendern (Default).
- Ist `hass` verändert und mindestens eine watched Entity hat einen
  neuen State? → ja, neu rendern.
- Sonst → nicht neu rendern.

**Verträglichkeit:** Cards, die `_watchedEntities()` nicht überschreiben,
verhalten sich exakt wie vorher. Die Optimierung ist opt-in.

---

## 8. Action-Strategie

**Aktueller Stand:** `NeoElement.fireAction()` ist eine vereinfachte
Action-Methode, die nur `hass-action`-Events feuert.

**Plan (Phase 2.D):** Ein neuer Helper `core/helpers/actions.js`
übernimmt die vollständige Action-Behandlung nach HA-Konvention:

```js
// Geplante Signatur
handleAction(hass, element, config, actionType)
// actionType = "tap" | "hold" | "double_tap"
```

Der Helper liest aus `config` das passende Action-Objekt
(`tap_action`, `hold_action`, `double_tap_action`) und führt die
Standard-Actions aus:

- `more-info` — öffnet das HA-Detail-Dialog.
- `toggle` — schaltet die Entity um.
- `navigate` — navigiert im Dashboard.
- `url` — externer Link.
- `call-service` — beliebiger HA-Service.
- `none` — keine Aktion.

**Verbindlich für neue Cards:**

- Keine eigene Action-Implementation mehr in einzelnen Cards.
- `tap_action`, `hold_action`, `double_tap_action` sind Standard-Felder
  jeder interaktiven Card.
- `NeoElement.fireAction()` wird mittelfristig durch `handleAction(...)`
  ersetzt. Bestehende Cards werden bei nächster Gelegenheit migriert.

---

## 9. Design-System-Regeln

Die zentrale Quelle für Tokens und Utility-Klassen ist
`src/core/neo-shared.css.js`. Sie wird durch `NeoElement.styles`
automatisch in jeder Card verfügbar gemacht.

### Token-Schichtung

Alle Farb- und Form-Tokens sind dreischichtig definiert:

```css
--neo-color-accent: var(--neo-accent, var(--primary-color, #03a9f4));
```

1. Eigenes Neo-Token (für unser Theme).
2. HA-Standard-Token (für Drittanbieter-Themes).
3. Hardcoded-Fallback (wenn gar kein Theme aktiv ist).

**Regel:** Neue Tokens folgen demselben Muster. Hardcoded-Fallbacks
sind verpflichtend.

### Token-Kategorien

| Kategorie     | Präfix              | Beispiele                          |
|---------------|---------------------|-------------------------------------|
| Farben        | `--neo-color-*`     | `--neo-color-surface`, `--neo-color-accent` |
| Form          | `--neo-radius*`     | `--neo-radius`, `--neo-radius-small` |
| Abstände      | `--neo-space-*`     | `--neo-space-md`                   |
| Schrift       | `--neo-font-*`      | `--neo-font-md`, `--neo-font-family` |
| Schatten      | `--neo-shadow-*`    | `--neo-shadow-soft`, `--neo-shadow-glow` |
| Glassmorphism | `--neo-blur*`, `--neo-border-glass` | `--neo-blur-bg`     |
| Glow          | `--neo-glow`        |                                     |
| Touch         | `--neo-touch-min`   |                                     |
| Bewegung      | `--neo-transition`  |                                     |

### Utility-Klassen

Utility-Klassen sind opt-in und werden von Cards bei Bedarf verwendet:

- `.neo-glass` — Glassmorphism-Hintergrund mit `backdrop-filter`-Fallback.
- `.neo-row` / `.neo-column` — Flex-Layout-Helfer.
- `.neo-icon-button` — touchfreundlicher Icon-Button (≥ 44 × 44 px).
- `.neo-active`, `.neo-muted`, `.neo-truncate` — Zustands- und Text-Helfer.

**Regel:** Cards definieren keine eigenen Tokens. Wenn ein neues Token
gebraucht wird, kommt es nach `neo-shared.css.js`.

---

## 10. Editor-Strategie

**Default: Schema-basiertes generisches Editor-Pattern.**

Für die meisten Cards genügt eine deklarative Schema-Beschreibung,
die von einer gemeinsamen Editor-Basisklasse `NeoCardEditor` gerendert
wird. Die Basisklasse nutzt intern HA's eingebautes `<ha-form>` —
dadurch sehen alle Editoren in jedem Theme nativ aus und bekommen
HA-Komponenten wie Entity-Picker oder Icon-Picker automatisch.

### Beabsichtigtes Pattern (zur Implementierung in Phase 2.E)

Card definiert ein Schema:

```js
// in der Card-Datei
static getConfigSchema() {
  return [
    { name: "entity", required: true, selector: { entity: {} } },
    { name: "name", selector: { text: {} } },
    { name: "icon", selector: { icon: {} } },
    { name: "tap_action", selector: { ui_action: {} } },
  ];
}

static getConfigElement() {
  return document.createElement("neo-card-editor");
}
```

`NeoCardEditor` rendert das Schema, validiert Eingaben und feuert
`config-changed`-Events. Eine Card braucht damit **kein eigenes
Editor-File**.

### Wann doch ein eigener Editor?

Nur in begründeten Spezialfällen, z. B.:

- Komplexe Listen-Editoren mit Drag & Drop (z. B. `users[]` in
  `neo-header-card`).
- Mehrstufige Wizards.
- UI-Elemente, die `<ha-form>` nicht abdeckt.

In diesen Fällen liegt der Editor unter `src/editors/{type}-editor.js`
und folgt den Naming-Konventionen aus Abschnitt 3.

### Verbindliche Regeln

- Default ist das Schema-Pattern.
- Eigener Editor nur, wenn das Schema-Pattern nachweislich nicht reicht.
- Pro Card maximal ein Editor.
- Editor-Code lebt nie in `src/cards/` — immer in `src/editors/`.

---

## 11. Teststrategie

### Was getestet wird

- **Helper (`src/core/helpers/`):** vollständig, mit Edge-Cases.
  Pflicht für jede neue Helper-Funktion.
- **Basisklasse (`NeoElement`):** Validierungs- und Lifecycle-Logik.
  Tests laufen aktuell mit Mock-`this`, weil Vitest in Node-Umgebung
  läuft.
- **Cards:** Render- und Lifecycle-Tests werden eingeführt, sobald die
  erste produktive Card entsteht (Phase 3). Dann wird `happy-dom` als
  Test-Environment für `tests/cards/*.test.js` aufgenommen.

### Konventionen

- Eine Test-Datei pro Helper-Modul: `tests/{modul}.test.js`.
- Card-Tests landen unter `tests/cards/{type}.test.js`.
- Tests sind in der gleichen Sprache wie der Code (Deutsch für
  Beschreibungen ist okay, englische Test-Bibliotheks-API).
- Jeder neue Helper kommt mit Tests im selben Commit.

### Aktueller Stand

- 6 Test-Files, 84 Tests grün.
- Vitest 4.x, `environment: "node"`.
- Keine Mock- oder Snapshot-Dateien.

### Was nicht getestet wird

- CSS-Tokens — manuelle visuelle Verifikation in Home Assistant.
- Build-Output — manuelle Verifikation, dass das Bundle in HA lädt
  und beide Cards korrekt rendern.

---

## 12. Roadmap

### Phase 1 — Foundation (abgeschlossen)

- Helper-Tests vollständig.
- `NeoElement` mit Validierungs-Hook.
- Glassmorphism-Tokens und Utility-Klassen.
- Registry-Helper für Card-Anmeldung.
- Minimale `hacs.json`.

### Phase 2 — Architektur (laufend)

- 2.A — Dieses Architektur-Dokument.
- 2.B — `_watchedEntities()` und `shouldUpdate`-Optimierung in `NeoElement`.
- 2.C — `hass.js`-Erweiterungen (`domainOf`, `stateIcon`, `lastChanged`).
- 2.D — `actions.js`-Helper inkl. Tests.
- 2.E — `NeoCardEditor`-Basisklasse mit Schema-Pattern.
- 2.F — Übergangs-Review: ggf. Migration bestehender Cards.

### Phase 3 — Erste produktive Cards

- **Erste Card: `neo-sensor-card`** (einzelner Sensor mit Icon, Name,
  Wert, Einheit, Tap-Action).
- Diese Card ist die **Reference-Implementation** für alle
  Architektur-Entscheidungen aus Phase 2 und dient als Vorlage für
  alle weiteren Cards.
- Begleitend: Einführung von `happy-dom` für Card-Render-Tests
  (Schritt aus Phase 1.6, bewusst auf Phase 3 verschoben).

### Phase 4 — Beispiele

- `examples/`-YAMLs pro Card.
- Test-Dashboards.

### Phase 5 — Dokumentation

- README-Überarbeitung mit Installations- und Nutzungs-Anleitung.
- `docs/`-Verzeichnis für ausführliche Card-Dokumentation.

### Phase 6 — HACS / Release

- GitHub-Actions für Build und Release.
- Versionierung über Tags.
- Erweiterte `hacs.json`.
- Auto-Versioning aus `package.json` ins Bundle.