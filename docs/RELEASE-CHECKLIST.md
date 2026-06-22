# Release Checklist — Neo Dashboard Kit

A practical pre-release checklist. Tick everything before tagging a release.

> **Release target:** `v1.0.0-rc.1` (Release Candidate). Do **not** tag a stable
> `v1.0.0` before the real-device matrix below is completed on actual hardware.
> See also [Free vs Premium](free-vs-premium.md).

---

## Cards — test matrices

### Actions (all cards)
**Editor (UI):**
- [ ] Control / Display / Header each show an **Actions** section (Tap / Hold / Double tap)
- [ ] Native HA action editor renders; conditional fields appear per action
- [ ] tap/hold/double configurable for: more-info · toggle · navigate · url · perform-action · none
- [ ] **"Default"** removes the action key from config (no `action: default` saved)
- [ ] perform-action: service + target + data editable via UI
**Runtime:**
- [ ] `tap_action`: more-info / toggle / navigate / url / call-service(perform-action) / none
- [ ] `hold_action` (press & hold ~0.5s); does not also fire tap
- [ ] `double_tap_action`; no conflict with single tap
- [ ] `confirmation: true` (generic prompt) and `confirmation.text` (custom); preserved across UI edits
- [ ] Invalid URL / invalid service does **not** crash (ignored)
- [ ] Internal buttons/sliders do **not** double-trigger the card action
- [ ] Display markdown / Header without entity → more-info does not crash

### Neo Control (`neo-control-card`)
- [ ] Light dimmable: toggle + brightness; non-dimmable: no slider, no false 0 %
- [ ] Switch / input_boolean toggles; `show_toggle: false` hides toggle
- [ ] Fan: simple on/off · percentage · presets · oscillate · direction
- [ ] Cover: open/stop/close · position · tilt · device_class label/icon
- [ ] Climate: current temp · setpoint + step · hvac modes · presets · (fan/swing/humidity optional)
- [ ] Media: play/pause/prev/next · volume · mute · (source/power optional)
- [ ] Lock (lock/unlock)
- [ ] Alarm control panel (arm home/away, disarm, code)
- [ ] Scene / script / button: default tap fires; custom `tap_action` overrides
- [ ] Light group: brightness only when a dimmable light is on; unavailable members ignored
- [ ] Capability-aware: unsupported controls are hidden
- [ ] `unknown`/`unavailable` renders cleanly (no broken buttons/active state)
- [ ] Empty state when no type/entity is selected
- [ ] Editor: type → entity flow, conditional fields, no console errors
- [ ] Editor: `show_*` visibility toggles reflect their on-by-default state after picking a type

### Neo Display (`neo-display-card`)
- [ ] Sensor value + unit
- [ ] Camera (snapshot/stream)
- [ ] Weather (current condition)
- [ ] Calendar / next event
- [ ] Badge / KPI and text/markdown types
- [ ] Actions work; default tap = more-info; preview stable for all types
- [ ] Empty state when no type/entity is selected
- [ ] Editor: type → entity flow, no console errors

### Neo Header (`neo-header-card`)
- [ ] Heading text renders
- [ ] Divider variant renders
- [ ] Actions work (default `none`); header/divider stable without an action
- [ ] Editor variant switch, no console errors

---

## Store — test matrix

> The catalog (`store/index.json`) ships **three curated free modules**:
> **Neo Mini Badge**, **Neo Glow Frame**, **Neo Accent Wash**. All store URLs are
> pinned to an **immutable commit SHA** (not `@main`). The Free/Premium split is
> defined in [free-vs-premium.md](free-vs-premium.md).

- [ ] Store tab loads (with **Neo Dashboard Tools** installed)
- [ ] All three curated modules appear and install
- [ ] Store URLs are **pinned to a commit SHA / tag** (no `@main`) — validator warns on `@main`
- [ ] Module manifest `version` matches the `store/index.json` `version`
- [ ] **Empty/old store** still shows a clean empty-state message ("Aktuell keine
      Store-Module verfügbar … Code einfügen"), not an error/blank
- [ ] `node scripts/validate-store.mjs` on the empty catalog → **warning only**,
      exit 0 (CI stays green)
- [ ] When entries exist later: all **valid** catalog items appear
- [ ] A deliberately **broken** entry (bad url / missing field) is **skipped**,
      the rest of the list still shows (check console warning)
- [ ] Install a card and a module from the store works
- [ ] Remove an installed card/module works
- [ ] "Paste code" still works for users' own/premium modules
- [ ] Without the **Neo Dashboard Tools** integration → clear message shown
- [ ] A **foreign/invalid store URL** is blocked (frontend skip + server
      `host_not_allowed` / `path_not_allowed`)
- [ ] "Refresh store" picks up a freshly merged entry (no release needed)

---

## Real-device tests (on actual hardware)

Tested with a real entity of each domain (Neo Control / Neo Display as
appropriate). **Required before tagging stable `v1.0.0`.**

- [ ] `light`
- [ ] `switch`
- [ ] `cover`
- [ ] `climate`
- [ ] `media_player`
- [ ] `fan`
- [ ] `lock`
- [ ] `alarm_control_panel`
- [ ] `sensor`
- [ ] `binary_sensor`
- [ ] `camera`
- [ ] `weather`

---

## Build & validation
- [ ] `npm ci`
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `node scripts/validate-store.mjs` (0 errors)
- [ ] `neo-dashboard.js` rebuilt and committed when `src/` changed
- [ ] `package.json` version bumped; `package-lock.json` in sync

---

## HACS
- [ ] Fresh installation via HACS works
- [ ] Update from a previous version works
- [ ] Hard browser refresh after update (no stale bundle)
- [ ] No console errors on a dashboard using all three cards
- [ ] (If beta) "Show beta versions" note still accurate in README/info.md

---

## Companion integration (neo-dashboard-tools)
- [ ] `python -m compileall custom_components/neo_dashboard_tools` passes
- [ ] Store index loads via the fetch proxy
- [ ] `@main` module URLs load via the fetch proxy
- [ ] Foreign host/repo/path is rejected (`host_not_allowed` / `path_not_allowed`)
