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
| Light / Switch | On/off toggle (lights also brightness) |
| Fan | Toggle + speed |
| Cover | Open / Stop / Close |
| Climate/Thermostat | Temperature − / + |
| Media player | ⏮ ⏯ ⏭ |
| Lock | Lock / Unlock |
| Alarm panel | Home / Away ↔ Disarm |
| Scene / Script | Tap to run |
| Light group | several lights together (`entities` field) |

**Options:** `entity` (or `entities` for groups), `name`, `sub` (subtitle),
`icon`, `accent` (color), `layout`.
*Advanced (YAML):* `step` (climate step), `code` (alarm code).

## 📊 Neo Display — `neo-display-card`
Shows values without controlling. Tap opens the device dialog.

| Device | Shows |
|---|---|
| Sensor / binary sensor / number | Value + unit |
| Camera | Snapshot (live on tap) |

**Options:** `entity`, `name`, `sub`, `icon`, `unit`, `accent`, `layout`.

## 🔖 Neo Header — `neo-header-card`
Pure layout block (no device) to structure the dashboard.
- `variant: header` — icon + title + subtitle
- `variant: divider` — divider line with optional label

**Options:** `title`, `subtitle`, `icon`, `accent`.

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
