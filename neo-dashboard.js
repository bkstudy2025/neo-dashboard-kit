// Neo Dashboard Kit v0.2.0-beta.16
// https://github.com/bkstudy2025/neo-dashboard-kit

// ── Token fallback (one-time, lightweight) ───────────────────
// Stellt nur die --neo-*-Design-Tokens als Fallback bereit, falls das
// offizielle Theme (themes/neo-dashboard.yaml) nicht aktiv ist. CSS-Custom-
// Properties auf :root vererben sich in alle Shadow-Roots – kein Polling,
// kein Eingriff in fremde Shadow-DOMs. Hintergründe/Layout übernimmt das Theme.
(function injectNeoTokens() {
  const STYLE_ID = "neo-dashboard-theme";
  if (document.getElementById(STYLE_ID)) return;

  const css = `
    /* Neo Dashboard Kit — Token-Fallback */
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

    /* Scrollbar (Haupt-Dokument) */
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
  `;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
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
  /* Responsives Layout (per data-neo-layout am Host gesetzt). min-height ist
     nur ein Boden → kleiner = kompakter, Inhalt wird nie abgeschnitten. */
  :host([data-neo-layout="tablet"]) .neo-card { padding:14px !important; min-height:140px !important; }
  :host([data-neo-layout="mobile"]) .neo-card { padding:12px !important; min-height:118px !important; }
`;

// ── Registry ──────────────────────────────────────────────────
// Cards register here (core + community). They appear in the
// neo-card dropdown automatically — only the single "neo-card"
// wrapper is exposed in HA's native card picker.
const _registry = new Map();
let _tagSeq = 0;
const NeoDashboardRegistry = {
  // Each card is defined under an internal, versioned tag so UPDATES work
  // live (a custom element can't be re-defined under the same name). The
  // public `type` maps to the current concrete tag — neo-card uses that.
  registerCard(type, cls, meta = {}) {
    const tag = `${type}--neo${++_tagSeq}`;
    try { customElements.define(tag, cls); } catch (e) { console.error("[Neo Dashboard]", e); return; }
    _registry.set(type, { cls, meta, tag }); // overwrite on update
    console.info(`[Neo Dashboard] Registered: ${type} (${tag})`);
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

// Links shown in the editor's "Info & Support" panel.
// TODO: trage hier deine echte Patreon-/PayPal-/Ko-fi-URL ein.
const NEO_LINKS = {
  repo: "https://github.com/bkstudy2025/neo-dashboard-kit",
  issues: "https://github.com/bkstudy2025/neo-dashboard-kit/issues",
  patreon: "https://www.patreon.com/",
  paypal: "https://www.paypal.com/",
  kofi: "https://ko-fi.com/",
  // Module Store reads community modules from GitHub Discussions
  discussions: "https://api.github.com/repos/bkstudy2025/neo-dashboard-kit/discussions?per_page=100",
  newDiscussion: "https://github.com/bkstudy2025/neo-dashboard-kit/discussions/new",
};

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
  info: `<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r="1" fill="currentColor"/>`,
  grid: `<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>`,
  // ── SmartHome-Erweiterung ───────────────────────────────────
  garage: `<path d="M3 21V9l9-5 9 5v12"/><rect x="6" y="12" width="12" height="9"/><path d="M6 15h12M6 18h12"/>`,
  motion: `<circle cx="5" cy="12" r="1.6" fill="currentColor"/><path d="M9 8a6 6 0 0 1 0 8"/><path d="M13 5a10 10 0 0 1 0 14"/><path d="M17 2a14 14 0 0 1 0 20"/>`,
  coffee: `<path d="M4 8h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2"/><path d="M8 2v2.5M12 2v2.5"/>`,
  washer: `<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="14" r="5"/><circle cx="12" cy="14" r="2"/><path d="M7 6h.01M10 6h.01"/>`,
  dishwasher: `<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M4 7h16"/><path d="M8 4.5h.01M11 4.5h.01"/><path d="M9 11c1 1 2 1 3 0s2-1 3 0M9 15c1 1 2 1 3 0s2-1 3 0"/>`,
  outlet: `<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9v2M15 9v2M9 14h6"/>`,
  toggle: `<rect x="2" y="8" width="20" height="8" rx="4"/><circle cx="8" cy="12" r="2.5" fill="currentColor"/>`,
  valve: `<circle cx="12" cy="12" r="3"/><path d="M12 9V3M12 21v-6M9 12H3M21 12h-6M9.5 9.5L7 7M14.5 9.5L17 7M9.5 14.5L7 17M14.5 14.5L17 17"/>`,
  smoke: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>`,
  warning: `<path d="M12 3l10 18H2z"/><path d="M12 10v4"/><circle cx="12" cy="17.5" r="1" fill="currentColor"/>`,
  solar: `<rect x="3" y="5" width="18" height="11" rx="1"/><path d="M3 9h18M3 12.5h18M9 5v11M15 5v11M12 19v2M9 21h6"/>`,
  bed: `<path d="M3 18v-5h18v5"/><path d="M3 13V8h8v5"/><path d="M3 18v2M21 18v2"/><circle cx="7" cy="10.5" r="1.5"/>`,
  sofa: `<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 12a2 2 0 0 1 2 2v3h14v-3a2 2 0 0 1 2-2"/><path d="M5 17v2M19 17v2"/>`,
  shower: `<path d="M4 12h16"/><path d="M6 12V7a3 3 0 0 1 6 0"/><path d="M12 7h4a3 3 0 0 1 3 3"/><path d="M8 16v1M12 16v2M16 16v1"/>`,
  bath: `<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M6 12V6a2 2 0 0 1 4 0"/><path d="M6 19l-1 2M18 19l1 2"/>`,
  toilet: `<path d="M6 4v7a5 5 0 0 0 10 0V4"/><path d="M5 4h14"/><path d="M11 16v4M8 20h6"/>`,
  plant: `<path d="M12 21v-7"/><path d="M12 14c0-3-2-5-5-5 0 3 2 5 5 5z"/><path d="M12 12c0-3 2-5 5-5 0 3-2 5-5 5z"/>`,
  paw: `<circle cx="6" cy="11" r="1.6"/><circle cx="10" cy="8" r="1.6"/><circle cx="14" cy="8" r="1.6"/><circle cx="18" cy="11" r="1.6"/><path d="M8 16a4 4 0 0 1 8 0 3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3z"/>`,
  key: `<circle cx="8" cy="8" r="4"/><path d="M11 11l9 9M17 17l2-2M19 19l2-2"/>`,
  remote: `<rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="6" r="1.2" fill="currentColor"/><path d="M10 10h4M10 13h4M10 16h4"/>`,
  sprinkler: `<path d="M12 3v6M5 9h14"/><path d="M5 9c-1 3-1 6 0 9M19 9c1 3 1 6 0 9M12 9v10"/>`,
  gate: `<path d="M3 8h18M3 20V8M21 20V8M7 20V8M11 20V8M15 20V8M19 20V8"/>`,
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
  // Name mit Doppelpunkt → HA-Icon (mdi:…, hue:… oder andere registrierte Sets).
  // So lassen sich Standard-MDI und installierte Custom-Icon-Sets nutzen.
  if (typeof name === "string" && name.includes(":")) {
    return `<ha-icon icon="${name}" style="--mdc-icon-size:${size}px;width:${size}px;height:${size}px;color:${color};display:flex;align-items:center;justify-content:center;line-height:0;flex-shrink:0"></ha-icon>`;
  }
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

// ── Reorder-Liste für Editoren (▲ ▼ 🗑) ───────────────────────
// Rendert eine sortierbare Liste in `container`. labelFn(item,i) liefert den
// Text; onChange(newItems) wird mit der neuen Reihenfolge / nach Löschen
// aufgerufen. Erneut aufrufbar (re-rendert). Up/Down statt Drag = robust,
// auch auf Touch / im HA-Dialog.
function neoRenderReorder(container, items, labelFn, onChange) {
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const move = (from, to) => {
    if (to < 0 || to >= items.length) return;
    const a = items.slice(); const [m] = a.splice(from, 1); a.splice(to, 0, m); onChange(a);
  };
  const del = (i) => { const a = items.slice(); a.splice(i, 1); onChange(a); };
  if (!items.length) { container.innerHTML = ""; return; }
  container.innerHTML = `
    <style>
      .nre { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
      .nre-row { display:flex; align-items:center; gap:8px; padding:7px 10px; border-radius:10px;
        background:var(--neo-fill1,rgba(255,255,255,.04)); border:1px solid var(--neo-line2,rgba(255,255,255,.08)); }
      .nre-h { color:var(--secondary-text-color); font-size:14px; cursor:default; }
      .nre-l { flex:1; min-width:0; font-size:13px; color:var(--primary-text-color);
        overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .nre-b { width:28px; height:28px; flex-shrink:0; border-radius:8px; cursor:pointer;
        display:flex; align-items:center; justify-content:center; font-size:13px;
        background:var(--neo-fill2,rgba(255,255,255,.06)); color:var(--primary-text-color);
        border:1px solid var(--neo-line2,rgba(255,255,255,.1)); }
      .nre-b[disabled] { opacity:.3; cursor:default; }
      .nre-b.del { color:var(--error-color,#F87171); }
    </style>
    <div class="nre">
      ${items.map((it, i) => `
        <div class="nre-row">
          <span class="nre-h">⠿</span>
          <span class="nre-l">${i + 1}. ${esc(labelFn(it, i))}</span>
          <button class="nre-b" data-up="${i}" ${i === 0 ? "disabled" : ""} title="Nach oben">▲</button>
          <button class="nre-b" data-dn="${i}" ${i === items.length - 1 ? "disabled" : ""} title="Nach unten">▼</button>
          <button class="nre-b del" data-del="${i}" title="Entfernen">🗑</button>
        </div>`).join("")}
    </div>`;
  container.querySelectorAll("[data-up]").forEach((b) => b.addEventListener("click", () => move(+b.dataset.up, +b.dataset.up - 1)));
  container.querySelectorAll("[data-dn]").forEach((b) => b.addEventListener("click", () => move(+b.dataset.dn, +b.dataset.dn + 1)));
  container.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => del(+b.dataset.del)));
}

