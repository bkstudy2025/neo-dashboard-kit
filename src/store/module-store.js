// Neo Dashboard Kit — Store (cards & modules)
// Talks to the "Neo Dashboard Tools" integration. Persists store items
// (cards & modules) server-side (file-based) so the dashboard config stays clean.
// Falls back gracefully (available=false) when not installed.
import { NeoDashboardRegistry } from "../core/registry.js";
import { NeoModules } from "../core/modules.js";
import { neoLoadModule } from "./module-loader.js";

// Modul-Code der letzten erfolgreichen Sitzung. Der Cache wird beim Start
// SYNCHRON (vor dem ersten Karten-Render) injiziert, damit Store-Karten sofort
// registriert sind und NICHT bei jedem Aufruf „Modul wird geladen …" aufblitzen.
// Der WS-Abgleich (_init) bleibt Quelle der Wahrheit und aktualisiert den Cache.
// Schlüssel ist origin-gebunden (localStorage) → pro HA-Instanz eindeutig.
const CACHE_KEY = "neo-modules-cache";

export const NeoStore = {
  _hass: null, _initStarted: false, _available: false, _loaded: false, _cache: [], _seeded: false,

  // Cache-Helfer: robust gegen deaktiviertes/volles localStorage (Sonderkontexte).
  _readCache() {
    try {
      const raw = window.localStorage?.getItem(CACHE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  },
  _writeCache(modules) {
    try {
      window.localStorage?.setItem(CACHE_KEY, JSON.stringify(modules || []));
    } catch (e) { /* Quota/blockiert → Cache ist nur ein Beschleuniger, ignorieren */ }
  },
  // Beim Bundle-Start einmal ausführen: injiziert die zuletzt bekannten Module
  // synchron, damit ihre Karten schon vor dem ersten Render in der Registry sind.
  _seedFromCache() {
    if (this._seeded) return;
    this._seeded = true;
    for (const m of this._readCache()) {
      if (m && m.code) neoLoadModule(m.code);
    }
  },

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
      // Nur Module (neu) injizieren, die der Cache-Seed nicht schon geladen hat
      // bzw. deren Code sich geändert hat → Live-Update ohne Reload.
      const seeded = new Map(this._readCache().map((m) => [m.name, m.code]));
      this._cache.forEach((m) => { if (seeded.get(m.name) !== m.code) neoLoadModule(m.code); });
      // Cache mit dem serverseitigen Stand abgleichen (auch Löschungen greifen
      // beim nächsten Reload). Nur bei ERFOLG schreiben — ein WS-Fehler soll den
      // funktionierenden Cache nicht leeren.
      this._writeCache(this._cache);
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
      this._writeCache(this._cache);
    } catch (e) { /* keep cache */ }
    return this._cache;
  },

  async save(name, code) {
    const res = await this._hass.connection.sendMessagePromise({ type: "neo_dashboard_tools/save", name, code });
    // Der Server sanitisiert den Dateinamen (_safe_name); unter DIESEM Namen
    // cachen, damit der lokale Cache exakt dem entspricht, was list() liefert.
    const savedName = res?.name || name;
    this._cache = this._cache.filter((m) => m.name !== savedName).concat([{ name: savedName, code }]);
    this._writeCache(this._cache);
    return res;
  },

  async delete(name) {
    const res = await this._hass.connection.sendMessagePromise({ type: "neo_dashboard_tools/delete", name });
    this._cache = this._cache.filter((m) => m.name !== name);
    this._writeCache(this._cache);
    NeoModules.unregister(name);
    NeoDashboardRegistry.unregisterCard?.(name);
    window.dispatchEvent(new CustomEvent("neo-module-changed"));
    return res;
  },

  // Server-side fetch of an https URL (Store) — avoids browser CORS.
  async fetch(url) {
    const res = await this._hass.connection.sendMessagePromise({ type: "neo_dashboard_tools/fetch", url });
    return res.content;
  },
};

window.NeoDashboard.store = NeoStore;
// Hinweis: _seedFromCache() wird bewusst NICHT hier aufgerufen, sondern erst am
// Ende von neo-dashboard.js — dann ist die komplette Public API (BaseCard,
// makeEditor, …) vorhanden, die injizierte Karten-Module beim Registrieren
// erwarten. Ein Seed hier (Import-Reihenfolge vor public-api.js) würde sie brechen.
