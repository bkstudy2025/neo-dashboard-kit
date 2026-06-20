# Entwickler-Handbuch — Karten & Module bauen

🇩🇪 Deutsch · [🇬🇧 English](../en/development.md) · [← Übersicht](README.md)

Alles, was du brauchst, um Erweiterungen für **Neo Dashboard Kit** zu bauen.
Zwei Arten:

| Du willst… | Baust ein… | API |
|---|---|---|
| einen **neuen Kartentyp** (neue Ansicht/Gerät) | **Karte** | `registerCard` |
| eine **bestehende Karte erweitern** (Badge, Effekt, Aktion) | **Modul** | `registerModule` |

Erweiterungen sind reine JS-Dateien. Sie docken an die öffentliche API
`window.NeoDashboard` an und erscheinen automatisch im Editor — keine
Kern-Änderung, kein Build-Schritt für den Nutzer.

---

## 1. Wie eine Erweiterung lädt

Eine Erweiterung ist eine eigenständige Datei, die sich selbst registriert. Da
sie vor oder nach dem Kern laden kann, immer auf die API prüfen und ggf. auf das
Event `neo-dashboard-ready` warten:

```js
(function () {
  function init() {
    const NEO = window.NeoDashboard;
    if (!NEO || !NEO.BaseCard) {           // Kern noch nicht bereit
      window.addEventListener("neo-dashboard-ready", init, { once: true });
      return;
    }
    // … hier Karte/Modul registrieren …
  }
  init();
})();
```

**Wie du deine Datei verteilst** (kompletter Workflow inkl. Premium/Patreon &
Ankündigungs-Vorlage): **[Mitmachen](mitmachen.md)**. Kurz:
- **Code einfügen** — Editor → *Erweiterungen* → *Code einfügen* (lädt sofort und
  wird von *Neo Dashboard Tools* serverseitig gespeichert → lädt bei jedem Start).
- **Store** — veröffentlicht in einem Katalog `index.json` (siehe §7).
- **HACS** — als eigenes separates Frontend-Repo (fortgeschritten).

---

## 2. Öffentliche API (`window.NeoDashboard`)

| Element | Typ | Zweck |
|---|---|---|
| `registerCard(type, klasse, meta)` | fn | neuen Kartentyp registrieren |
| `registerModule(manifest)` | fn | Layer-Modul registrieren |
| `BaseCard` | Klasse | Basis-Klasse für Karten (erweitern) |
| `makeEditor(schema, meta)` | fn | Karten-Editor aus `ha-form`-Schema bauen |
| `icon(name, opts)` | fn | Inline-SVG-Icon als String |
| `accents` | obj | Akzent-Palette (`{ blue, amber, mint, violet, rose }`) |
| `accentOptions` | array | Akzent-Optionen für einen `select` |
| `iconOptions` | array | alle Icon-Namen als Select-Optionen |
| `layoutOptions` | array | Layout-Optionen (auto/mobil/tablet/desktop) |
| `normalizeLayout(v)` | fn | Layout-Wert normalisieren |
| `viewportLayout()` | fn | aktuelles Layout aus der Fensterbreite |
| `renderReorder(...)` | fn | Helfer für ▲▼-/Drag-Sortierlisten |
| `version` | string | installierte Neo-Version |
| `ready` | bool | `true`, sobald die API verfügbar ist |

Event: **`neo-dashboard-ready`** wird auf `window` ausgelöst, sobald die API bereit ist.

---

## 3. Eine Karte bauen

### 3.1 Grundgerüst