// ── Base Card ─────────────────────────────────────────────────
// ── Responsives Layout (geteilt von ALLEN Karten) ─────────────
// Jede Karte erhält eine "layout"-Option: auto | mobile | tablet | desktop.
// "auto" richtet sich nach der Bildschirmbreite (Mobil-/Tablet-Dashboard),
// die festen Werte erzwingen ein Layout (z.B. Tablet-Ansicht am Desktop).
const NEO_BP = { mobile: 640, tablet: 1024 }; // max. Breite je Stufe (px)
const NEO_LAYOUT_OPTS = [
  { value: "auto", label: "Automatisch (Bildschirmbreite)" },
  { value: "mobile", label: "Mobil (kompakt)" },
  { value: "tablet", label: "Tablet" },
  { value: "desktop", label: "Desktop (groß)" },
];
function normalizeLayout(v) {
  return ["mobile", "tablet", "desktop", "auto"].includes(v) ? v : "auto";
}
// Wiederverwendbares Editor-Feld für die Layout-Auswahl (alle Karten).
const NEO_LAYOUT_FIELD = {
  name: "layout", label: "Layout / Gerät",
  selector: { select: { mode: "dropdown", options: NEO_LAYOUT_OPTS } },
};
function neoViewportLayout() {
  const w = window.innerWidth || 1024;
  if (w <= NEO_BP.mobile) return "mobile";
  if (w <= NEO_BP.tablet) return "tablet";
  return "desktop";
}

class NeoBaseCard extends HTMLElement {
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

