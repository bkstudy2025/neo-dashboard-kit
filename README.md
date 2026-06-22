<p align="center">
  <img src="https://raw.githubusercontent.com/bkstudy2025/neo-dashboard-kit/main/logo.png" width="170" alt="Neo Dashboard Kit" />
</p>

<h1 align="center">Neo Dashboard Kit</h1>

<p align="center">
  Glassmorphism cards for Home Assistant — one card that adapts to your device.<br>
  Glassmorphism-Karten für Home Assistant — eine Karte, die sich anpasst.
</p>

<p align="center">
  <a href="docs/de/README.md"><b>🇩🇪 Deutsch</b></a> ·
  <a href="docs/en/README.md"><b>🇬🇧 English</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HACS-Custom-orange.svg" alt="HACS">
  <img src="https://img.shields.io/github/v/release/bkstudy2025/neo-dashboard-kit?include_prereleases" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
</p>

---

## 📚 Documentation / Dokumentation

| | 🇩🇪 Deutsch | 🇬🇧 English |
|---|---|---|
| Getting started | [Erste Schritte](docs/de/README.md) | [Getting started](docs/en/README.md) |
| Cards | [Karten](docs/de/karten.md) | [Cards](docs/en/cards.md) |
| Modules & Store | [Module & Store](docs/de/module.md) | [Modules & Store](docs/en/modules.md) |
| Free vs Premium | [Free vs Premium](docs/de/free-vs-premium.md) | [Free vs Premium](docs/en/free-vs-premium.md) |
| Development | [Entwicklung](docs/de/entwicklung.md) | [Development](docs/en/development.md) |

---

## ⚡ Quick start

1. **Prerequisites:** none for the cards (no Card Mod needed). Optional:
   [Neo Dashboard Tools](https://github.com/bkstudy2025/neo-dashboard-tools) (recommended).
2. **Install** via HACS → Frontend → custom repository → `bkstudy2025/neo-dashboard-kit`.
3. **Add a card:** *Add card* → search **“Neo Card”** → pick a card type → choose an entity. Done.

The picker has **three** cards — pick one, choose an entity, it adapts:

| Card | For |
|---|---|
| **Neo Control** (`neo-control-card`) | anything controllable: light, switch, cover, climate, media, lock, alarm, scene/script, light groups |
| **Neo Display** (`neo-display-card`) | sensor values & cameras |
| **Neo Header** (`neo-header-card`) | headings / dividers |

Everything else is added through **modules** and **Premium** — see the docs above.

---

---

## 🧪 Beta & updates

This project is currently published as **beta (pre-releases)**. HACS **hides
pre-releases by default**, so updates only appear once you enable
**“Show beta versions”** for this repository in HACS
(repository → 3-dot menu → *Redownload* / settings → enable beta). A stable
release will be cut later.

> ℹ️ **First-open note:** When you open the repository in HACS for the first
> time, the description box may briefly show *“the developer has not provided
> further information”* until HACS has fetched and cached it — reopen once and
> the README/info appears. This is HACS-side lazy-loading/caching and is **not**
> configurable from the repository.

---

## 🧩 Submit a community card or module

The Store is **curated**: **propose** a card/module in the
[**Community Cards & Modules**](https://github.com/bkstudy2025/neo-dashboard-kit/discussions/new?category=community-cards-modules)
Discussions category (no fork or PR needed) — an admin reviews it and merges it
into the repo, and it then appears after **“Refresh store”**.

> **Discussions are a proposal channel, not an install source.** **Premium**
> cards are **not** in the public Store; Premium code is shared privately and
> added via the editor’s **“Paste code”**.

**Full guides:**
[🇩🇪 Mitmachen](docs/de/mitmachen.md) · [🇬🇧 Community](docs/en/community.md) ·
[Maintainer-Workflow (DE)](docs/Neo-Dashboard-Community-Store-Workflow.md) ·
[`CONTRIBUTING.md`](CONTRIBUTING.md)

---

## ❤️ Support
Built with love in my spare time. If you enjoy it, any support is huge
motivation — links are in the editor’s **“Info & Support”** panel and on
[Patreon](https://patreon.com), [Ko‑fi](https://ko-fi.com) & PayPal.

## 🤝 Contributing
See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`STRUCTURE.md`](STRUCTURE.md).

## 📄 License
MIT