```js
const { BaseCard, icon, accents, registerCard, makeEditor } = window.NeoDashboard;

class MeineKarte extends BaseCard {
  getCardSize() { return 2; }                 // Höhe im Raster (Ganzzahl)

  render() {                                   // gibt einen HTML-String zurück
    const s = this._state(this._config.entity);
    const acc = accents[this._config.accent] || accents.blue;
    const name = this._config.name || s?.attributes?.friendly_name || "Meine Karte";
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px; min-height:160px; cursor:pointer;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        border:1px solid var(--neo-line2);">
        <div style="display:flex;align-items:center;gap:10px;">
          ${icon(this._config.icon || "sparkle", { size: 19, color: acc.c })}
          <span style="font-weight:600;">${name}</span>
        </div>
        <div style="font-size:26px;margin-top:12px;">${s?.state ?? "—"}</div>
      </div>`;
  }

  _bindEvents() {                              // Listener nach jedem Render setzen
    this.shadowRoot.getElementById("card")
      ?.addEventListener("click", (e) => {
        if (this._moduleTap(e)) return;        // Modul darf den Tipp übernehmen
        this._modCtx().moreInfo(this._config.entity);
      });
  }

  static getConfigElement() { return document.createElement("meine-karte-editor"); }
  static getStubConfig() { return {}; }        // Standard-Config beim Hinzufügen
}

