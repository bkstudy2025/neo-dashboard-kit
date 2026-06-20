# Contributing to Neo Dashboard Kit

Thanks for your interest! Here's how to contribute.

## Core cards (this repo)

1. Fork and clone the repo
2. `npm install`
3. `npm run dev` — watches and rebuilds `neo-dashboard.js` (repo root)
4. Test in Home Assistant by pointing your resource at your local build
5. Open a PR with a clear description of what the card does

## Community cards & modules (share / submit)

Build a card or module, then share it with your community. The full workflow —
publishing to the public Store (fork + PR), distributing Premium via Patreon
(code only), or shipping your own HACS repo, plus a copy-paste announcement
template — is documented here:

- 🇬🇧 [docs/en/community.md](docs/en/community.md)
- 🇩🇪 [docs/de/mitmachen.md](docs/de/mitmachen.md)

How to write a card/module (API reference): [docs/en/development.md](docs/en/development.md) ([Deutsch](docs/de/entwicklung.md)).

## Code style

- Each card is one file in `src/cards/`
- Cards must call `NeoDashboardRegistry.registerCard(type, class)` at module level
- Use Neo CSS tokens (`--neo-*`) for all colors, spacing and blur — never hardcode colors
- `getCardSize()` must return a sensible integer (grid rows)

## Versioning

We follow [SemVer](https://semver.org/). Breaking changes to the plugin API = major bump.
