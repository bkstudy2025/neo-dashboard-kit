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

### Curated submission workflow (Discussions → review → Store)

The Store stays **curated**: anyone can *propose* a card/module, but only entries
an admin reviews and merges into this repo are published. Nothing is installed
automatically from Discussions.

1. **Propose (contributor).** Open a discussion in the
   [**Community Cards & Modules**](https://github.com/bkstudy2025/neo-dashboard-kit/discussions/new?category=community-cards-modules)
   category and complete the submission form: name, description, screenshot,
   standalone code (or public repo/gist link), HA version, required
   entities/domains, type (card or module), and the security & license
   confirmation.
2. **Review (admin).** Check the code (readable, no secrets, MIT-compatible),
   screenshot and description; test if needed.
3. **Adopt (admin).** Add the reviewed file as `store/modules/<id>.js` and a
   matching entry in `store/index.json` (`id` must equal the `register*` id;
   use `"kind": "card"` for cards). Keep `version` in the file and the index in
   sync. See [`store/README.md`](store/README.md).
4. **Merge to `main`.**
5. **Live for users.** Users click **“Refresh store”** in the editor (Extensions
   → Official store) and the new entry appears — **no HACS release**, **no new
   `neo-dashboard.js` bundle**, no app build.

> **Discussions are not an install source.** There is no automatic installation
> from Discussions — they are for proposals, showcase and support only.
> **Premium** cards are **not** accepted into the public Store and must not be
> listed in `store/index.json`; Premium code is distributed privately (e.g.
> Patreon) and added by users via the editor’s **“Paste code”** (`author:
> "Premium"` places it in the Premium category).

## Code style

- Each card is one file in `src/cards/`
- Cards must call `NeoDashboardRegistry.registerCard(type, class)` at module level
- Use Neo CSS tokens (`--neo-*`) for all colors, spacing and blur — never hardcode colors
- `getCardSize()` must return a sensible integer (grid rows)

## Versioning

We follow [SemVer](https://semver.org/). Breaking changes to the plugin API = major bump.
