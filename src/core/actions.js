// Neo Dashboard Kit — Home-Assistant-style action system
// Shared tap/hold/double-tap action handling for all core cards.
// Supported actions: more-info · toggle · navigate · url · call-service · none.
// Designed to be robust: an incomplete or invalid action config never throws.

import { safeUrl } from "./html.js";

export const NEO_ACTION_DEFAULT_CONFIRM = "Aktion wirklich ausführen?";

// Normalize an action config — accepts the object form or a string shorthand
// ("more-info"), returns an object { action, … } or null.
export function neoNormalizeAction(raw) {
  if (raw == null) return null;
  if (typeof raw === "string") return { action: raw };
  if (typeof raw === "object") return raw;
  return null;
}

// Confirmation gate. confirmation: true → generic text; confirmation.text → custom.
// Returns true when execution may proceed (no confirmation, or user accepted).
function neoConfirmed(cfg, t) {
  const c = cfg.confirmation;
  if (!c) return true;
  const text = (c && typeof c === "object" && c.text) ? c.text : NEO_ACTION_DEFAULT_CONFIRM;
  const msg = typeof t === "function" ? t(text) : text;
  try { return window.confirm(msg); } catch (_e) { return true; }
}

// Execute an action config with the given helpers.
// helpers: { entity, moreInfo(id), navigate(path), callService(d,s,data,target),
//            toggle(), t(text) }
// Returns true when the gesture was handled (incl. "none" and cancelled confirm),
// false only when the config is missing/unrecognized so the caller can fall back.
export function neoExecuteAction(raw, helpers = {}) {
  const cfg = neoNormalizeAction(raw);
  if (!cfg) return false;
  const action = cfg.action || "none";
  if (action === "none") return true;
  if (!neoConfirmed(cfg, helpers.t)) return true;

  switch (action) {
    case "more-info": {
      const ent = cfg.entity || helpers.entity;
      if (ent && typeof helpers.moreInfo === "function") helpers.moreInfo(ent);
      return true;
    }
    case "toggle": {
      if (typeof helpers.toggle === "function") helpers.toggle();
      return true;
    }
    case "navigate": {
      const path = cfg.navigation_path;
      if (path && typeof helpers.navigate === "function") helpers.navigate(path);
      return true;
    }
    case "url": {
      const url = safeUrl(cfg.url_path || cfg.url);
      if (url) { try { window.open(url, "_blank", "noopener"); } catch (_e) { /* ignore */ } }
      return true;
    }
    case "call-service":
    case "perform-action": {
      // HA renamed "call-service" → "perform-action" and `service` → `perform_action`.
      // Both are accepted here for forward/backward compatibility.
      const svc = cfg.service || cfg.perform_action;
      if (typeof svc === "string" && svc.includes(".") && typeof helpers.callService === "function") {
        const dot = svc.indexOf(".");
        const domain = svc.slice(0, dot);
        const service = svc.slice(dot + 1);
        // service_data is a legacy alias for data.
        const data = { ...(cfg.service_data || {}), ...(cfg.data || {}) };
        if (domain && service) helpers.callService(domain, service, data, cfg.target);
      }
      return true;
    }
    default:
      return false;
  }
}
