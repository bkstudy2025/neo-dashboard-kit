# Development — your own cards & modules

[🇩🇪 Deutsch](../de/entwicklung.md) · 🇬🇧 English · [← Overview](README.md)

Neo exposes a public API at `window.NeoDashboard`. Use it to build standalone
extensions (your own repos, community or premium) that plug into the editor —
without changing the core.

## Public API (`window.NeoDashboard`)

| API | Purpose |
|---|---|
| `registerCard(type, class, meta)` | **new card** (appears in the type picker) |
| `registerModule(manifest)` | **layer module** (extends existing cards) |
| `BaseCard` | base class for cards (render, layout, re-render logic) |
| `makeEditor(schema, meta)` | builds a card editor from an `ha-form` schema |
| `icon(name, opts)` | built-in SVG icon |
| `accents`, `accentOptions` | accent colors |
| `layoutOptions` | layout choices (auto/mobile/tablet/desktop) |
| `version` | installed Neo version |

Load order doesn’t matter: if the API isn’t ready yet, wait for the
`neo-dashboard-ready` event.

## A custom card

```js
(function () {
  function init() {
    const NEO = window.NeoDashboard;
    if (!NEO || !NEO.BaseCard) {
      window.addEventListener("neo-dashboard-ready", init, { once: true });
      return;
    }
    const { BaseCard, icon, accents, registerCard, makeEditor } = NEO;

    class MyCard extends BaseCard {
      render() {
        const s = this._state(this._config.entity);
        return `<div class="neo-card" id="card" role="button" style="padding:16px;">
          ${icon("sparkle", { size: 20, color: accents.blue.c })}
          <div>${s?.state ?? "—"}</div>
        </div>`;
      }
      _bindEvents() {
        this.shadowRoot.getElementById("card")
          ?.addEventListener("click", () => this._modCtx().moreInfo(this._config.entity));
      }
      static getConfigElement() { return document.createElement("my-card-editor"); }
      static getStubConfig() { return {}; }
    }

    customElements.define("my-card-editor", makeEditor([
      { name: "entity", label: "Entity", selector: { entity: {} } },
    ], { name: "My Card", description: "Example", icon: "⭐" }));

    registerCard("neo-my-card", MyCard, {
      name: "My Card", icon: "⭐", version: "1.0.0", author: "Community",
    });
  }
  init();
})();
```

- `author: "Premium"` or `"Community"` controls the **category** in the picker.
- Users install the file via **Extensions → Paste code** or the store.

## A layer module
If you only want to extend an *existing* card (badge, effect, custom tap action),
use `registerModule` instead of a whole card — see **[Modules & Store](modules.md)**.

## Card vs. module — which one?
- **New view / new device type** → a **card** (`registerCard`).
- **Small enhancement of a card** → a **module** (`registerModule`).

## Contributing
Repo layout & conventions: see [`STRUCTURE.md`](../../STRUCTURE.md) and
[`CONTRIBUTING.md`](../../CONTRIBUTING.md). Build: `npm run build` (produces
`neo-dashboard.js` from `src/`).
