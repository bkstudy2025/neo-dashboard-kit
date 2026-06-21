# Contributing to Neo Dashboard Kit

Thanks for your interest! Here's how to contribute.

## Core cards (this repo)

1. Fork and clone the repo
2. `npm install`
3. `npm run dev` — watches and rebuilds `neo-dashboard.js` (repo root)
4. Test in Home Assistant by pointing your resource at your local build
5. Open a PR with a clear description of what the card does

## Community cards & modules (share / submit)

Build a card or module, then share it with your community. **Community
submissions are accepted through Discussions only.** The maintainer reviews,
adapts, and adds accepted cards/modules to the repository and official Store.
The full workflow — submitting via Discussions, distributing Premium via Patreon
(code only), or shipping your own HACS repo, plus a copy-paste announcement
template — is documented here:

- 🇬🇧 [docs/en/community.md](docs/en/community.md)
- 🇩🇪 [docs/de/mitmachen.md](docs/de/mitmachen.md)

How to write a card/module (API reference): [docs/en/development.md](docs/en/development.md) ([Deutsch](docs/de/entwicklung.md)).

### Curated submission workflow (Discussions → review → Store)

The Store stays **curated**: anyone can *propose* a card/module via Discussions,
but only entries the maintainer reviews and merges into this repo are published.
Step-by-step (contributor + maintainer parts) lives in the guides linked above;
the maintainer adoption details (`store/modules/<id>.js` + `store/index.json`)
are in [`store/README.md`](store/README.md).

> **Discussions are not an install source** — nothing is installed
> automatically; they are for proposals, showcase and support only.
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
