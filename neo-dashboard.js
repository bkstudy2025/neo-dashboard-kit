// Neo Dashboard Kit v0.1.3-beta.9
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
  /* Tactile press feedback (ported from prototype) */
  button { transition: transform .12s cubic-bezier(.2,.8,.2,1), background .2s, filter .2s; }
  button:hover { filter: brightness(1.12); }
  button:active { transform: scale(0.9); }
  [role="button"]:active { transform: scale(0.97); }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
  @keyframes spin { from{transform:rotate(0)}to{transform:rotate(360deg)} }
`;

// ── Registry ──────────────────────────────────────────────────
// Cards register here (core + community). They appear in the
// neo-card dropdown automatically — only the single "neo-card"
// wrapper is exposed in HA's native card picker.
const _registry = new Map();
const NeoDashboardRegistry = {
  registerCard(type, cls, meta = {}) {
    if (_registry.has(type)) return;
    _registry.set(type, { cls, meta });
    if (!customElements.get(type)) customElements.define(type, cls);
    console.info(`[Neo Dashboard] Registered: ${type}`);
  },
  getCard(type) {
    return _registry.get(type)?.cls;
  },
  getMeta(type) {
    return _registry.get(type)?.meta || {};
  },
  // [{ type, name, description, icon }] for the dropdown
  list() {
    return Array.from(_registry.entries()).map(([type, { meta }]) => ({
      type,
      name: meta.name || type,
      description: meta.description || "",
      icon: meta.icon || "✨",
    }));
  },
};
window.NeoDashboard = NeoDashboardRegistry;

// ── Icon set (SF-symbol style SVG, ported from prototype) ──────
// Returned as strings so cards can inline them via innerHTML.
const NEO_ICON_FILLED = new Set(["play", "pause", "next", "prev", "more", "starF", "dot"]);
const NEO_ICON_PATHS = {
  home: `<path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2v-9z"/>`,
  rooms: `<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>`,
  devices: `<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>`,
  energy: `<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>`,
  scenes: `<path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3l-1.4-1.4M19.1 19.1l-1.4-1.4M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4"/><circle cx="12" cy="12" r="4"/>`,
  settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>`,
  lightbulb: `<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>`,
  thermo: `<path d="M14 14.8V4a2 2 0 1 0-4 0v10.8a4 4 0 1 0 4 0z"/><circle cx="12" cy="17" r="1.5" fill="currentColor"/>`,
  camera: `<path d="M3 7h3l2-3h8l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/>`,
  lock: `<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>`,
  unlock: `<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>`,
  speaker: `<rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="14" r="3"/><circle cx="12" cy="7" r="1" fill="currentColor"/>`,
  play: `<path d="M8 5v14l11-7z"/>`,
  pause: `<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>`,
  next: `<path d="M5 4l10 8-10 8V4zM17 4h2v16h-2z"/>`,
  prev: `<path d="M19 4L9 12l10 8V4zM5 4h2v16H5z"/>`,
  blinds: `<rect x="3" y="3" width="18" height="3"/><rect x="3" y="8" width="18" height="2"/><rect x="3" y="12" width="18" height="2"/><path d="M12 16v5M10 21h4"/>`,
  vacuum: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>`,
  wind: `<path d="M3 8h11a3 3 0 1 0-3-3M3 16h15a3 3 0 1 1-3 3M3 12h17"/>`,
  plug: `<path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0V8zM12 16v6"/>`,
  wifi: `<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/>`,
  bell: `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 0 0 4 0"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  minus: `<path d="M5 12h14"/>`,
  chevR: `<path d="M9 6l6 6-6 6"/>`,
  chevL: `<path d="M15 6l-6 6 6 6"/>`,
  chevD: `<path d="M6 9l6 6 6-6"/>`,
  chevU: `<path d="M6 15l6-6 6 6"/>`,
  sun: `<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M5 12H2M22 12h-3M6.3 6.3L4.2 4.2M19.8 19.8l-2.1-2.1M17.7 6.3l2.1-2.1M4.2 19.8l2.1-2.1"/>`,
  moon: `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>`,
  leaf: `<path d="M5 21c0-9 7-16 16-16 0 9-7 16-16 16zM5 21c4-4 8-6 12-7"/>`,
  shield: `<path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/>`,
  shieldOk: `<path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/>`,
  water: `<path d="M12 3s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z"/>`,
  eye: `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>`,
  mic: `<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8"/>`,
  search: `<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>`,
  more: `<circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/>`,
  check: `<path d="M5 12l5 5L20 7"/>`,
  x: `<path d="M6 6l12 12M18 6L6 18"/>`,
  star: `<path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9l3-7z"/>`,
  starF: `<path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9l3-7z"/>`,
  sparkle: `<path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.5 5.5l3 3M15.5 15.5l3 3M18.5 5.5l-3 3M8.5 15.5l-3 3"/>`,
  kettle: `<path d="M5 9h12l-1 11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 9zM17 11l3-2-3-2M9 5h4"/>`,
  tv: `<rect x="3" y="5" width="18" height="13" rx="2"/><path d="M8 21h8"/>`,
  fridge: `<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 10h14M8 6v1M8 14v3"/>`,
  dot: `<circle cx="12" cy="12" r="4"/>`,
  arrUp: `<path d="M12 19V5M5 12l7-7 7 7"/>`,
  arrDown: `<path d="M12 5v14M5 12l7 7 7-7"/>`,
  // Weather (added — not in original prototype set)
  cloud: `<path d="M7 18a4 4 0 0 1 .5-7.97 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17.5 18z"/>`,
  rain: `<path d="M7 15a4 4 0 0 1 .5-7.97 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17.5 15z"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/>`,
  snow: `<path d="M7 15a4 4 0 0 1 .5-7.97 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17.5 15z"/><path d="M8 19v.01M12 20v.01M16 19v.01"/>`,
  storm: `<path d="M7 15a4 4 0 0 1 .5-7.97 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17.5 15z"/><path d="M12 16l-2 3h3l-2 3"/>`,
  fog: `<path d="M4 9h16M4 13h16M6 17h12"/>`,
  partly: `<circle cx="8" cy="8" r="3"/><path d="M8 2v1.5M3 8H1.5M13 3l-1 1M3 13l1-1"/><path d="M10 18a3.5 3.5 0 0 1 .4-6.98 4.8 4.8 0 0 1 9.2 1.3A3 3 0 0 1 19 18z"/>`,
  // Common smart-home additions
  calendar: `<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  fan: `<circle cx="12" cy="12" r="1.5"/><path d="M12 10.5C12 7 13.5 4 16 4c1.5 0 2 2 0 3.5-1.5 1-4 3-4 3zM13.5 12c3.5 0 6.5 1.5 6.5 4 0 1.5-2 2-3.5 0-1-1.5-3-4-3-4zM12 13.5c0 3.5-1.5 6.5-4 6.5-1.5 0-2-2 0-3.5 1.5-1 4-3 4-3zM10.5 12c-3.5 0-6.5-1.5-6.5-4 0-1.5 2-2 3.5 0 1 1.5 3 4 3 4z"/>`,
  door: `<path d="M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M4 21h14M13.5 12h.01"/>`,
  window: `<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 12h16"/>`,
  battery: `<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 10v4"/>`,
  flame: `<path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 1.5 2C12 12 9 9 12 2z"/>`,
  snowflake: `<path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/>`,
  person: `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
  people: `<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5a3.5 3.5 0 0 1 0 7M17 13.5a6.5 6.5 0 0 1 4.5 6.5"/>`,
  car: `<path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11M4 11h16v6h-2M4 11v6h2m0 0h12M7 17v2M17 17v2"/><circle cx="7.5" cy="14.5" r="1"/><circle cx="16.5" cy="14.5" r="1"/>`,
  music: `<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>`,
  volume: `<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/>`,
  heart: `<path d="M12 20l-7-7a4 4 0 0 1 5.6-5.6L12 8.8l1.4-1.4A4 4 0 0 1 19 13l-7 7z"/>`,
  trash: `<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>`,
  refresh: `<path d="M21 12a9 9 0 1 1-3-6.7L21 7M21 3v4h-4"/>`,
  power: `<path d="M12 3v9M6.6 6.6a9 9 0 1 0 10.8 0"/>`,
  server: `<rect x="4" y="3" width="16" height="8" rx="2"/><rect x="4" y="13" width="16" height="8" rx="2"/><path d="M8 7h.01M8 17h.01"/>`,
  robot: `<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 8V5M9 3h6"/><circle cx="9.5" cy="13" r="1"/><circle cx="14.5" cy="13" r="1"/><path d="M8 16h8"/>`,
  gauge: `<path d="M12 14l3-3"/><path d="M4 18a9 9 0 1 1 16 0"/><circle cx="12" cy="14" r="1"/>`,
  flag: `<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>`,
  router_wifi: `<rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 17h.01M11 17h.01M12 6a6 6 0 0 1 6 6M12 9a3 3 0 0 1 3 3"/>`,
};
function neoIcon(name, { size = 22, color = "currentColor", stroke = 1.7 } = {}) {
  const inner = NEO_ICON_PATHS[name] || `<circle cx="12" cy="12" r="9"/>`;
  const paint = NEO_ICON_FILLED.has(name)
    ? `fill="currentColor"`
    : `fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="color:${color};display:block" ${paint}>${inner}</svg>`;
}
// Icon dropdown options for editors
const NEO_ICON_OPTIONS = Object.keys(NEO_ICON_PATHS).map((k) => ({ value: k, label: k }));

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
// meta: { name, description, icon } renders a Bubble-style header.
function makeNeoEditor(schema, meta = {}) {
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
      // Bubble-style header card
      const header = document.createElement("div");
      header.className = "neo-editor-header";
      header.innerHTML = `
        <style>
          .neo-editor-header {
            display:flex; align-items:center; gap:14px;
            padding:14px 16px; margin-bottom:16px;
            border-radius:16px;
            background:linear-gradient(135deg, rgba(124,156,255,0.18) 0%, rgba(124,156,255,0.04) 100%);
            border:1px solid rgba(124,156,255,0.25);
          }
          .neo-editor-icon {
            width:46px; height:46px; border-radius:13px; flex-shrink:0;
            display:flex; align-items:center; justify-content:center;
            font-size:24px;
            background:linear-gradient(160deg, #7C9CFF 0%, #7C9CFFcc 100%);
            box-shadow:0 4px 14px rgba(124,156,255,0.35);
          }
          .neo-editor-meta-name {
            font-size:16px; font-weight:600;
            color:var(--primary-text-color, #F4F6FB);
          }
          .neo-editor-meta-desc {
            font-size:12.5px; margin-top:2px;
            color:var(--secondary-text-color, rgba(244,246,251,0.72));
          }
        </style>
        <div class="neo-editor-icon">${meta.icon || "✨"}</div>
        <div>
          <div class="neo-editor-meta-name">${meta.name || "Neo Karte"}</div>
          <div class="neo-editor-meta-desc">${meta.description || ""}</div>
        </div>
      `;
      this.appendChild(header);

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

  _render() {
    this.shadowRoot.innerHTML = `<style>${NEO_CSS}</style>${this.render()}`;
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
    this._trackedCache = [...ids];
    return this._trackedCache;
  }

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
            box-shadow:${on ? `0 4px 14px ${glow}` : "none"};">${neoIcon("lightbulb", { size: 19, color: on ? "#fff" : acc.c })}</div>
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
], { name: "Neo Licht", description: "Licht mit Helligkeits-Slider", icon: "💡" }));
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
    const icon = this._config?.icon || "thermo";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint;
    return `
      <div class="neo-card" style="padding:16px;min-height:160px;display:flex;flex-direction:column;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);box-shadow:0 18px 40px -16px var(--neo-shadow1);">
        <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);
          border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 19, color: acc.c })}</div>
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
  static getStubConfig() { return { entity: "sensor.temperature", icon: "thermo", accent: "mint" }; }
}
customElements.define("neo-sensor-card-editor", makeNeoEditor([
  { name: "entity", label: "Sensor-Entity", selector: { entity: { domain: "sensor" } } },
  { name: "name", label: "Name (optional)", selector: { text: {} } },
  { name: "icon", label: "Icon", selector: { select: { mode: "dropdown", options: NEO_ICON_OPTIONS } } },
  { name: "unit", label: "Einheit (optional)", selector: { text: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
], { name: "Neo Sensor", description: "Sensorwert mit Icon", icon: "📊" }));
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
    const icon = this._config?.icon || "sparkle";
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
          border:1px solid ${active ? "rgba(255,255,255,0.25)" : acc.c + "33"};">${neoIcon(icon, { size: 19, color: active ? "#fff" : acc.c })}</div>
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
  static getStubConfig() { return { entity: "scene.movie_night", name: "Movie Night", icon: "sparkle", accent: "violet" }; }
}
customElements.define("neo-scene-card-editor", makeNeoEditor([
  { name: "entity", label: "Szenen-Entity", selector: { entity: { domain: "scene" } } },
  { name: "name", label: "Name (optional)", selector: { text: {} } },
  { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
  { name: "icon", label: "Icon", selector: { select: { mode: "dropdown", options: NEO_ICON_OPTIONS } } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
], { name: "Neo Szene", description: "Szene per Tap aktivieren", icon: "🎬" }));
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
    const sub = this._config?.sub || (on ? "An" : "Aus");
    const icon = this._config?.icon || "plug";
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
            border:1px solid ${on ? "rgba(255,255,255,0.25)" : acc.c + "33"};">${neoIcon(icon, { size: 19, color: on ? "#fff" : acc.c })}</div>
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
  static getStubConfig() { return { entity: "switch.living_room", icon: "plug", accent: "blue" }; }
}
customElements.define("neo-quick-action-card-editor", makeNeoEditor([
  { name: "entity", label: "Entity (switch, light, etc.)", selector: { entity: {} } },
  { name: "name", label: "Name (optional)", selector: { text: {} } },
  { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
  { name: "icon", label: "Icon", selector: { select: { mode: "dropdown", options: NEO_ICON_OPTIONS } } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
], { name: "Neo Schnellaktion", description: "Schalter-Kachel mit Toggle", icon: "⚡" }));
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

  // Default per-button config (slot 1 = Suche, 2 = Kalender, 3 = Benachrichtigungen)
  _buttonDefaults(slot) {
    return {
      1: { show: true, icon: "search", action: "quickbar", path: "", badge_entity: "" },
      2: { show: true, icon: "calendar", action: "navigate", path: "", badge_entity: "" },
      3: { show: true, icon: "bell", action: "navigate", path: "", badge_entity: "" },
    }[slot];
  }

  _button(slot) {
    return { ...this._buttonDefaults(slot), ...(this._config?.[`button${slot}`] || {}) };
  }

  // Returns { kind: "count"|"dot"|null, value }
  _badge(entityId) {
    if (!entityId) return { kind: null };
    const st = this._state(entityId)?.state;
    if (st == null) return { kind: null };
    const num = parseInt(st);
    if (!isNaN(num)) return num > 0 ? { kind: "count", value: num } : { kind: null };
    if (st === "on") return { kind: "dot" };
    return { kind: null };
  }

  _renderButton(slot) {
    const b = this._button(slot);
    if (!b.show) return "";
    const badge = this._badge(b.badge_entity);
    const active = badge.kind !== null;
    // Accent: configured, else rose for counts / violet for dot
    const acc = NEO_ACCENTS[b.accent] || (badge.kind === "count" ? NEO_ACCENTS.rose : NEO_ACCENTS.violet);
    // Tint the button itself when a badge is active (unless disabled)
    const highlight = active && b.highlight !== false;

    let badgeHtml = "";
    if (badge.kind === "count") {
      badgeHtml = `<span style="
        position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;padding:0 4px;
        border-radius:9px;background:${acc.c};color:#fff;font-size:10px;font-weight:700;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 0 2px var(--ha-card-background,#111827);
      ">${badge.value}</span>`;
    } else if (badge.kind === "dot") {
      badgeHtml = `<span style="
        position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:5px;
        background:${acc.c};box-shadow:0 0 0 2px var(--ha-card-background,#111827),0 0 6px ${acc.c};
      "></span>`;
    }

    const bg = highlight
      ? `linear-gradient(160deg, ${acc.glow} 0%, var(--neo-fill2,rgba(255,255,255,0.055)) 100%)`
      : "var(--neo-fill2,rgba(255,255,255,0.055))";
    const border = highlight ? `${acc.c}66` : "var(--neo-line2,rgba(255,255,255,0.08))";
    const iconColor = highlight ? acc.c : "var(--neo-text1)";

    return `
      <button class="neo-hero-btn" data-slot="${slot}" style="
        width:40px;height:40px;border-radius:20px;
        border:1px solid ${border};
        background:${bg};
        ${highlight ? `box-shadow:0 4px 14px ${acc.glow};` : ""}
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;flex-shrink:0;
        font-size:16px;position:relative;
      ">${neoIcon(b.icon, { size: 18, color: iconColor })}${badgeHtml}</button>`;
  }

  // Presence → { label, color } for the big status line
  _presence() {
    const personId = this._config?.person_entity;
    if (!personId) return null;
    const st = this._state(personId)?.state;
    if (st == null) return null;
    if (st === "home") return { label: "Zuhause", color: "#5EDCB8" };
    if (st === "not_home") return { label: "Unterwegs", color: "#FFB26B" };
    // Named zone (e.g. "Arbeit") → show capitalized
    return { label: st.charAt(0).toUpperCase() + st.slice(1), color: "#7C9CFF" };
  }

  _rgb(v) { return Array.isArray(v) && v.length === 3 ? `rgb(${v[0]},${v[1]},${v[2]})` : null; }

  render() {
    const userName = this._hass?.user?.name;
    const name = this._config?.name || userName || "Home";
    const greeting = this._config?.greeting_text || this._greeting();

    // Optional name color / gradient
    const c1 = this._rgb(this._config?.name_color);
    const c2 = this._rgb(this._config?.name_color2);
    let nameStyle = "font-weight:600;";
    if (c1 && c2) nameStyle += `background:linear-gradient(90deg,${c1},${c2});-webkit-background-clip:text;background-clip:text;color:transparent;`;
    else if (c1) nameStyle += `color:${c1};`;
    const nameHtml = `<span style="${nameStyle}">${name}</span>`;
    const greetLine = name && name !== "Home" ? `${greeting}, ${nameHtml}` : greeting;

    const presence = this._presence();
    const bigLine = presence ? presence.label : name;
    const showDot = presence && this._config?.show_status_dot !== false;
    const dot = showDot
      ? `<span style="flex-shrink:0;width:9px;height:9px;border-radius:5px;background:${presence.color};box-shadow:0 0 8px ${presence.color};"></span>`
      : "";

    return `
      <div style="font-family:var(--neo-font,system-ui);color:var(--neo-text1,#F4F6FB);padding:8px 6px 12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <div style="min-width:0;">
            <div style="font-size:13px;color:var(--neo-text2);font-weight:500;letter-spacing:0.2px;line-height:1.2;">${greetLine}</div>
            <div style="display:flex;align-items:center;gap:8px;font-size:28px;font-weight:600;letter-spacing:-0.6px;line-height:1.1;margin-top:1px;">${dot}<span>${bigLine}</span></div>
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0;">
            ${this._renderButton(1)}
            ${this._renderButton(2)}
            ${this._renderButton(3)}
          </div>
        </div>
      </div>`;
  }

  _navigate(path) {
    if (!path) return;
    history.pushState(null, "", path);
    window.dispatchEvent(new CustomEvent("location-changed"));
  }

  // Opens HA's built-in Quick Bar (entity search / command palette).
  // HA's keydown listener lives on the <home-assistant> element, so the
  // synthetic event must be dispatched there (events bubble up, not down).
  _openQuickBar(commands) {
    const key = commands ? "c" : "e";
    const code = commands ? "KeyC" : "KeyE";
    const keyCode = commands ? 67 : 69;
    const ev = new KeyboardEvent("keydown", {
      key, code, keyCode, which: keyCode,
      bubbles: true, cancelable: true, composed: true,
    });
    const target = document.querySelector("home-assistant") || document.body;
    target.dispatchEvent(ev);
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: true, composed: true, detail: { entityId },
    }));
  }

  _runAction(b) {
    const action = b.action || (b.path ? "navigate" : "none");
    switch (action) {
      case "quickbar": this._openQuickBar(false); break;
      case "quickbar_commands": this._openQuickBar(true); break;
      case "more_info": this._moreInfo(b.badge_entity); break;
      case "navigate": this._navigate(b.path); break;
      default: if (b.path) this._navigate(b.path);
    }
  }

  _bindEvents() {
    this.shadowRoot.querySelectorAll(".neo-hero-btn").forEach((el) => {
      el.addEventListener("click", () => {
        const slot = el.getAttribute("data-slot");
        this._runAction(this._button(slot));
      });
    });
  }

  static getConfigElement() {
    return document.createElement("neo-hero-card-editor");
  }

  static getStubConfig() {
    return {
      button1: { show: true, icon: "search", path: "" },
      button2: { show: true, icon: "scenes", path: "" },
      button3: { show: true, icon: "bell", path: "" },
    };
  }
}

