# Contributing to Neo Dashboard Kit

Thanks for your interest! Here's how to contribute.

## Core cards (this repo)

1. Fork and clone the repo
2. `npm install`
3. `npm run dev` — watches and rebuilds `neo-dashboard.js` (repo root)
4. Test in Home Assistant by pointing your resource at your local build
5. Open a PR with a clear description of what the card does

## Community cards & modules (share / submit)

Build a card or module, then share it with your community. There are **two
welcome ways** to get it into the public Store:

1. **Discussion** — propose an idea/module in the **Community Cards & Modules**
   category (great for feedback). Nothing is installed automatically from a
   Discussion.
2. **Pull Request** — submit a finished module: add `store/modules/<id>.js` and
   a `store/index.json` entry (`id` lowercase kebab-case, `version` and `target`
   set). CI validates the catalog and the file automatically.

The maintainer reviews and merges; that's what makes an entry appear in the
Store (no HACS release / new bundle needed). Full step-by-step, Premium via
Patreon (code only), your-own-HACS-repo, and a copy-paste announcement template:

- 🇬🇧 [docs/en/community.md](docs/en/community.md)
- 🇩🇪 [docs/de/mitmachen.md](docs/de/mitmachen.md)

How to write a card/module (API reference): [docs/en/development.md](docs/en/development.md) ([Deutsch](docs/de/entwicklung.md)).

### Review rules (what gets merged)

The Store stays **curated** — the maintainer checks each submission for:

- readable code (not minified/obfuscated);
- no external requests without a reason (no foreign CDN, no tracking);
- no `eval` / `new Function` / `document.write` / `XMLHttpRequest`;
- no secrets/tokens/private links;
- no Premium/paywalled modules in the community Store.

`store/index.json` is loaded live and `@main` store URLs are allowed so accepted
entries show up without a release; CI (`scripts/validate-store.mjs`) checks the
catalog + module files, so broken entries are not merged.

> **Premium** cards are **not** accepted into the public Store and must not be
> listed in `store/index.json`; Premium code is distributed privately (e.g.
> Patreon) and added via the editor’s **“Paste code”** (`author: "Premium"`).

## Code style

- Each card is one file in `src/cards/`
- Cards must call `NeoDashboardRegistry.registerCard(type, class)` at module level
- Use Neo CSS tokens (`--neo-*`) for all colors, spacing and blur — never hardcode colors
- `getCardSize()` must return a sensible integer (grid rows)

## Versioning

We follow [SemVer](https://semver.org/). Breaking changes to the plugin API = major bump.
