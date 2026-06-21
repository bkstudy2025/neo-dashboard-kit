# Release Checklist — Neo Dashboard Kit

A practical pre-release checklist. Tick everything before tagging a release.

---

## Cards — test matrices

### Actions (all cards)
- [ ] `tap_action`: more-info / toggle / navigate / url / call-service / none
- [ ] `hold_action` (press & hold ~0.5s)
- [ ] `double_tap_action`
- [ ] `confirmation: true` (generic prompt) and `confirmation.text` (custom)
- [ ] Invalid URL / invalid service does **not** crash (ignored)
- [ ] Internal buttons/sliders do **not** double-trigger the card action

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
- [ ] Editor: type → entity flow, visibility toggles, conditional fields, no console errors

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

> For the initial release the catalog (`store/index.json`) ships **empty (`[]`)**
> on purpose — this is **not** a blocker, and no example modules need to be in
> the store.

- [ ] Store tab loads (with **Neo Dashboard Tools** installed)
- [ ] **Empty store** shows a clean empty-state message ("Aktuell keine
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
