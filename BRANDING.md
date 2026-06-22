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

## How HACS shows the icon for this repo

Neo Dashboard Kit is a **Lovelace / frontend plugin**, not a custom integration.

- The **inline `brand/` mechanism** (HA 2026.3+) applies **only to custom
  integrations** (`custom_components/<domain>/brand/`). It does **not** apply to
  frontend plugins, so this repo does not ship a `brand/` folder.
- For plugin repositories, HACS resolves the listing icon from
  `home-assistant/brands` / the HACS data CDN. For a **custom (non-default)
  repository**, HACS may fall back to a generic icon — this is a HACS-side
  behaviour and is **not** configurable from the repository.
- The README header logo is loaded directly from the repo via
  `raw.githubusercontent.com`, so it always renders regardless of HACS.

If/when this repo is added to the HACS default store, an icon can be registered
in `home-assistant/brands` under the plugin's name.

## Brand image guidelines (for reference)

- **Icon:** square (1:1), 256×256, PNG, trimmed, transparency preserved.
- **Logo:** landscape, PNG, displayed at `width=170` in the README.

See the Home Assistant [brands repository](https://github.com/home-assistant/brands)
for the full specification.
