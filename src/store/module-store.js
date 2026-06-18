// Neo Dashboard Kit — Module Store
// Talks to the "Neo Dashboard Tools" integration. Persists modules
// server-side (file-based) so the dashboard config stays clean.
// Falls back gracefully (available=false) when not installed.
import { neoLoadModule } from "./module-loader.js";

export const NeoStore = {
  _hass: null, _initStarted: false, _available: false, _loaded: false, _cache: [],

  setHass(hass) {
    if (!hass) return;
    this._hass = hass;
    if (!this._initStarted) this._init();
  },

  async _init() {
    this._initStarted = true;
    try {
      const res = await this._hass.connection.sendMessagePromise({ type: "neo_dashboard_tools/list" });
      this._available = true;
      this._cache = res.modules || [];
      this._cache.forEach((m) => neoLoadModule(m.code));
    } catch (e) {
      this._available = false; // integration not installed → fallback mode
    }
    this._loaded = true;
    window.dispatchEvent(new CustomEvent("neo-modules-loaded"));
  },

  available() { return this._available; },

  async list() {
    if (!this._available || !this._hass) return [];
    try {
      const res = await this._hass.connection.sendMessagePromise({ type: "neo_dashboard_tools/list" });
      this._cache = res.modules || [];
    } catch (e) { /* keep cache */ }
    return this._cache;
  },

  async save(name, code) {
    return this._hass.connection.sendMessagePromise({ type: "neo_dashboard_tools/save", name, code });
  },

  async delete(name) {
    return this._hass.connection.sendMessagePromise({ type: "neo_dashboard_tools/delete", name });
  },

  // Server-side fetch of an https URL (Module Store) — avoids browser CORS.
  async fetch(url) {
    const res = await this._hass.connection.sendMessagePromise({ type: "neo_dashboard_tools/fetch", url });
    return res.content;
  },
};

window.NeoDashboard.store = NeoStore;