// Hero Card Visual Editor — expandable section per button
const _heroButtonSchema = (slot, title) => ({
  type: "expandable",
  name: `button${slot}`,
  title,
  schema: [
    { name: "show", label: "Anzeigen", selector: { boolean: {} } },
    { name: "icon", label: "Icon", selector: { select: { mode: "dropdown", options: NEO_ICON_OPTIONS } } },
    { name: "action", label: "Aktion beim Klick", selector: { select: { mode: "dropdown", options: [
      { value: "navigate", label: "Navigation (Pfad)" },
      { value: "quickbar", label: "Schnellsuche (Entitäten)" },
      { value: "quickbar_commands", label: "Befehle (Command Palette)" },
      { value: "more_info", label: "Info-Dialog (Badge-Entity)" },
      { value: "none", label: "Keine" },
    ] } } },
    { name: "path", label: "Navigations-Pfad (z.B. /lovelace/kalender)", selector: { text: {} } },
    { name: "badge_entity", label: "Badge-Entity (Zahl = Zähler, on = Punkt)", selector: { entity: {} } },
    { name: "accent", label: "Akzentfarbe bei Meldung", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
    { name: "highlight", label: "Button bei Meldung einfärben", selector: { boolean: {} } },
  ],
});
customElements.define("neo-hero-card-editor", makeNeoEditor([
  { name: "name", label: "Name (leer = angemeldeter Benutzer)", selector: { text: {} } },
  { name: "greeting_text", label: "Begrüßungstext (leer = automatisch nach Uhrzeit)", selector: { text: {} } },
  { name: "person_entity", label: "Person für Status (Zuhause/Unterwegs)", selector: { entity: { domain: "person" } } },
  { name: "show_status_dot", label: "Status-Punkt anzeigen", selector: { boolean: {} } },
  { name: "name_color", label: "Namensfarbe (optional)", selector: { color_rgb: {} } },
  { name: "name_color2", label: "Verlauf-Endfarbe (optional, für Gradient)", selector: { color_rgb: {} } },
  _heroButtonSchema(1, "Button 1 – Suche"),
  _heroButtonSchema(2, "Button 2 – Kalender"),
  _heroButtonSchema(3, "Button 3 – Benachrichtigungen"),
], { name: "Neo Hero / Begrüßung", description: "Begrüßung mit Name und Action-Buttons", icon: "👋" }));
NeoDashboardRegistry.registerCard("neo-hero-card", NeoHeroCard, {
  name: "Neo Hero / Begrüßung",
  description: "Begrüßung mit Name und Action-Buttons",
});

// Default cloud texture. Served from GitHub raw so it works regardless
// of how HACS lays out files locally. Override via `cloud_image`.
const NEO_CLOUD_IMG = "https://raw.githubusercontent.com/bkstudy2025/neo-dashboard-kit/main/img/cloud.png";

// ── Weather Card ──────────────────────────────────────────────
// CSS for the animated background (rain / snow / stars). Pure CSS =
// no requestAnimationFrame loop, GPU-friendly transforms only.
const NEO_WEATHER_CSS = `
  .neo-wx-fx { position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:0; }

  /* Rain — slanted streaks with a bright head, falling tail */
  .neo-wx-rain { position:absolute; top:-24px; width:2px; height:18px; border-radius:2px;
    background:linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(210,228,255,.7) 100%);
    animation:neo-wx-drop linear infinite; will-change:transform; }
  @keyframes neo-wx-drop {
    0%{transform:translateY(-24px) rotate(14deg)} 100%{transform:translateY(140px) rotate(14deg)}
  }

  /* Snow — soft glowing flakes with horizontal drift */
  .neo-wx-snow { position:absolute; top:-12px; border-radius:50%;
    background:radial-gradient(circle, #fff 0%, #fff 55%, rgba(255,255,255,.4) 100%);
    box-shadow:0 0 4px rgba(255,255,255,.7);
    animation:neo-wx-snowfall linear infinite; will-change:transform; }
  @keyframes neo-wx-snowfall {
    0%{transform:translate(0,-12px)} 50%{transform:translate(var(--drift,8px),65px)}
    100%{transform:translate(0,140px)}
  }

  /* Stars — twinkle with a subtle glow */
  .neo-wx-star { position:absolute; border-radius:50%; background:#fff;
    box-shadow:0 0 4px rgba(255,255,255,.85);
    animation:neo-wx-twinkle ease-in-out infinite; will-change:opacity, transform; }
  @keyframes neo-wx-twinkle { 0%,100%{opacity:.15; transform:scale(.7)} 50%{opacity:1; transform:scale(1)} }

  /* Clouds — real cloud PNG texture, drifting */
  .neo-wx-cloud { position:absolute; left:0; display:block;
    background-repeat:no-repeat; background-size:100% 100%;
    animation:neo-wx-drift linear infinite; will-change:transform; }
  @keyframes neo-wx-drift { 0%{transform:translateX(-220px)} 100%{transform:translateX(820px)} }

  /* Lightning flash */
  .neo-wx-flash { position:absolute; inset:0;
    background:radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.9) 0%, rgba(255,255,255,0) 70%);
    opacity:0; animation:neo-wx-flash 5.5s linear infinite; }
  @keyframes neo-wx-flash {
    0%,90%,100%{opacity:0} 91%{opacity:.5} 92%{opacity:.1} 93%{opacity:.7}
    94%{opacity:0} 96%{opacity:.55} 97%{opacity:0}
  }

  /* Fog — soft drifting haze bands */
  .neo-wx-fog { position:absolute; left:-20%; width:140%; height:18px; border-radius:50%;
    background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.35), rgba(255,255,255,0));
    filter:blur(4px); animation:neo-wx-fog linear infinite; will-change:transform, opacity; }
  @keyframes neo-wx-fog {
    0%{transform:translateX(-12%)} 50%{transform:translateX(12%)} 100%{transform:translateX(-12%)}
  }

  /* Sun rays for sunny */
  .neo-wx-sun { position:absolute; top:-30px; right:-10px; width:90px; height:90px; border-radius:50%;
    background:radial-gradient(circle, rgba(255,236,170,.9) 0%, rgba(255,214,120,.35) 40%, rgba(255,214,120,0) 70%);
    animation:neo-wx-pulse 6s ease-in-out infinite; }
  @keyframes neo-wx-pulse { 0%,100%{opacity:.7; transform:scale(1)} 50%{opacity:1; transform:scale(1.08)} }

  @media (prefers-reduced-motion: reduce) {
    .neo-wx-rain, .neo-wx-snow, .neo-wx-star, .neo-wx-cloud, .neo-wx-flash, .neo-wx-fog, .neo-wx-sun { animation: none; }
    .neo-wx-flash { display:none; }
  }
`;

class NeoWeatherCard extends NeoBaseCard {
  getCardSize() { return 2; }

  // Re-render also when the sun crosses the horizon (day/night gradient)
  _trackedEntities() {
    const base = super._trackedEntities();
    return base.includes("sun.sun") ? base : [...base, "sun.sun"];
  }

  _isNight() {
    const sun = this._hass?.states?.["sun.sun"]?.state;
    if (sun === "below_horizon") return true;
    if (sun === "above_horizon") return false;
    const h = new Date().getHours();
    return h < 6 || h >= 20;
  }

  // condition + night → { gradient, particles }
  _fx(cond, night) {
    const G = {
      sunny: "linear-gradient(120deg, hsl(207,70%,52%), hsl(205,75%,62%))",
      "clear-night": "linear-gradient(120deg, hsl(235,40%,20%), hsl(255,35%,24%))",
      partlycloudy: "linear-gradient(120deg, hsl(209,42%,60%), hsl(207,46%,52%))",
      "partlycloudy-night": "linear-gradient(120deg, hsl(235,30%,20%), hsl(245,28%,22%))",
      cloudy: "linear-gradient(120deg, hsl(210,14%,58%), hsl(210,12%,50%))",
      "cloudy-night": "linear-gradient(120deg, hsl(230,14%,24%), hsl(240,12%,20%))",
      rainy: "linear-gradient(120deg, hsl(208,32%,46%), hsl(210,30%,56%))",
      pouring: "linear-gradient(120deg, hsl(210,22%,32%), hsl(210,22%,44%))",
      snowy: "linear-gradient(120deg, hsl(208,42%,64%), hsl(210,42%,80%))",
      "snowy-rainy": "linear-gradient(120deg, hsl(212,20%,50%), hsl(210,30%,70%))",
      fog: "linear-gradient(120deg, hsl(210,16%,62%), hsl(210,16%,72%))",
      lightning: "linear-gradient(120deg, hsl(220,18%,22%), hsl(220,16%,34%))",
      "lightning-rainy": "linear-gradient(120deg, hsl(220,18%,22%), hsl(220,16%,34%))",
      windy: "linear-gradient(120deg, hsl(205,36%,60%), hsl(205,36%,68%))",
      "windy-variant": "linear-gradient(120deg, hsl(205,36%,58%), hsl(205,36%,66%))",
      hail: "linear-gradient(120deg, hsl(208,28%,58%), hsl(210,28%,52%))",
      exceptional: "linear-gradient(120deg, hsl(12,60%,44%), hsl(12,56%,52%))",
      default: "linear-gradient(120deg, hsl(205,55%,58%), hsl(210,58%,66%))",
      "default-night": "linear-gradient(120deg, hsl(235,28%,18%), hsl(250,24%,18%))",
    };
    let key;
    if (night) {
      if (cond === "sunny" || cond === "clear") key = "clear-night";
      else if (G[cond + "-night"]) key = cond + "-night";
      else key = "default-night";
    } else {
      key = G[cond] ? cond : "default";
    }
    const gradient = G[key] || G.default;

    let particles = null;
    if (cond === "rainy" || cond === "lightning-rainy") particles = { kind: "rain", count: 18 };
    else if (cond === "pouring") particles = { kind: "rain", count: 30 };
    else if (cond === "snowy") particles = { kind: "snow", count: 18 };
    else if (cond === "snowy-rainy") particles = { kind: "snow", count: 14 };
    else if (night && (cond === "clear" || cond === "sunny")) particles = { kind: "star", count: 14 };

    let clouds = null;
    if (cond === "cloudy" || cond === "windy-variant") clouds = { intensity: "heavy" };
    else if (cond === "partlycloudy") clouds = { intensity: "light" };
    else if (cond === "lightning" || cond === "lightning-rainy" || cond === "pouring" || cond === "rainy") clouds = { intensity: "normal" };

    const flash = cond === "lightning" || cond === "lightning-rainy";
    const fog = cond === "fog";
    const sun = !night && (cond === "sunny" || cond === "clear");

    return { gradient, particles, clouds, flash, fog, sun };
  }

  _clouds({ intensity }, night) {
    const count = intensity === "heavy" ? 5 : intensity === "light" ? 2 : 3;
    const img = this._config?.cloud_image || NEO_CLOUD_IMG;
    // Night: darken + shift toward blue (like Clooos)
    const filter = night ? "brightness(0.5) saturate(1.1) hue-rotate(200deg)" : "none";
    let html = "";
    for (let i = 0; i < count; i++) {
      const w = 110 + Math.random() * 120;
      const h = w * 0.5625; // PNG aspect 1280x720
      const top = (-20 + Math.random() * 55).toFixed(0);
      const dur = (30 + Math.random() * 28).toFixed(1);
      const delay = (-Math.random() * dur).toFixed(1);
      const dayOp = intensity === "heavy" ? 0.9 : 0.7;
      const op = ((night ? 0.55 : dayOp) * (0.75 + Math.random() * 0.25)).toFixed(2);
      html += `<span class="neo-wx-cloud" style="top:${top}%;width:${w.toFixed(0)}px;height:${h.toFixed(0)}px;opacity:${op};filter:${filter};background-image:url('${img}');animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
    }
    return html;
  }

  _particles({ kind, count }) {
    let html = "";
    for (let i = 0; i < count; i++) {
      const left = (Math.random() * 100).toFixed(1);
      // Depth: ~⅓ of particles sit "in front" (bigger, faster, brighter)
      const front = i % 3 === 0;
      if (kind === "star") {
        const top = (Math.random() * 72).toFixed(1);
        const big = Math.random() > 0.8;
        const size = (big ? 1.8 + Math.random() * 1.2 : 0.8 + Math.random() * 1.1).toFixed(1);
        const dur = (2 + Math.random() * 3.5).toFixed(2);
        const delay = (-Math.random() * 4).toFixed(2);
        html += `<span class="neo-wx-star" style="left:${left}%;top:${top}%;width:${size}px;height:${size}px;animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
      } else if (kind === "snow") {
        const size = (front ? 3 + Math.random() * 2 : 1.6 + Math.random() * 1.6).toFixed(1);
        const drift = (Math.random() * 22 - 11).toFixed(0);
        const dur = (front ? 3 + Math.random() * 2 : 4.5 + Math.random() * 3).toFixed(2);
        const delay = (-Math.random() * 6).toFixed(2);
        const op = (front ? 1 : 0.7).toFixed(2);
        html += `<span class="neo-wx-snow" style="left:${left}%;width:${size}px;height:${size}px;opacity:${op};--drift:${drift}px;animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
      } else {
        const w = (front ? 2.4 : 1.6).toFixed(1);
        const h = (front ? 22 : 15).toFixed(0);
        const dur = (front ? 0.6 + Math.random() * 0.3 : 0.85 + Math.random() * 0.45).toFixed(2);
        const delay = (-Math.random() * 1.3).toFixed(2);
        const op = (front ? 0.85 : 0.5).toFixed(2);
        html += `<span class="neo-wx-rain" style="left:${left}%;width:${w}px;height:${h}px;opacity:${op};animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
      }
    }
    return html;
  }

  _fog() {
    let html = "";
    for (let i = 0; i < 3; i++) {
      const top = 15 + i * 28;
      const dur = (8 + Math.random() * 6).toFixed(1);
      const delay = (-Math.random() * dur).toFixed(1);
      html += `<span class="neo-wx-fog" style="top:${top}%;animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
    }
    return html;
  }

  // condition → { icon name, accent color }
  _weatherIcon(condition) {
    const map = {
      "sunny": ["sun", "#FFB26B"], "clear-night": ["moon", "#7C9CFF"],
      "partlycloudy": ["partly", "#FFB26B"], "cloudy": ["cloud", "#7C9CFF"],
      "rainy": ["rain", "#7C9CFF"], "pouring": ["rain", "#7C9CFF"],
      "snowy": ["snow", "#7C9CFF"], "snowy-rainy": ["snow", "#7C9CFF"],
      "windy": ["wind", "#5EDCB8"], "windy-variant": ["wind", "#5EDCB8"],
      "fog": ["fog", "#7C9CFF"], "hail": ["snow", "#7C9CFF"],
      "lightning": ["storm", "#FFB26B"], "lightning-rainy": ["storm", "#FFB26B"],
      "exceptional": ["sun", "#FFB26B"],
    };
    return map[condition] || ["partly", "#7C9CFF"];
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
    const cfg = this._config || {};
    const entityId = cfg.entity || "weather.forecast_home";
    const sunsetId = cfg.sunset_entity || "sensor.sun_next_setting";
    const s = this._state(entityId);
    const raw = (s?.state || "").toLowerCase();
    const cond = raw.replace(/-night$/, "").replace(/-day$/, "");
    const temp = s?.attributes?.temperature ?? "—";
    const feelsLike = s?.attributes?.apparent_temperature ?? s?.attributes?.feels_like ?? null;
    const humidity = s?.attributes?.humidity ?? null;
    const sunset = this._formatTime(this._state(sunsetId)?.state);
    const [iconName, iconColor] = this._weatherIcon(raw || cond);
    const label = this._conditionLabel(cond);

    const subParts = [
      feelsLike !== null ? `Gefühlt ${feelsLike}°` : null,
      sunset !== "—" ? `Sonnenuntergang ${sunset}` : null,
      humidity !== null ? `Luftfeuchtigkeit ${humidity}%` : null,
    ].filter(Boolean).join(" · ");

    const animatedBg = cfg.animated_background !== false;
    const animations = cfg.animations !== false;
    const night = raw.endsWith("-night") || this._isNight();
    const fx = animatedBg ? this._fx(cond, night) : null;

    // On a colored gradient → light text; otherwise theme text
    const onDark = !!fx;
    const t1 = onDark ? "#fff" : "var(--neo-text1)";
    const t3 = onDark ? "rgba(255,255,255,0.82)" : "var(--neo-text3)";
    const chev = onDark ? "rgba(255,255,255,0.7)" : "var(--neo-text3)";
    const iconC = onDark ? "#fff" : iconColor;
    const bg = fx
      ? fx.gradient
      : `linear-gradient(120deg, ${NEO_ACCENTS.blue.glow} 0%, var(--neo-fill1,rgba(255,255,255,0.04)) 70%)`;
    const particles = (animations && fx?.particles) ? this._particles(fx.particles) : "";
    const clouds = (animations && fx?.clouds) ? this._clouds(fx.clouds, night) : "";
    const flash = (animations && fx?.flash) ? `<div class="neo-wx-flash"></div>` : "";
    const fog = (animations && fx?.fog) ? this._fog() : "";
    const sun = (animations && fx?.sun) ? `<div class="neo-wx-sun"></div>` : "";
    const inner = `${sun}${clouds}${fog}${particles}${flash}`;
    const fxLayer = inner ? `<div class="neo-wx-fx">${inner}</div>` : "";
    const border = onDark ? "rgba(255,255,255,0.12)" : "var(--neo-line2,rgba(255,255,255,0.08))";

    return `
      <style>${NEO_WEATHER_CSS}</style>
      <div style="font-family:var(--neo-font,system-ui);padding:0 6px;">
        <div id="weather-banner" style="
          position:relative;overflow:hidden;
          display:flex;align-items:center;justify-content:space-between;
          padding:14px 16px;border-radius:20px;cursor:pointer;
          background:${bg};
          border:1px solid ${border};
          ${onDark ? "box-shadow:0 18px 40px -16px rgba(0,0,0,0.45);" : "backdrop-filter:var(--neo-blur,blur(24px));-webkit-backdrop-filter:var(--neo-blur,blur(24px));"}
        ">
          ${fxLayer}
          <div style="position:relative;z-index:1;display:flex;align-items:center;gap:12px;">
            <span style="display:flex;">${neoIcon(iconName, { size: 30, color: iconC })}</span>
            <div>
              <div style="font-size:15px;font-weight:600;color:${t1};">${label} · ${temp}°</div>
              ${subParts ? `<div style="font-size:11px;color:${t3};margin-top:2px;">${subParts}</div>` : ""}
            </div>
          </div>
          <span style="position:relative;z-index:1;font-size:18px;color:${chev};">›</span>
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
  { name: "animated_background", label: "Wetter-Hintergrund (Verlauf je Zustand)", selector: { boolean: {} } },
  { name: "animations", label: "Animationen (Regen/Schnee/Sterne/Wolken)", selector: { boolean: {} } },
  { name: "cloud_image", label: "Wolken-Bild URL (optional, eigenes PNG)", selector: { text: {} } },
], { name: "Neo Wetter", description: "Wetter-Banner mit animiertem Hintergrund", icon: "🌤️" }));
NeoDashboardRegistry.registerCard("neo-weather-card", NeoWeatherCard, {
  name: "Neo Wetter",
  description: "Wetter-Banner mit Temperatur und Sonnenuntergang",
});

