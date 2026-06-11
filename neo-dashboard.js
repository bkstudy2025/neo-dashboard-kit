// Neo Dashboard Kit v0.1.0
// https://github.com/bkstudy2025/neo-dashboard-kit

// ── Auto-inject theme into HA frontend ───────────────────────
(function injectNeoTheme() {
  const STYLE_ID = "neo-dashboard-theme";
  if (document.getElementById(STYLE_ID)) return;

  const css = `
    /* Neo Dashboard Kit — auto-injected theme */
    :root, html {
      --lovelace-background:
        radial-gradient(80% 60% at 20% 0%, #161d33 0%, rgba(7,9,15,0) 55%),
        radial-gradient(70% 50% at 100% 100%, #1a1426 0%, rgba(7,9,15,0) 55%),
        #06080F;

      --primary-color: #7C9CFF;
      --accent-color: #7C9CFF;

      --card-background-color: rgba(255,255,255,0.04);
      --secondary-background-color: rgba(255,255,255,0.02);
      --divider-color: rgba(255,255,255,0.08);

      --primary-text-color: #F4F6FB;
      --secondary-text-color: rgba(244,246,251,0.72);
      --disabled-text-color: rgba(244,246,251,0.30);
      --text-primary-color: #F4F6FB;

      --sidebar-background-color: #0a0d18;
      --sidebar-text-color: rgba(244,246,251,0.72);
      --sidebar-icon-color: rgba(244,246,251,0.50);
      --sidebar-selected-text-color: #F4F6FB;
      --sidebar-selected-icon-color: #7C9CFF;

      --app-header-background-color: rgba(10,13,24,0.85);
      --app-header-text-color: #F4F6FB;

      --ha-card-background: rgba(255,255,255,0.04);
      --ha-card-border-color: rgba(255,255,255,0.08);
      --ha-card-border-width: 1px;
      --ha-card-border-radius: 24px;
      --ha-card-box-shadow: 0 18px 40px -16px rgba(0,0,0,0.55);

      --switch-checked-color: #7C9CFF;
      --switch-unchecked-color: rgba(255,255,255,0.14);

      /* Neo tokens */
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
      --neo-text4: rgba(244,246,251,0.30);
      --neo-shadow1: rgba(0,0,0,0.55);
      --neo-shadow2: rgba(0,0,0,0.5);
      --neo-blur: blur(24px) saturate(140%);
      --neo-radius: 24px;
      --neo-font: -apple-system, "SF Pro Display", "Inter", system-ui, sans-serif;
      --neo-accent-blue: #7C9CFF;
      --neo-accent-amber: #FFB26B;
      --neo-accent-mint: #5EDCB8;
      --neo-accent-violet: #C084FC;
      --neo-accent-rose: #F87171;
    }

    /* Lovelace background */
    home-assistant,
    home-assistant-main,
    ha-panel-lovelace,
    hui-root,
    #view {
      background: var(--lovelace-background) !important;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
  `;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);

  // Also inject into any existing shadow roots (HA uses lots of them)
  const injectIntoShadow = (root) => {
    if (!root) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = css;
    try { root.appendChild(s); } catch(e) {}
  };

  // Retry a few times until HA elements are available
  let tries = 0;
  const tryInject = setInterval(() => {
    const ha = document.querySelector("home-assistant");
    if (ha?.shadowRoot) {
      injectIntoShadow(ha.shadowRoot);
      clearInterval(tryInject);
    }
    if (++tries > 20) clearInterval(tryInject);
  }, 500);
})();

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
  registerCard(type, cls, meta = {}) {
    if (_registry.has(type)) return;
    _registry.set(type, cls);
    if (!customElements.get(type)) customElements.define(type, cls);

    // Register in HA's card picker so it shows up in "Karte hinzufügen"
    window.customCards = window.customCards || [];
    if (!window.customCards.find((c) => c.type === type)) {
      window.customCards.push({
        type,
        name: meta.name || type,
        description: meta.description || "Neo Dashboard Kit card",
        preview: meta.preview !== false,
        documentationURL: "https://github.com/bkstudy2025/neo-dashboard-kit",
      });
    }
    console.info(`[Neo Dashboard] Registered: ${type}`);
  },
};
window.NeoDashboard = NeoDashboardRegistry;