  _render() {
    this.setAttribute("data-neo-layout", this._layout());
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
  NEO_LAYOUT_FIELD,
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
  { name: "icon", label: "Icon", selector: { icon: {} } },
  { name: "unit", label: "Einheit (optional)", selector: { text: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
  NEO_LAYOUT_FIELD,
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
  { name: "icon", label: "Icon", selector: { icon: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
  NEO_LAYOUT_FIELD,
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
  { name: "icon", label: "Icon", selector: { icon: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
  NEO_LAYOUT_FIELD,
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
    { name: "icon", label: "Icon", selector: { icon: {} } },
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
  NEO_LAYOUT_FIELD,
], { name: "Neo Hero / Begrüßung", description: "Begrüßung mit Name und Action-Buttons", icon: "👋" }));
NeoDashboardRegistry.registerCard("neo-hero-card", NeoHeroCard, {
  name: "Neo Hero / Begrüßung",
  description: "Begrüßung mit Name und Action-Buttons",
});

// ── Status Card — horizontal carousel of status pills ─────────
const NEO_STATUS_CSS = `
  .neo-pills-wrap { position:relative; }
  .neo-pills-scroll {
    display:flex; gap:8px; overflow-x:auto; scroll-behavior:smooth;
    padding:2px 2px; scrollbar-width:none; -ms-overflow-style:none;
  }
  .neo-pills-scroll::-webkit-scrollbar { display:none; }
  .neo-pill {
    display:flex; align-items:center; gap:8px; flex-shrink:0;
    height:40px; padding:0 16px; border-radius:999px; cursor:pointer;
    background:var(--neo-fill2,rgba(255,255,255,0.055));
    border:1px solid var(--neo-line2,rgba(255,255,255,0.08));
    font-size:14px; font-weight:600; color:var(--neo-text1,#F4F6FB);
    letter-spacing:-0.1px; white-space:nowrap;
    transition:transform .12s, background .2s; }
  .neo-pill svg { flex-shrink:0; }
  .neo-pill:active { transform:scale(0.95); }
  .neo-pills-arrow {
    position:absolute; top:50%; transform:translateY(-50%);
    width:28px; height:28px; border-radius:14px; z-index:2; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    background:var(--neo-fill2,rgba(255,255,255,0.08));
    border:1px solid var(--neo-line3,rgba(255,255,255,0.10));
    backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
    opacity:0; pointer-events:none; transition:opacity .2s; }
  .neo-pills-arrow.left { left:-2px; }
  .neo-pills-arrow.right { right:-2px; }
`;

class NeoStatusCard extends NeoBaseCard {
  getCardSize() { return 1; }

  _pills() {
    if (Array.isArray(this._config?.pills)) return this._config.pills.filter(Boolean);
    const out = [];
    for (let i = 1; i <= 8; i++) {
      const p = this._config?.[`pill${i}`];
      if (p && p.show !== false && (p.icon || p.entity || p.name)) out.push(p);
    }
    return out;
  }

  _pillText(p) {
    if (p.name) return p.name;
    const st = this._state(p.entity);
    if (!st) return "—";
    const unit = st.attributes?.unit_of_measurement;
    return unit ? `${st.state} ${unit}` : st.state;
  }

  render() {
    const pills = this._pills();
    const html = pills.map((p, i) => {
      const acc = NEO_ACCENTS[p.accent] || NEO_ACCENTS.blue;
      const text = this._pillText(p);
      const icon = p.icon ? neoIcon(p.icon, { size: 16, color: acc.c }) : "";
      return `<div class="neo-pill" data-i="${i}" ${p.entity ? `data-entity="${p.entity}"` : ""}>
        ${icon}<span>${text}</span>
      </div>`;
    }).join("");

    return `
      <style>${NEO_STATUS_CSS}</style>
      <div style="font-family:var(--neo-font,system-ui);padding:0 6px;">
        <div class="neo-pills-wrap">
          <button id="pills-left" class="neo-pills-arrow left">${neoIcon("chevL", { size: 16, color: "var(--neo-text1)" })}</button>
          <div id="pills-scroll" class="neo-pills-scroll">${html}</div>
          <button id="pills-right" class="neo-pills-arrow right">${neoIcon("chevR", { size: 16, color: "var(--neo-text1)" })}</button>
        </div>
      </div>`;
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: true, composed: true, detail: { entityId },
    }));
  }

  _bindEvents() {
    const scroller = this.shadowRoot.getElementById("pills-scroll");
    const left = this.shadowRoot.getElementById("pills-left");
    const right = this.shadowRoot.getElementById("pills-right");
    if (!scroller) return;

    const update = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const x = scroller.scrollLeft;
      this._scroll = x;
      const show = (btn, on) => {
        if (!btn) return;
        btn.style.opacity = on ? "1" : "0";
        btn.style.pointerEvents = on ? "auto" : "none";
      };
      show(left, x > 4);
      show(right, x < max - 4);
    };

    scroller.addEventListener("scroll", update);
    left?.addEventListener("click", () => scroller.scrollBy({ left: -scroller.clientWidth * 0.8, behavior: "smooth" }));
    right?.addEventListener("click", () => scroller.scrollBy({ left: scroller.clientWidth * 0.8, behavior: "smooth" }));

    // Restore scroll position across re-renders
    if (this._scroll) scroller.scrollLeft = this._scroll;
    requestAnimationFrame(update);

    this.shadowRoot.querySelectorAll("[data-entity]").forEach((el) => {
      el.addEventListener("click", () => this._moreInfo(el.getAttribute("data-entity")));
    });
  }

  static getConfigElement() { return document.createElement("neo-status-card-editor"); }
  static getStubConfig() {
    return { pills: [{ icon: "shieldOk", name: "Armed", accent: "mint" }] };
  }
}

// ── Status editor — one HA-managed ha-form with a dynamic slot count ──
// All inputs are native ha-form (reliable). The list grows automatically:
// there is always one empty "Neue Pill" slot; fill it to add another.
// Set a pill's icon to "— (keine)" and clear its text to remove it.
const NEO_PILL_ICON_OPTIONS = [{ value: "none", label: "— (keine / entfernen)" }, ...NEO_ICON_OPTIONS];
const NEO_PILL_FIELDS = [
  { name: "icon", label: "Icon", selector: { select: { mode: "dropdown", options: NEO_PILL_ICON_OPTIONS } } },
  { name: "name", label: "Text (leer = Entity-Status)", selector: { text: {} } },
  { name: "entity", label: "Entity (optional)", selector: { entity: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
];
class NeoStatusCardEditor extends HTMLElement {
  setConfig(config) {
    // Editor owns the model; ignore HA's config echoes after first build.
    if (this._form) { this._config = { ...config }; return; }
    this._config = { ...config };
    this._pills = this._extract(config);
    this._build();
  }
  set hass(h) { this._hass = h; if (this._form) this._form.hass = h; }

  _extract(config) {
    if (Array.isArray(config.pills)) return config.pills.filter(Boolean).map((p) => ({ ...p }));
    const out = [];
    for (let i = 1; i <= 30; i++) {
      const p = config[`pill${i}`];
      if (this._present(p)) out.push({ ...p });
    }
    return out;
  }
  _present(p) { return !!(p && ((p.icon && p.icon !== "none") || p.name || p.entity)); }

  _schema() {
    const slots = this._pills.length + 1; // trailing empty slot = add
    const arr = [NEO_LAYOUT_FIELD];
    for (let i = 0; i < slots; i++) {
      const last = i === this._pills.length;
      const p = this._pills[i] || {};
      const title = last ? "➕ Neue Pill" : `${i + 1}. ${p.name || p.entity || "Pill"}`;
      arr.push({ type: "expandable", name: `p${i}`, title, schema: NEO_PILL_FIELDS });
    }
    return arr;
  }
  _data() {
    const d = { layout: normalizeLayout(this._config.layout) };
    this._pills.forEach((p, i) => (d[`p${i}`] = p));
    d[`p${this._pills.length}`] = {};
    return d;
  }

  _build() {
    this.innerHTML = "";
    const header = document.createElement("div");
    header.innerHTML = `
      <style>
        .neo-ed-head { display:flex; align-items:center; gap:14px; padding:14px 16px; margin-bottom:14px;
          border-radius:16px; background:linear-gradient(135deg, rgba(124,156,255,0.18), rgba(124,156,255,0.04));
          border:1px solid rgba(124,156,255,0.25); }
        .neo-ed-ic { width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;
          font-size:24px;background:linear-gradient(160deg,#7C9CFF,#7C9CFFcc);box-shadow:0 4px 14px rgba(124,156,255,.35); }
      </style>
      <div class="neo-ed-head">
        <div class="neo-ed-ic">🏷️</div>
        <div>
          <div style="font-size:16px;font-weight:600;color:var(--primary-text-color)">Neo Status-Leiste</div>
          <div style="font-size:12.5px;color:var(--secondary-text-color)">Leeren Slot füllen = neue Pill · Icon „—" = entfernen</div>
        </div>
      </div>`;
    this.appendChild(header);

    // Reihenfolge ändern (▲ ▼ 🗑)
    this._reorderEl = document.createElement("div");
    this.appendChild(this._reorderEl);
    this._renderReorder();

    this._form = document.createElement("ha-form");
    this._form.schema = this._schema();
    this._form.data = this._data();
    if (this._hass) this._form.hass = this._hass;
    this._form.computeLabel = (s) => s.label || s.name;
    this._form.addEventListener("value-changed", (e) => this._onChange(e));
    this.appendChild(this._form);
  }

  _renderReorder() {
    if (!this._reorderEl || !window.NeoDashboard?.renderReorder) return;
    window.NeoDashboard.renderReorder(this._reorderEl, this._pills,
      (p, i) => p.name || p.entity || `Pill ${i + 1}`,
      (next) => {
        this._pills = next;
        this._form.schema = this._schema();
        this._form.data = this._data();
        this._renderReorder();
        this._fire();
      });
  }

  _onChange(e) {
    e.stopPropagation();
    const v = e.detail.value || {};
    const next = [];
    for (let i = 0; i <= this._pills.length; i++) {
      const p = v[`p${i}`];
      if (this._present(p)) next.push(p);
    }
    const countChanged = next.length !== this._pills.length;
    this._pills = next;
    this._config.layout = normalizeLayout(v.layout);
    if (countChanged) this._form.schema = this._schema(); // grow / shrink slots
    this._form.data = this._data();
    this._renderReorder();
    this._fire();
  }

  _fire() {
    const out = { ...this._config };
    for (let i = 1; i <= 30; i++) delete out[`pill${i}`]; // drop legacy keys
    out.pills = this._pills;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: out }, bubbles: true, composed: true,
    }));
  }
}
customElements.define("neo-status-card-editor", NeoStatusCardEditor);
NeoDashboardRegistry.registerCard("neo-status-card", NeoStatusCard, {
  name: "Neo Status-Leiste",
  description: "Scrollbare Status-Pills mit Pfeilen",
});