registerCard("neo-meine-karte", MeineKarte, {
  name: "Meine Karte", description: "Was sie zeigt", icon: "⭐",
  version: "1.0.0", author: "Community",       // author → Kategorie im Picker
});
```

### 3.2 `BaseCard`-Referenz

Geerbte Lebenszyklus-Methoden & Helfer:

| Element | Funktion |
|---|---|
| `setConfig(config)` | von HA mit der Karten-Config aufgerufen; als `this._config` gespeichert, löst Render aus |
| `set hass(h)` / `get hass` | HA liefert Zustände hierher; **rendert nur neu, wenn sich eine getrackte Entität wirklich geändert hat** (Performance) |
| `render()` | **überschreiben** — gibt den HTML-String der Karte zurück |
| `_bindEvents()` | **überschreiben** — Listener setzen (nach jedem Render aufgerufen) |
| `getCardSize()` | überschreiben — Raster-Zeilen (Ganzzahl), Standard `2` |
| `_state(id)` | `hass.states[id]` |
| `_attr(id, a)` | `hass.states[id].attributes[a]` |
| `_callService(domain, service, data)` | ruft einen HA-Dienst auf |
| `_modCtx(settings?, extra?)` | baut einen Kontext mit Helfern: `{ hass, config, settings, card, callService, navigate, moreInfo }` |
| `_moduleTap(event)` | führt ggf. `tapAction` eines aktiven Moduls aus; `true` wenn behandelt |
| `_trackedEntities()` | Entitäten, die ein Re-Render auslösen (auto aus der Config; überschreibbar) |
| `_layout()` / `_isMobile()` / `_isTablet()` / `_isDesktop()` | aufgelöstes responsives Layout |

**Statisch** (auf deiner Klasse definieren):
- `static getConfigElement()` → liefert dein Editor-Element.
- `static getStubConfig()` → Standard-Config beim Hinzufügen.

> **Render-Modell:** `render()` gibt einen **String** zurück. Die Basis-Klasse
> verpackt ihn als `<style>{Neo-Tokens + Modul-Styles}</style>{dein HTML}` im
> Shadow-Root, führt dann `decorate()`-Hooks der Module und dein `_bindEvents()`
> aus. Das DOM wird bei jedem Render neu gebaut → Listener immer in
> `_bindEvents()` (neu) setzen.

### 3.3 Styling: `.neo-card` + Tokens

Verpacke deine Karte in `.neo-card` (abgerundet, beschnitten, Theme-fähig). Nutze
die CSS-Tokens — **nie Farben hartkodieren** (Theme liefert Hell/Dunkel):

| Token | Verwendung |
|---|---|
| `--neo-fill0 … --neo-fill2` | Flächen (subtil → stärker) |
| `--neo-line1 … --neo-line6` | Ränder/Trenner (subtil → stark) |
| `--neo-text1 / 2 / 3` | Text (primär / sekundär / gedämpft) |
| `--neo-shadow1`, `--neo-shadow2` | Schatten |
| `--neo-blur` | Glas-Unschärfe (`backdrop-filter`) |
| `--neo-radius` | Eckenradius der Karte |
| `--neo-font` | Schriftart |

`role="button"` an einer klickbaren Karte gibt eingebautes Druck-Feedback.
Responsives Padding/min-height wird automatisch über `data-neo-layout` gesetzt.

### 3.4 Der Editor — `makeEditor(schema, meta)`

`schema` ist ein [`ha-form`](https://www.home-assistant.io/dashboards/)-Schema
(Array). `meta = { name, description, icon }` rendert eine Kopfzeile.

```js
customElements.define("meine-karte-editor", makeEditor([
  // einfache Felder
  { name: "entity", label: "Entität", selector: { entity: {} } },
  { name: "name",   label: "Name (optional)", selector: { text: {} } },
  { name: "icon",   label: "Icon", selector: { icon: {} } },
  { name: "accent", label: "Farbe",
    selector: { select: { mode: "dropdown", options: window.NeoDashboard.accentOptions } } },
  // gruppierter Abschnitt (bleibt flach in der Config, da ohne `name`)
  { type: "expandable", title: "Darstellung", icon: "mdi:palette", schema: [
    { name: "unit", label: "Einheit", selector: { text: {} } },
    { name: "layout", label: "Layout",
      selector: { select: { mode: "dropdown", options: window.NeoDashboard.layoutOptions } } },
  ]},
], { name: "Meine Karte", description: "Beispiel", icon: "⭐" }));
```

Häufige Selektoren: `entity` (optional `{ entity: { domain: "light" } }` oder
`{ domain: [...], multiple: true }`), `text`, `boolean`, `icon`,
`number: { min, max, mode }`, `select: { mode: "dropdown", options: [{value,label}] }`.

> Innerhalb der `neo-card`-Hülle bekommt dein Editor die Config **ohne**
> `card_type` und `modules` — die verwaltet die Hülle. Lies/schreibe nur deine
> eigenen Felder.

### 3.5 `registerCard(type, klasse, meta)`

| meta | Bedeutung |
|---|---|
| `name` | Anzeige im Picker |
| `description` | Untertitel |
| `icon` | Emoji/Text im Picker |
| `version` | in der Installations-Liste angezeigt |
| `author` | **Kategorie**: `"Premium"` / `"Community"` / sonst = Standard |
| `hidden` | `true` = nicht im Picker (rendert nur bestehende Configs) |

Karten registrieren unter einem internen **versionierten Tag** — eine
aktualisierte Datei wird live getauscht (kein Reload nötig).

---

## 4. Ein Modul bauen

Ein Modul erweitert eine bestehende Karte über typisierte Hooks. Manifest
registrieren:

```js
window.NeoDashboard.registerModule({
  id: "neo-mein-modul",           // eindeutig (Pflicht)
  name: "Mein Modul",
  description: "Was es macht.",
  icon: "✨",
  target: "neo-control-card",     // Kartentyp · Liste · "*" für alle
  version: "1.0.0",
  author: "Community",
  config: [                        // optionales ha-form-Schema → Nutzer-Einstellungen
    { name: "entity", label: "Entität", selector: { entity: {} } },
  ],
  // Hooks — alle optional:
  style(ctx)          { return "/* CSS-String in die Karte */"; },
  decorate(root, ctx) { /* DOM nach dem Render ergänzen; root = ShadowRoot */ },
  tapAction(ctx)      { /* Tipp auf die Karte behandeln (überschreibt Standard) */ },
});
```

### 4.1 Hooks

| Hook | Wann | Gibt zurück / tut |
|---|---|---|
| `style(ctx)` | bei jedem Render | gibt einen **CSS-String** zurück (in das `<style>` der Karte) |
| `decorate(root, ctx)` | nach dem Render | verändert das DOM (`root.getElementById("card")`, Elemente anhängen …) |
| `tapAction(ctx)` | beim Tippen | das **erste** aktive Modul mit `tapAction` behandelt den Tipp und überschreibt die Standard-Aktion |

Das DOM wird bei jedem Render neu gebaut, `decorate()` läuft also jedes Mal neu
(von Natur aus idempotent). Hook-Fehler werden vom Kern pro Modul isoliert.

### 4.2 `ctx`

```
{
  hass,                         // Home-Assistant-Objekt
  config,                       // die komplette Karten-Config
  settings,                     // Einstellungen DIESES Moduls (aus deinem `config`-Schema)
  card,                         // die Karten-Instanz
  callService(domain, service, data),
  navigate(path),               // Dashboard-Ansicht wechseln
  moreInfo(entityId),           // HA-Geräte-Dialog öffnen
}
```

### 4.3 Targeting

- `"neo-control-card"` — nur diese Karte
- `["neo-control-card", "neo-display-card"]` — mehrere
- `"*"` — jede Karte

Das Modul erscheint im *Module*-Bereich nur bei passenden Karten.

### 4.4 Beispiel (decorate)

```js
window.NeoDashboard.registerModule({
  id: "neo-state-glow", name: "Status-Glow", target: "*",
  version: "1.0.0", author: "Community",
  config: [{ name: "entity", label: "Entität", selector: { entity: {} } }],
  style(ctx) {
    const st = ctx.hass?.states?.[ctx.settings?.entity]?.state;
    const on = st === "on" || st === "home" || st === "open";
    return `.neo-card{box-shadow:0 0 22px 1px rgba(94,220,184,${on ? ".55" : "0"});transition:box-shadow .4s;}`;
  },
});
```

Vollständige Beispiele in [`store/modules/`](../../store/modules/).

---

## 5. Karte oder Modul — was nehmen?

- **Neue Ansicht / neuer Gerätetyp** → eine **Karte** (`registerCard`).
- **Kleine Erweiterung einer bestehenden Karte** → ein **Modul** (`registerModule`).

Halte Karten schlank: die wichtigste Steuerung auf die Karte, den Rest über
`moreInfo()`, und Extras als Module. Das ist das Kernprinzip des Projekts.

---

## 6. Referenz

### Akzentfarben (`accents`)
`blue` `#7C9CFF` · `amber` `#FFB26B` · `mint` `#5EDCB8` · `violet` `#C084FC` ·
`rose` `#F87171`. Jeweils `{ c: "<hex>", glow: "rgba(...)" }`.

