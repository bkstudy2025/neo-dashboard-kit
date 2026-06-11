// Neo Dashboard Kit v0.1.0
// https://github.com/bkstudy2025/neo-dashboard-kit

const NEO_ACCENTS = {
  blue:   { c: "#7C9CFF", glow: "rgba(124,156,255,0.35)" },
  amber:  { c: "#FFB26B", glow: "rgba(255,178,107,0.35)" },
  mint:   { c: "#5EDCB8", glow: "rgba(94,220,184,0.35)" },
  violet: { c: "#C084FC", glow: "rgba(192,132,252,0.35)" },
  rose:   { c: "#F87171", glow: "rgba(248,113,113,0.35)" },
};

const NEO_CSS = `
  :host {
    --neo-fill0: rgba(255,255,255,0.02);
    --neo-fill1: rgba(255,255,255,0.04);
    --neo-fill2: rgba(255,255,255,0.055);
    --neo-line1: rgba(255,255,255,0.06);
    --neo-line2: rgba(255,255,255,0.08);
    --neo-line3: rgba(255,255,255,0.10);
    --neo-line4: rgba(255,255,255,0.12);
    --neo-line5: rgba(255,255,255,0.14);
    --neo-line6: rgba(255,255,255,0.16);
    --neo-text1: #F4F6FB;
    --neo-text2: rgba(244,246,251,0.72);
    --neo-text3: rgba(244,246,251,0.50);
    --neo-shadow1: rgba(0,0,0,0.55);
    --neo-shadow2: rgba(0,0,0,0.5);
    --neo-blur: blur(24px) saturate(140%);
    --neo-radius: 24px;
    --neo-font: -apple-system, "SF Pro Display", "Inter", system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  .neo-card {
    position: relative;
    border-radius: var(--neo-radius);
    overflow: hidden;
    font-family: var(--neo-font);
    color: var(--neo-text1);
    transition: all 240ms cubic-bezier(.2,.8,.2,1);
  }
  .neo-card[role="button"]:active { transform: scale(0.975); }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
  @keyframes spin { from{transform:rotate(0)}to{transform:rotate(360deg)} }
`;

// ── Registry ──────────────────────────────────────────────────
const _registry = new Map();
const NeoDashboardRegistry = {
  registerCard(type, cls) {
    if (_registry.has(type)) return;
    _registry.set(type, cls);
    if (!customElements.get(type)) customElements.define(type, cls);
    console.info(`[Neo Dashboard] Registered: ${type}`);
  },
};
window.NeoDashboard = NeoDashboardRegistry;

// ── Base Card ─────────────────────────────────────────────────
class NeoBaseCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); }
  setConfig(config) { this._config = config; this._render(); }
  set hass(h) { this._hass = h; this._render(); }
  get hass() { return this._hass; }
  getCardSize() { return 2; }
  render() { return `<div style="padding:16px">Override render()</div>`; }
  _render() {
    this.shadowRoot.innerHTML = `<style>${NEO_CSS}</style>${this.render()}`;
    this._bindEvents();
  }
  _bindEvents() {}
  _state(id) { return this._hass?.states?.[id]; }
  _attr(id, a) { return this._state(id)?.attributes?.[a]; }
  _callService(domain, service, data = {}) { this._hass?.callService(domain, service, data); }
}