// ══════════════════════════════════════════════════════════════
// NEO CARD — single wrapper card with a type dropdown.
// This is the ONLY card shown in HA's picker. The dropdown lists
// every registered Neo card (core + community plugins).
// ══════════════════════════════════════════════════════════════
class NeoCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    const type = this._config.card_type;

    if (!type) {
      this.innerHTML = `
        <ha-card style="
          padding:28px 24px;border-radius:24px;text-align:center;
          display:flex;flex-direction:column;align-items:center;gap:10px;
        ">
          <div style="
            width:52px;height:52px;border-radius:15px;
            display:flex;align-items:center;justify-content:center;font-size:26px;
            background:linear-gradient(160deg,#7C9CFF 0%,#7C9CFFcc 100%);
            box-shadow:0 4px 14px rgba(124,156,255,0.35);
          ">✨</div>
          <div style="font-size:16px;font-weight:600;color:var(--primary-text-color);">Neo Card</div>
          <div style="font-size:13px;color:var(--secondary-text-color);max-width:240px;line-height:1.4;">
            Wähle im Editor unter <b>Kartentyp</b> die gewünschte Karte (Licht, Sensor, Szene …).
          </div>
        </ha-card>`;
      this._child = null;
      this._childType = null;
      return;
    }

    if (!NeoDashboardRegistry.getCard(type)) {
      this.innerHTML = `
        <ha-card style="padding:24px;text-align:center;color:var(--error-color,#F87171);">
          Unbekannter Neo-Kartentyp: ${type}
        </ha-card>`;
      return;
    }

    // (Re)create child element only when the type changes
    if (!this._child || this._childType !== type) {
      this.innerHTML = "";
      this._child = document.createElement(type);
      this._childType = type;
      this.appendChild(this._child);
    }

    const childConfig = { ...this._config };
    delete childConfig.card_type;
    this._child.setConfig(childConfig);
    if (this._hass) this._child.hass = this._hass;
  }

  set hass(h) {
    this._hass = h;
    if (this._child) this._child.hass = h;
  }
  get hass() { return this._hass; }

  getCardSize() {
    return this._child?.getCardSize?.() ?? 2;
  }

  static getConfigElement() {
    return document.createElement("neo-card-editor");
  }

  static getStubConfig() {
    // Empty stub → picker shows the placeholder, not a specific card
    return {};
  }
}
customElements.define("neo-card", NeoCard);