### Layout
`auto` (Standard; folgt dem Viewport — mobil ≤640px, tablet ≤1024px, sonst
desktop) · `mobile` · `tablet` · `desktop`.

### Icons (`icon(name, { size, color, stroke })`)
```
home rooms devices energy scenes settings lightbulb thermo camera lock unlock
speaker play pause next prev blinds vacuum wind plug wifi bell plus minus
chevR chevL chevD chevU sun moon leaf info grid garage motion coffee washer
dishwasher outlet toggle valve smoke warning solar bed sofa shower bath toilet
plant paw key remote sprinkler gate shield shieldOk water eye mic search more
check star starF sparkle kettle tv fridge dot arrUp arrDown cloud rain snow
storm fog partly calendar clock fan door window battery flame snowflake person
people car music volume heart trash refresh power server robot gauge flag
```

---

## 7. Verteilung & Persistenz

- **Persistenz:** Die Integration *Neo Dashboard Tools* speichert installierte
  Dateien unter `<config>/neo_dashboard_modules/<id>.js` und lädt sie beim Start
  (CORS-frei). Ohne sie lädt *Code einfügen* nur für die Sitzung.
- **Store-Katalog:** Datei `store/modules/<id>.js` + Eintrag in `store/index.json`
  (id, name, description, target, author, version, icon, `url` = jsDelivr-Link).
  Anleitung: [`store/README.md`](../../store/README.md).
- **Versionierung:** `version` in `registerCard`/`registerModule`-Meta erhöhen;
  die Liste zeigt sie an, *Aktualisieren* lädt die Katalog-Datei neu.

---

## 8. Checkliste

- [ ] Eigenständige Datei, mit `neo-dashboard-ready` abgesichert.
- [ ] Eindeutige `id`/`type` (Präfix `neo-…`).
- [ ] `author` gesetzt (Premium/Community) für die richtige Kategorie.
- [ ] Farben nur über `--neo-*`-Tokens.
- [ ] Karte: `.neo-card`-Hülle, `_bindEvents()` für Listener, `getStubConfig()`.
- [ ] Modul: korrektes `target`, Einstellungen via `config`, Hooks rein & idempotent.
- [ ] Schlanke Karte + `moreInfo()` für den vollen Funktionsumfang.

Repo-Aufbau & Konventionen: [`STRUCTURE.md`](../../STRUCTURE.md) ·
[`CONTRIBUTING.md`](../../CONTRIBUTING.md).
