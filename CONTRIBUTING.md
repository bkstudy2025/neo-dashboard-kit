# Contributing to Neo Dashboard Kit

Thanks for your interest! Here's how to contribute.

## Core cards (this repo)

1. Fork and clone the repo
2. `npm install`
3. `npm run dev` — watches and rebuilds `dist/neo-dashboard.js`
4. Test in Home Assistant by pointing your resource at your local build
5. Open a PR with a clear description of what the card does

## Community plugin cards (separate repos)

Build your own card as a standalone HACS repo — see [docs/plugin-development.md](docs/plugin-development.md).

## Code style

- Each card is one file in `src/cards/`
- Cards must call `NeoDashboardRegistry.registerCard(type, class)` at module level
- Use Neo CSS tokens (`--neo-*`) for all colors, spacing and blur — never hardcode colors
- `getCardSize()` must return a sensible integer (grid rows)

## Versioning

We follow [SemVer](https://semver.org/). Breaking changes to the plugin API = major bump.
