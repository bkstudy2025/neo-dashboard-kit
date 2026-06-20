# Neo Dashboard Kit

Glassmorphism cards for Home Assistant — one card that adapts to your device.
Glassmorphism-Karten für Home Assistant — eine Karte, die sich anpasst.

## Quick start

1. Install via HACS (the Lovelace resource is added automatically).
2. **Add card** → search **"Neo Card"** → pick a **type** → choose an **entity**.

The picker has three cards that adapt to the chosen type/entity:

- **Neo Control** — anything controllable: light, switch, cover, climate, media, lock, alarm, scene/script, light groups.
- **Neo Display** — sensor values, cameras and status.
- **Neo Header** — headings and dividers.

Everything else is added through **modules** and **Premium**.

## Docs

- Deutsch: https://github.com/bkstudy2025/neo-dashboard-kit/blob/main/docs/de/README.md
- English: https://github.com/bkstudy2025/neo-dashboard-kit/blob/main/docs/en/README.md

## Updates (Beta)

This project is published as **beta (pre-releases)**. HACS **hides pre-releases by default** — to receive new versions, enable **"Show beta versions"** for this repository in HACS (repository → 3-dot menu → *Redownload* / settings), then update as usual. A stable release will follow later.

## Notes

- No frontend dependency for the cards (Card Mod is **not** required).
- **Neo Dashboard Tools** (HACS · Integration) is recommended for the server-side store.
- On first open, HACS may briefly show "no information" until it has cached this text — reopen once and it appears (HACS-side caching, not configurable from the repo).
