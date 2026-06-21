# Modules & Store

[🇩🇪 Deutsch](../de/module.md) · 🇬🇧 English · [← Overview](README.md)

**Modules** add extra functionality or visuals to a card — without bloating the
core. Each card stays lean, and the “big” extras come on top.

> There are two kinds of extension:
> - **Module** — attaches to an *existing* card (e.g. status badge, glow).
> - **Card** — a *new* card type (e.g. a Premium weather card).
>
> You install both in the same place.

## Using modules (everyone)

In the card editor, the **Extensions** area (visible right on the landing):

1. Open **➕ Install card or module**.
2. **Store** — install vetted catalog modules with one click.
   *(Requires the **Neo Dashboard Tools** integration for persistent storage.)*
3. **Paste code** — paste a module or card (e.g. from Patreon) → **Add**.

The list shows everything installed with **version**, a **Card/Module** badge,
plus **Update** and **Remove**.

### Enabling a module on a card
Pick a **card type** at the top and scroll to **Module**. There you toggle the
matching modules **on/off**, set their options, and reorder them with **▲ ▼**.

---

## Writing a module (developers)

A module is a small, self-contained JS file that registers itself:

```js
window.NeoDashboard.registerModule({
  id: "neo-my-module",           // unique
  name: "My Module",
  description: "What it does.",
  icon: "✨",
  target: "neo-control-card",    // target card · list · "*" for all
  version: "1.0.0",
  author: "Community",
  config: [                       // optional settings (ha-form schema)
    { name: "entity", label: "Entity", selector: { entity: {} } },
  ],
  // Hooks (all optional):
  style(ctx)    { return "/* CSS into the card */"; },
  decorate(root, ctx) { /* add DOM after render */ },
  tapAction(ctx)      { /* handles the card tap */ },
});
```

**Hooks**
| Hook | When | Purpose |
|---|---|---|
| `style(ctx)` | every render | returns CSS (into the shadow root) |
| `decorate(root, ctx)` | after render | add/modify DOM |
| `tapAction(ctx)` | on tap | first active module wins (overrides default) |

**`ctx`** = `{ hass, config, settings, card, callService, navigate, moreInfo }`
(`settings` = your module’s values set in the editor.)

Full example: [`docs/examples/store-modules/neo-state-glow.js`](../examples/store-modules/neo-state-glow.js).

## Publishing to the store
The catalog lives under [`store/`](../../store/): one file `store/modules/<id>.js`
per module plus an entry in `store/index.json`. Guide:
**[store/README.md](../../store/README.md)**.

> Premium modules (Patreon) do **not** belong in the public catalog — share them
> via **Paste code**.

More on building your own **cards**: **[Development](development.md)**.