// Accent dropdown options shared by all card editors
const NEO_ACCENT_OPTIONS = [
  { value: "blue", label: "Blau" },
  { value: "amber", label: "Amber" },
  { value: "mint", label: "Mint" },
  { value: "violet", label: "Violett" },
  { value: "rose", label: "Rosé" },
];

// ── Shared ha-form editor factory ─────────────────────────────
// HA's <ha-form> needs real JS properties (.schema/.data) — they
// cannot be passed as stringified HTML attributes. This helper
// creates the element and binds properties correctly.
function makeNeoEditor(schema) {
  return class extends HTMLElement {
    setConfig(config) {
      this._config = { ...config };
      if (this._form) this._form.data = this._config;
      else this._build();
    }
    set hass(hass) {
      this._hass = hass;
      if (this._form) this._form.hass = hass;
    }
    _build() {
      this._form = document.createElement("ha-form");
      this._form.schema = schema;
      this._form.data = this._config || {};
      if (this._hass) this._form.hass = this._hass;
      this._form.computeLabel = (s) => s.label || s.name;
      this._form.addEventListener("value-changed", (e) => {
        this._config = e.detail.value;
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true, composed: true,
        }));
      });
      this.appendChild(this._form);
    }
  };
}

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
  static getConfigElement() { return document.createElement("neo-light-card-editor"); }
  static getStubConfig() { return { entity: "light.living_room", accent: "amber" }; }
}
customElements.define("neo-light-card-editor", makeNeoEditor([
  { name: "entity", label: "Licht-Entity", selector: { entity: { domain: "light" } } },
  { name: "name", label: "Name (optional)", selector: { text: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
]));
NeoDashboardRegistry.registerCard("neo-light-card", NeoLightCard, {
  name: "Neo Licht",
  description: "Licht mit Helligkeits-Slider",
});

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
  static getConfigElement() { return document.createElement("neo-sensor-card-editor"); }
  static getStubConfig() { return { entity: "sensor.temperature", icon: "🌡️", accent: "mint" }; }
}
customElements.define("neo-sensor-card-editor", makeNeoEditor([
  { name: "entity", label: "Sensor-Entity", selector: { entity: { domain: "sensor" } } },
  { name: "name", label: "Name (optional)", selector: { text: {} } },
  { name: "icon", label: "Emoji-Icon", selector: { text: {} } },
  { name: "unit", label: "Einheit (optional)", selector: { text: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
]));
NeoDashboardRegistry.registerCard("neo-sensor-card", NeoSensorCard, {
  name: "Neo Sensor",
  description: "Sensorwert mit Icon",
});

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
  static getConfigElement() { return document.createElement("neo-scene-card-editor"); }
  static getStubConfig() { return { entity: "scene.movie_night", name: "Movie Night", icon: "🎬", accent: "violet" }; }
}
customElements.define("neo-scene-card-editor", makeNeoEditor([
  { name: "entity", label: "Szenen-Entity", selector: { entity: { domain: "scene" } } },
  { name: "name", label: "Name (optional)", selector: { text: {} } },
  { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
  { name: "icon", label: "Emoji-Icon", selector: { text: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
]));
NeoDashboardRegistry.registerCard("neo-scene-card", NeoSceneCard, {
  name: "Neo Szene",
  description: "Szene per Tap aktivieren",
});

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
  static getConfigElement() { return document.createElement("neo-quick-action-card-editor"); }
  static getStubConfig() { return { entity: "switch.living_room", icon: "💡", accent: "blue" }; }
}
customElements.define("neo-quick-action-card-editor", makeNeoEditor([
  { name: "entity", label: "Entity (switch, light, etc.)", selector: { entity: {} } },
  { name: "name", label: "Name (optional)", selector: { text: {} } },
  { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
  { name: "icon", label: "Emoji-Icon", selector: { text: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
]));
NeoDashboardRegistry.registerCard("neo-quick-action-card", NeoQuickActionCard, {
  name: "Neo Schnellaktion",
  description: "Schalter-Kachel mit Toggle",
});

// ── Hero Card ─────────────────────────────────────────────────
class NeoHeroCard extends NeoBaseCard {
  getCardSize() { return 1; }

  _greeting() {
    const h = new Date().getHours();
    if (h < 5)  return "Gute Nacht";
    if (h < 12) return "Guten Morgen";
    if (h < 18) return "Guten Tag";
    return "Guten Abend";
  }

  render() {
    const name = this._config?.name || "Home";
    const greeting = this._config?.greeting_text || this._greeting();
    const showSearch = this._config?.show_search !== false;
    const showScenes = this._config?.show_scenes !== false;
    const showNotifications = this._config?.show_notifications !== false;
    const notifEntity = this._config?.notifications_entity;
    const notifCount = notifEntity ? (parseInt(this._state(notifEntity)?.state) || 0) : 0;

    const btn = (content, id) => `
      <button id="${id}" style="
        width:40px;height:40px;border-radius:20px;
        border:1px solid var(--neo-line2,rgba(255,255,255,0.08));
        background:var(--neo-fill2,rgba(255,255,255,0.055));
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;flex-shrink:0;color:var(--neo-text1);
        font-size:16px;position:relative;
      ">${content}</button>`;

    return `
      <div style="font-family:var(--neo-font,system-ui);color:var(--neo-text1,#F4F6FB);padding:8px 0 12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="min-width:0;">
            <div style="font-size:13px;color:var(--neo-text2);font-weight:500;letter-spacing:0.2px;">${greeting}</div>
            <div style="font-size:28px;font-weight:600;letter-spacing:-0.6px;margin-top:1px;">${name}</div>
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0;">
            ${showSearch ? btn("🔍", "btn-search") : ""}
            ${showScenes ? btn("✨", "btn-scenes") : ""}
            ${showNotifications ? `
              <button id="btn-notif" style="
                width:40px;height:40px;border-radius:20px;
                border:1px solid var(--neo-line2,rgba(255,255,255,0.08));
                background:var(--neo-fill2,rgba(255,255,255,0.055));
                display:flex;align-items:center;justify-content:center;
                cursor:pointer;flex-shrink:0;font-size:16px;position:relative;
              ">
                🔔
                ${notifCount > 0 ? `<span style="
                  position:absolute;top:7px;right:7px;
                  min-width:16px;height:16px;padding:0 4px;
                  border-radius:8px;background:#F87171;color:#fff;
                  font-size:10px;font-weight:700;
                  display:flex;align-items:center;justify-content:center;
                  box-shadow:0 0 0 2px var(--ha-card-background,#111827);
                ">${notifCount}</span>` : ""}
              </button>` : ""}
          </div>
        </div>
      </div>`;
  }

  static getConfigElement() {
    return document.createElement("neo-hero-card-editor");
  }

  static getStubConfig() {
    return { name: "Home", show_search: true, show_scenes: true, show_notifications: true };
  }
}

// Hero Card Visual Editor
customElements.define("neo-hero-card-editor", makeNeoEditor([
  { name: "name", label: "Name", selector: { text: {} } },
  { name: "greeting_text", label: "Begrüßungstext (leer = automatisch)", selector: { text: {} } },
  { name: "show_search", label: "Suche-Button anzeigen", selector: { boolean: {} } },
  { name: "show_scenes", label: "Szenen-Button anzeigen", selector: { boolean: {} } },
  { name: "show_notifications", label: "Benachrichtigungs-Button anzeigen", selector: { boolean: {} } },
  { name: "notifications_entity", label: "Entity für Benachrichtigungs-Zähler (optional)", selector: { entity: {} } },
]));
NeoDashboardRegistry.registerCard("neo-hero-card", NeoHeroCard, {
  name: "Neo Hero / Begrüßung",
  description: "Begrüßung mit Name und Action-Buttons",
});

// ── Weather Card ──────────────────────────────────────────────
class NeoWeatherCard extends NeoBaseCard {
  getCardSize() { return 2; }

  _weatherIcon(condition) {
    const map = {
      "sunny": "☀️", "clear-night": "🌙", "partlycloudy": "⛅",
      "cloudy": "☁️", "rainy": "🌧️", "pouring": "🌧️", "snowy": "❄️",
      "snowy-rainy": "🌨️", "windy": "💨", "windy-variant": "💨",
      "fog": "🌫️", "hail": "🌨️", "lightning": "⚡", "lightning-rainy": "⛈️",
      "exceptional": "🌡️",
    };
    return map[condition] || "🌤️";
  }

  _conditionLabel(condition) {
    const map = {
      "sunny": "Sonnig", "clear-night": "Klar", "partlycloudy": "Teilweise bewölkt",
      "cloudy": "Bewölkt", "rainy": "Regen", "pouring": "Starkregen",
      "snowy": "Schnee", "snowy-rainy": "Schneeregen", "windy": "Windig",
      "windy-variant": "Stürmisch", "fog": "Nebel", "hail": "Hagel",
      "lightning": "Gewitter", "lightning-rainy": "Gewitterregen",
    };
    return map[condition] || condition || "—";
  }

  _formatTime(isoString) {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }

  _greeting() {
    const h = new Date().getHours();
    if (h < 5)  return "Gute Nacht";
    if (h < 12) return "Guten Morgen";
    if (h < 18) return "Guten Tag";
    return "Guten Abend";
  }

  render() {
    const entityId = this._config?.entity || "weather.forecast_home";
    const sunsetId = this._config?.sunset_entity || "sensor.sun_next_setting";
    const s = this._state(entityId);
    const condition = s?.state;
    const temp = s?.attributes?.temperature ?? "—";
    const feelsLike = s?.attributes?.apparent_temperature ?? s?.attributes?.feels_like ?? null;
    const humidity = s?.attributes?.humidity ?? null;
    const sunset = this._formatTime(this._state(sunsetId)?.state);
    const icon = this._weatherIcon(condition);
    const label = this._conditionLabel(condition);
    const acc = NEO_ACCENTS.blue;

    const subParts = [
      feelsLike !== null ? `Gefühlt ${feelsLike}°` : null,
      sunset !== "—" ? `Sonnenuntergang ${sunset}` : null,
      humidity !== null ? `Luftfeuchtigkeit ${humidity}%` : null,
    ].filter(Boolean).join(" · ");

    return `
      <div style="font-family:var(--neo-font,system-ui);color:var(--neo-text1,#F4F6FB);">
        <div id="weather-banner" style="
          display:flex;align-items:center;justify-content:space-between;
          padding:14px 16px;border-radius:20px;cursor:pointer;
          background:linear-gradient(120deg,${acc.glow} 0%,var(--neo-fill1,rgba(255,255,255,0.04)) 70%);
          border:1px solid var(--neo-line2,rgba(255,255,255,0.08));
          backdrop-filter:var(--neo-blur,blur(24px));-webkit-backdrop-filter:var(--neo-blur,blur(24px));
        ">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:30px;line-height:1;">${icon}</span>
            <div>
              <div style="font-size:15px;font-weight:600;color:var(--neo-text1);">${label} · ${temp}°</div>
              ${subParts ? `<div style="font-size:11px;color:var(--neo-text3);margin-top:2px;">${subParts}</div>` : ""}
            </div>
          </div>
          <span style="font-size:18px;color:var(--neo-text3);">›</span>
        </div>
      </div>`;
  }

  _bindEvents() {
    const entityId = this._config?.entity || "weather.forecast_home";
    this.shadowRoot.getElementById("weather-banner")?.addEventListener("click", () => {
      const event = new CustomEvent("hass-more-info", {
        bubbles: true, composed: true,
        detail: { entityId },
      });
      this.dispatchEvent(event);
    });
  }

  static getConfigElement() {
    return document.createElement("neo-weather-card-editor");
  }

  static getStubConfig() {
    return { entity: "weather.forecast_home", sunset_entity: "sensor.sun_next_setting" };
  }
}

customElements.define("neo-weather-card-editor", makeNeoEditor([
  { name: "entity", label: "Wetter-Entity", selector: { entity: { domain: "weather" } } },
  { name: "sunset_entity", label: "Sonnenuntergang-Entity (optional)", selector: { entity: { domain: "sensor" } } },
]));
NeoDashboardRegistry.registerCard("neo-weather-card", NeoWeatherCard, {
  name: "Neo Wetter",
  description: "Wetter-Banner mit Temperatur und Sonnenuntergang",
});

console.info(
  "%c NEO DASHBOARD KIT %c v0.1.0 ",
  "background:#7C9CFF;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:700;",
  "background:#1a1f2e;color:#7C9CFF;padding:2px 6px;border-radius:0 4px 4px 0;"
);
