# Developer Guide — building Cards & Modules

[🇩🇪 Deutsch](../de/entwicklung.md) · 🇬🇧 English · [← Overview](README.md)

Everything you need to build extensions for **Neo Dashboard Kit**. Two kinds:

| You want to… | Build a… | API |
|---|---|---|
| add a **new card type** (new view/device) | **Card** | `registerCard` |
| **enhance an existing card** (badge, effect, action) | **Module** | `registerModule` |

Extensions are plain JS files. They attach to the public API on
`window.NeoDashboard` and show up in the editor automatically — no core change,
no build step required for the consumer.

---

## 1. How an extension loads

An extension is a self-contained file that registers itself. Because it may load
before or after the core, always guard for the API and wait for the
`neo-dashboard-ready` event if needed:

```js
(function () {
  function init() {
    const NEO = window.NeoDashboard;
    if (!NEO || !NEO.BaseCard) {           // core not ready yet
      window.addEventListener("neo-dashboard-ready", init, { once: true });
      return;
    }
    // … register your card/module here …
  }
  init();
})();
```

**How users install your file:**
- **Paste code** — editor → *Extensions* → *Paste code* (loads now, and is saved
  server-side by *Neo Dashboard Tools* so it loads on every start).
- **Store** — published in a catalog `index.json` (see §7).
- **HACS** — as your own separate frontend repo (advanced).

---

## 2. Public API (`window.NeoDashboard`)

| Member | Type | Purpose |
|---|---|---|
| `registerCard(type, class, meta)` | fn | register a new card type |
| `registerModule(manifest)` | fn | register a layer module |
| `BaseCard` | class | base class for cards (extend it) |
| `makeEditor(schema, meta)` | fn | build a card editor from an `ha-form` schema |
| `icon(name, opts)` | fn | inline SVG icon string |
| `accents` | obj | accent palette (`{ blue, amber, mint, violet, rose }`) |
| `accentOptions` | array | accent options for a `select` selector |
| `iconOptions` | array | all icon names as select options |
| `layoutOptions` | array | layout options (auto/mobile/tablet/desktop) |
| `normalizeLayout(v)` | fn | normalize a layout value |
| `viewportLayout()` | fn | current layout from viewport width |
| `renderReorder(...)` | fn | helper for drag/▲▼ reorder lists |
| `version` | string | installed Neo version |
| `ready` | bool | `true` once the API is available |

Event: **`neo-dashboard-ready`** is dispatched on `window` once the API is ready.

---

## 3. Building a Card

### 3.1 Skeleton

```js
const { BaseCard, icon, accents, registerCard, makeEditor } = window.NeoDashboard;

class MyCard extends BaseCard {
  getCardSize() { return 2; }                 // grid height (integer)

  render() {                                   // return an HTML string
    const s = this._state(this._config.entity);
    const acc = accents[this._config.accent] || accents.blue;
    const name = this._config.name || s?.attributes?.friendly_name || "My Card";
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

  _bindEvents() {                              // attach listeners after each render
    this.shadowRoot.getElementById("card")
      ?.addEventListener("click", (e) => {
        if (this._moduleTap(e)) return;        // let modules override the tap
        this._modCtx().moreInfo(this._config.entity);
      });
  }

  static getConfigElement() { return document.createElement("my-card-editor"); }
  static getStubConfig() { return {}; }        // default config on add
}

registerCard("neo-my-card", MyCard, {
  name: "My Card", description: "What it shows", icon: "⭐",
  version: "1.0.0", author: "Community",       // author → category in the picker
});
```

### 3.2 `BaseCard` reference

Lifecycle & helpers you inherit:

| Member | What it does |
|---|---|
| `setConfig(config)` | called by HA with the card config; stored as `this._config`, triggers a render |
| `set hass(h)` / `get hass` | HA pushes state here; **re-renders only when a tracked entity actually changed** (performance) |
| `render()` | **override** — return the card’s HTML string |
| `_bindEvents()` | **override** — attach event listeners (called after every render) |
| `getCardSize()` | override — grid rows (integer), default `2` |
| `_state(id)` | `hass.states[id]` |
| `_attr(id, a)` | `hass.states[id].attributes[a]` |
| `_callService(domain, service, data)` | calls a HA service |
| `_modCtx(settings?, extra?)` | builds a context with helpers: `{ hass, config, settings, card, callService, navigate, moreInfo }` |
| `_moduleTap(event)` | runs an enabled module’s `tapAction` if any; returns `true` if handled |
| `_trackedEntities()` | entity ids that trigger re-render (auto-scanned from config; override to customize) |
| `_layout()` / `_isMobile()` / `_isTablet()` / `_isDesktop()` | resolved responsive layout |

