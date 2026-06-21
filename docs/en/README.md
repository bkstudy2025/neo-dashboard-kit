# Neo Dashboard Kit — Documentation (English)

[🇩🇪 Deutsch](../de/README.md) · 🇬🇧 English

Beautiful glassmorphism cards for your Home Assistant dashboard — **one** card
that adapts to your device. Extensible via **modules** and **Premium**.

## Contents
- [Getting started](#getting-started) — install & first card
- [Cards](cards.md) — the three cards explained
- [Modules & Store](modules.md) — extend your cards
- [Development](development.md) — build your own cards/modules
- [Contributing](community.md) — share & submit cards/modules

---

## Getting started

### Prerequisites
| Plugin | HACS category | Required? |
|---|---|---|
| _no frontend dependency_ | — | The cards need **no** Card Mod or similar — mobile header & glass dialogs are built into Neo itself. |
| [Neo Dashboard Tools](https://github.com/bkstudy2025/neo-dashboard-tools) | Integration | ⭐ Recommended — store (cards & modules) & persistent storage |

### 1. Install (HACS)
1. HACS → **Frontend** → ⋮ → *Custom repository* →
   `https://github.com/bkstudy2025/neo-dashboard-kit` (type: *Dashboard/Lovelace*).
2. Install **Neo Dashboard Kit**, then restart Home Assistant.
3. Install **Neo Dashboard Tools** (integration) — recommended.

> HACS registers the resource automatically. Reload the browser once afterwards.

### 2. Enable the theme (optional, recommended)
1. Copy `themes/neo-dashboard.yaml` from this repo to `config/themes/`.
2. In `configuration.yaml`: `frontend:` → `themes: !include_dir_merge_named themes`.
3. Restart → Profile → **Theme** → pick **Neo Dashboard**
   (auto-switches light/dark).

### 2. Add a card
1. Edit dashboard → **Add card** → search for **“Neo Card”**.
2. At the top, under **Card type**, pick one of the three cards:
   - **Neo Steuerung (Control)** — anything controllable (light, switch, cover, climate, media …)
   - **Neo Anzeige (Display)** — sensor values & cameras
   - **Neo Header** — heading/divider to structure your dashboard
3. Choose an **entity** — the card automatically shows the right controls.
4. Done. 🎉

> **Rule of thumb:** the most-used control sits on the card. The **full** set of
> options is one **tap on the card** away (opens Home Assistant’s device dialog).

### 3. Extend cards (modules)
In the card editor there’s an **Extensions** area → **➕ Install card or module**:
- **Store** — install vetted modules with one click.
- **Paste code** — add modules/Premium cards (e.g. from Patreon).

More: **[Modules & Store](modules.md)**.

---

## Help & support
- 📖 [Documentation](https://github.com/bkstudy2025/neo-dashboard-kit)
- 🐞 [Report issues](https://github.com/bkstudy2025/neo-dashboard-kit/issues)
- 💬 [Discussions](https://github.com/bkstudy2025/neo-dashboard-kit/discussions)
- ❤️ Like it? Support keeps the project alive — see the links in the editor (“Info & Support”).
