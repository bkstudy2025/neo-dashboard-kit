# Release Checklist — Neo Dashboard Kit

A practical pre-release checklist. Tick everything before tagging a release.

---

## Cards — test matrices

### Neo Control (`neo-control-card`)
- [ ] Light (on/off, brightness, color where supported)
- [ ] Switch / input_boolean toggles
- [ ] Cover (open/close/stop, position if available)
- [ ] Climate (mode + setpoint)
- [ ] Media player (play/pause, volume)
- [ ] Lock (lock/unlock)
- [ ] Alarm control panel (arm/disarm states)
- [ ] Scene / script (activate)
- [ ] Light group
- [ ] Empty state when no type/entity is selected
- [ ] Editor: type → entity flow, conditional fields, no console errors

### Neo Display (`neo-display-card`)
- [ ] Sensor value + unit
- [ ] Camera (snapshot/stream)
- [ ] Weather (current condition)
- [ ] Calendar / next event
- [ ] Badge / KPI and text/markdown types
- [ ] Empty state when no type/entity is selected
- [ ] Editor: type → entity flow, no console errors

### Neo Header (`neo-header-card`)
- [ ] Heading text renders
- [ ] Divider variant renders
- [ ] Editor variant switch, no console errors

---

## Store — test matrix
- [ ] Store tab loads (with **Neo Dashboard Tools** installed)
- [ ] All **valid** catalog items appear
- [ ] A deliberately **broken** entry (bad url / missing field) is **skipped**,
      the rest of the list still shows (check console warning)
- [ ] Install a card and a module from the store works
- [ ] Remove an installed card/module works
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
