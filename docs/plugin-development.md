# Neo Dashboard Kit — Plugin Development Guide

Build your own Neo Dashboard card and publish it as a HACS integration.

---

## Quickstart

### 1. Create a new GitHub repository

Name it `neo-dashboard-[your-card-name]`, e.g. `neo-dashboard-weather-card`.

### 2. Add a `hacs.json`

```json
{
  "name": "Neo Weather Card",
  "content_in_root": true,
  "filename": "neo-weather-card.js",
  "render_readme": true,
  "categories": ["lovelace"]
}
```

### 3. Write your card

Your card must be loaded **after** `neo-dashboard.js`. Use `window.NeoDashboard.registerCard()` to register it.

#### Option A — Plain HTMLElement (zero dependencies)

```js
class NeoWeatherCard extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return 2; }

  _render() {
    const entity = this._hass?.states?.[this._config.entity];
    this.innerHTML = `
      <div style="
        border-radius: 24px;
        padding: 16px;
        background: linear-gradient(160deg, var(--neo-fill2) 0%, var(--neo-fill0) 100%);
        border: 1px solid var(--neo-line2);
        color: var(--neo-text1);
        font-family: var(--neo-font, system-ui);
      ">
        <div style="font-size:26px;font-weight:500;">${entity?.state ?? '—'}</div>
        <div style="font-size:12px;color:var(--neo-text3);">${this._config.name ?? entity?.attributes?.friendly_name}</div>
      </div>
    `;
  }
}

window.NeoDashboard.registerCard("neo-weather-card", NeoWeatherCard);
```

#### Option B — Extend NeoBaseCard (recommended)

Include the core as a dev dependency or import it via CDN in your build:

```js
// Your card repo — import base from the core
// (users must have neo-dashboard.js loaded first, so the base is available)

class NeoWeatherCard extends HTMLElement {
  // ...same as Option A but you can reuse Neo tokens
}
```

### 4. Use Neo Design Tokens

All Neo CSS variables are available on any element inside HA once neo-dashboard.js is loaded:

```css
color: var(--neo-text1);
background: var(--neo-fill1);
border: 1px solid var(--neo-line2);
backdrop-filter: var(--neo-blur);
border-radius: var(--neo-radius);
```

Accent colors (use inline):
- Blue: `#7C9CFF` / glow `rgba(124,156,255,0.35)`
- Amber: `#FFB26B` / glow `rgba(255,178,107,0.35)`
- Mint: `#5EDCB8` / glow `rgba(94,220,184,0.35)`
- Violet: `#C084FC` / glow `rgba(192,132,252,0.35)`
- Rose: `#F87171` / glow `rgba(248,113,113,0.35)`

### 4b. Responsive layout (shared system)

`NeoBaseCard` provides a consistent device/breakpoint system so every card
(including community cards) behaves the same. Give your card a `layout` config
option with values `auto | mobile | tablet | desktop` and read the resolved
layout in `render()`:

```js
class MyCard extends NeoBaseCard {
  render() {
    const lay = this._layout();          // "mobile" | "tablet" | "desktop"
    if (this._isMobile())  { /* compact */ }
    if (this._isTablet())  { /* medium, show more detail */ }
    // ...
  }
}
```

- `layout: auto` (default) resolves by viewport width — mobile ≤640 px,
  tablet ≤1024 px, otherwise desktop. The card **re-renders automatically**
  when the viewport crosses a breakpoint.
- Fixed values (`mobile`/`tablet`/`desktop`) force a layout — useful for a
  dedicated tablet dashboard.

For the editor dropdown, reuse the shared options:

```js
const { layoutOptions } = window.NeoDashboard;
// in your ha-form schema:
{ name: "layout", label: "Layout / Gerät", selector: { select: { mode: "dropdown", options: layoutOptions } } }
```

Helpers on the API: `window.NeoDashboard.normalizeLayout(v)` and
`window.NeoDashboard.viewportLayout()`.

### 5. YAML config example

```yaml
type: custom:neo-weather-card
entity: weather.home
name: Today's Weather
```

### 6. Submit to HACS

1. Add a release tag: `git tag v1.0.0 && git push --tags`
2. Make sure your repo is public
3. Submit to the [HACS default repository list](https://github.com/hacs/default) (optional)
4. Or share the repo URL with users to install as a custom HACS repository

---

## Card loading order

Your plugin JS must load **after** `neo-dashboard.js`. In HA resources:

```yaml
resources:
  - url: /hacsfiles/neo-dashboard-kit/neo-dashboard.js
    type: module
  - url: /hacsfiles/neo-dashboard-weather-card/neo-weather-card.js
    type: module
```

---

## Community

Share your card in the [Discussions tab](https://github.com/bkstudy2025/neo-dashboard-kit/discussions) so others can find it!
