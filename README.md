# Neo Dashboard Kit

A glassmorphism-style Home Assistant dashboard with a community plugin system.

![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)
![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## Installation via HACS

1. Open HACS → Frontend → Custom Repositories
2. Add `https://github.com/bkstudy2025/neo-dashboard-kit` with category **Plugin**
3. Install **Neo Dashboard Kit**
4. Add to your `configuration.yaml` or Lovelace resources:

```yaml
resources:
  - url: /hacsfiles/neo-dashboard-kit/neo-dashboard.js
    type: module
```

---

## Cards

### `neo-light-card`
```yaml
type: custom:neo-light-card
entity: light.living_room
name: Living Room     # optional, uses friendly_name
accent: amber         # blue | amber | mint | violet | rose
```

### `neo-sensor-card`
```yaml
type: custom:neo-sensor-card
entity: sensor.temperature_living_room
name: Temperature
icon: "🌡️"
unit: "°C"
accent: mint
```

### `neo-scene-card`
```yaml
type: custom:neo-scene-card
entity: scene.movie_night
name: Movie Night
sub: "6 devices"
icon: "🎬"
accent: violet
```

---

## Community Plugins

Anyone can build additional Neo Dashboard cards as a separate HACS repo.

See **[docs/plugin-development.md](docs/plugin-development.md)** for the full guide.

Quick example:
```js
class MyCustomCard extends HTMLElement {
  setConfig(config) { this._config = config; }
  set hass(hass) { this._hass = hass; }
  getCardSize() { return 2; }
}

// Register with Neo Dashboard
window.NeoDashboard.registerCard("neo-my-card", MyCustomCard);
```

---

## Design Tokens

All cards use CSS custom properties — override them in your theme:

| Variable | Default | Description |
|---|---|---|
| `--neo-fill0` | `rgba(255,255,255,0.02)` | Darkest surface fill |
| `--neo-fill1` | `rgba(255,255,255,0.04)` | Card background |
| `--neo-fill2` | `rgba(255,255,255,0.055)` | Elevated surface |
| `--neo-text1` | `#F4F6FB` | Primary text |
| `--neo-text2` | `rgba(244,246,251,0.72)` | Secondary text |
| `--neo-text3` | `rgba(244,246,251,0.50)` | Tertiary / labels |
| `--neo-blur` | `blur(24px) saturate(140%)` | Backdrop filter |
| `--neo-radius` | `24px` | Card corner radius |

---

## Contributing

PRs welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

---

## License

MIT © [Neo Dashboard Kit Contributors](https://github.com/bkstudy2025/neo-dashboard-kit)