**Static** (define on your class):
- `static getConfigElement()` → returns your editor element.
- `static getStubConfig()` → default config when the card is added.

> **Rendering model:** `render()` returns a **string**. The base class wraps it as
> `<style>{neo tokens + module styles}</style>{your html}` inside the shadow root,
> then runs module `decorate()` hooks and your `_bindEvents()`. The DOM is rebuilt
> on each render, so always (re)bind in `_bindEvents()`.

### 3.3 Styling: `.neo-card` + tokens

Wrap your card in `.neo-card` (rounded, clipped, themed). Use the CSS tokens —
**never hardcode colors** (the theme provides light/dark):

| Token | Use |
|---|---|
| `--neo-fill0 … --neo-fill2` | surface fills (subtle → stronger) |
| `--neo-line1 … --neo-line6` | borders/dividers (subtle → strong) |
| `--neo-text1 / 2 / 3` | text (primary / secondary / muted) |
| `--neo-shadow1`, `--neo-shadow2` | shadows |
| `--neo-blur` | glass blur (`backdrop-filter`) |
| `--neo-radius` | card corner radius |
| `--neo-font` | font stack |

Add `role="button"` to a clickable card for built-in press feedback. Responsive
padding/min-height is applied automatically via `data-neo-layout`.

### 3.4 The editor — `makeEditor(schema, meta)`