// ── Light Card ────────────────────────────────────────────────
class NeoLightCard extends NeoBaseCard {
  getCardSize() { return 3; }
  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const on = s?.state === "on";
    const bri = s?.attributes?.brightness ? Math.round((s.attributes.brightness / 255) * 100) : 0;
    const name = this._config?.name || s?.attributes?.friendly_name || id || "Light";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const c = on ? (s?.attributes?.rgb_color ? `rgb(${s.attributes.rgb_color})` : acc.c) : acc.c;
    const glow = `${c}55`;
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:180px;display:flex;flex-direction:column;cursor:pointer;
        background:${on ? `linear-gradient(160deg,${glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${on ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${on ? `0 18px 40px -16px ${glow}` : "0 18px 40px -16px var(--neo-shadow1)"};
      ">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
            background:${on ? `linear-gradient(160deg,${c} 0%,${c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
            border:1px solid ${on ? "rgba(255,255,255,0.25)" : acc.c + "33"};
            box-shadow:${on ? `0 4px 14px ${glow}` : "none"};font-size:18px;">💡</div>
          <div id="toggle" style="width:36px;height:22px;border-radius:11px;padding:2px;
            background:${on ? acc.c : "var(--neo-line5)"};transition:background 200ms;cursor:pointer;">
            <div style="width:18px;height:18px;border-radius:9px;background:#fff;
              transform:translateX(${on ? "14px" : "0px"});
              transition:transform 220ms cubic-bezier(.2,.8,.2,1);box-shadow:0 1px 2px rgba(0,0,0,0.3);"></div>
          </div>
        </div>
        <div style="margin-top:auto;">
          <div style="font-size:17px;font-weight:600;margin-bottom:8px;">${name}</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--neo-text3);">
            <span>Brightness</span><span style="font-weight:600;">${on ? bri : 0}%</span>
          </div>
          <input type="range" id="bri" min="1" max="100" value="${on ? bri : 1}" style="
            width:100%;height:26px;border-radius:9px;-webkit-appearance:none;appearance:none;cursor:pointer;
            background:linear-gradient(90deg,${c}cc 0%,${c} ${on ? bri : 0}%,var(--neo-line2) ${on ? bri : 0}%);
            border:1px solid var(--neo-line1);" />
        </div>
      </div>`;
  }
  _bindEvents() {
    const id = this._config?.entity;
    const on = this._state(id)?.state === "on";
    this.shadowRoot.getElementById("toggle")?.addEventListener("click", e => {
      e.stopPropagation();
      this._callService("light", on ? "turn_off" : "turn_on", { entity_id: id });
    });
    this.shadowRoot.getElementById("bri")?.addEventListener("change", e => {
      this._callService("light", "turn_on", { entity_id: id, brightness: Math.round((+e.target.value / 100) * 255) });
    });
    this.shadowRoot.getElementById("card")?.addEventListener("click", () => {
      this._callService("light", on ? "turn_off" : "turn_on", { entity_id: id });
    });
  }
  static getStubConfig() { return { entity: "light.living_room", accent: "amber" }; }
}
NeoDashboardRegistry.registerCard("neo-light-card", NeoLightCard);

// ── Sensor Card ───────────────────────────────────────────────
class NeoSensorCard extends NeoBaseCard {
  getCardSize() { return 2; }
  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const value = s?.state ?? "—";
    const unit = this._config?.unit || s?.attributes?.unit_of_measurement || "";
    const name = this._config?.name || s?.attributes?.friendly_name || id || "Sensor";
    const icon = this._config?.icon || "📊";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint;
    return `
      <div class="neo-card" style="padding:16px;min-height:160px;display:flex;flex-direction:column;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);box-shadow:0 18px 40px -16px var(--neo-shadow1);">
        <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);
          border:1px solid ${acc.c}33;font-size:18px;">${icon}</div>
        <div style="margin-top:auto;">
          <div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:0.6px;">${name}</div>
          <div style="display:flex;align-items:baseline;gap:3px;margin-top:4px;">
            <span style="font-size:26px;font-weight:500;letter-spacing:-0.5px;">${value}</span>
            <span style="font-size:13px;color:var(--neo-text2);">${unit}</span>
          </div>
        </div>
      </div>`;
  }
  static getStubConfig() { return { entity: "sensor.temperature", icon: "🌡️", accent: "mint" }; }
}
NeoDashboardRegistry.registerCard("neo-sensor-card", NeoSensorCard);

// ── Scene Card ────────────────────────────────────────────────
class NeoSceneCard extends NeoBaseCard {
  getCardSize() { return 2; }
  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const active = s?.state === "on";
    const name = this._config?.name || s?.attributes?.friendly_name || id || "Scene";
    const sub = this._config?.sub || "";
    const icon = this._config?.icon || "✨";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.violet;
    return `
      <div class="neo-card" id="card" role="button" style="padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
        background:${active ? `linear-gradient(160deg,${acc.glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${active ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${active ? `0 18px 40px -16px ${acc.glow}` : "0 18px 40px -16px var(--neo-shadow1)"};
      ">
        <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
          background:${active ? `linear-gradient(160deg,${acc.c} 0%,${acc.c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
          border:1px solid ${active ? "rgba(255,255,255,0.25)" : acc.c + "33"};font-size:18px;">${icon}</div>
        <div style="margin-top:auto;">
          <div style="font-size:16px;font-weight:600;">${name}</div>
          ${sub ? `<div style="font-size:12px;color:var(--neo-text2);margin-top:2px;">${sub}</div>` : ""}
        </div>
      </div>`;
  }
  _bindEvents() {
    const id = this._config?.entity;
    this.shadowRoot.getElementById("card")?.addEventListener("click", () => {
      this._callService("scene", "turn_on", { entity_id: id });
    });
  }
  static getStubConfig() { return { entity: "scene.movie_night", name: "Movie Night", icon: "🎬", accent: "violet" }; }
}
NeoDashboardRegistry.registerCard("neo-scene-card", NeoSceneCard);

// ── Quick Action Card ─────────────────────────────────────────
class NeoQuickActionCard extends NeoBaseCard {
  getCardSize() { return 2; }
  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const on = s?.state === "on";
    const name = this._config?.name || s?.attributes?.friendly_name || id || "Device";
    const sub = this._config?.sub || (on ? "On" : "Off");
    const icon = this._config?.icon || "⚡";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    return `
      <div class="neo-card" id="card" role="button" style="padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
        background:${on ? `linear-gradient(160deg,${acc.glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${on ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${on ? `0 18px 40px -16px ${acc.glow}` : "0 18px 40px -16px var(--neo-shadow1)"};
      ">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
            background:${on ? `linear-gradient(160deg,${acc.c} 0%,${acc.c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
            border:1px solid ${on ? "rgba(255,255,255,0.25)" : acc.c + "33"};font-size:18px;">${icon}</div>
          <div style="width:36px;height:22px;border-radius:11px;padding:2px;
            background:${on ? acc.c : "var(--neo-line5)"};transition:background 200ms;">
            <div style="width:18px;height:18px;border-radius:9px;background:#fff;
              transform:translateX(${on ? "14px" : "0px"});
              transition:transform 220ms cubic-bezier(.2,.8,.2,1);box-shadow:0 1px 2px rgba(0,0,0,0.3);"></div>
          </div>
        </div>
        <div style="margin-top:auto;">
          <div style="font-size:16px;font-weight:600;">${name}</div>
          <div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${sub}</div>
        </div>
      </div>`;
  }
  _bindEvents() {
    const id = this._config?.entity;
    const on = this._state(id)?.state === "on";
    const domain = id?.split(".")[0] || "homeassistant";
    this.shadowRoot.getElementById("card")?.addEventListener("click", () => {
      this._callService(domain, on ? "turn_off" : "turn_on", { entity_id: id });
    });
  }
  static getStubConfig() { return { entity: "switch.living_room", icon: "💡", accent: "blue" }; }
}
NeoDashboardRegistry.registerCard("neo-quick-action-card", NeoQuickActionCard);

console.info(
  "%c NEO DASHBOARD KIT %c v0.1.0 ",
  "background:#7C9CFF;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:700;",
  "background:#1a1f2e;color:#7C9CFF;padding:2px 6px;border-radius:0 4px 4px 0;"
);