// Expose ONLY neo-card in HA's native picker
window.customCards = window.customCards || [];
if (!window.customCards.find((c) => c.type === "neo-card")) {
  window.customCards.push({
    type: "neo-card",
    name: "Neo Card",
    description: "Glassmorphism-Karten — Typ im Editor wählen",
    preview: true,
    documentationURL: "https://github.com/bkstudy2025/neo-dashboard-kit",
  });
}

// ── Neo Card Editor — type dropdown + selected card's own editor ─
class NeoCardEditor extends HTMLElement {
  setConfig(config) {
    const incoming = { ...config };
    // Defensive: if a partial config arrives without card_type, keep ours.
    if (!incoming.card_type && this._config?.card_type) {
      incoming.card_type = this._config.card_type;
    }
    this._config = incoming;
    if (!this._built) this._build();
    else this._syncTypeForm();
  }
  set hass(h) {
    this._hass = h;
    if (this._typeForm) this._typeForm.hass = h;
    if (this._sub) this._sub.hass = h;
  }

  _build() {
    this._built = true;
    this.innerHTML = "";

    // Type dropdown (ha-form select, populated from the registry)
    const options = NeoDashboardRegistry.list()
      .filter((c) => c.type !== "neo-card")
      .map((c) => ({ value: c.type, label: c.name }));

    this._typeForm = document.createElement("ha-form");
    this._typeForm.schema = [
      { name: "card_type", label: "Kartentyp", selector: { select: { mode: "dropdown", options } } },
    ];
    this._typeForm.data = { card_type: this._config.card_type };
    if (this._hass) this._typeForm.hass = this._hass;
    this._typeForm.computeLabel = (s) => s.label || s.name;
    this._typeForm.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      const newType = e.detail.value.card_type;
      if (newType === this._config.card_type) return;
      const cls = NeoDashboardRegistry.getCard(newType);
      const stub = cls?.getStubConfig?.() || {};
      this._config = { type: this._config.type, card_type: newType, ...stub };
      this._mountSub();
      this._fire();
    });
    this.appendChild(this._typeForm);

    this._subContainer = document.createElement("div");
    this._subContainer.style.marginTop = "8px";
    this.appendChild(this._subContainer);

    this._mountSub();
  }

  _syncTypeForm() {
    if (!this._typeForm) return;
    // Only update when the value actually changed — avoids re-rendering
    // the dropdown (which would close it mid-interaction).
    if (this._typeForm.data?.card_type !== this._config.card_type) {
      this._typeForm.data = { card_type: this._config.card_type };
    }
  }

  _mountSub() {
    this._subContainer.innerHTML = "";
    this._sub = null;
    const type = this._config.card_type;
    if (!type) return;
    const cls = NeoDashboardRegistry.getCard(type);
    if (!cls?.getConfigElement) return;

    this._sub = cls.getConfigElement();
    const subConfig = { ...this._config };
    delete subConfig.card_type;
    if (this._hass) this._sub.hass = this._hass;
    this._sub.setConfig(subConfig);
    this._sub.addEventListener("config-changed", (e) => {
      // Stop the sub-editor's event from bubbling to HA directly —
      // otherwise HA would receive a config without type/card_type.
      e.stopPropagation();
      this._config = { type: this._config.type, card_type: type, ...e.detail.config };
      this._fire();
    });
    this._subContainer.appendChild(this._sub);
  }

  _fire() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true, composed: true,
    }));
  }
}
customElements.define("neo-card-editor", NeoCardEditor);

console.info(
  "%c NEO DASHBOARD KIT %c v0.1.3-beta.9 ",
  "background:#7C9CFF;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:700;",
  "background:#1a1f2e;color:#7C9CFF;padding:2px 6px;border-radius:0 4px 4px 0;"
);