`schema` is an [`ha-form`](https://www.home-assistant.io/dashboards/) schema
(array). `meta = { name, description, icon }` renders a header.

```js
customElements.define("my-card-editor", makeEditor([
  // simple fields
  { name: "entity", label: "Entity", selector: { entity: {} } },
  { name: "name",   label: "Name (optional)", selector: { text: {} } },
  { name: "icon",   label: "Icon", selector: { icon: {} } },
  { name: "accent", label: "Color",
    selector: { select: { mode: "dropdown", options: window.NeoDashboard.accentOptions } } },
  // grouped section (kept flat in config because it has no `name`)
  { type: "expandable", title: "Appearance", icon: "mdi:palette", schema: [
    { name: "unit", label: "Unit", selector: { text: {} } },
    window.NeoDashboard.layoutOptions
      ? { name: "layout", label: "Layout", selector: { select: { mode: "dropdown", options: window.NeoDashboard.layoutOptions } } }
      : {},
  ]},
], { name: "My Card", description: "Example", icon: "⭐" }));
```

Common selectors: `entity` (optionally `{ entity: { domain: "light" } }` or
`{ domain: [...] , multiple: true }`), `text`, `boolean`, `icon`,
`number: { min, max, mode }`, `select: { mode: "dropdown", options: [{value,label}] }`.

> Inside the `neo-card` wrapper your editor receives the card config **without**
> `card_type` and `modules` — the wrapper manages those. Just read/write your own
> fields.

### 3.5 `registerCard(type, class, meta)`

| meta | Meaning |
|---|---|
| `name` | shown in the picker |
| `description` | subtitle |
| `icon` | emoji/text shown in the picker |
| `version` | shown in the install list |
| `author` | **category**: `"Premium"` / `"Community"` / anything else = Standard |
| `hidden` | `true` = not in the picker (renders existing configs only) |

Cards register under an internal **versioned tag**, so re-installing an updated
file hot-swaps live (no reload needed).

---

## 4. Building a Module

A module enhances an existing card via typed hooks. Register a manifest:

```js
window.NeoDashboard.registerModule({
  id: "neo-my-module",            // unique (required)
  name: "My Module",
  description: "What it does.",
  icon: "✨",
  target: "neo-control-card",     // card type · array of types · "*" for all
  version: "1.0.0",
  author: "Community",
  config: [                        // optional ha-form schema → user settings
    { name: "entity", label: "Entity", selector: { entity: {} } },
  ],
  // Hooks — all optional:
  style(ctx)          { return "/* CSS string injected into the card */"; },
  decorate(root, ctx) { /* add/modify DOM after render; root = ShadowRoot */ },
  tapAction(ctx)      { /* handle the card tap (overrides default) */ },
});
```

### 4.1 Hooks

| Hook | When | Returns / does |
|---|---|---|
| `style(ctx)` | every render | return a **CSS string** (added to the card’s shadow `<style>`) |
| `decorate(root, ctx)` | after render | mutate the DOM (`root.getElementById("card")`, append elements, …) |
| `tapAction(ctx)` | on card tap | the **first** enabled module with `tapAction` handles the tap and overrides the card’s default action |

The DOM is rebuilt every render, so `decorate()` is re-applied each time
(idempotent by nature). Wrap risky code in try/catch is unnecessary — the core
already isolates hook errors per module.

### 4.2 `ctx`

```
{
  hass,                         // Home Assistant object
  config,                       // the card's full config
  settings,                     // THIS module's settings (from your `config` schema)
  card,                         // the card element instance
  callService(domain, service, data),
  navigate(path),               // change dashboard view
  moreInfo(entityId),           // open HA's device dialog
}
```

### 4.3 Targeting

- `"neo-control-card"` — only that card
- `["neo-control-card", "neo-display-card"]` — several
- `"*"` — every card

The module appears in the *Module* section only for matching cards.

### 4.4 Example (decorate)

```js
window.NeoDashboard.registerModule({
  id: "neo-state-glow", name: "State Glow", target: "*",
  version: "1.0.0", author: "Community",
  config: [{ name: "entity", label: "Entity", selector: { entity: {} } }],
  style(ctx) {
    const st = ctx.hass?.states?.[ctx.settings?.entity]?.state;
    const on = st === "on" || st === "home" || st === "open";
    return `.neo-card{box-shadow:0 0 22px 1px rgba(94,220,184,${on ? ".55" : "0"});transition:box-shadow .4s;}`;
  },
});
```

See full examples in [`store/modules/`](../../store/modules/).

---

## 5. Card vs. Module — which one?

- **New view / new device type** → a **Card** (`registerCard`).
- **Small enhancement of an existing card** → a **Module** (`registerModule`).

Keep cards lean: put the most-used control on the card, expose the rest via
`moreInfo()`, and ship extras as modules. This is the project’s core principle.

---

## 6. Reference

### Accent colors (`accents`)
`blue` `#7C9CFF` · `amber` `#FFB26B` · `mint` `#5EDCB8` · `violet` `#C084FC` ·
`rose` `#F87171`. Each is `{ c: "<hex>", glow: "rgba(...)" }`.

### Layout
`auto` (default; follows viewport — mobile ≤640px, tablet ≤1024px, else desktop)
· `mobile` · `tablet` · `desktop`.

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

## 7. Distribution & persistence

- **Persistence:** the *Neo Dashboard Tools* integration stores installed files
  under `<config>/neo_dashboard_modules/<id>.js` and serves them on startup
  (CORS-free). Without it, *Paste code* loads only for the session.
- **Store catalog:** add a file `store/modules/<id>.js` and an entry in
  `store/index.json` (id, name, description, target, author, version, icon,
  `url` = jsDelivr link). Guide: [`store/README.md`](../../store/README.md).
- **Versioning:** bump `version` in your `registerCard`/`registerModule` meta;
  the install list shows it and *Update* re-fetches the catalog file.

---

## 8. Checklist

- [ ] Self-contained file, guarded with `neo-dashboard-ready`.
- [ ] Unique `id`/`type` (prefix `neo-…`).
- [ ] `author` set (Premium/Community) for the right category.
- [ ] Colors via `--neo-*` tokens only.
- [ ] Card: `.neo-card` wrapper, `_bindEvents()` for listeners, `getStubConfig()`.
- [ ] Module: correct `target`, settings via `config`, hooks pure & idempotent.
- [ ] Lean card + `moreInfo()` for full control.

Repo layout & conventions: [`STRUCTURE.md`](../../STRUCTURE.md) ·
[`CONTRIBUTING.md`](../../CONTRIBUTING.md).
