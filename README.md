# Neo Dashboard Kit

Neo Dashboard Kit is a modern Home Assistant custom-card bundle for clean, touch-friendly and glassmorphism-inspired dashboards.

The project provides reusable Lovelace cards, shared design tokens, helper utilities and a schema-based editor foundation for building consistent Home Assistant dashboards.

## Status

**Development / early preview**

This project is still under active development. The current version is intended for testing, iteration and early dashboard building. APIs, card options and styling details may still change before a stable release.

## Available Cards

| Card            | Type                     | Purpose                                                                               |
| --------------- | ------------------------ | ------------------------------------------------------------------------------------- |
| Neo Header Card | `custom:neo-header-card` | Personal dashboard header with greeting, date/time and optional person entity         |
| Neo Demo Card   | `custom:neo-demo-card`   | Small demo card for testing the Neo design foundation                                 |
| Neo Sensor Card | `custom:neo-sensor-card` | Displays one sensor value with icon, unit, layout options and secondary info          |
| Neo Tile Card   | `custom:neo-tile-card`   | Touch-friendly action tile for lights, switches, scenes, scripts and similar entities |

## Home Assistant Resource

After building or copying the bundle to your Home Assistant `www` directory, add it as a Lovelace resource:

```yaml
url: /local/neo-dashboard-kit.js
type: module
```

Example path on Home Assistant:

```text
/config/www/neo-dashboard-kit.js
```

Home Assistant then serves it as:

```text
/local/neo-dashboard-kit.js
```

## Minimal Sensor Card Example

```yaml
type: custom:neo-sensor-card
entity: sensor.example_temperature
name: Wohnzimmer
icon: mdi:thermometer
unit: °C
decimals: 1
secondary_info: last_changed
layout: compact
tap_action:
  action: more-info
```

Useful options:

| Option           | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `entity`         | Required Home Assistant entity                       |
| `name`           | Optional display name                                |
| `icon`           | Optional MDI icon override                           |
| `unit`           | Optional unit override                               |
| `decimals`       | Optional number of decimal places for numeric states |
| `secondary_info` | `none`, `last_changed` or `entity_id`                |
| `layout`         | `compact` or `large`                                 |
| `tap_action`     | Home Assistant action object                         |

## Minimal Tile Card Example

```yaml
type: custom:neo-tile-card
entity: light.example_living_room
name: Wohnzimmer Licht
icon: mdi:ceiling-light
show_state: true
secondary_info: last_changed
layout: compact
tap_action:
  action: toggle
hold_action:
  action: more-info
```

Useful options:

| Option              | Description                           |
| ------------------- | ------------------------------------- |
| `entity`            | Required Home Assistant entity        |
| `name`              | Optional display name                 |
| `icon`              | Optional MDI icon override            |
| `show_state`        | Show or hide the current state        |
| `secondary_info`    | `none`, `last_changed` or `entity_id` |
| `layout`            | `compact` or `large`                  |
| `tap_action`        | Home Assistant action object          |
| `hold_action`       | Optional hold action                  |
| `double_tap_action` | Optional double-tap action            |

If no explicit `tap_action` is configured, `neo-tile-card` uses sensible defaults for common domains such as `light`, `switch`, `input_boolean`, `fan`, `scene` and `script`.

## Examples

More complete YAML examples are available in the `examples/` directory:

```text
examples/sensor-card.yaml
examples/tile-card.yaml
examples/dashboard-basic.yaml
examples/dashboard-mobile.yaml
```

These examples include placeholder entities such as `sensor.example_temperature`, `light.example_living_room` and `switch.example_socket`. Replace them with your own Home Assistant entities.

## Development

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Build the bundle:

```bash
npm run build
```

The built file is generated at:

```text
dist/neo-dashboard-kit.js
```

## HACS

The repository already includes a minimal `hacs.json` and is prepared for future HACS usage.

A complete release workflow, installation guide and HACS release documentation are not finalized yet.

## Architecture

For architecture decisions, naming conventions, validation strategy, helper structure and editor strategy, see:

```text
ARCHITECTURE.md
```

Additional phase review documents are also included:

```text
PHASE_2_REVIEW.md
PHASE_3_REVIEW.md
```

## License

MIT
