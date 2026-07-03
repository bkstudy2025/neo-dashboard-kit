// Neo Dashboard Kit — Registry
// Cards register here (core + community). They appear in the
// neo-card dropdown automatically — only the single "neo-card"
// wrapper is exposed in HA's native card picker.
import { neoLog } from "./debug.js";

const _registry = new Map();
let _tagSeq = 0;

export const NeoDashboardRegistry = {
  // Each card is defined under an internal, versioned tag so UPDATES work
  // live (a custom element can't be re-defined under the same name). The
  // public `type` maps to the current concrete tag — neo-card uses that.
  registerCard(type, cls, meta = {}) {
    const tag = `${type}--neo${++_tagSeq}`;
    try { customElements.define(tag, cls); } catch (e) { console.error("[Neo Dashboard]", e); return; }
    _registry.set(type, { cls, meta, tag }); // overwrite on update
    neoLog(`[Neo Dashboard] Registered: ${type} (${tag})`);
  },
  unregisterCard(type) {
    if (!type || type === "neo-card") return false;
    const removed = _registry.delete(type);
    if (removed) {
      neoLog(`[Neo Dashboard] Unregistered: ${type}`);
      window.dispatchEvent(new CustomEvent("neo-module-changed"));
    }
    return removed;
  },
  getCard(type) {
    return _registry.get(type)?.cls;
  },
  getTag(type) {
    return _registry.get(type)?.tag;
  },
  getMeta(type) {
    return _registry.get(type)?.meta || {};
  },
  // [{ type, name, description, icon, version, author }] for the dropdown/module list
  list() {
    return Array.from(_registry.entries()).map(([type, { meta }]) => ({
      type,
      name: meta.name || type,
      description: meta.description || "",
      icon: meta.icon || "✨",
      version: meta.version || "",
      author: meta.author || "",
      hidden: !!meta.hidden,
    }));
  },
};

window.NeoDashboard = NeoDashboardRegistry;