// Loads pasted module code (script injection, deduped). Used by the
// neo-card wrapper at runtime and by its editor's "Modul einfügen" area.
// Returns { ok, cards } where cards = metadata of newly registered cards.
function neoLoadModule(code) {
  if (!code || !code.trim()) return { ok: false, cards: [] };
  window.__neoModules = window.__neoModules || new Set();
  const key = code.length + ":" + code.slice(0, 96);
  if (window.__neoModules.has(key)) return { ok: true, cards: [] };
  const before = new Set(NeoDashboardRegistry.list().map((c) => c.type));
  try {
    const s = document.createElement("script");
    s.textContent = code;
    document.head.appendChild(s);
    window.__neoModules.add(key);
    const cards = NeoDashboardRegistry.list().filter((c) => !before.has(c.type));
    // Live-Swap aller neo-card-Instanzen auf die (neue) Modul-Version – kein Reload nötig.
    window.dispatchEvent(new CustomEvent("neo-module-changed"));
    return { ok: true, cards };
  } catch (e) {
    console.error("[Neo Module] Fehler beim Laden:", e);
    return { ok: false, cards: [] };
  }
}

// ── Module Store — talks to the "Neo Dashboard Tools" integration ──
// Persists modules server-side (file-based) so the dashboard config stays
// clean. Falls back gracefully (available=false) when not installed.
const NeoStore = {
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


// ══════════════════════════════════════════════════════════════
// NEO CARD — single wrapper card with a type dropdown.
// This is the ONLY card shown in HA's picker. The dropdown lists
// every registered Neo card (core + community plugins).
// ══════════════════════════════════════════════════════════════
class NeoCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};

    // Load any pasted modules first so their card types are available.
    // Modules may be code strings (legacy) or { code, cards } objects.
    if (Array.isArray(this._config.modules)) {
      this._config.modules.forEach((m) => neoLoadModule(typeof m === "string" ? m : m?.code));
    }

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
      // Module may still be loading from the backend store — retry once ready
      this.innerHTML = `
        <ha-card style="padding:24px;text-align:center;color:var(--secondary-text-color);">
          ${NeoStore._loaded ? `Unbekannter Neo-Kartentyp: ${type}` : "Modul wird geladen …"}
        </ha-card>`;
      if (!NeoStore._loaded && !this._waitingModules) {
        this._waitingModules = true;
        window.addEventListener("neo-modules-loaded", () => {
          this._waitingModules = false;
          this.setConfig(this._config);
        }, { once: true });
      }
      return;
    }

    // (Re)create child when the type OR its concrete tag changes. The tag
    // changes when a module is updated → the new version goes live without
    // a page reload.
    const tag = NeoDashboardRegistry.getTag(type) || type;
    if (!this._child || this._childTag !== tag) {
      this.innerHTML = "";
      this._child = document.createElement(tag);
      this._childType = type;
      this._childTag = tag;
      this.appendChild(this._child);
    }

    const childConfig = { ...this._config };
    delete childConfig.card_type;
    this._child.setConfig(childConfig);
    if (this._hass) this._child.hass = this._hass;
  }

  set hass(h) {
    this._hass = h;
    NeoStore.setHass(h);
    if (this._child) this._child.hass = h;
  }
  get hass() { return this._hass; }

  connectedCallback() {
    // Live-Swap: wenn ein Modul (neu) geladen/aktualisiert wird, Kind mit
    // aktuellem versioniertem Tag neu aufbauen – ohne Browser-Reload.
    this._onModChange = () => { if (this._config) this.setConfig(this._config); };
    window.addEventListener("neo-module-changed", this._onModChange);
  }

  disconnectedCallback() {
    if (this._onModChange) window.removeEventListener("neo-module-changed", this._onModChange);
  }

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
    NeoStore.setHass(h);
    if (this._typeForm) this._typeForm.hass = h;
    if (this._sub) this._sub.hass = h;
  }

  _build() {
    this._built = true;
    this.innerHTML = "";

    // Kartentyp-Picker — eigener, nach Kategorie gruppierter Auswahldialog
    // (ha-form kann keine echten Gruppen/Überschriften).
    this._typeBox = document.createElement("div");
    this.appendChild(this._typeBox);
    this._renderTypePicker();

    this._subContainer = document.createElement("div");
    this._subContainer.style.marginTop = "8px";
    this.appendChild(this._subContainer);

    // Module manager (collapsed). Uses a plain textarea (reliable, unlike the
    // settings-dialog one) and stores to the server via Neo Dashboard Tools.
    this._modPanel = document.createElement("div");
    this._modPanel.style.marginTop = "12px";
    this.appendChild(this._modPanel);
    this._renderModPanel();
    if (NeoStore.available()) NeoStore.list().then((m) => { this._mods = m; this._renderModPanel(); });

    // Info & Support panel (collapsed)
    const info = document.createElement("div");
    info.style.marginTop = "10px";
    info.innerHTML = this._infoPanelHtml();
    this.appendChild(info);
    info.querySelector("#ni-toggle")?.addEventListener("click", () => {
      const body = info.querySelector("#ni-body");
      const open = body.style.display !== "none";
      body.style.display = open ? "none" : "block";
      info.querySelector(".ni").classList.toggle("open", !open);
    });

    this._mountSub();
  }

  _infoPanelHtml() {
    const v = (window.NeoDashboard && window.NeoDashboard.version) || "";
    const chip = (href, label) =>
      `<a href="${href}" target="_blank" rel="noopener" class="ni-chip">${label}</a>`;
    return `
      <style>
        .ni { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; overflow:hidden; }
        .ni-h { display:flex; align-items:center; gap:8px; padding:11px 12px; cursor:pointer;
          font-size:14px; font-weight:600; color:var(--primary-text-color); }
        .ni-h .chev { transition:transform .2s; display:flex; color:var(--secondary-text-color); }
        .ni.open .chev { transform:rotate(90deg); }
        .ni-c { padding:4px 12px 14px; }
        .ni-sec { font-size:13px; font-weight:700; color:var(--primary-text-color); margin:12px 0 8px; }
        .ni-txt { font-size:12.5px; color:var(--secondary-text-color); line-height:1.5; }
        .ni-chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
        .ni-chip { display:inline-flex; align-items:center; gap:6px; padding:7px 12px; border-radius:999px;
          font-size:12.5px; font-weight:600; text-decoration:none; cursor:pointer;
          color:var(--primary-text-color); background:var(--neo-fill2,rgba(255,255,255,.06));
          border:1px solid var(--neo-line2,rgba(255,255,255,.1)); }
        .ni-chip.heart { color:#FFB26B; border-color:rgba(255,178,107,.4); background:rgba(255,178,107,.12); }
      </style>
      <div class="ni ${this._infoOpen ? "open" : ""}">
        <div class="ni-h" id="ni-toggle">
          <span class="chev">${neoIcon("chevR", { size: 16, color: "currentColor" })}</span>
          <span>ℹ️ Info &amp; Support${v ? ` · v${v}` : ""}</span>
        </div>
        <div class="ni-c" id="ni-body" style="display:${this._infoOpen ? "block" : "none"}">
          <div class="ni-sec">Ressourcen &amp; Hilfe</div>
          <div class="ni-chips">
            ${chip(NEO_LINKS.repo, "📖 Dokumentation")}
            ${chip(NEO_LINKS.issues, "🐞 Probleme melden")}
          </div>
          <div class="ni-sec">Projekt unterstützen ❤️</div>
          <div class="ni-txt">Wenn dir Neo Dashboard Kit gefällt, freue ich mich über deine Unterstützung — so kann ich weiter neue Karten &amp; Module entwickeln.</div>
          <div class="ni-chips">
            ${chip(NEO_LINKS.patreon, "Patreon")}
            ${chip(NEO_LINKS.paypal, "PayPal")}
            ${chip(NEO_LINKS.kofi, "☕ Kaffee")}
          </div>
        </div>
      </div>`;
  }

  _modStyles() {
    return `
      <style>
        .nm2 { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; overflow:hidden; }
        .nm2-h { display:flex; align-items:center; gap:8px; padding:11px 12px; cursor:pointer;
          font-size:14px; font-weight:600; color:var(--primary-text-color); }
        .nm2-h .chev { transition:transform .2s; display:flex; color:var(--secondary-text-color); }
        .nm2.open .chev { transform:rotate(90deg); }
        .nm2-c { padding:0 12px 12px; }
        .nm2-tabs { display:flex; gap:6px; margin:6px 0 10px; }
        .nm2-tab { flex:1; text-align:center; padding:8px; border-radius:9px; cursor:pointer; font-size:13px; font-weight:600;
          color:var(--secondary-text-color); background:transparent; border:1px solid var(--divider-color,rgba(255,255,255,.1)); }
        .nm2-tab.active { color:#fff; background:var(--primary-color,#7C9CFF); border-color:transparent; }
        .nm2 textarea { width:100%; box-sizing:border-box; min-height:110px; resize:vertical; margin-top:8px;
          border-radius:10px; border:1px solid var(--divider-color,rgba(255,255,255,.15));
          background:var(--secondary-background-color,#0d1020); color:var(--primary-text-color);
          font-family:ui-monospace,monospace; font-size:12px; padding:10px; }
        .nm2-input { width:100%; box-sizing:border-box; padding:9px 12px; border-radius:10px;
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); background:var(--secondary-background-color,#0d1020);
          color:var(--primary-text-color); font-size:13px; }
        .nm2-btn { margin-top:8px; padding:9px 14px; border-radius:10px; cursor:pointer; border:none;
          background:var(--primary-color,#7C9CFF); color:#fff; font-size:14px; font-weight:600; }
        .nm2-btn.sm { margin:0; padding:7px 12px; font-size:12.5px; }
        .nm2-btn.ghost { background:transparent; border:1px solid var(--divider-color,rgba(255,255,255,.15)); color:var(--primary-text-color); }
        .nm2-item { display:flex; align-items:center; gap:10px; padding:9px 10px; margin-top:8px; font-size:13px;
          border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:10px; }
        .nm2-item .t { flex:1; min-width:0; }
        .nm2-item .nm { font-weight:600; color:var(--primary-text-color); }
        .nm2-item .meta { font-size:11.5px; color:var(--secondary-text-color); margin-top:1px; }
        .nm2-iconbtn { width:30px;height:30px;border:none;background:transparent;cursor:pointer; border-radius:8px;
          display:flex;align-items:center;justify-content:center;flex-shrink:0; color:var(--secondary-text-color); }
        .nm2-iconbtn.del { color:var(--error-color,#F87171); }
        .nm2-msg { font-size:12px; margin-top:8px; min-height:14px; }
        .nm2-note { font-size:11.5px; color:var(--secondary-text-color); margin:6px 0; line-height:1.4; }
        .nm2-store { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; padding:10px; margin-top:8px; }
        .nm2-store .img { width:100%; border-radius:8px; margin-top:8px; display:block; }
        .nm2-store .desc { font-size:12.5px; color:var(--secondary-text-color); margin-top:6px; line-height:1.45; }
        .nm2-store .row { display:flex; gap:8px; margin-top:10px; }
        .nm2-badge { display:inline-block; padding:1px 7px; border-radius:999px; font-size:10.5px; font-weight:700;
          background:rgba(94,220,184,.16); color:#5EDCB8; border:1px solid rgba(94,220,184,.4); margin-left:6px; }
      </style>`;
  }

  async _renderModPanel() {
    const backend = NeoStore.available();
    const mods = this._mods || [];
    const open = this._modOpen;
    const tab = this._modTab || "mine";

    const body = tab === "store" ? this._storeHtml() : this._mineHtml(backend, mods);

    this._modPanel.innerHTML = `
      ${this._modStyles()}
      <div class="nm2 ${open ? "open" : ""}">
        <div class="nm2-h" id="nm2-toggle">
          <span class="chev">${neoIcon("chevR", { size: 16, color: "currentColor" })}</span>
          <span>🧩 Module${mods.length ? ` (${mods.length})` : ""}</span>
        </div>
        <div class="nm2-c" id="nm2-body" style="display:${open ? "block" : "none"}">
          <div class="nm2-tabs">
            <div class="nm2-tab ${tab === "mine" ? "active" : ""}" data-tab="mine">Meine Module</div>
            <div class="nm2-tab ${tab === "store" ? "active" : ""}" data-tab="store">Modul-Store</div>
          </div>
          ${body}
          <div class="nm2-msg" id="nm2-msg"></div>
        </div>
      </div>`;

    const q = (s) => this._modPanel.querySelector(s);
    q("#nm2-toggle").addEventListener("click", () => {
      this._modOpen = !this._modOpen;
      q("#nm2-body").style.display = this._modOpen ? "block" : "none";
      this._modPanel.querySelector(".nm2").classList.toggle("open", this._modOpen);
    });
    this._modPanel.querySelectorAll(".nm2-tab").forEach((t) => {
      t.addEventListener("click", () => {
        this._modTab = t.getAttribute("data-tab");
        this._modOpen = true;
        this._renderModPanel();
        if (this._modTab === "store" && !this._storeItems) this._loadStore();
      });
    });

    if (tab === "mine") this._wireMine(backend);
    else this._wireStore(backend);
  }

  // ── My Modules tab ─────────────────────────────────────────
  _mineHtml(backend, mods) {
    if (!backend) {
      return `<div class="nm2-note">⚠️ Integration <b>Neo Dashboard Tools</b> nicht gefunden — zum zentralen Speichern/Bearbeiten bitte installieren.</div>`;
    }
    const item = (m, i, meta) => {
      if (this._editIdx === i) {
        return `<div class="nm2-item" style="flex-direction:column;align-items:stretch;">
          <div style="font-weight:600;color:var(--primary-text-color)">${meta.name} bearbeiten</div>
          <textarea data-edit="${i}">${(m.code || "").replace(/</g, "&lt;")}</textarea>
          <div class="nm2-store-row" style="display:flex;gap:8px;margin-top:8px;">
            <button class="nm2-btn sm" data-save="${i}">Speichern</button>
            <button class="nm2-btn sm ghost" data-cancel="1">Abbrechen</button>
          </div>
        </div>`;
      }
      return `<div class="nm2-item">
        <span style="font-size:18px;">${meta.icon || "📦"}</span>
        <div class="t"><div class="nm">${meta.name}</div>
          <div class="meta">${meta.version ? "v" + meta.version : ""}</div></div>
        <button class="nm2-iconbtn" data-editbtn="${i}" title="Bearbeiten">${neoIcon("settings", { size: 16, color: "currentColor" })}</button>
        <button class="nm2-iconbtn del" data-del="${i}" title="Entfernen">${neoIcon("trash", { size: 15, color: "currentColor" })}</button>
      </div>`;
    };
    // Nach Kategorie gruppieren (Original-Index für Edit/Delete erhalten).
    const cat = (a) => a === "Community" ? "Community" : a === "Premium" ? "Premium" : "Sonstige";
    const groups = { Premium: [], Community: [], Sonstige: [] };
    mods.forEach((m, i) => { const meta = this._parseMod(m.code); groups[cat(meta.author)].push({ m, i, meta }); });
    const badge = { Premium: "🟡", Community: "🟢", Sonstige: "📦" };
    const hdr = (g, n) => `<div style="font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--secondary-text-color);margin:12px 0 2px;">${badge[g]} ${g} (${n})</div>`;
    const list = ["Premium", "Community", "Sonstige"]
      .filter((g) => groups[g].length)
      .map((g) => hdr(g, groups[g].length) + groups[g].map(({ m, i, meta }) => item(m, i, meta)).join(""))
      .join("");
    return `
      ${mods.length ? list : `<div class="nm2-note">Noch keine Module installiert. Über den <b>Modul-Store</b> oder per Code-Einfügen unten hinzufügen.</div>`}
      <div style="margin-top:12px;font-size:12.5px;font-weight:700;color:var(--primary-text-color)">Code einfügen (z.B. Patreon)</div>
      <textarea id="nm2-code" placeholder="Karten-Code hier einfügen …"></textarea>
      <button class="nm2-btn" id="nm2-add">Hinzufügen / Aktualisieren</button>`;
  }

  _wireMine(backend) {
    const q = (s) => this._modPanel.querySelector(s);
    const msg = (txt, err) => {
      const m = this._modPanel.querySelector("#nm2-msg");
      if (m) { m.style.color = err ? "var(--error-color,#F87171)" : "var(--success-color,#5EDCB8)"; m.textContent = txt; }
    };
    q("#nm2-add")?.addEventListener("click", async () => {
      const code = (q("#nm2-code").value || "").trim();
      if (!code) return msg("Bitte Code einfügen.", true);
      await this._saveModule(code, msg);
    });
    this._modPanel.querySelectorAll("[data-editbtn]").forEach((b) =>
      b.addEventListener("click", () => { this._editIdx = +b.getAttribute("data-editbtn"); this._renderModPanel(); }));
    this._modPanel.querySelectorAll("[data-cancel]").forEach((b) =>
      b.addEventListener("click", () => { this._editIdx = null; this._renderModPanel(); }));
    this._modPanel.querySelectorAll("[data-save]").forEach((b) =>
      b.addEventListener("click", async () => {
        const i = +b.getAttribute("data-save");
        const ta = this._modPanel.querySelector(`textarea[data-edit="${i}"]`);
        const code = (ta?.value || "").trim();
        if (!code) return msg("Code ist leer.", true);
        this._editIdx = null;
        await this._saveModule(code, msg);
      }));
    this._modPanel.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", async () => {
        const i = +b.getAttribute("data-del");
        const mod = (this._mods || [])[i];
        if (backend && mod) { try { await NeoStore.delete(mod.name); } catch (e) {} this._mods = await NeoStore.list(); }
        this._refreshTypeOptions();
        this._renderModPanel();
      }));
  }

  async _saveModule(code, msg) {
    neoLoadModule(code);
    const meta = this._parseMod(code);
    const name = meta.type || `modul-${Date.now()}`;
    if (NeoStore.available()) {
      try { await NeoStore.save(name, code); } catch (e) { return msg("Speichern fehlgeschlagen.", true); }
      this._mods = await NeoStore.list();
    }
    this._refreshTypeOptions();
    this._renderModPanel();
    msg(`✓ Gespeichert — ${meta.name}. Oben im Kartentyp wählen.`);
  }

  // ── Module Store tab (reads GitHub Discussions) ────────────
  _extractJs(body) {
    const m = body.match(/```(?:js|javascript)?\s*\n([\s\S]*?)```/i);
    return m ? m[1].trim() : "";
  }
  _extractImage(body) {
    const m = body.match(/!\[[^\]]*\]\(([^)]+)\)/) || body.match(/<img[^>]+src=["']([^"']+)["']/i);
    return m ? m[1] : "";
  }
  _extractDesc(body) {
    const text = body
      .replace(/```[\s\S]*?```/g, "")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      .replace(/<img[^>]*>/gi, "")
      .replace(/[#>*_`]/g, "")
      .trim();
    const line = text.split("\n").map((l) => l.trim()).filter(Boolean)[0] || "";
    return line.length > 180 ? line.slice(0, 177) + "…" : line;
  }
  _parseCodeMeta(code) {
    const m = code.match(/registerCard\(\s*["'`]([\w-]+)["'`]\s*,\s*[A-Za-z_$][\w$]*\s*,\s*\{([^{}]*)\}/);
    const field = (body, key) => {
      const f = body.match(new RegExp(key + "\\s*:\\s*[\"'`]([^\"'`]+)[\"'`]"));
      return f ? f[1] : null;
    };
    if (m) return { type: m[1], name: field(m[2], "name") || m[1], version: field(m[2], "version"), author: field(m[2], "author"), icon: field(m[2], "icon") };
    const t = (code.match(/registerCard\(\s*["'`]([\w-]+)["'`]/) || [])[1];
    return { type: t, name: t, version: null, author: null, icon: null };
  }

  async _loadStore() {
    try {
      const txt = await NeoStore.fetch(NEO_LINKS.discussions);
      const discussions = JSON.parse(txt);
      const items = [];
      for (const d of discussions) {
        const code = this._extractJs(d.body || "");
        if (!code || !/registerCard\(/.test(code)) continue; // only module posts
        const meta = this._parseCodeMeta(code);
        items.push({
          name: meta.name || d.title,
          type: meta.type,
          author: meta.author || d.user?.login || "?",
          version: meta.version,
          icon: meta.icon,
          description: this._extractDesc(d.body || ""),
          image: this._extractImage(d.body || ""),
          repo: d.html_url,
          code,
        });
      }
      this._storeItems = items;
      this._storeError = null;
    } catch (e) {
      this._storeItems = [];
      this._storeError = "Store konnte nicht geladen werden (GitHub-Limit?).";
    }
    this._renderModPanel();
  }

  _storeHtml() {
    if (!NeoStore.available()) {
      return `<div class="nm2-note">⚠️ Für den Store wird die Integration <b>Neo Dashboard Tools</b> benötigt.</div>`;
    }
    if (!this._storeItems) return `<div class="nm2-note">Lade Store …</div>`;
    if (this._storeError) return `<div class="nm2-note">${this._storeError} <button class="nm2-btn sm ghost" id="nm2-reload">Erneut</button></div>`;
    const installed = new Set((this._mods || []).map((m) => this._parseMod(m.code).type));
    const ql = (this._storeQuery || "").toLowerCase();
    const items = this._storeItems.filter((it) =>
      !ql || (it.name + " " + (it.author || "") + " " + (it.description || "")).toLowerCase().includes(ql));
    const cards = items.map((it, i) => {
      const has = installed.has(it.type);
      return `<div class="nm2-store">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:18px;">🧩</span>
          <div style="flex:1;min-width:0;">
            <div class="nm">${it.name}${has ? `<span class="nm2-badge">installiert</span>` : ""}</div>
            <div class="meta" style="font-size:11.5px;color:var(--secondary-text-color)">von ${it.author || "?"}${it.version ? " · v" + it.version : ""}</div>
          </div>
        </div>
        ${it.image ? `<img class="img" src="${it.image}" loading="lazy" />` : ""}
        ${it.description ? `<div class="desc">${it.description}</div>` : ""}
        <div class="row">
          <button class="nm2-btn sm" data-install="${i}">${has ? "Aktualisieren" : "Installieren"}</button>
          ${it.repo ? `<a class="nm2-btn sm ghost" href="${it.repo}" target="_blank" rel="noopener" style="text-decoration:none;">Mehr Infos</a>` : ""}
        </div>
      </div>`;
    }).join("");
    return `
      <div class="nm2-note" style="border-left:3px solid var(--warning-color,#F0B429);">
        ⚠️ Store-Module sind <b>ungeprüfter Community-Code</b> mit vollem Frontend-Zugriff.
        Nur aus vertrauenswürdigen Quellen installieren.</div>
      <input class="nm2-input" id="nm2-search" placeholder="🔍 Module suchen …" value="${this._storeQuery || ""}" />
      ${items.length ? cards : `<div class="nm2-note">Noch keine Module veröffentlicht.</div>`}
      <div class="nm2-note" style="margin-top:10px;">Eigenes Modul teilen? Einfach eine
        <a href="${NEO_LINKS.newDiscussion}" target="_blank" rel="noopener">GitHub-Diskussion</a>
        mit deinem Code in einem <code>\`\`\`js</code>-Block erstellen.</div>`;
  }

  _wireStore() {
    const q = (s) => this._modPanel.querySelector(s);
    q("#nm2-reload")?.addEventListener("click", () => { this._storeItems = null; this._storeError = null; this._loadStore(); });
    const search = q("#nm2-search");
    if (search) {
      search.addEventListener("input", () => {
        this._storeQuery = search.value;
        const pos = search.selectionStart;
        this._renderModPanel();
        const s2 = this._modPanel.querySelector("#nm2-search");
        if (s2) { s2.focus(); s2.setSelectionRange(pos, pos); }
      });
    }
    this._modPanel.querySelectorAll("[data-install]").forEach((b) =>
      b.addEventListener("click", async () => {
        const it = this._storeItems[+b.getAttribute("data-install")];
        const msg = (t, e) => { const m = q("#nm2-msg"); if (m) { m.style.color = e ? "var(--error-color,#F87171)" : "var(--success-color,#5EDCB8)"; m.textContent = t; } };
        const src = it.url || it.discussion || "GitHub Discussions";
        const ok = window.confirm(
          `⚠ Sicherheitshinweis – „${it.name}" installieren?\n\n` +
          `Dies ist ungeprüfter Community-Code und läuft mit vollem Zugriff ` +
          `auf dein Home Assistant Frontend (Tokens, alle Entitäten).\n` +
          `Installiere nur Module aus Quellen, denen du vertraust.\n\n` +
          `Autor: ${it.author || "unbekannt"}\n` +
          `Quelle: ${src}\n\n` +
          `Fortfahren?`
        );
        if (!ok) return;
        b.textContent = "Lädt …"; b.disabled = true;
        try {
          const code = it.code; // already loaded from the discussion
          neoLoadModule(code);
          await NeoStore.save(it.type || `modul-${Date.now()}`, code);
          this._mods = await NeoStore.list();
          this._refreshTypeOptions();
          this._renderModPanel();
          msg(`✓ ${it.name} installiert. Oben im Kartentyp wählen.`);
        } catch (e) {
          msg(`Installation fehlgeschlagen: ${e?.message || e}`, true);
        }
      }));
  }

  _parseMod(code) {
    const t = (code.match(/registerCard\(\s*["'`]([\w-]+)["'`]/) || [])[1];
    const meta = t ? NeoDashboardRegistry.getMeta(t) : {};
    return {
      type: t,
      name: meta.name || t || "Modul",
      version: meta.version,
      author: meta.author,
      icon: meta.icon,
    };
  }

  _syncTypeForm() {
    if (this._typeBox) this._renderTypePicker();
  }

  _refreshTypeOptions() {
    if (this._typeBox) this._renderTypePicker();
  }

  // Karten nach Kategorie gruppiert: Standard · Premium · Community.
  _typeGroups() {
    const cat = (a) => a === "Premium" ? "Premium" : a === "Community" ? "Community" : "Standard";
    const order = ["Standard", "Premium", "Community"];
    const groups = { Standard: [], Premium: [], Community: [] };
    NeoDashboardRegistry.list()
      .filter((c) => c.type !== "neo-card" && !c.hidden)
      .forEach((c) => groups[cat(c.author)].push({ value: c.type, name: c.name, icon: c.icon || "✨" }));
    order.forEach((g) => groups[g].sort((a, b) => a.name.localeCompare(b.name)));
    return order.filter((g) => groups[g].length).map((g) => ({ group: g, items: groups[g] }));
  }

  _selectType(newType) {
    if (!newType || newType === this._config.card_type) return;
    const cls = NeoDashboardRegistry.getCard(newType);
    const stub = cls?.getStubConfig?.() || {};
    const mods = this._config.modules;
    this._config = { type: this._config.type, card_type: newType, ...(mods ? { modules: mods } : {}), ...stub };
    this._renderTypePicker();
    this._mountSub();
    this._fire();
  }

  // Eigener, gruppierter Kartentyp-Picker (ha-form kann keine Gruppen).
  _renderTypePicker() {
    if (!this._typeBox) return;
    const DOT = { Standard: "#9aa0a6", Premium: "#F0B429", Community: "#5EDCB8" };
    const catOf = (a) => a === "Premium" ? "Premium" : a === "Community" ? "Community" : "Standard";
    const cur = this._config.card_type;
    const m = NeoDashboardRegistry.getMeta(cur) || {};
    const curCat = catOf(m.author);
    const curName = m.name || cur || "Kartentyp wählen …";
    const groups = this._typeGroups();
    this._typeBox.innerHTML = `
      <style>
        .nt-h { font-size:12px; color:var(--secondary-text-color); margin:0 0 4px 4px; }
        .nt { position:relative; }
        .nt-btn { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; box-sizing:border-box;
          padding:11px 12px; border-radius:10px; cursor:pointer; font-size:14px;
          background:var(--secondary-background-color,#0d1020); color:var(--primary-text-color);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); }
        .nt-lbl { display:flex; align-items:center; gap:8px; min-width:0; }
        .nt-nm { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .nt-dot { width:8px; height:8px; border-radius:4px; flex-shrink:0; }
        .nt-cv { opacity:.6; transition:transform .2s; }
        .nt.open .nt-cv { transform:rotate(180deg); }
        .nt-panel { position:absolute; left:0; right:0; top:calc(100% + 4px); z-index:30; max-height:330px; overflow:auto;
          border-radius:10px; background:var(--card-background-color,#1b2030);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); box-shadow:0 14px 34px rgba(0,0,0,.45); }
        .nt-grp { font-size:11px; font-weight:700; letter-spacing:.6px; text-transform:uppercase;
          color:var(--secondary-text-color); padding:10px 12px 4px; position:sticky; top:0;
          background:var(--card-background-color,#1b2030); }
        .nt-opt { display:flex; align-items:center; gap:9px; padding:9px 12px; cursor:pointer; font-size:14px;
          color:var(--primary-text-color); }
        .nt-opt:hover { background:var(--neo-fill2,rgba(255,255,255,.06)); }
        .nt-opt.sel { color:var(--primary-color,#7C9CFF); font-weight:600; }
        .nt-ic { width:20px; text-align:center; flex-shrink:0; }
        .nt-search { position:sticky; top:0; z-index:1; padding:8px; background:var(--card-background-color,#1b2030);
          border-bottom:1px solid var(--divider-color,rgba(255,255,255,.1)); }
        .nt-search input { width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px; font-size:13px;
          background:var(--secondary-background-color,#0d1020); color:var(--primary-text-color);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); }
        .nt-empty { padding:14px 12px; font-size:13px; color:var(--secondary-text-color); }
      </style>
      <div class="nt-h">Kartentyp</div>
      <div class="nt">
        <div class="nt-btn" id="nt-btn">
          <span class="nt-lbl"><span class="nt-dot" style="background:${DOT[curCat]};"></span>
            <span class="nt-ic">${m.icon || "✨"}</span><span class="nt-nm">${curName}</span></span>
          <span class="nt-cv">▾</span>
        </div>
        <div class="nt-panel" id="nt-panel" style="display:none;">
          <div class="nt-search"><input id="nt-search" type="text" placeholder="🔍 Karte suchen …" /></div>
          <div id="nt-list">
          ${groups.map((grp) => `
            <div class="nt-section">
              <div class="nt-grp"><span class="nt-dot" style="display:inline-block;background:${DOT[grp.group]};margin-right:6px;"></span>${grp.group}</div>
              ${grp.items.map((it) => `<div class="nt-opt ${it.value === cur ? "sel" : ""}" data-v="${it.value}" data-s="${(it.name + " " + it.value + " " + grp.group).toLowerCase()}">
                <span class="nt-ic">${it.icon}</span><span class="nt-nm">${it.name}</span>
              </div>`).join("")}
            </div>`).join("")}
          <div class="nt-empty" id="nt-empty" style="display:none;">Keine Treffer.</div>
          </div>
        </div>
      </div>`;
    const root = this._typeBox.querySelector(".nt");
    const panel = this._typeBox.querySelector("#nt-panel");
    const close = () => { panel.style.display = "none"; root.classList.remove("open"); document.removeEventListener("click", onDoc, true); };
    const onDoc = (e) => { if (!this._typeBox.contains(e.target)) close(); };
    const search = this._typeBox.querySelector("#nt-search");
    this._typeBox.querySelector("#nt-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (panel.style.display !== "none") { close(); return; }
      panel.style.display = "block"; root.classList.add("open");
      document.addEventListener("click", onDoc, true);
      setTimeout(() => search?.focus(), 30);
    });
    search?.addEventListener("click", (e) => e.stopPropagation());
    search?.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let any = false;
      this._typeBox.querySelectorAll(".nt-section").forEach((sec) => {
        let vis = 0;
        sec.querySelectorAll(".nt-opt").forEach((o) => {
          const hit = !q || o.getAttribute("data-s").includes(q);
          o.style.display = hit ? "" : "none"; if (hit) vis++;
        });
        sec.style.display = vis ? "" : "none"; if (vis) any = true;
      });
      const empty = this._typeBox.querySelector("#nt-empty");
      if (empty) empty.style.display = any ? "none" : "block";
    });
    this._typeBox.querySelectorAll(".nt-opt").forEach((o) =>
      o.addEventListener("click", () => { close(); this._selectType(o.getAttribute("data-v")); }));
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
    delete subConfig.modules;
    if (this._hass) this._sub.hass = this._hass;
    this._sub.setConfig(subConfig);
    this._sub.addEventListener("config-changed", (e) => {
      // Stop the sub-editor's event from bubbling to HA directly —
      // otherwise HA would receive a config without type/card_type.
      e.stopPropagation();
      const mods = this._config.modules;
      this._config = { type: this._config.type, card_type: type, ...(mods ? { modules: mods } : {}), ...e.detail.config };
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

// ══════════════════════════════════════════════════════════════
// PUBLIC API — external/premium cards (separate JS files) use this
// to build cards that plug into the neo-card dropdown automatically.
//   const { BaseCard, icon, accents, registerCard, makeEditor } = window.NeoDashboard;
// ══════════════════════════════════════════════════════════════
Object.assign(window.NeoDashboard, {
  BaseCard: NeoBaseCard,
  icon: neoIcon,
  accents: NEO_ACCENTS,
  makeEditor: makeNeoEditor,
  iconOptions: NEO_ICON_OPTIONS,
  accentOptions: NEO_ACCENT_OPTIONS,
  layoutOptions: NEO_LAYOUT_OPTS,
  normalizeLayout,
  viewportLayout: neoViewportLayout,
  renderReorder: neoRenderReorder,
  version: "0.2.0",
  ready: true,
});
// Let external files that loaded first know the API is now available
window.dispatchEvent(new CustomEvent("neo-dashboard-ready"));

console.info(
  "%c NEO DASHBOARD KIT %c v0.2.0-beta.16 ",
  "background:#7C9CFF;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:700;",
  "background:#1a1f2e;color:#7C9CFF;padding:2px 6px;border-radius:0 4px 4px 0;"
);
