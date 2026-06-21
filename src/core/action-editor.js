// Neo Dashboard Kit — Action editor schema helper
// Builds the visual "Aktionen" section for card editors using Home Assistant's
// NATIVE `ui_action` selector (the same hui-action-editor HA core uses). That
// gives us the action dropdown plus conditional fields (navigation_path, url_path,
// perform_action + target + data), the "Default" option (which clears the key),
// and HA's own translations — without reimplementing anything.
//
// Note: HA's action editor has no inline confirmation UI; `confirmation` is set
// via YAML and is preserved across edits (the native editor spreads the config).

// Supported actions (modern HA token "perform-action"; "call-service" stays
// supported in saved configs at runtime). "assist" is intentionally omitted.
const NEO_UI_ACTIONS = ["more-info", "toggle", "navigate", "url", "perform-action", "none"];

// One collapsible "Aktionen" group with tap/hold/double-tap fields.
// opts: { tapDefault, holdDefault, doubleDefault } — optional default_action
// labels shown on the "Default" entry (purely cosmetic).
export function neoActionFields(opts = {}) {
  const mk = (def) => ({ ui_action: { actions: NEO_UI_ACTIONS, ...(def ? { default_action: def } : {}) } });
  return {
    type: "expandable", title: "Aktionen", icon: "mdi:gesture-tap",
    schema: [
      { name: "tap_action", label: "Tippen", selector: mk(opts.tapDefault) },
      { name: "hold_action", label: "Halten", selector: mk(opts.holdDefault) },
      { name: "double_tap_action", label: "Doppeltippen", selector: mk(opts.doubleDefault) },
    ],
  };
}

// Drop empty / "default" action keys so the card falls back to its default
// behaviour and the YAML stays clean (the native editor sets undefined on Default).
export function neoCleanActions(cfg) {
  for (const k of ["tap_action", "hold_action", "double_tap_action"]) {
    const v = cfg[k];
    if (v == null) { delete cfg[k]; continue; }
    if (typeof v === "object" && (!v.action || v.action === "default")) delete cfg[k];
  }
  return cfg;
}
