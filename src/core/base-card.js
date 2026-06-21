// Neo Dashboard Kit — Base Card
// All Neo cards (core + community) extend this class. Handles the shared
// shadow-root styling, responsive layout and performance-gated re-renders.

import { NEO_CSS } from "./tokens.js";
import { NEO_BP, normalizeLayout, neoViewportLayout } from "./layout.js";
import { NeoModules } from "./modules.js";
import { neoT } from "./i18n.js";
import { neoExecuteAction, neoNormalizeAction } from "./actions.js";

export class NeoBaseCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); }

  // Re-render bei Breakpoint-Wechsel, solange layout="auto".
  connectedCallback() {
    this._mqL = window.matchMedia(`(max-width:${NEO_BP.mobile}px)`);
    this._mqT = window.matchMedia(`(max-width:${NEO_BP.tablet}px)`);
    this._onBP = () => { if (normalizeLayout(this._config?.layout) === "auto") this._render(); };
    this._mqL.addEventListener("change", this._onBP);
    this._mqT.addEventListener("change", this._onBP);
  }
  disconnectedCallback() {
    if (this._onBP) {
      this._mqL?.removeEventListener("change", this._onBP);
      this._mqT?.removeEventListener("change", this._onBP);
    }
  }

  // Aufgelöstes Layout für diese Karte: "mobile" | "tablet" | "desktop".
  _layout() {
    const m = normalizeLayout(this._config?.layout);
    return m === "auto" ? neoViewportLayout() : m;
  }
  _isMobile() { return this._layout() === "mobile"; }
  _isTablet() { return this._layout() === "tablet"; }
  _isDesktop() { return this._layout() === "desktop"; }

  setConfig(config) {
    this._config = config;
    this._trackedCache = null; // config changed → recompute tracked entities
    this._render();
  }

  // Performance: only re-render when a tracked entity actually changed.
  // HA pushes a fresh hass object on EVERY state change in the system;
  // a naive re-render would rebuild the DOM dozens of times per second.
  set hass(h) {
    const prev = this._hass;
    this._hass = h;
    if (!prev) { this._render(); return; }
    const ids = this._trackedEntities();
    // No entities tracked → nothing state-driven to update (skip churn)
    if (ids.length === 0) return;
    const changed = ids.some((id) => prev.states?.[id] !== h.states?.[id]);
    if (changed) this._render();
  }
  get hass() { return this._hass; }

  getCardSize() { return 2; }
  render() { return `<div style="padding:16px">Override render()</div>`; }

  // Aktivierte Module dieser Karte (aus config.modules), aufgelöst aus der Registry.
  _enabledModules() {
    const list = Array.isArray(this._config?.modules) ? this._config.modules : [];
    return list
      .map((m) => ({ mod: NeoModules.get(m.id), settings: m.settings || {} }))
      .filter((x) => x.mod);
  }

  // Kontext für Modul-Hooks: Live-Daten + bequeme Aktions-Helfer, damit
  // Module nicht in interne Methoden greifen müssen.
  _modCtx(settings, extra) {
    return {
      hass: this._hass,
      config: this._config,
      settings: settings || {},
      card: this,
      callService: (d, s, data) => this._callService(d, s, data),
      navigate: (path) => {
        history.pushState(null, "", path);
        window.dispatchEvent(new CustomEvent("location-changed"));
      },
      moreInfo: (entityId) =>
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          detail: { entityId }, bubbles: true, composed: true,
        })),
      ...extra,
    };
  }

  // tapAction-Hook: erstes aktives Modul mit tapAction übernimmt den Tap
  // (überschreibt die Standard-Aktion der Karte). Gibt true zurück, wenn
  // ein Modul den Tap behandelt hat.
  _moduleTap(event) {
    for (const { mod, settings } of this._enabledModules()) {
      if (typeof mod.tapAction === "function") {
        try { mod.tapAction(this._modCtx(settings, { event })); }
        catch (e) { console.error("[Neo Module] tapAction", mod.id, e); }
        return true;
      }
    }
    return false;
  }

  // ── Action system (tap / hold / double_tap) ─────────────────
  // True when any action is configured (and not "none") — cards use this to
  // decide whether to look interactive (cursor/role) for action-only elements.
  _hasAnyAction() {
    const c = this._config || {};
    return [c.tap_action, c.hold_action, c.double_tap_action].some((x) =>
      x && (typeof x === "string" ? x !== "none" : x.action && x.action !== "none"));
  }

  // Helpers passed to the action executor — bound to this card's hass/services.
  _actionHelpers(entity, toggle) {
    return {
      entity,
      moreInfo: (id) => this._modCtx().moreInfo(id),
      navigate: (p) => this._modCtx().navigate(p),
      callService: (d, s, data, target) => this._callService(d, s, data, target),
      toggle,
      t: (s) => this._t(s),
    };
  }

  // Wire the standard tap/hold/double-tap action system onto `el`.
  // behavior: { entity, toggle, tapDefault }
  //   entity     — entity id for more-info / default behaviour
  //   toggle     — fn for action "toggle" (card's primary toggle)
  //   tapDefault — fn run when tap_action is NOT configured (domain default)
  // Module tapAction still wins for the tap gesture.
  _bindCardActions(el, behavior = {}) {
    if (!el) return;
    const cfg = this._config || {};
    const run = (key, fallback) => {
      // An empty or explicit "default" action falls back to the card's default
      // behaviour (domain default / more-info / none).
      const norm = neoNormalizeAction(cfg[key]);
      if (norm && norm.action && norm.action !== "default") {
        neoExecuteAction(norm, this._actionHelpers(behavior.entity ?? cfg.entity, behavior.toggle));
      } else if (typeof fallback === "function") fallback();
    };
    const onTap = (e) => { if (this._moduleTap(e)) return; run("tap_action", behavior.tapDefault); };
    const onHold = () => run("hold_action", null);
    const onDouble = () => run("double_tap_action", null);
    this._gesture(el, {
      onTap, onHold, onDouble,
      hold: cfg.hold_action != null,
      double: cfg.double_tap_action != null,
    });
  }

  // Low-level gesture detection. Plain click in the common case (no hold/double
  // configured) to avoid any tap delay; timers only when needed.
  _gesture(el, { onTap, onHold, onDouble, hold, double }) {
    // Ignore gestures that start on interactive children (buttons, sliders, …)
    // so internal controls never double-trigger a card action.
    const fromControl = (e) =>
      !!(e.target && e.target.closest && e.target.closest("button,input,select,a,[data-no-action]"));

    if (!hold && !double) {
      el.addEventListener("click", (e) => { if (!fromControl(e)) onTap(e); });
      return;
    }

    let holdTimer = null, held = false, clicks = 0, clickTimer = null, lastEvent = null;
    const HOLD_MS = 500, DOUBLE_MS = 250;
    const clearHold = () => { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } };

    el.addEventListener("pointerdown", (e) => {
      held = false;
      if (hold && !fromControl(e)) { clearHold(); holdTimer = setTimeout(() => { held = true; onHold(); }, HOLD_MS); }
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => el.addEventListener(ev, clearHold));

    el.addEventListener("click", (e) => {
      clearHold();
      if (fromControl(e)) return;
      if (held) { held = false; return; }
      if (!double) { onTap(e); return; }
      lastEvent = e; clicks++;
      if (clicks === 1) {
        clickTimer = setTimeout(() => { clicks = 0; onTap(lastEvent); }, DOUBLE_MS);
      } else {
        clearTimeout(clickTimer); clicks = 0; onDouble();
      }
    });
  }

  _render() {
    this.setAttribute("data-neo-layout", this._layout());

    const mods = this._enabledModules();
    const ctx = (settings) => this._modCtx(settings);

    // style()-Hooks: zusätzliches CSS in den Shadow-Root.
    let extraCss = "";
    for (const { mod, settings } of mods) {
      if (typeof mod.style === "function") {
        try { extraCss += "\n" + (mod.style(ctx(settings)) || ""); }
        catch (e) { console.error("[Neo Module] style", mod.id, e); }
      }
    }

    this.shadowRoot.innerHTML = `<style>${NEO_CSS}${extraCss}</style>${this.render()}`;

    // decorate()-Hooks: DOM nach dem Render ergänzen (Layer in Reihenfolge).
    for (const { mod, settings } of mods) {
      if (typeof mod.decorate === "function") {
        try { mod.decorate(this.shadowRoot, ctx(settings)); }
        catch (e) { console.error("[Neo Module] decorate", mod.id, e); }
      }
    }

    this._bindEvents();
  }
  _bindEvents() {}

  // Collect entity ids referenced anywhere in the config (cached).
  // Cards with special needs can override.
  _trackedEntities() {
    if (this._trackedCache) return this._trackedCache;
    const ids = new Set();
    const ENTITY_RE = /^[a-z_]+\.[a-z0-9_]+$/;
    const scan = (v) => {
      if (typeof v === "string") { if (ENTITY_RE.test(v)) ids.add(v); }
      else if (Array.isArray(v)) v.forEach(scan);
      else if (v && typeof v === "object") Object.values(v).forEach(scan);
    };
    scan(this._config || {});
    // Sicher: die expliziten Entity-Felder immer tracken (auch falls das Regex
    // einen ungewöhnlichen entity_id verfehlt) → Karte bleibt live.
    const c = this._config || {};
    if (typeof c.entity === "string") ids.add(c.entity);
    (Array.isArray(c.entities) ? c.entities : []).forEach((e) => { if (typeof e === "string") ids.add(e); });
    this._trackedCache = [...ids];
    return this._trackedCache;
  }

  // Übersetzt UI-Text nach HA-Sprache (DE Quelle, EN Standard).
  _t(s) { return neoT(this._hass, s); }

  _state(id) { return this._hass?.states?.[id]; }
  _attr(id, a) { return this._state(id)?.attributes?.[a]; }
  _callService(domain, service, data = {}, target) {
    if (target) this._hass?.callService(domain, service, data, target);
    else this._hass?.callService(domain, service, data);
  }
}
