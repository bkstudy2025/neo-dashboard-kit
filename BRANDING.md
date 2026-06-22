# Branding & Icons — Neo Dashboard Kit

Keep the brand assets consistent across the repo and with
[Neo Dashboard Tools](https://github.com/bkstudy2025/neo-dashboard-tools).

## Asset files

| File | Size | Purpose |
|---|---|---|
| `logo.png` | 365×325 | README header image (referenced via `raw.githubusercontent.com`) |
| `icon.png` | 256×256 | Square icon (kept for parity with the Tools integration) |

`info.md` is intentionally **image-free** so the HACS info box renders without a
broken image while HACS caches the description (see commit history).

## How HACS shows the icon for this repo (researched, not guessed)

Neo Dashboard Kit is a **Lovelace / frontend plugin**, not a custom integration.

- HACS resolves a repository's store/list icon from the **Home Assistant brands
  service, keyed by an integration *domain*** (e.g.
  `https://brands.home-assistant.io/_/<domain>/icon.png`, with metadata from
  `data-v2.hacs.xyz`). It does **not** read the repo's root `icon.png`/`logo.png`,
  the README image, or any `hacs.json` field (HACS has no icon field).
- A **frontend plugin has no integration domain**, and `home-assistant/brands`
  has **no category for Lovelace plugins**. There is therefore **no supported
  repo-side mechanism** to set the HACS list icon for a custom plugin — HACS shows
  a **generic icon**. This is expected HACS behaviour and **cannot be fixed from
  this repository**.
- The **inline `brand/` mechanism** (HA 2026.3+) applies **only to custom
  integrations** (`custom_components/<domain>/brand/`), so this plugin repo does
  not ship a `brand/` folder. (The companion **Neo Dashboard Tools** integration
  does — see its `BRANDING.md`.)
- The README header logo is loaded directly from the repo via
  `raw.githubusercontent.com`, so it always renders regardless of HACS.

> **Summary:** the generic Kit icon in HACS is a known limitation of how HACS
> handles **frontend plugins**, not a missing/broken asset in this repo. Related
> HACS discussion:
> [hacs/integration#5223](https://github.com/hacs/integration/issues/5223),
> [hacs/integration#5171](https://github.com/hacs/integration/issues/5171).

## Brand image guidelines (for reference)

- **Icon:** square (1:1), 256×256, PNG, trimmed, transparency preserved.
- **Logo:** landscape, PNG, displayed at `width=170` in the README.

See the Home Assistant [brands repository](https://github.com/home-assistant/brands)
for the full specification.
