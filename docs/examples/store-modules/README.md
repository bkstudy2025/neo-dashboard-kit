# Example store modules (not in the official store)

These are **reference examples** of standalone Neo Dashboard cards/modules. They
are **not** part of the official store catalog (`store/index.json` ships empty
for the initial release, which focuses on the standard cards).

Use them as templates when you build your own card or module:

- `neo-community-example-card.js` — a card using the typed-editor pattern
  (`makeTypedEditor` / `capabilityType` / `typeDef`) with safe output
  (`escapeHtml` / `escapeAttr` / `safeUrl`).
- `neo-state-glow.js` — a small layer **module** (`registerModule`).
- `neo-cover-position.js` — a control-card module.
- `neo-homelab-card.js` — a larger standalone card.
- `neo-badge.js`, `neo-glow.js` — the **former built-in example modules**
  (decorate/style hooks). They were previously bundled into the core; they now
  live here as references only. Note: they use internal `../core/...` imports,
  so to ship them via the store they must be rewritten as **standalone** modules
  that register through `window.NeoDashboard` (see `neo-state-glow.js`).

To propose one of these (or your own) for the official store after the release,
see [`../../../CONTRIBUTING.md`](../../../CONTRIBUTING.md): open a **Discussion**
or a **Pull Request** that adds `store/modules/<id>.js` plus an entry in
`store/index.json`.
