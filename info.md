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

## Updates

This project is published as a **stable release** (`v1.0.0` and later). Install and update through HACS as usual — no beta setting required.

## Notes

- No frontend dependency for the cards (Card Mod is **not** required).
- **Neo Dashboard Tools** (HACS · Integration) is recommended for the server-side store.
- On first open, HACS may briefly show "no information" until it has cached this text — reopen once and it appears (HACS-side caching, not configurable from the repo).
