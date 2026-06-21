# Cards

[🇩🇪 Deutsch](../de/karten.md) · 🇬🇧 English · [← Overview](README.md)

There are **three** cards. Pick one, choose your **entity** — the rest adapts
automatically. All run through the wrapper card `custom:neo-card`.

```yaml
type: custom:neo-card
card_type: neo-control-card
entity: climate.living_room
```

## 🎛️ Neo Control — `neo-control-card`
One card for **all controllable devices**. It detects the entity type and shows
the matching controls:

| Device | On-card control |
|---|---|
| Light / Switch | On/off toggle (dimmable lights also brightness) |
| Fan | Toggle + speed + presets, oscillate, direction |
| Cover | Open / Stop / Close + position + tilt |
| Climate/Thermostat | Temperature − / + + modes + presets (optional fan/swing/humidity) |
| Media player | ⏮ ⏯ ⏭ + volume, mute (optional source, power) |
| Lock | Lock / Unlock |
| Alarm panel | Home / Away ↔ Disarm |
| Scene / Script / Button | Tap to run (`scene.turn_on` / `script.turn_on` / `button.press`) |
| Light group | several lights together (`entities` field) |

> **Capability-aware:** only controls the entity actually supports are shown — a
> non-dimmable light gets no brightness slider, a cover without position support
> no position slider, and so on. **`unknown`/`unavailable`** renders cleanly as
> "Unavailable" / "—" (no misleading active state, no broken buttons);
> more-info still works as long as an `entity` is set.

**Options:** `entity` (or `entities` for groups), `name`, `sub` (subtitle),
`icon`, `accent` (color), `layout`.
*Advanced (YAML):* `step` (climate step), `code` (alarm code).

### Control visibility
All toggles default to **on** (except those marked below) and only take effect
when the entity supports the feature.

| Option | Default | Applies to |
|---|---|---|
| `show_toggle` | `true` | light, switch, fan, lock, light group |
| `show_brightness` | `true` | light, light group (dimmable only) |
| `show_percentage` | `true` | fan |
| `show_fan_presets` | `true` | fan |
| `show_fan_oscillate` | `true` | fan |
| `show_fan_direction` | `true` | fan |
| `show_cover_controls` | `true` | cover (open/stop/close) |
| `show_cover_position` | `true` | cover |
| `show_cover_tilt` | `true` | cover |
| `show_temperature_controls` | `true` | climate |
| `show_hvac_modes` | `true` | climate |
| `show_climate_presets` | `true` | climate |
| `show_climate_fan_modes` | `false` | climate |
| `show_climate_swing_modes` | `false` | climate |
| `show_humidity` | `false` | climate |
| `show_media_controls` | `true` | media |
| `show_volume` | `true` | media |
| `show_mute` | `true` | media |
| `show_source` | `false` | media |
| `show_media_power` | `false` | media |
| `show_alarm_controls` | `true` | alarm |

For covers the `device_class` (e.g. `garage`, `door`, `gate`, `window`,
`shutter`, `blind`, `curtain`, `awning`, `shade`) picks a sensible icon/label.

### Examples

```yaml
# Light (dimmable) – tap opens more-info, hold toggles
type: custom:neo-card
card_type: neo-control-card
device_type: light
entity: light.living_room
show_toggle: true
show_brightness: true
tap_action:
  action: more-info
hold_action:
  action: toggle
```

```yaml
# Fan
type: custom:neo-card
card_type: neo-control-card
device_type: fan
entity: fan.bedroom
show_percentage: true
show_fan_presets: true
show_fan_oscillate: true
```

```yaml
# Cover
type: custom:neo-card
card_type: neo-control-card
device_type: cover
entity: cover.living_room_blind
show_cover_position: true
show_cover_tilt: false
```

```yaml
# Climate
type: custom:neo-card
card_type: neo-control-card
device_type: climate
entity: climate.living_room
show_hvac_modes: true
show_climate_presets: true
show_climate_fan_modes: false
```

```yaml
# Media
type: custom:neo-card
card_type: neo-control-card
device_type: media_player
entity: media_player.living_room
show_volume: true
show_mute: true
show_source: false
```

## 📊 Neo Display — `neo-display-card`
Shows values without controlling. Tap opens the device dialog.

| Device | Shows |
|---|---|
| Sensor / binary sensor / number | Value + unit |
| Camera | Snapshot (live on tap) |

**Options:** `entity`, `name`, `sub`, `icon`, `unit`, `accent`, `layout`.

**Actions:** `tap_action` (default `more-info`), `hold_action`, `double_tap_action`.
`toggle` only applies when the entity is toggleable; otherwise it is ignored.
Preview for markdown, camera, badge, weather and calendar stays stable.

## 🔖 Neo Header — `neo-header-card`
Pure layout block (no device) to structure the dashboard.
- `variant: header` — icon + title + subtitle
- `variant: divider` — divider line with optional label

**Options:** `title`, `subtitle`, `icon`, `accent`.

**Actions:** `tap_action` (default `none`), `hold_action`, `double_tap_action`
(`navigate` · `url` · `call-service` · `none`). Without a configured action the
heading and divider stay pure layout elements.

---

## Actions (`tap_action` · `hold_action` · `double_tap_action`)

All three cards support a Home-Assistant-style action system. Actions are
configured via **YAML** (nested objects).

**Supported actions:** `more-info` · `toggle` · `navigate` · `url` ·
`call-service` · `none`.

**Defaults:**

| Card | `tap_action` | `hold_action` | `double_tap_action` |
|---|---|---|---|
| Neo Control | domain default¹ | `none` | `none` |
| Neo Display | `more-info` | `none` | `none` |
| Neo Header | `none` | `none` | `none` |

¹ Control domain defaults: scene → `scene.turn_on`, script → `script.turn_on`,
button → `button.press`, light group → toggle, all other entity-based types →
`more-info`. A custom `tap_action` **overrides** the domain default.

```yaml
# Open a URL (relative HA paths and http/https only; invalid URLs are ignored)
tap_action:
  action: url
  url_path: https://example.com
```

```yaml
# Navigate
tap_action:
  action: navigate
  navigation_path: /lovelace/lights
```

```yaml
# Call a service — with confirmation
tap_action:
  action: call-service
  service: light.turn_on
  target:
    entity_id: light.living_room
  data:
    brightness_pct: 50
  confirmation:
    text: Start light scene?
```

**Confirmation:** `confirmation: true` shows a generic prompt ("Really run this
action?"), `confirmation.text` a custom one. A `window.confirm` runs before
execution — nothing happens if cancelled.

**`call-service`:** `service: "domain.service"`, optional `target`, `data`
(or `service_data` as an alias).

**Security (`url`):** the URL is validated via the `safeUrl()` helper; only
**relative HA paths** (`/lovelace/...`) and **`http`/`https`** are allowed.
Invalid URLs are ignored (no crash).

---

## Common options

**Color (`accent`):** `blue` · `amber` · `mint` · `violet` · `rose`

**Layout (`layout`):** `auto` (default, follows screen width) · `mobile`
· `tablet` · `desktop`

**Modules:** every card can be extended with modules (e.g. status badge, glow).
See **[Modules & Store](modules.md)**.

> Note: there are intentionally **only these three** cards. Device-specific
> behaviour (light, climate, cover, media …) is handled by the **Control** card
> automatically based on the entity. Extra card types come from the **Store**
> or **Premium**.
