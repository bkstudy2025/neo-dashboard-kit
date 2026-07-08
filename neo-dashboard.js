// Neo Dashboard Kit — built from src/ (npm run build). Do not edit directly.
// Neo Dashboard Kit — Token-Fallback
// ----------------------------------------------------------------
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

// Neo Dashboard Kit — Debug-Logging
// Registrierungs- und Modul-Logs sind standardmäßig STUMM, damit die Browser-
// Konsole übersichtlich bleibt. Der Versions-Banner bleibt immer sichtbar.
//
// Aktivieren (für Support/Entwicklung) in der Browser-Konsole:
//   localStorage.setItem("neo-debug", "1");   // + Seite neu laden
// Deaktivieren:
//   localStorage.removeItem("neo-debug");

function neoDebugEnabled() {
  try {
    return window.localStorage?.getItem("neo-debug") === "1";
  } catch (_e) {
    return false; // localStorage kann in Sonderkontexten blockiert sein
  }
}

function neoLog(...args) {
  if (neoDebugEnabled()) console.info(...args);
}

// Neo Dashboard Kit — Registry
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

// Neo Dashboard Kit — Module registry ("Neo Module Layers")
// Karten-gebundene Erweiterungs-Module. Ein Modul ist ein deklaratives
// Manifest (mit Ziel-Karte + optionalem Config-Schema) plus optionale,
// typisierte Hooks. So bleiben die Basis-Karten schlank und alle "großen"
// Funktionen kommen aus Modulen (Premium/Community).
//
// Manifest-Form:
//   {
//     id: "neo-badge",            // eindeutig (Pflicht)
//     name, description, icon,    // Anzeige
//     target: "neo-control-card", // Ziel-Karte, Liste, oder "*" für alle
//     version, author,            // Meta (author = Badge: Premium/Community/…)
//     config: [ ...ha-form-Schema... ],   // eigene Einstellungen (optional)
//     // Hooks (alle optional):
//     style(ctx)    -> CSS-String (in den Shadow-Root der Karte)
//     decorate(root, ctx)         -> DOM nachträglich ergänzen
//   }
// ctx = { hass, config, settings, card }


const _modules = new Map();

function matches(target, cardType) {
  if (!target || target === "*") return true;
  if (Array.isArray(target)) return target.includes(cardType);
  return target === cardType;
}

const NeoModules = {
  register(manifest) {
    if (!manifest || !manifest.id) {
      console.warn("[Neo Module] Manifest ohne id ignoriert.");
      return null;
    }
    _modules.set(manifest.id, manifest); // overwrite on update
    neoLog(`[Neo Module] Registered: ${manifest.id} → ${manifest.target || "*"}`);
    return manifest;
  },
  unregister(id) {
    if (!id) return false;
    const removed = _modules.delete(id);
    if (removed) {
      neoLog(`[Neo Module] Unregistered: ${id}`);
      window.dispatchEvent(new CustomEvent("neo-module-changed"));
    }
    return removed;
  },
  get(id) { return _modules.get(id); },
  list() { return Array.from(_modules.values()); },
  // Passt ein target (Manifest oder Store-Eintrag) zu einer Karte?
  matches(target, cardType) { return matches(target, cardType); },
  // Nur Module, deren target zur Karte passt (für den Editor + Anzeige).
  forCard(cardType) {
    return Array.from(_modules.values()).filter((m) => matches(m.target, cardType));
  },
};

// Öffentliche API für externe/Premium-Module.
if (window.NeoDashboard) {
  window.NeoDashboard.modules = NeoModules;
  window.NeoDashboard.registerModule = (m) => NeoModules.register(m);
  window.NeoDashboard.unregisterModule = (id) => NeoModules.unregister(id);
}

// Neo Dashboard Kit — Design-Tokens
// Akzentfarben, geteiltes Karten-CSS (Shadow-DOM) und Editor-Optionen.

const NEO_ACCENTS = {
  blue:   { c: "#7C9CFF", glow: "rgba(124,156,255,0.35)" },
  amber:  { c: "#FFB26B", glow: "rgba(255,178,107,0.35)" },
  mint:   { c: "#5EDCB8", glow: "rgba(94,220,184,0.35)" },
  violet: { c: "#C084FC", glow: "rgba(192,132,252,0.35)" },
  rose:   { c: "#F87171", glow: "rgba(248,113,113,0.35)" },
};

// Geteiltes CSS, das jede Karte in ihren Shadow-Root spiegelt.
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
    /* Glow zentral: Karten setzen --neo-glow (mit Akzentfarbe) inline; sonst
       greift dieser neutrale Default. */
    box-shadow: var(--neo-glow, 0 18px 40px -16px var(--neo-shadow1));
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
  :host([data-neo-layout="tablet"]) .neo-card { padding:13px !important; min-height:124px !important; }
  :host([data-neo-layout="mobile"]) .neo-card { padding:10px !important; min-height:96px !important; }
  /* Auf dem Smartphone liegen die Karten nahezu randlos am Bildschirmrand – ein
     40px breiter Glow läuft dort über die Viewport-Kante und wirkt „abgeschnitten".
     Mobil daher ein engerer Schatten, der innerhalb des Karten-Abstands bleibt. */
  :host([data-neo-layout="mobile"]) .neo-card {
    box-shadow: var(--neo-glow-m, 0 8px 22px -14px var(--neo-shadow1)) !important;
  }
`;

// Akzent-Dropdown, von allen Karten-Editoren geteilt.
const NEO_ACCENT_OPTIONS = [
  { value: "blue", label: "Blau" },
  { value: "amber", label: "Amber" },
  { value: "mint", label: "Mint" },
  { value: "violet", label: "Violett" },
  { value: "rose", label: "Rosé" },
];

// Neo Dashboard Kit — Externe Links
// Im Editor unter "Info & Support" und vom Store (Karten & Module) genutzt.
// TODO: trage hier deine echte Patreon-/PayPal-/Ko-fi-URL ein.
const NEO_LINKS = {
  repo: "https://github.com/bkstudy2025/neo-dashboard-kit",
  issues: "https://github.com/bkstudy2025/neo-dashboard-kit/issues",
  patreon: "https://www.patreon.com/",
  paypal: "https://www.paypal.com/",
  kofi: "https://ko-fi.com/",
  // Community-Diskussionen (Support/Showcase/Wünsche). Hinweis: der Store
  // installiert NICHT aus Discussions, sondern aus dem kuratierten Katalog
  // (modulesIndex) — geprüft, versioniert, CDN-ausgeliefert. Der Link führt
  // direkt in die Einreichungs-Kategorie "Community Cards & Modules".
  newDiscussion: "https://github.com/bkstudy2025/neo-dashboard-kit/discussions/new?category=community-cards-modules",
  // Neo Store (Karten & Module) — Katalog liegt im Repo unter store/.
  // index.json wird LIVE geladen, ganz OHNE neuen Kit-Release/Bundle:
  //  - PRIMÄR über die GitHub-API (api.github.com/.../contents/...): Echtzeit,
  //    KEIN Pfad-CDN-Cache → frisch gemergte Versionen erscheinen sofort.
  //  - FALLBACK über raw.githubusercontent.com (falls die API mal scheitert,
  //    z. B. Rate-Limit) — ~5 min CDN-Cache.
  // Beide Quellen werden serverseitig über die Integration "Neo Dashboard Tools"
  // geladen (CORS) und sind dort auf genau diesen Pfad beschränkt.
  // Die einzelnen Modul-/Karten-Dateien (url im index.json) liegen auf jsDelivr
  // und sind auf einen Commit-SHA gepinnt (unveränderlich, nie stale).
  // index.json = [{ id, kind?, name, description, target, author, version, icon, image, url, homepage }]
  modulesIndex: "https://api.github.com/repos/bkstudy2025/neo-dashboard-kit/contents/store/index.json?ref=main",
  modulesIndexFallback: "https://raw.githubusercontent.com/bkstudy2025/neo-dashboard-kit/main/store/index.json",
  modulesRepo: "https://github.com/bkstudy2025/neo-dashboard-kit/tree/main/store",
};

// Neo Dashboard Kit — Branding
// Das Neo-Logo (icon.png) als optimiertes 128x128-PNG, direkt eingebettet
// (Data-URI) — offline-fest, kein CDN/Netzwerk nötig. Quelle: icon.png im Repo.
// Bei Logo-Änderung neu generieren (siehe scripts/build-logo, sonst manuell).
const NEO_LOGO = "data:image/png;base64,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";

// Liefert ein <img> mit dem Neo-Logo (quadratischer Badge).
function neoLogo({ size = 46, radius = 13 } = {}) {
  return `<img src="${NEO_LOGO}" alt="Neo" width="${size}" height="${size}" ` +
    `style="width:${size}px;height:${size}px;border-radius:${radius}px;object-fit:cover;display:block;" />`;
}

// Neo Dashboard Kit — small HTML escaping helpers

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function safeUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  // Relative HA/local paths are allowed; protocol-relative and malformed values
  // are intentionally not allowed for card/store-rendered links and images.
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;

  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch (_err) {
    return "";
  }
}

// Neo Dashboard Kit — Icon-Set (SF-symbol style SVG, ported from prototype)
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
  // Name kommt aus Karten-Configs → escapen (Attribut-Injection ausschließen).
  if (typeof name === "string" && name.includes(":")) {
    return `<ha-icon icon="${escapeAttr(name)}" style="--mdc-icon-size:${size}px;width:${size}px;height:${size}px;color:${color};display:flex;align-items:center;justify-content:center;line-height:0;flex-shrink:0"></ha-icon>`;
  }
  const inner = NEO_ICON_PATHS[name] || `<circle cx="12" cy="12" r="9"/>`;
  const paint = NEO_ICON_FILLED.has(name)
    ? `fill="currentColor"`
    : `fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="color:${color};display:block" ${paint}>${inner}</svg>`;
}

// Icon dropdown options for editors (alphabetisch, damit die Liste scanbar ist)
const NEO_ICON_OPTIONS = Object.keys(NEO_ICON_PATHS)
  .sort()
  .map((k) => ({ value: k, label: k }));

// Editor-Selector für Icon-Felder: rendert das eigene Feld-Element
// ha-selector-neo_icon (siehe icon-picker.js) — nativer HA-Icon-Picker
// (mdi:, hue:, … mit Vorschau) PLUS Neo-Icon-Raster mit SVG-Vorschau.
const NEO_ICON_SELECTOR = { neo_icon: {} };

// Neo Dashboard Kit — Responsives Layout (geteilt von ALLEN Karten)
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

// Neo Dashboard Kit — i18n
// Die UI ist in Deutsch verfasst (Quelle). neoT(hass, de) liefert die englische
// Übersetzung, wenn die HA-Sprache NICHT Deutsch ist — sonst den deutschen Text.
// So folgt die Oberfläche automatisch der Home-Assistant-Sprache (Englisch als
// Standard/international, Deutsch für deutsche Nutzer) ohne eigenen Schalter.
//
// Platzhalter: Strings können {name}/{author}/… enthalten und werden am
// Aufrufort per .replace() gefüllt.

// Deutsch → Englisch. Fehlt ein Eintrag, wird der deutsche Text zurückgegeben.
const EN = {
  // Sektionen
  "Kartentyp": "Card type",
  "Einstellungen": "Settings",
  // Startseite
  "Glassmorphism-Karten für dein Dashboard. Wähle oben einen <b>Kartentyp</b> — danach erscheinen hier die Einstellungen und rechts die Live-Vorschau.":
    "Glassmorphism cards for your dashboard. Pick a <b>card type</b> above — the settings appear here and the live preview on the right.",
  // Wrapper-Karte (Platzhalter & Lade-/Fehlertexte)
  "Wähle zuerst eine Karte: Header, Steuerung oder Anzeige. Danach wählst du den passenden Typ.":
    "Pick a card first: Header, Control or Display. Then choose the matching type.",
  "Unbekannter Neo-Kartentyp:": "Unknown Neo card type:",
  "Modul wird geladen …": "Loading module …",
  // Erweiterungen / Module
  "Module": "Modules",
  "Erweiterungen": "Extensions",
  "Für diese Karte sind noch keine Module aktiv. Über <b>➕ Modul hinzufügen</b> kommst du zum Store.":
    "No modules are active for this card yet. Use <b>➕ Add module</b> to open the store.",
  "<b>Karten</b> &amp; <b>Module</b> installieren (Store oder Code einfügen) — oder oben einen <b>Kartentyp</b> wählen, um Module für eine Karte zu aktivieren.":
    "Install <b>cards</b> &amp; <b>modules</b> (store or paste code) — or pick a <b>card type</b> above to enable modules for a card.",
  "Modul hinzufügen": "Add module",
  "Aktiv": "Active",
  "Aktive Module — klicke ein Modul an, um die Einstellungen zu bearbeiten.":
    "Active modules — click a module to edit its settings.",
  "Karte oder Modul installieren": "Install card or module",
  "Store": "Store",
  "Code einfügen": "Paste code",
  "Installiert": "Installed",
  // Store
  "⚠️ Für den Store wird die Integration <b>Neo Dashboard Tools</b> benötigt (serverseitiges Speichern + Laden).":
    "⚠️ The store needs the <b>Neo Dashboard Tools</b> integration (server-side save + load).",
  "Lade Store …": "Loading store …",
  "Store-Index konnte nicht geladen werden.": "Could not load the store index.",
  "Store-Index konnte nicht geladen werden. Prüfe die Internetverbindung und versuche es erneut.":
    "Could not load the store index. Check your internet connection and try again.",
  "Erneut": "Retry",
  "Offizieller Store": "Official store",
  "Store aktualisieren": "Refresh store",
  "Store wird aktualisiert …": "Refreshing store …",
  "Erweiterungen führen JavaScript in Home Assistant aus. Installiere nur vertrauenswürdige Erweiterungen.":
    "Extensions run JavaScript in Home Assistant. Only install extensions you trust.",
  "Community-Beitrag vorschlagen": "Suggest a community contribution",
  "Installiert (per Code eingefügt)": "Installed (pasted code)",
  "Aktuell keine Store-Module verfügbar. Premium-Karten (z. B. Wetter) fügst du über <b>Code einfügen</b> hinzu.":
    "No store modules available right now. Add premium cards (e.g. weather) via <b>Paste code</b>.",
  "✓ Installiert": "✓ Installed",
  "Installieren": "Install",
  "Aktualisieren": "Update",
  "Entfernen": "Remove",
  "von": "by",
  "Karte": "Card",
  "Modul": "Module",
  // Code einfügen
  "ℹ️ Ohne <b>Neo Dashboard Tools</b> wird das Modul nur für diese Sitzung geladen (nicht dauerhaft gespeichert).":
    "ℹ️ Without <b>Neo Dashboard Tools</b> the module loads for this session only (not saved permanently).",
  "Modul- oder Karten-Code einfügen (registerModule / registerCard, z. B. Premium-Karten) …":
    "Paste module or card code (registerModule / registerCard, e.g. premium cards) …",
  "Für Premium-Code (z. B. Patreon) oder privat geprüften Test-Code. Wird nicht über den öffentlichen Store verteilt.":
    "For premium code (e.g. Patreon) or privately reviewed test code. Not distributed via the public store.",
  "Premium- oder Test-Code einfügen": "Paste premium or test code",
  "Hinzufügen": "Add",
  // Meldungen
  "Bitte Code einfügen.": "Please paste some code.",
  "Code konnte nicht geladen werden.": "Could not load the code.",
  "Kein Modul/Karte erkannt (registerModule/registerCard fehlt?).":
    "No module/card detected (missing registerModule/registerCard?).",
  "✓ Karte „{name}” hinzugefügt — oben im Kartentyp wählbar.":
    "✓ Card “{name}” added — selectable in the card type above.",
  "✓ Karte „{name}” aktualisiert.": "✓ Card “{name}” updated.",
  "✓ Modul „{name}” hinzugefügt.": "✓ Module “{name}” added.",
  "✓ Modul „{name}” aktualisiert.": "✓ Module “{name}” updated.",
  "Speichern fehlgeschlagen: {err}": "Saving failed: {err}",
  "Integritätsprüfung fehlgeschlagen: Der geladene Code passt nicht zur Signatur im Store-Index. Nicht installiert.":
    "Integrity check failed: the downloaded code does not match the signature in the store index. Not installed.",
  "Installiere …": "Installing …",
  "Aktualisiere …": "Updating …",
  "✓ „{name}” installiert.": "✓ “{name}” installed.",
  "✓ „{name}” aktualisiert.": "✓ “{name}” updated.",
  "Installation fehlgeschlagen: {err}": "Installation failed: {err}",
  "Aktualisierung fehlgeschlagen: {err}": "Update failed: {err}",
  "Geladene Modulversion passt nicht zur Store-Version. Vermutlich CDN-Cache.":
    "Loaded module version does not match the store version. Likely a CDN cache.",
  "Geladener Code registriert nicht die erwartete Karte/Modul-ID (evtl. CDN-Fehlerseite). Nicht gespeichert.":
    "Loaded code did not register the expected card/module id (possibly a CDN error page). Not saved.",
  "Karte konnte nicht geladen werden: {err}. Falls das Kit gerade aktualisiert wurde, bitte einmal hart neu laden (Strg/Cmd+Shift+R).":
    "Card could not be loaded: {err}. If the kit was just updated, please do a hard reload once (Ctrl/Cmd+Shift+R).",
  "Update verfügbar": "Update available",
  "Installiert:": "Installed:", "Store:": "Store:",
  "Modul entfernt. (Bereits geladener Code verschwindet nach einem Reload.)":
    "Module removed. (Already-loaded code disappears after a reload.)",
  // Reorder / Aktionen
  "Layer nach oben": "Move layer up",
  "Layer nach unten": "Move layer down",
  "Modul entfernen": "Remove module",
  // Kartentyp-Picker
  "Kartentyp wählen …": "Choose a card type …",
  "🔍 Karte suchen …": "🔍 Search cards …",
  "Keine Treffer.": "No matches.",
  "Standard": "Standard",
  "Premium": "Premium",
  "Community": "Community",
  // Progressive Kartenauswahl (Bereich → Karte)
  "Bereich wählen": "Choose a category",
  "Karte wählen": "Choose a card",
  "Karte wählen …": "Choose a card …",
  "Wähle zuerst einen Bereich, um die passenden Karten zu sehen.":
    "Pick a category first to see the matching cards.",
  "In diesem Bereich gibt es noch keine Karten.":
    "There are no cards in this category yet.",
  "Premium- und Community-Karten fügst du unten über <b>Erweiterungen</b> hinzu.":
    "Add premium and community cards via <b>Extensions</b> below.",
  // Info & Support
  "Info &amp; Support": "Info &amp; Support",
  "Ressourcen &amp; Hilfe": "Resources &amp; help",
  "Fragen oder ein Problem? Die Doku und die Community helfen weiter.":
    "Questions or a problem? The docs and the community can help.",
  "📖 Dokumentation": "📖 Documentation",
  "🐞 Probleme melden": "🐞 Report issues",
  "💬 Diskussionen": "💬 Discussions",
  "❤️ Projekt unterstützen": "❤️ Support the project",
  "Hi! Ich entwickle <b>Neo Dashboard Kit</b> in meiner Freizeit und stecke viel Herzblut hinein. Wenn es dir gefällt, ist jede Unterstützung eine riesige Motivation — so kann ich weiter neue Karten &amp; Module bauen. Auf Patreon gibt es außerdem exklusive Premium-Karten und Vorlagen.":
    "Hi! I build <b>Neo Dashboard Kit</b> in my spare time and put a lot of heart into it. If you enjoy it, any support is huge motivation — it lets me keep building new cards &amp; modules. Patreon also has exclusive premium cards and templates.",
  "☕ Kaffee spendieren": "☕ Buy me a coffee",
  "💳 PayPal": "💳 PayPal",
  "♥ Patreon": "♥ Patreon",
  "Danke, dass du Teil dieser Community bist! 🎉": "Thanks for being part of this community! 🎉",

  // ── Karten: Render-Texte ──
  "An": "On", "Aus": "Off", "Bereit": "Idle", "Auto": "Auto",
  "Schalter": "Switch", "Helligkeit": "Brightness", "Stufe": "Speed",
  "Verriegelt": "Locked", "Entriegelt": "Unlocked", "Schloss": "Lock",
  "Ventilator": "Fan", "Rollladen": "Cover", "Klima": "Climate", "Media": "Media",
  "Öffnen": "Open", "Stopp": "Stop", "Schließen": "Close",
  "Offen": "Open", "Geschlossen": "Closed", "Öffnet": "Opening", "Schließt": "Closing",
  "% offen": "% open",
  "Heizt": "Heating", "Kühlt": "Cooling", "Entfeuchtet": "Drying", "Lüftet": "Fan",
  "Heizen": "Heat", "Kühlen": "Cool", "Aktuell": "Current",
  "Spielt": "Playing", "Pausiert": "Paused", "Standby": "Standby", "Puffert": "Buffering",
  // capability-aware Controls & Aktionen
  "Nicht verfügbar": "Unavailable",
  "Position": "Position", "Neigung": "Tilt",
  "Lautstärke": "Volume", "Stumm": "Mute", "Quelle": "Source",
  "Modus": "Mode", "Voreinstellung": "Preset", "Lüftung": "Fan mode",
  "Schwenken": "Swing", "Luftfeuchte": "Humidity",
  "Oszillation": "Oscillate", "Richtung": "Direction",
  "Entfeuchten": "Dry", "Lüften": "Fan only",
  "Jalousie": "Blind", "Vorhang": "Curtain", "Garage": "Garage", "Tür": "Door",
  "Tor": "Gate", "Fenster": "Window", "Markise": "Awning", "Rollo": "Shade",
  "Aktion wirklich ausführen?": "Really run this action?",
  // Editor: Aktionen-Abschnitt (übrige Action-Felder übersetzt HA selbst)
  "Aktionen": "Actions", "Tippen": "Tap", "Halten": "Hold", "Doppeltippen": "Double tap",
  // Editor: Sichtbarkeits-Schalter
  "Schalter anzeigen": "Show toggle", "Helligkeit anzeigen": "Show brightness",
  "Stufe anzeigen": "Show speed", "Voreinstellungen anzeigen": "Show presets",
  "Oszillation anzeigen": "Show oscillate", "Richtung anzeigen": "Show direction",
  "Auf/Stopp/Zu anzeigen": "Show open/stop/close", "Position anzeigen": "Show position",
  "Neigung anzeigen": "Show tilt", "Temperatur-Steuerung anzeigen": "Show temperature controls",
  "Modi anzeigen": "Show modes", "Lüftungsstufen anzeigen": "Show fan modes",
  "Schwenken anzeigen": "Show swing", "Luftfeuchte anzeigen": "Show humidity",
  "Transport anzeigen": "Show transport", "Lautstärke anzeigen": "Show volume",
  "Stumm anzeigen": "Show mute", "Quelle anzeigen": "Show source", "Power anzeigen": "Show power",
  "Bedienelemente anzeigen": "Show controls",
  "Unscharf": "Disarmed", "Zuhause": "Home", "Abwesend": "Away", "Alarm": "Alarm",
  "Scharf · Zuhause": "Armed · Home", "Scharf · Abwesend": "Armed · Away",
  "Scharf · Nacht": "Armed · Night", "Scharf · Urlaub": "Armed · Vacation",
  "Aktiviert …": "Arming …", "Eingang …": "Entry …", "ALARM": "ALARM",
  "Szene": "Scene", "Taster": "Button", "Skript": "Script", "Aktion": "Action",
  "an": "on",
  "Wert": "Value", "Kamera": "Camera", "Sensor": "Sensor", "Licht-Gruppe": "Light group",
  "Wähle einen Gerätetyp, um die Vorschau zu starten": "Pick a device type to start the preview",
  "Wähle einen Anzeige-Typ, um die Vorschau zu starten": "Pick a display type to start the preview",
  "Sensor / Wert": "Sensor / Value", "Batterie": "Battery", "Status": "Status",
  "Person / Anwesenheit": "Person / Presence", "Wetter": "Weather",
  "Kalender / Termin": "Calendar / Event", "Kalender": "Calendar", "Keine Termine": "No events",
  "Kennzahl": "Metric", "Titel (optional)": "Title (optional)",
  "Text / Markdown eingeben …": "Enter text / markdown …",
  // Wetter-Zustände (Display: Wetter-Typ)
  "Sonnig": "Sunny", "Klar": "Clear", "Bewölkt": "Cloudy", "Teils bewölkt": "Partly cloudy",
  "Regen": "Rain", "Starkregen": "Heavy rain", "Schnee": "Snow", "Schneeregen": "Sleet",
  "Windig": "Windy", "Nebel": "Fog", "Hagel": "Hail", "Gewitter": "Thunderstorm", "Extrem": "Severe",

  // ── Editor: Feld-Labels & Abschnitte (zentral in makeEditor übersetzt) ──
  "Allgemein": "General", "Darstellung": "Appearance",
  "Entität": "Entity", "Entität (Gerät)": "Entity (device)",
  "Name (optional)": "Name (optional)", "Untertitel (optional)": "Subtitle (optional)",
  "Icon": "Icon", "Icon (optional)": "Icon (optional)",
  "Akzentfarbe": "Accent color", "Akzentfarbe (optional)": "Accent color (optional)",
  "Einheit (optional)": "Unit (optional)", "Lichter": "Lights",
  "Temperaturschritt (optional)": "Temperature step (optional)",
  "Code (optional, falls erforderlich)": "Code (optional, if required)",
  "Typ": "Type", "Titel (bei Trenner optional)": "Title (optional for divider)",
  "Inhalt": "Content", "Titel": "Title",
  "Trenner-Label (optional)": "Divider label (optional)",
  "Layout / Gerät": "Layout / device",
  // Optionen
  "Blau": "Blue", "Amber": "Amber", "Mint": "Mint", "Violett": "Violet", "Rosé": "Rosé",
  "Automatisch (Bildschirmbreite)": "Automatic (screen width)",
  "Mobil (kompakt)": "Mobile (compact)", "Tablet": "Tablet", "Desktop (groß)": "Desktop (large)",
  "Überschrift": "Heading", "Trenner": "Divider",
  "Licht": "Light", "Szene / Skript / Taster": "Scene / Script / Button",
  // Karten-Namen & -Beschreibungen (Picker + Editor-Kopf)
  "Neo Steuerung": "Neo Control", "Neo Anzeige": "Neo Display",
  "Neo Ventilator": "Neo Fan", "Neo Kamera": "Neo Camera", "Neo Klima": "Neo Climate",
  "Neo Cover": "Neo Cover", "Neo Media": "Neo Media", "Neo Licht-Gruppe": "Neo Light Group",
  "Eine Karte für alle Geräte — passt sich automatisch an die Entität an":
    "One card for all devices — adapts automatically to the entity",
  "Eine Karte für alle Geräte — passt sich an": "One card for all devices — it adapts",
  "Sensorwert, Kamera oder Status — passt sich an die Entität an":
    "Sensor value, camera or status — adapts to the entity",
  "Sensor · Kamera · Status": "Sensor · Camera · Status",
  "Überschrift / Trenner zum Strukturieren": "Heading / divider for structure",
  "Überschrift / Trenner": "Heading / Divider",
  "Neo Karte": "Neo Card",
  // Store: Update/Entfernen/Info
  "Update": "Update", "Info": "Info",
  "Per Code eingefügt — Update durch erneutes Einfügen.": "Pasted code — update by pasting again.",
  "Entfernen fehlgeschlagen: {err}": "Removal failed: {err}",
  "Modul entfernt.": "Module removed.",
  "Karte entfernt — zum vollständigen Entladen einmal neu laden.":
    "Card removed — reload once to fully unload it.",
};

function neoLang(hass) {
  return (hass && hass.language ? String(hass.language) : "en").slice(0, 2).toLowerCase();
}

// Übersetzt den deutschen Quelltext je nach HA-Sprache.
function neoT(hass, de) {
  if (neoLang(hass) === "de") return de;
  return EN[de] || de;
}

// Neo Dashboard Kit — Shared ha-form editor factory
// HA's <ha-form> needs real JS properties (.schema/.data) — they cannot be
// passed as stringified HTML attributes. This helper creates the element and
// binds properties correctly. meta: { name, description, icon } renders a header.
//
// Labels, Abschnitts-Titel und Select-Optionen werden über i18n nach der
// HA-Sprache übersetzt (Deutsch = Quelle, Englisch = Standard).
//
// ── Konditionale Schemas (Referenzmuster, siehe neo-header-card) ──
// `schema` darf entweder ein statisches Array sein (abwärtskompatibel) oder eine
// Funktion (config, hass) => schema[]. Letztere erlaubt Progressive Disclosure:
// erst Komponente/Variante wählen, dann erscheinen nur die passenden Felder.
// Damit der Tippfokus erhalten bleibt, wird das ha-form NICHT bei jeder Eingabe
// neu gebaut, sondern nur wenn sich ein „strukturbestimmendes" Feld ändert
// (meta.rebuildKeys, z. B. ["variant"]). Sonst wird nur .schema/.data aktualisiert.
//
// meta.normalizeConfig(config) => config (optional): normalisiert die Config beim
// Laden und nach Strukturwechseln — z. B. um Legacy-Configs auf einen expliziten
// Typ zu migrieren oder beim Typwechsel nicht mehr passende Keys zurückzusetzen.

// Übersetzt label / title / select-options eines ha-form-Schemas (rekursiv).
function neoTranslateSchema(hass, schema) {
  return schema.map((item) => {
    const out = { ...item };
    if (out.label) out.label = neoT(hass, out.label);
    if (out.title) out.title = neoT(hass, out.title);
    if (Array.isArray(out.schema)) out.schema = neoTranslateSchema(hass, out.schema);
    const sel = out.selector && out.selector.select;
    if (sel && Array.isArray(sel.options)) {
      out.selector = {
        ...out.selector,
        select: {
          ...sel,
          options: sel.options.map((o) =>
            (o && typeof o === "object" && "label" in o) ? { ...o, label: neoT(hass, o.label) } : o),
        },
      };
    }
    return out;
  });
}

// Sammelt rekursiv alle Feld-Namen eines Schemas (inkl. expandable/grid-Gruppen).
// Dient dem Pruning: nur Keys, die dieser Editor verwaltet, dürfen entfernt werden.
function neoCollectFieldNames(schema, acc = new Set()) {
  for (const item of schema || []) {
    if (item && item.name) acc.add(item.name);
    if (item && Array.isArray(item.schema)) neoCollectFieldNames(item.schema, acc);
  }
  return acc;
}

function makeNeoEditor(schema, meta = {}) {
  const isFn = typeof schema === "function";
  const rebuildKeys = Array.isArray(meta.rebuildKeys) ? meta.rebuildKeys : [];

  return class extends HTMLElement {
    constructor() {
      super();
      // Vereinigung aller je angezeigten Feld-Namen → Universum der „verwalteten" Keys.
      // Nur diese dürfen beim Varianten-Wechsel geprunt werden (nie fremde/Meta-Keys).
      this._managedKeys = new Set();
    }

    // Schema für den aktuellen Zustand auflösen (Array = statisch, Funktion = konditional).
    _resolveSchema(config) {
      return isFn ? (schema(config || {}, this._hass) || []) : schema;
    }

    // Strukturbestimmende Änderung? Dann muss das ha-form neu bestückt werden.
    // Statisches Schema ändert nie seine Struktur → nie Rebuild bei Eingaben.
    _isStructuralChange(next) {
      if (!isFn) return false;
      if (rebuildKeys.length)
        return rebuildKeys.some((k) => next?.[k] !== this._config?.[k]);
      // Fallback ohne explizite rebuildKeys: Feld-Namen-Signatur vergleichen.
      return this._fieldSig(next) !== this._fieldSig(this._config);
    }
    _fieldSig(config) {
      return [...neoCollectFieldNames(this._resolveSchema(config))].sort().join("|");
    }

    // Entfernt verwaltete Keys, die im aktuellen Zustand nicht (mehr) gültig sind.
    // So schleppt die Config keine unsichtbaren Felder einer anderen Variante mit.
    _pruneStaleKeys() {
      const valid = neoCollectFieldNames(this._resolveSchema(this._config));
      for (const k of this._managedKeys)
        if (!valid.has(k) && k in this._config) delete this._config[k];
    }

    // ha-form mit aufgelöstem + übersetztem Schema und aktuellen Daten bestücken.
    _applySchema() {
      const resolved = this._resolveSchema(this._config);
      neoCollectFieldNames(resolved, this._managedKeys); // Universum erweitern
      this._form.schema = neoTranslateSchema(this._hass, resolved);
      this._form.data = this._config || {};
      this._structSig = this._sig(this._config);
    }
    _sig(config) {
      return rebuildKeys.map((k) => String(config?.[k])).join("::");
    }

    // Optionaler Hook: normalisiert die Config (z. B. Legacy → expliziter Typ,
    // oder Zurücksetzen nicht mehr passender Keys bei Strukturwechsel). Läuft bei
    // setConfig (Anzeige) und nach strukturellen Änderungen (vor dem Dispatch).
    _normalize(cfg) {
      return typeof meta.normalizeConfig === "function" ? (meta.normalizeConfig(cfg) || cfg) : cfg;
    }

    setConfig(config) {
      this._config = this._normalize({ ...config });
      if (!this._form) { this._build(); return; }
      // Rebuild-Guard: Schema nur neu setzen, wenn sich die Struktur ändert
      // (sonst nur .data → ha-form behält Fokus/Cursorposition).
      if (isFn && this._sig(this._config) !== this._structSig) this._applySchema();
      else this._form.data = this._config;
    }
    set hass(hass) {
      const langChanged = this._lang !== undefined && this._lang !== neoLang(hass);
      this._hass = hass;
      this._lang = neoLang(hass);
      if (this._form) {
        this._form.hass = hass;
        if (langChanged) this._build(); // Sprache gewechselt → Labels neu übersetzen
      }
    }
    _t(s) { return neoT(this._hass, s); }

    _build() {
      this.innerHTML = ""; // idempotent (auch beim Sprachwechsel-Rebuild)
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
          <div class="neo-editor-meta-name">${this._t(meta.name || "Neo Karte")}</div>
          <div class="neo-editor-meta-desc">${this._t(meta.description || "")}</div>
        </div>
      `;
      this.appendChild(header);

      this._form = document.createElement("ha-form");
      if (this._hass) this._form.hass = this._hass;
      this._form.computeLabel = (s) => neoT(this._hass, s.label || s.name);
      this._form.addEventListener("value-changed", (e) => {
        const next = { ...e.detail.value };
        const structural = this._isStructuralChange(next);
        this._config = next;
        if (structural) {
          this._pruneStaleKeys();                  // veraltete Felder der Vorvariante verwerfen
          this._config = this._normalize(this._config); // Invarianten erzwingen (z. B. Entität zurücksetzen)
          this._applySchema();                     // passende Felder einblenden (gezielter Rebuild)
        }
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true, composed: true,
        }));
      });
      this._applySchema(); // initiales Schema (statisch oder konditional) bestücken
      this.appendChild(this._form);
    }
  };
}

// Neo Dashboard Kit — Icon-Selector für Editoren (ha-form-kompatibel)
//
// Ein Icon-Feld, das BEIDES kann:
//   1. den nativen HA-Icon-Picker einbetten (mdi:, hue: und alle registrierten
//      Sets — mit Suche und Grafik-Vorschau), und
//   2. die mitgelieferten Neo-Icons als aufklappbares Raster mit ECHTER
//      SVG-Vorschau anbieten (der native Picker kennt sie nicht, weil HAs
//      Custom-Icon-API nur gefüllte Einzel-Pfade unterstützt — die Neo-Icons
//      sind stroke-basierte Mehrfach-Shapes).
//
// Einbindung über HAs Selector-Mechanismus: ha-form rendert für den Selector
// { neo_icon: {} } das Element `ha-selector-neo_icon` und setzt hass/label/
// value als Properties; Änderungen melden wir als `value-changed` zurück —
// exakt wie native Selectors. Wertformat bleibt kompatibel: Neo-Namen ohne
// Präfix ("search"), HA-Icons mit Präfix ("mdi:sofa").

const NEO_NAMES = new Set(NEO_ICON_OPTIONS.map((o) => o.value));

class NeoIconSelectorField extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._value = "";
  }

  // ── Properties, die ha-form/dynamicElement setzt ─────────────
  set hass(h) { this._hass = h; if (this._sel) this._sel.hass = h; }
  get hass() { return this._hass; }
  set selector(s) { this._selectorCfg = s; }
  get selector() { return this._selectorCfg; }
  set label(l) { this._labelTxt = l; if (this._sel) this._sel.label = l; }
  get label() { return this._labelTxt; }
  set helper(h) { this._helperTxt = h; }
  set disabled(d) { this._disabled = !!d; if (this._sel) this._sel.disabled = this._disabled; }
  // Muss an den inneren Picker durchgereicht werden: ha-selector hat
  // required=true als Default und zeigt sonst fälschlich ein Pflicht-„*".
  set required(r) { this._required = !!r; if (this._sel) this._sel.required = this._required; }
  set value(v) {
    const nv = v == null ? "" : String(v);
    if (nv === this._value) return;
    this._value = nv;
    this._sync();
  }
  get value() { return this._value; }

  connectedCallback() { if (!this._built) this._build(); }

  _t(s) { return neoT(this._hass, s); }

  _build() {
    this._built = true;
    const sr = this.shadowRoot;
    sr.innerHTML = `
      <style>
        :host { display:block; }
        #native ha-selector { display:block; }
        .neo-chip {
          display:flex; align-items:center; gap:8px; margin-top:6px;
          padding:6px 8px; border-radius:10px;
          background: var(--secondary-background-color, rgba(127,127,127,.12));
          border: 1px solid var(--divider-color, rgba(127,127,127,.25));
          color: var(--primary-text-color, inherit); font-size:13px;
        }
        .neo-chip .ic {
          width:26px; height:26px; border-radius:8px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          background: var(--card-background-color, rgba(127,127,127,.15));
        }
        .neo-chip .nm { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .neo-chip button {
          all:unset; cursor:pointer; padding:2px 6px; border-radius:6px; line-height:1;
          color: var(--secondary-text-color, inherit);
        }
        .neo-chip button:hover { background: var(--divider-color, rgba(127,127,127,.25)); }
        #toggle {
          all:unset; box-sizing:border-box; width:100%; cursor:pointer;
          display:flex; align-items:center; gap:10px;
          margin-top:8px; padding:10px 12px; border-radius:12px;
          font-size:14px; font-weight:500;
          color: var(--primary-text-color, inherit);
          background: var(--secondary-background-color, rgba(127,127,127,.08));
          border: 1px solid var(--divider-color, rgba(127,127,127,.2));
          transition: border-color .15s ease, background .15s ease;
        }
        #toggle:hover { border-color: var(--primary-color, #7C9CFF); }
        #toggle:focus-visible { outline: 2px solid var(--primary-color, #7C9CFF); outline-offset: 2px; }
        #toggle .cnt { color: var(--secondary-text-color, inherit); font-size:12px; font-weight:400; }
        #toggle .sp { flex:1; }
        #toggle .peek { display:flex; align-items:center; gap:7px; color: var(--secondary-text-color, inherit); opacity:.9; }
        #toggle .chev { display:flex; align-items:center; transition: transform .18s ease; color: var(--secondary-text-color, inherit); }
        #toggle.open .chev { transform: rotate(180deg); }
        #grid {
          display:grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap:6px;
          margin-top:6px; padding:10px; max-height:236px; overflow-y:auto;
          border-radius:12px; box-sizing:border-box;
          background: var(--secondary-background-color, rgba(127,127,127,.08));
          border: 1px solid var(--divider-color, rgba(127,127,127,.2));
        }
        #grid button {
          all:unset; box-sizing:border-box; cursor:pointer; height:42px; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          color: var(--primary-text-color, inherit);
          transition: background .12s ease, transform .12s ease, color .12s ease;
        }
        #grid button:hover {
          background: var(--divider-color, rgba(127,127,127,.25));
          color: var(--primary-color, #7C9CFF);
          transform: scale(1.08);
        }
        #grid button.sel {
          outline: 2px solid var(--primary-color, #7C9CFF);
          background: rgba(124,156,255,.16);
          color: var(--primary-color, #7C9CFF);
        }
        [hidden] { display:none !important; }
      </style>
      <div id="native"></div>
      <div id="chip" class="neo-chip" hidden></div>
      <button type="button" id="toggle">
        <span>🧩 Neo-Icons</span><span class="cnt">(${NEO_ICON_OPTIONS.length})</span>
        <span class="sp"></span>
        <span class="peek">${["lightbulb", "thermo", "camera", "bell"].map((n) => neoIcon(n, { size: 16 })).join("")}</span>
        <span class="chev">${neoIcon("chevD", { size: 16 })}</span>
      </button>
      <div id="grid" hidden></div>
    `;

    // Nativer HA-Picker über <ha-selector> (im Editor-Kontext immer definiert;
    // lädt seinerseits ha-selector-icon/ha-icon-picker nach). Fallback: Textfeld.
    const native = sr.getElementById("native");
    if (customElements.get("ha-selector")) {
      const sel = document.createElement("ha-selector");
      sel.selector = { icon: {} };
      if (this._hass) sel.hass = this._hass;
      if (this._labelTxt) sel.label = this._labelTxt;
      if (this._disabled) sel.disabled = true;
      // ha-selector-Default ist required=true (zeigt sonst fälschlich „*").
      sel.required = !!this._required;
      sel.addEventListener("value-changed", (e) => {
        e.stopPropagation(); // wir melden selbst (einheitlich für beide Quellen)
        this._set(e.detail?.value || "");
      });
      native.appendChild(sel);
      this._sel = sel;
    } else {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.placeholder = this._labelTxt || "Icon";
      inp.style.cssText = "width:100%;box-sizing:border-box;padding:8px;border-radius:8px;border:1px solid var(--divider-color,#888);background:transparent;color:inherit;";
      inp.addEventListener("change", () => this._set(inp.value.trim()));
      native.appendChild(inp);
      this._inp = inp;
    }

    // Neo-Raster: lazy befüllt beim ersten Aufklappen (~80 Inline-SVGs).
    const toggle = sr.getElementById("toggle");
    const grid = sr.getElementById("grid");
    toggle.addEventListener("click", () => {
      if (grid.hidden && !grid.childElementCount) {
        grid.innerHTML = NEO_ICON_OPTIONS.map((o) =>
          `<button type="button" data-v="${escapeAttr(o.value)}" title="${escapeAttr(o.value)}">${neoIcon(o.value, { size: 22 })}</button>`
        ).join("");
      }
      grid.hidden = !grid.hidden;
      toggle.classList.toggle("open", !grid.hidden);
      this._markSelection();
    });
    grid.addEventListener("click", (e) => {
      const b = e.target.closest?.("[data-v]");
      if (b) this._set(b.dataset.v);
    });

    // Chip: aktuelle Neo-Auswahl mit echter Vorschau (der native Picker kann
    // Neo-Namen nicht rendern) + Entfernen-Button.
    sr.getElementById("chip").addEventListener("click", (e) => {
      if (e.target.closest?.("[data-clear]")) this._set("");
    });

    this._sync();
  }

  _set(v) {
    this._value = v || "";
    this._sync();
    this.dispatchEvent(new CustomEvent("value-changed", {
      detail: { value: this._value || undefined },
      bubbles: true,
      composed: true,
    }));
  }

  _sync() {
    if (!this._built) return;
    const isNeo = NEO_NAMES.has(this._value);
    // Nativer Picker zeigt nur präfixierte Werte (Neo-Namen kennt er nicht).
    const nativeVal = (!isNeo && this._value) ? this._value : "";
    if (this._sel && this._sel.value !== nativeVal) this._sel.value = nativeVal;
    if (this._inp) this._inp.value = this._value;

    const chip = this.shadowRoot.getElementById("chip");
    if (isNeo) {
      chip.hidden = false;
      chip.innerHTML = `
        <span class="ic">${neoIcon(this._value, { size: 18 })}</span>
        <span class="nm">${escapeAttr(this._value)}</span>
        <button type="button" data-clear title="${escapeAttr(this._t("Entfernen"))}">✕</button>`;
    } else {
      chip.hidden = true;
    }
    this._markSelection();
  }

  _markSelection() {
    const grid = this.shadowRoot.getElementById("grid");
    if (!grid || grid.hidden) return;
    grid.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("sel", b.dataset.v === this._value);
    });
  }
}

if (!customElements.get("ha-selector-neo_icon")) {
  customElements.define("ha-selector-neo_icon", NeoIconSelectorField);
}

// Neo Dashboard Kit — Reorder-Liste für Editoren (▲ ▼ 🗑)
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

// Neo Dashboard Kit — Home-Assistant-style action system
// Shared tap/hold/double-tap action handling for all core cards.
// Supported actions: more-info · toggle · navigate · url · call-service · none.
// Designed to be robust: an incomplete or invalid action config never throws.


const NEO_ACTION_DEFAULT_CONFIRM = "Aktion wirklich ausführen?";

// Normalize an action config — accepts the object form or a string shorthand
// ("more-info"), returns an object { action, … } or null.
function neoNormalizeAction(raw) {
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
function neoExecuteAction(raw, helpers = {}) {
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

// Neo Dashboard Kit — Base Card
// All Neo cards (core + community) extend this class. Handles the shared
// shadow-root styling, responsive layout and performance-gated re-renders.


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
function neoActionFields(opts = {}) {
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
function neoCleanActions(cfg) {
  for (const k of ["tap_action", "hold_action", "double_tap_action"]) {
    const v = cfg[k];
    if (v == null) { delete cfg[k]; continue; }
    if (typeof v === "object" && (!v.action || v.action === "default")) delete cfg[k];
  }
  return cfg;
}

// Neo Dashboard Kit — Capability registry / typed-editor generator
//
// Deklarative Struktur, mit der Standard-, Premium- und Community-Karten
// DIESELBE Editor-/Preview-/Pruning-Logik verwenden — ohne Sonder-UX. Eine Karte
// liefert nur ein Spec; daraus werden das konditionale ha-form-Schema, die
// rebuildKeys und normalizeConfig erzeugt. Bewusst entlang der echten Muster aus
// Header/Control/Display abstrahiert (nicht spekulativ).
//
// Spec-Form (card_type → supported_types → entity_domains → editor_schema →
// preview_placeholder → prune_keys):
//   {
//     typeKey:   "display_type",     // strukturbestimmender Config-Key ('type' ist von Lovelace belegt)
//     typeLabel: "Typ",
//     entityLabel: "Entität",
//     types: [ {
//       value, label, icon, mode,     // mode = Render-Art der Karte
//       domains?: [],                 // erlaubte Entitäts-Domains (Picker-Filter + Typ-Ableitung)
//       device_class?: "",            // optionaler Entity-device_class-Filter
//       source?: "text",              // 'text' → Content-Feld statt Entität
//       multi?: true,                 // Multi-Entity → 'entities' statt 'entity' (z. B. Licht-Gruppe)
//       entityLabel?: "Lichter",      // eigenes Label für den (Multi-)Picker
//       fields?: [],                  // zusätzliche allgemeine Felder dieses Typs (z. B. step/code)
//       unit?: true,                  // Einheiten-Feld (Darstellung)
//     } ],
//     appearance?: [],                // zusätzliche Darstellungs-Felder (z. B. accent, layout)
//   }
//
// Gemeinsame Garantien (für alle Karten gleich):
//  - Typ zuerst → danach nur passende Entität/Quelle und Optionen
//  - Kein Typ → die Karte rendert ihren Empty-State (mode-basiert, kartenseitig)
//  - Typwechsel: unpassende Entität wird verworfen, alte Keys werden geprunt
//  - Rebuild-Guard via rebuildKeys → kein Fokusverlust
//  - Editor UND Rendering leiten den Typ aus derselben Map ab (neoCapabilityType)

const domainOf = (id) => (id ? String(id).split(".")[0] : "");
const neoTypeDef = (spec, t) => spec.types.find((x) => x.value === t);

// Entitäts-Domain → Typ (Legacy-Migration; erste passende Domain gewinnt).
function typeByDomain(spec, d) {
  if (!d) return "";
  const hit = spec.types.find((x) => Array.isArray(x.domains) && x.domains.includes(d));
  return hit ? hit.value : "";
}

// Effektiver Typ: expliziter typeKey, sonst aus Entität/Entities abgeleitet.
function neoCapabilityType(config, spec) {
  if (config?.[spec.typeKey]) return config[spec.typeKey];
  if (config?.entities?.length) {
    const m = spec.types.find((x) => x.multi);
    if (m) return m.value; // Multi-Entity-Typ (z. B. Licht-Gruppe)
  }
  return typeByDomain(spec, domainOf(config?.entity)) || "";
}

// Invarianten: Legacy → Typ migrieren; Quelle (Entität/Entities) passend halten.
function neoCapabilityNormalize(config, spec) {
  const cfg = { ...config };
  if (!cfg[spec.typeKey]) {
    const m = spec.types.find((x) => x.multi);
    if (cfg.entities?.length && m) cfg[spec.typeKey] = m.value;
    else { const t = typeByDomain(spec, domainOf(cfg.entity)); if (t) cfg[spec.typeKey] = t; }
  }
  neoCleanActions(cfg); // leere/Default-Aktionen verwerfen (Editor schreibt undefined bei „Standard")
  const t = cfg[spec.typeKey];
  if (!t) return cfg;
  const def = neoTypeDef(spec, t);
  // Sichtbarkeits-Defaults explizit setzen, damit die Editor-Schalter den
  // tatsächlichen (Default = an) Zustand anzeigen. Nur fehlende Keys, nie
  // explizite false-Werte überschreiben (bestehende YAML bleibt unangetastet).
  if (def?.defaults) for (const [k, v] of Object.entries(def.defaults)) if (cfg[k] == null) cfg[k] = v;
  if (def?.source === "text") { delete cfg.entity; delete cfg.entities; return cfg; } // Text-Quelle: keine Entität
  if (def?.multi) { delete cfg.entity; return cfg; }   // Multi nutzt 'entities'
  delete cfg.entities;                                 // Single-Typ nutzt 'entity'
  const d = domainOf(cfg.entity);
  if (d && def && def.domains?.length && !def.domains.includes(d)) delete cfg.entity; // Mismatch-Reset
  return cfg;
}

// Konditionales ha-form-Schema aus dem Spec (für makeNeoEditor).
function buildCapabilitySchema(config, spec) {
  const t = neoCapabilityType(config, spec);
  const def = neoTypeDef(spec, t);
  const hasLegacyEntity = !!(config?.entity || config?.entities?.length);
  const entityLabel = (def && def.entityLabel) || spec.entityLabel || "Entität";
  const general = [
    {
      name: spec.typeKey, label: spec.typeLabel || "Typ",
      selector: { select: { mode: "dropdown", options: spec.types.map(({ value, label }) => ({ value, label })) } },
    },
  ];
  if (def?.source === "text") {
    general.push(
      { name: "content", label: "Text / Markdown", selector: { text: { multiline: true } } },
      { name: "name", label: "Titel (optional)", selector: { text: {} } },
    );
  } else if (def?.multi) {
    // Multi-Entity (z. B. Licht-Gruppe) → 'entities' statt 'entity'.
    general.push(
      { name: "entities", label: entityLabel,
        selector: { entity: { ...(def.domains?.length ? { domain: def.domains } : {}), multiple: true } } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
    );
    (def.fields || []).forEach((f) => general.push(f));
  } else if (t || hasLegacyEntity) {
    const entSel = def && def.domains?.length
      ? { domain: def.domains, ...(def.device_class ? { device_class: def.device_class } : {}) }
      : {}; // keine/leere Domains (z. B. Badge, Legacy) → ungefilterter Picker
    general.push(
      { name: "entity", label: entityLabel, selector: { entity: entSel } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
    );
    (def?.fields || []).forEach((f) => general.push(f));
  }

  const sections = [
    { type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true, schema: general },
  ];

  // Empty-State: ohne gewählten Typ und ohne Legacy-Entität nur den Typ-Picker
  // anzeigen. Darstellungsfelder würden sonst versteckte Optionen suggerieren.
  if (t || hasLegacyEntity) {
    const appearance = [];
    // Eigenes Icon-Feld: nativer HA-Picker + Neo-Icon-Raster (icon-picker.js).
    if (def?.source !== "text") appearance.push({ name: "icon", label: "Icon", selector: NEO_ICON_SELECTOR });
    if (def?.unit) appearance.push({ name: "unit", label: "Einheit (optional)", selector: { text: {} } });
    (spec.appearance || []).forEach((f) => appearance.push(f));
    sections.push({ type: "expandable", title: "Darstellung", icon: "mdi:palette", schema: appearance });

    // Aktionen (tap/hold/double_tap) — opt-in per Spec, eigener Abschnitt.
    if (spec.actions) sections.push(neoActionFields(spec.actionDefaults || {}));
  }

  return sections;
}

// Erzeugt die Editor-Custom-Element-Klasse aus einem Capability-Spec.
// meta: { name, description, icon } für den Editor-Kopf.
function makeNeoTypedEditor(spec, meta = {}) {
  return makeNeoEditor((config) => buildCapabilitySchema(config, spec), {
    ...meta,
    rebuildKeys: [spec.typeKey],
    normalizeConfig: (config) => neoCapabilityNormalize(config, spec),
  });
}

// Neo Dashboard Kit — Entity capability helpers
// Small, defensive helpers that answer "does this entity support feature X?".
// Used by Neo Control so it only renders controls the entity actually supports.
// Everything is attribute-first (works without supported_features) and never
// throws when attributes are missing.

// ── Generic ──────────────────────────────────────────────────
function isUnavailable(s) {
  const st = s?.state;
  return !s || st === "unavailable" || st === "unknown";
}
function hasAttribute(s, name) {
  return !!s?.attributes && s.attributes[name] != null;
}
function hasFeature(s, bit) {
  const f = s?.attributes?.supported_features;
  return typeof f === "number" && (f & bit) !== 0;
}

// ── Light ────────────────────────────────────────────────────
// Dimmable = any color mode other than plain on/off (brightness, color_temp,
// hs, rgb, …). Falls back to the brightness attribute if color modes are absent.
function supportsBrightness(s) {
  const a = s?.attributes;
  if (!a) return false;
  const modes = a.supported_color_modes;
  if (Array.isArray(modes) && modes.length) {
    return modes.some((m) => m && m !== "onoff" && m !== "unknown");
  }
  return a.brightness != null;
}

// ── Fan (FanEntityFeature: SET_SPEED=1, OSCILLATE=2, DIRECTION=4, PRESET=8) ──
function supportsFanPercentage(s) { return hasAttribute(s, "percentage") || hasFeature(s, 1); }
function supportsFanPreset(s) {
  const list = s?.attributes?.preset_modes;
  return (Array.isArray(list) && list.length > 0) || hasFeature(s, 8);
}
function supportsFanOscillate(s) { return hasAttribute(s, "oscillating") || hasFeature(s, 2); }
function supportsFanDirection(s) { return hasAttribute(s, "direction") || hasFeature(s, 4); }

// ── Cover (CoverEntityFeature: SET_POSITION=4, SET_TILT_POSITION=128) ────────
function supportsCoverPosition(s) { return hasAttribute(s, "current_position") || hasFeature(s, 4); }
function supportsCoverTilt(s) { return hasAttribute(s, "current_tilt_position") || hasFeature(s, 128); }

// ── Climate (ClimateEntityFeature: TARGET_TEMP=1, TARGET_HUMIDITY=4,
//    FAN_MODE=8, PRESET_MODE=16, SWING_MODE=32) ─────────────────────────────
function supportsClimateTemperature(s) { return hasAttribute(s, "temperature") || hasFeature(s, 1); }
function supportsClimateHvacModes(s) {
  const m = s?.attributes?.hvac_modes; return Array.isArray(m) && m.length > 0;
}
function supportsClimatePresetModes(s) {
  const m = s?.attributes?.preset_modes; return Array.isArray(m) && m.length > 0;
}
function supportsClimateFanModes(s) {
  const m = s?.attributes?.fan_modes; return Array.isArray(m) && m.length > 0;
}
function supportsClimateSwingModes(s) {
  const m = s?.attributes?.swing_modes; return Array.isArray(m) && m.length > 0;
}
function supportsClimateHumidity(s) {
  return hasAttribute(s, "humidity") || hasAttribute(s, "target_humidity") || hasFeature(s, 4);
}

// ── Media player (MediaPlayerEntityFeature: VOLUME_SET=4, VOLUME_MUTE=8,
//    SELECT_SOURCE=2048) ──────────────────────────────────────────────────
function supportsMediaVolume(s) { return hasAttribute(s, "volume_level") || hasFeature(s, 4); }
function supportsMediaMute(s) { return hasAttribute(s, "is_volume_muted") || hasFeature(s, 8); }
function supportsMediaSource(s) {
  const list = s?.attributes?.source_list;
  return (Array.isArray(list) && list.length > 0) || hasFeature(s, 2048);
}

// Neo Dashboard Kit — Control Card ("Neo Steuerung")
// EINE universelle Steuerungs-Karte: erkennt die Domain der gewählten Entität
// und zeigt automatisch die passende Bedienung (Toggle, +/-, Auf/Stopp/Zu,
// Transport, Scharf/Unscharf …). So bleibt der Picker kurz; alles Weitere
// kommt über Module. Aufgebaut mit einem gemeinsamen Shell-Helper, nach
// Domain gegliedert.

const DEFAULT_ICON = {
  light: "lightbulb", switch: "toggle", input_boolean: "toggle", fan: "fan",
  cover: "blinds", climate: "thermo", media_player: "speaker", lock: "lock",
  scene: "scenes", script: "robot", button: "robot", lightgroup: "lightbulb",
};

// device_type → Render-Domain (nur die abweichenden Fälle; die übrigen Typ-Werte
// sind bereits identisch mit der Render-Domain). Für die Typ-Vorschau ohne Entität.
const DEVICE_TYPE_DOMAIN = { action: "scene", lightgroup: "lightgroup" };

// Domain-Ableitung — einzige Quelle der Wahrheit für Render UND Editor.
// Reihenfolge: mehrere Entitäten ⇒ Licht-Gruppe; echte Entität gewinnt; sonst
// fällt die Vorschau auf den gewählten Typ (device_type) zurück, damit die
// Live-Vorschau sofort zum Typ passt – auch wenn noch keine Entität gewählt ist.
function neoControlDomain(config) {
  if (Array.isArray(config?.entities) && config.entities.length) return "lightgroup";
  const id = config?.entity;
  if (id) return id.split(".")[0];
  const dt = config?.device_type;
  return dt ? (DEVICE_TYPE_DOMAIN[dt] || dt) : "";
}
const ALARM_STATES = {
  disarmed: { label: "Unscharf", accent: "mint", icon: "unlock" },
  armed_home: { label: "Scharf · Zuhause", accent: "amber", icon: "lock" },
  armed_away: { label: "Scharf · Abwesend", accent: "amber", icon: "lock" },
  armed_night: { label: "Scharf · Nacht", accent: "amber", icon: "lock" },
  armed_vacation: { label: "Scharf · Urlaub", accent: "amber", icon: "lock" },
  arming: { label: "Aktiviert …", accent: "amber", icon: "lock" },
  pending: { label: "Eingang …", accent: "amber", icon: "lock" },
  triggered: { label: "ALARM", accent: "rose", icon: "bell" },
};
const MEDIA_LABEL = { playing: "Spielt", paused: "Pausiert", idle: "Bereit", off: "Aus", standby: "Standby", buffering: "Puffert", unavailable: "—" };
const COVER_LABEL = { open: "Offen", closed: "Geschlossen", opening: "Öffnet", closing: "Schließt", unavailable: "—" };
// Cover device_class → Icon + Label (kompakt; nur sinnvolle Fälle).
const COVER_DEVICE = {
  blind: { icon: "blinds", label: "Jalousie" }, shutter: { icon: "blinds", label: "Rollladen" },
  curtain: { icon: "blinds", label: "Vorhang" }, garage: { icon: "garage", label: "Garage" },
  door: { icon: "door", label: "Tür" }, gate: { icon: "gate", label: "Tor" },
  window: { icon: "window", label: "Fenster" }, awning: { icon: "blinds", label: "Markise" },
  shade: { icon: "blinds", label: "Rollo" },
};
const HVAC_LABEL = { off: "Aus", heat: "Heizen", cool: "Kühlen", auto: "Auto", heat_cool: "Auto", dry: "Entfeuchten", fan_only: "Lüften" };

class NeoControlCard extends NeoBaseCard {
  getCardSize() { return this._domain() === "media_player" ? 3 : 2; }

  _domain() { return neoControlDomain(this._config); }
  _acc() { return NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue; }
  _name(s, fallback) { return this._config?.name || s?.attributes?.friendly_name || this._config?.entity || this._t(fallback); }

  // ── gemeinsame Bausteine ───────────────────────────────────
  _shell(acc, active, headerRight, icon, body, minH) {
    const glow = `${acc.c}55`;
    const iconBg = active ? `linear-gradient(160deg,${acc.c} 0%,${acc.c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`;
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:${minH || 160}px;display:flex;flex-direction:column;cursor:pointer;
        background:${active ? `linear-gradient(160deg,${glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${active ? "var(--neo-line6)" : "var(--neo-line2)"};
        --neo-glow:0 18px 40px -16px ${active ? glow : "var(--neo-shadow1)"};
        --neo-glow-m:0 8px 22px -14px ${active ? glow : "var(--neo-shadow1)"};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
          <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
            background:${iconBg};border:1px solid ${active ? "rgba(255,255,255,0.25)" : acc.c + "33"};">${neoIcon(icon, { size: 19, color: active ? "#fff" : acc.c })}</div>
          ${headerRight || ""}
        </div>
        <div style="margin-top:auto;">${body}</div>
      </div>`;
  }
  _toggleEl(acc, on) {
    return `<div id="toggle" style="width:36px;height:22px;border-radius:11px;padding:2px;flex-shrink:0;
      background:${on ? acc.c : "var(--neo-line5)"};transition:background 200ms;cursor:pointer;">
      <div style="width:18px;height:18px;border-radius:9px;background:#fff;transform:translateX(${on ? "14px" : "0px"});
        transition:transform 220ms cubic-bezier(.2,.8,.2,1);box-shadow:0 1px 2px rgba(0,0,0,0.3);"></div></div>`;
  }
  _badge(acc, active, text) {
    return `<span style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px;
      color:${active ? acc.c : "var(--neo-text2)"};background:${active ? acc.c + "1f" : "var(--neo-fill2)"};
      border:1px solid ${active ? acc.c + "55" : "var(--neo-line2)"};">${escapeHtml(text)}</span>`;
  }
  _title(name, sub, extra) {
    return `<div style="font-size:16px;font-weight:600;">${escapeHtml(name)}</div>
      ${sub ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${escapeHtml(sub)}</div>` : ""}${extra || ""}`;
  }
  // Option mit Default (fehlt der Key → Default; explizit false bleibt false).
  _opt(name, def) { const v = this._config?.[name]; return v == null ? def : v; }

  _slider(idAttr, acc, pct, label, min = 1) {
    const n = Number(pct) || 0;
    const v = Math.max(min, Math.min(100, n));
    return `<div style="margin-top:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--neo-text3);">
        <span>${escapeHtml(label)}</span><span style="font-weight:600;">${escapeHtml(Math.round(n))}%</span></div>
      <input type="range" id="${idAttr}" min="${min}" max="100" value="${v}" style="
        width:100%;height:26px;border-radius:9px;-webkit-appearance:none;appearance:none;cursor:pointer;
        background:linear-gradient(90deg,${acc.c}cc 0%,${acc.c} ${n}%,var(--neo-line2) ${n}%);
        border:1px solid var(--neo-line1);" /></div>`;
  }
  // Kompakte Auswahl-Chips. `list` = String[] ODER {value,label}[]. `current`
  // markiert den aktiven Chip. data-Attribut = `data-${attr}` (für bindEvents).
  _chips(attr, list, current, acc, label) {
    const arr = (Array.isArray(list) ? list : [])
      .map((x) => (x && typeof x === "object") ? x : { value: x, label: x })
      .filter((x) => x.value != null);
    if (!arr.length) return "";
    const items = arr.map((o) => {
      const on = String(o.value) === String(current);
      return `<button data-${attr}="${escapeAttr(o.value)}" style="padding:6px 11px;border-radius:999px;font-size:12px;cursor:pointer;white-space:nowrap;
        color:${on ? "#fff" : "var(--neo-text2)"};background:${on ? acc.c : "var(--neo-fill2)"};
        border:1px solid ${on ? "transparent" : "var(--neo-line2)"};">${escapeHtml(o.label)}</button>`;
    }).join("");
    return `<div style="margin-top:8px;">
      ${label ? `<div style="font-size:12px;color:var(--neo-text3);margin-bottom:6px;">${escapeHtml(label)}</div>` : ""}
      <div style="display:flex;flex-wrap:wrap;gap:6px;">${items}</div></div>`;
  }
  // Kleiner, kompakter (Toggle-)Button mit Icon + Label.
  _miniBtn(attr, val, icon, label, active, acc) {
    return `<button data-${attr}="${escapeAttr(val)}" title="${escapeAttr(label)}" style="flex:1;height:38px;border-radius:11px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;
      color:${active ? "#fff" : "var(--neo-text2)"};background:${active ? acc.c : "var(--neo-fill2)"};
      border:1px solid ${active ? "transparent" : "var(--neo-line2)"};">${neoIcon(icon, { size: 15, color: active ? "#fff" : "currentColor" })}<span>${escapeHtml(label)}</span></button>`;
  }
  _flatBtn(attr, val, label, acc, primary) {
    return `<button ${attr}="${val}" style="flex:1;height:42px;border-radius:12px;cursor:pointer;font-size:13px;font-weight:600;
      display:flex;align-items:center;justify-content:center;color:#fff;
      background:${primary ? acc.c : "var(--neo-fill2,rgba(255,255,255,.06))"};
      border:1px solid ${primary ? "transparent" : "var(--neo-line2)"};">${escapeHtml(label)}</button>`;
  }
  _iconBtn(attr, val, sym, acc) {
    return `<button ${attr}="${val}" style="width:44px;height:44px;flex-shrink:0;border-radius:22px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;color:var(--neo-text1,#fff);
      background:var(--neo-fill2,rgba(255,255,255,.06));border:1px solid var(--neo-line2);">${neoIcon(sym, { size: 18, color: "currentColor" })}</button>`;
  }

  _icon(d, fb) { return this._config?.icon || DEFAULT_ICON[d] || fb || "dot"; }

  // Neutraler Empty-State: kein Typ gewählt (und keine Entität) → keine
  // implizite Schalter-/Default-Karte, sondern eine Aufforderung.
  _renderEmpty() {
    const msg = this._t("Wähle einen Gerätetyp, um die Vorschau zu starten");
    return `
      <div class="neo-card" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:12px;text-align:center;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px dashed var(--neo-line2);">
        <div style="width:40px;height:40px;border-radius:20px;display:flex;align-items:center;justify-content:center;
          background:var(--neo-fill1);border:1px solid var(--neo-line2);">${neoIcon("plus", { size: 20, color: "var(--neo-text3)" })}</div>
        <div style="font-size:14px;color:var(--neo-text2);max-width:220px;line-height:1.4;">${escapeHtml(msg)}</div>
      </div>`;
  }

  // ── Render-Dispatch ────────────────────────────────────────
  render() {
    const d = this._domain();
    if (!d) return this._renderEmpty(); // kein Typ & keine Entität
    switch (d) {
      case "fan": return this._renderFan();
      case "cover": return this._renderCover();
      case "climate": return this._renderClimate();
      case "media_player": return this._renderMedia();
      case "alarm_control_panel": return this._renderAlarm();
      case "lock": return this._renderLock();
      case "scene": case "script": case "button": return this._renderAction(d);
      case "lightgroup": return this._renderLightGroup();
      default: return this._renderToggle(d); // light/switch/input_boolean/…
    }
  }

  // light / switch / input_boolean
  _renderToggle(d) {
    const id = this._config?.entity;
    const s = this._state(id);
    const unavail = isUnavailable(s);
    const on = s?.state === "on";
    const acc = this._acc();
    const isLight = d === "light";
    const showToggle = this._opt("show_toggle", true);
    const dimmable = isLight && supportsBrightness(s);
    const showBri = isLight && this._opt("show_brightness", true) && dimmable && on && !unavail;
    let pct = 0;
    if (dimmable && on) pct = s?.attributes?.brightness != null ? Math.round((s.attributes.brightness / 255) * 100) : 0;
    let sub;
    if (unavail) sub = this._config?.sub ?? this._t("Nicht verfügbar");
    else if (dimmable) sub = this._config?.sub ?? (on ? `${pct}%` : this._t("Aus"));
    else sub = this._config?.sub ?? (on ? this._t("An") : this._t("Aus"));
    const right = unavail ? this._badge(acc, false, "—") : (showToggle ? this._toggleEl(acc, on) : "");
    const body = this._title(this._name(s, "Schalter"), sub, showBri ? this._slider("bri", acc, pct, this._t("Helligkeit")) : "");
    return this._shell(acc, on && !unavail, right, this._icon(d), body, isLight ? 180 : 160);
  }

  _renderLock() {
    const id = this._config?.entity;
    const s = this._state(id);
    const unavail = isUnavailable(s);
    const locked = s?.state === "locked";
    const acc = NEO_ACCENTS[this._config?.accent] || (locked ? NEO_ACCENTS.mint : NEO_ACCENTS.amber);
    const showToggle = this._opt("show_toggle", true);
    const sub = unavail ? (this._config?.sub ?? this._t("Nicht verfügbar"))
      : (this._config?.sub ?? (locked ? this._t("Verriegelt") : this._t("Entriegelt")));
    const right = unavail ? this._badge(acc, false, "—")
      : (showToggle ? this._toggleEl(acc, locked) : this._badge(acc, true, locked ? "🔒" : "🔓"));
    const body = this._title(this._name(s, "Schloss"), sub);
    return this._shell(acc, locked && !unavail, right, this._config?.icon || (locked ? "lock" : "unlock"), body);
  }

  _renderFan() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const unavail = isUnavailable(s);
    const on = s?.state === "on";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint;
    const showToggle = this._opt("show_toggle", true);
    const pctSupported = supportsFanPercentage(s);
    const pct = typeof a.percentage === "number" ? a.percentage : (on ? 100 : 0);
    const sub = unavail ? (this._config?.sub ?? this._t("Nicht verfügbar"))
      : (this._config?.sub ?? (on ? (pctSupported ? `${pct}%` : this._t("An")) : this._t("Aus")));
    let extra = "";
    if (on && !unavail) {
      if (this._opt("show_percentage", true) && pctSupported) extra += this._slider("pct", acc, pct, this._t("Stufe"));
      if (this._opt("show_fan_presets", true) && supportsFanPreset(s))
        extra += this._chips("fan-preset", a.preset_modes, a.preset_mode, acc, this._t("Voreinstellung"));
      const btns = [];
      if (this._opt("show_fan_oscillate", true) && supportsFanOscillate(s))
        btns.push(this._miniBtn("fan-osc", "toggle", "wind", this._t("Oszillation"), !!a.oscillating, acc));
      if (this._opt("show_fan_direction", true) && supportsFanDirection(s))
        btns.push(this._miniBtn("fan-dir", "toggle", "refresh", this._t("Richtung"), a.direction === "reverse", acc));
      if (btns.length) extra += `<div style="display:flex;gap:8px;margin-top:8px;">${btns.join("")}</div>`;
    }
    const right = unavail ? this._badge(acc, false, "—") : (showToggle ? this._toggleEl(acc, on) : "");
    const body = this._title(this._name(s, "Ventilator"), sub, extra);
    return this._shell(acc, on && !unavail, right, this._icon("fan"), body, 180);
  }

  _renderCover() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const unavail = isUnavailable(s);
    const state = s?.state || "unavailable";
    const acc = this._acc();
    const dc = COVER_DEVICE[a.device_class] || {};
    const pos = typeof a.current_position === "number" ? a.current_position : null;
    const active = !unavail && (state === "open" || state === "opening" || (pos != null && pos > 0));
    const right = this._badge(acc, false, unavail ? "—"
      : (pos != null ? `${pos}${this._t("% offen")}` : this._t(COVER_LABEL[state] || state)));
    let body = "";
    if (!unavail) {
      if (this._opt("show_cover_controls", true)) {
        body += `<div style="display:flex;gap:8px;margin-top:10px;">
          ${this._iconBtnTxt("up", "▲", this._t("Öffnen"))}${this._iconBtnTxt("stop", "■", this._t("Stopp"))}${this._iconBtnTxt("down", "▼", this._t("Schließen"))}</div>`;
      }
      if (this._opt("show_cover_position", true) && supportsCoverPosition(s))
        body += this._slider("cover-pos", acc, pos != null ? pos : 0, this._t("Position"), 0);
      if (this._opt("show_cover_tilt", true) && supportsCoverTilt(s)) {
        const tilt = typeof a.current_tilt_position === "number" ? a.current_tilt_position : 0;
        body += this._slider("cover-tilt", acc, tilt, this._t("Neigung"), 0);
      }
    }
    const name = this._config?.name || a.friendly_name || this._t(dc.label || "Rollladen");
    return this._shell(acc, active, right, this._config?.icon || dc.icon || "blinds", this._title(name, "", body), 200);
  }
  _iconBtnTxt(val, glyph, title) {
    return `<button data-cover="${val}" title="${escapeAttr(title)}" style="flex:1;height:42px;border-radius:12px;cursor:pointer;font-size:16px;
      display:flex;align-items:center;justify-content:center;color:var(--neo-text1,#fff);
      background:var(--neo-fill2,rgba(255,255,255,.06));border:1px solid var(--neo-line2);">${escapeHtml(glyph)}</button>`;
  }

  _renderClimate() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const unavail = isUnavailable(s);
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const unit = this._hass?.config?.unit_system?.temperature || "°";
    const target = a.temperature;
    const action = a.hvac_action;
    const mode = s?.state || "off";
    const actCol = action === "cooling" ? NEO_ACCENTS.blue.c : action === "heating" ? NEO_ACCENTS.amber.c : acc.c;
    const active = !unavail && ((action && action !== "idle" && action !== "off") || (!action && mode !== "off"));
    const accE = { c: actCol, glow: actCol + "55" };
    const badge = unavail ? "—" : this._t(action ? ({ heating: "Heizt", cooling: "Kühlt", drying: "Entfeuchtet", fan: "Lüftet", idle: "Bereit", off: "Aus" }[action] || action)
      : (HVAC_LABEL[mode] || mode));
    const cur = a.current_temperature;
    let body = "";
    if (!unavail) {
      if (this._opt("show_temperature_controls", true) && supportsClimateTemperature(s)) {
        body += `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px;">
          ${this._iconBtn("data-temp", "dec", "minus", accE)}
          <div style="display:flex;align-items:baseline;gap:2px;"><span style="font-size:32px;font-weight:500;letter-spacing:-1px;">${escapeHtml(target != null ? target : "—")}</span><span style="font-size:15px;color:var(--neo-text2);">${escapeHtml(unit)}</span></div>
          ${this._iconBtn("data-temp", "inc", "plus", accE)}
        </div>`;
      }
      if (cur != null) body += `<div style="font-size:12px;color:var(--neo-text3);margin-top:8px;text-align:center;">${escapeHtml(this._t("Aktuell"))} ${escapeHtml(cur)}${escapeHtml(unit)}</div>`;
      if (this._opt("show_hvac_modes", true) && supportsClimateHvacModes(s))
        body += this._chips("hvac", a.hvac_modes.map((m) => ({ value: m, label: this._t(HVAC_LABEL[m] || m) })), mode, accE, this._t("Modus"));
      if (this._opt("show_climate_presets", true) && supportsClimatePresetModes(s))
        body += this._chips("climate-preset", a.preset_modes, a.preset_mode, accE, this._t("Voreinstellung"));
      if (this._opt("show_climate_fan_modes", false) && supportsClimateFanModes(s))
        body += this._chips("climate-fan", a.fan_modes, a.fan_mode, accE, this._t("Lüftung"));
      if (this._opt("show_climate_swing_modes", false) && supportsClimateSwingModes(s))
        body += this._chips("climate-swing", a.swing_modes, a.swing_mode, accE, this._t("Schwenken"));
      if (this._opt("show_humidity", false) && supportsClimateHumidity(s) && typeof a.humidity === "number")
        body += this._slider("climate-hum", accE, a.humidity, this._t("Luftfeuchte"), 0);
    }
    return this._shell(accE, active, this._badge(accE, active, badge), this._icon("climate"), this._title(this._name(s, "Klima"), "", body), 200);
  }

  _renderMedia() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const unavail = isUnavailable(s);
    const state = s?.state || "unavailable";
    const playing = state === "playing";
    const active = !unavail && (playing || state === "paused" || state === "buffering");
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.violet;
    const title = a.media_title || "";
    const artist = a.media_artist || a.app_name || "";
    const name = this._name(s, "Media");
    const line2 = title ? (artist || name) : this._t(MEDIA_LABEL[state] || state);
    let body = `<div style="font-size:16px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(title || name)}</div>
      ${line2 ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(line2)}</div>` : ""}`;
    if (!unavail) {
      const power = this._opt("show_media_power", false) ? this._iconBtn("data-media", "__power", "power", acc) : "";
      if (this._opt("show_media_controls", true)) {
        body += `<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-top:12px;">
          ${this._iconBtn("data-media", "media_previous_track", "prev", acc)}
          ${this._iconBtn("data-media", "media_play_pause", playing ? "pause" : "play", acc)}
          ${this._iconBtn("data-media", "media_next_track", "next", acc)}${power}</div>`;
      } else if (power) {
        body += `<div style="display:flex;justify-content:center;margin-top:12px;">${power}</div>`;
      }
      if (this._opt("show_volume", true) && supportsMediaVolume(s)) {
        const vol = typeof a.volume_level === "number" ? Math.round(a.volume_level * 100) : 0;
        body += this._slider("media-vol", acc, vol, this._t("Lautstärke"), 0);
      }
      if (this._opt("show_mute", true) && supportsMediaMute(s)) {
        body += `<div style="display:flex;gap:8px;margin-top:8px;">${this._miniBtn("media-mute", "toggle", "volume", this._t("Stumm"), !!a.is_volume_muted, acc)}</div>`;
      }
      if (this._opt("show_source", false) && supportsMediaSource(s))
        body += this._chips("media-source", a.source_list, a.source, acc, this._t("Quelle"));
    }
    return this._shell(acc, active, this._badge(acc, false, unavail ? "—" : this._t(MEDIA_LABEL[state] || state)), this._icon("media_player"), body, 200);
  }

  _renderAlarm() {
    const id = this._config?.entity;
    const s = this._state(id);
    const unavail = isUnavailable(s);
    const state = s?.state || "unavailable";
    const meta = ALARM_STATES[state] || { label: state, accent: "blue", icon: "lock" };
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS[meta.accent] || NEO_ACCENTS.blue;
    const armed = state !== "disarmed" && !unavail;
    let body = this._title(this._name(s, "Alarm"), "");
    if (!unavail && this._opt("show_alarm_controls", true)) {
      const controls = state === "disarmed"
        ? `${this._flatBtn("data-alarm", "alarm_arm_home", this._t("Zuhause"), acc)}${this._flatBtn("data-alarm", "alarm_arm_away", this._t("Abwesend"), acc)}`
        : `${this._flatBtn("data-alarm", "alarm_disarm", this._t("Unscharf"), acc, true)}`;
      body = this._title(this._name(s, "Alarm"), "", `<div style="display:flex;gap:8px;margin-top:10px;">${controls}</div>`);
    }
    return this._shell(acc, armed, this._badge(acc, armed, unavail ? "—" : this._t(meta.label)), this._config?.icon || meta.icon, body, 190);
  }

  _renderAction(d) {
    const id = this._config?.entity;
    const s = this._state(id);
    const acc = this._acc();
    const sub = this._config?.sub ?? this._t(d === "scene" ? "Szene" : d === "button" ? "Taster" : "Skript");
    return this._shell(acc, false, "", this._icon(d), this._title(this._name(s, "Aktion"), sub), 160);
  }

  _renderLightGroup() {
    const ids = (this._config.entities || []).filter(Boolean); // Typ-Vorschau ohne Entitäten
    let total = 0, onCount = 0, briSum = 0, briN = 0, dimmable = false;
    ids.forEach((id) => {
      const s = this._state(id);
      if (isUnavailable(s)) return; // nicht verfügbare Entitäten ignorieren
      total++;
      if (s?.state === "on") {
        onCount++;
        if (supportsBrightness(s)) { dimmable = true; const b = s.attributes?.brightness; if (typeof b === "number") { briSum += b; briN++; } }
      }
    });
    const bri = briN ? Math.round((briSum / briN / 255) * 100) : 0;
    const on = onCount > 0;
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const showToggle = this._opt("show_toggle", true);
    const showBri = this._opt("show_brightness", true) && dimmable && on;
    const sub = this._config?.sub ?? `${onCount}/${total} ${this._t("an")}`;
    const body = this._title(this._config?.name || this._t("Licht-Gruppe"), sub, showBri ? this._slider("bri", acc, bri, this._t("Helligkeit")) : "");
    return this._shell(acc, on, showToggle ? this._toggleEl(acc, on) : "", this._config?.icon || "lightbulb", body);
  }

  // ── Events ────────────────────────────────────────────────
  _bindEvents() {
    const d = this._domain();
    const id = this._config?.entity;
    const sr = this.shadowRoot;
    const a = this._state(id)?.attributes || {};

    // Primärer Toggle (light/switch/fan/lock/lightgroup).
    sr.getElementById("toggle")?.addEventListener("click", (e) => { e.stopPropagation(); this._primaryToggle(d); });

    // Helligkeit (Licht / Licht-Gruppe).
    sr.getElementById("bri")?.addEventListener("change", (e) => {
      e.stopPropagation();
      const ids = d === "lightgroup" ? (this._config.entities || []).filter(Boolean) : id;
      if (ids) this._callService("light", "turn_on", { entity_id: ids, brightness_pct: +e.target.value });
    });

    // Ventilator: Stufe / Voreinstellung / Oszillation / Richtung.
    sr.getElementById("pct")?.addEventListener("change", (e) => { e.stopPropagation(); if (id) this._callService("fan", "set_percentage", { entity_id: id, percentage: +e.target.value }); });
    sr.querySelectorAll("[data-fan-preset]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("fan", "set_preset_mode", { entity_id: id, preset_mode: b.getAttribute("data-fan-preset") }); }));
    sr.querySelector("[data-fan-osc]")?.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("fan", "oscillate", { entity_id: id, oscillating: !a.oscillating }); });
    sr.querySelector("[data-fan-dir]")?.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("fan", "set_direction", { entity_id: id, direction: a.direction === "reverse" ? "forward" : "reverse" }); });

    // Cover: Auf/Stopp/Zu + Position + Neigung.
    sr.querySelectorAll("[data-cover]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("cover", { up: "open_cover", stop: "stop_cover", down: "close_cover" }[b.getAttribute("data-cover")], { entity_id: id }); }));
    sr.getElementById("cover-pos")?.addEventListener("change", (e) => { e.stopPropagation(); if (id) this._callService("cover", "set_cover_position", { entity_id: id, position: +e.target.value }); });
    sr.getElementById("cover-tilt")?.addEventListener("change", (e) => { e.stopPropagation(); if (id) this._callService("cover", "set_cover_tilt_position", { entity_id: id, tilt_position: +e.target.value }); });

    // Klima: Temperatur + Modi/Voreinstellungen/Lüftung/Schwenken/Luftfeuchte.
    sr.querySelectorAll("[data-temp]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); this._stepTemp(b.getAttribute("data-temp") === "inc" ? 1 : -1); }));
    sr.querySelectorAll("[data-hvac]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("climate", "set_hvac_mode", { entity_id: id, hvac_mode: b.getAttribute("data-hvac") }); }));
    sr.querySelectorAll("[data-climate-preset]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("climate", "set_preset_mode", { entity_id: id, preset_mode: b.getAttribute("data-climate-preset") }); }));
    sr.querySelectorAll("[data-climate-fan]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("climate", "set_fan_mode", { entity_id: id, fan_mode: b.getAttribute("data-climate-fan") }); }));
    sr.querySelectorAll("[data-climate-swing]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("climate", "set_swing_mode", { entity_id: id, swing_mode: b.getAttribute("data-climate-swing") }); }));
    sr.getElementById("climate-hum")?.addEventListener("change", (e) => { e.stopPropagation(); if (id) this._callService("climate", "set_humidity", { entity_id: id, humidity: +e.target.value }); });

    // Media: Transport + Volume + Mute + Quelle + Power.
    sr.querySelectorAll("[data-media]").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation(); if (!id) return;
      const v = b.getAttribute("data-media");
      if (v === "__power") { const st = this._state(id)?.state; this._callService("media_player", (st === "off" || st === "standby") ? "turn_on" : "turn_off", { entity_id: id }); }
      else this._callService("media_player", v, { entity_id: id });
    }));
    sr.getElementById("media-vol")?.addEventListener("change", (e) => { e.stopPropagation(); if (id) this._callService("media_player", "volume_set", { entity_id: id, volume_level: (+e.target.value) / 100 }); });
    sr.querySelector("[data-media-mute]")?.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("media_player", "volume_mute", { entity_id: id, is_volume_muted: !a.is_volume_muted }); });
    sr.querySelectorAll("[data-media-source]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("media_player", "select_source", { entity_id: id, source: b.getAttribute("data-media-source") }); }));

    // Alarm.
    sr.querySelectorAll("[data-alarm]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); this._alarm(b.getAttribute("data-alarm")); }));

    // Karten-Aktionen (tap/hold/double_tap) + Modul-Tap + Domain-Defaults.
    this._bindCardActions(sr.getElementById("card"), {
      entity: id,
      toggle: () => this._primaryToggle(d),
      tapDefault: () => this._controlTapDefault(d, id),
    });
  }

  // Standard-Tap je Domain (greift nur, wenn keine eigene tap_action gesetzt ist).
  _controlTapDefault(d, id) {
    if (d === "scene") this._callService("scene", "turn_on", { entity_id: id });
    else if (d === "button") this._callService("button", "press", { entity_id: id });
    else if (d === "script") id?.startsWith("script.") ? this._callService("script", "turn_on", { entity_id: id }) : this._callService("script", id, {});
    else if (d === "lightgroup") this._primaryToggle(d);
    else if (id) this._modCtx().moreInfo(id);
  }

  _primaryToggle(d) {
    const id = this._config?.entity;
    if (d === "lightgroup") {
      const ids = (this._config.entities || []).filter(Boolean);
      const anyOn = ids.some((x) => this._state(x)?.state === "on");
      if (ids.length) this._callService("light", anyOn ? "turn_off" : "turn_on", { entity_id: ids });
      return;
    }
    if (!id) return;
    const s = this._state(id);
    if (d === "lock") { this._callService("lock", s?.state === "locked" ? "unlock" : "lock", { entity_id: id }); return; }
    if (d === "fan") { this._callService("fan", s?.state === "on" ? "turn_off" : "turn_on", { entity_id: id }); return; }
    const domain = d === "light" ? "light" : (id.split(".")[0] || "homeassistant");
    this._callService(domain, s?.state === "on" ? "turn_off" : "turn_on", { entity_id: id });
  }
  _stepTemp(dir) {
    const id = this._config?.entity;
    const a = this._state(id)?.attributes || {};
    const step = this._config?.step || a.target_temp_step || 0.5;
    if (a.temperature == null) return;
    let v = Math.round((a.temperature + dir * step) * 10) / 10;
    if (a.min_temp != null) v = Math.max(a.min_temp, v);
    if (a.max_temp != null) v = Math.min(a.max_temp, v);
    this._callService("climate", "set_temperature", { entity_id: id, temperature: v });
  }
  _alarm(service) {
    const id = this._config?.entity;
    if (!id) return;
    const data = { entity_id: id };
    if (this._config?.code) data.code = String(this._config.code);
    this._callService("alarm_control_panel", service, data);
  }

  static getConfigElement() { return document.createElement("neo-control-card-editor"); }
  static getStubConfig() { return {}; }
}

// ── Editor: aus Capability-Spec generiert (wie Display) ──────────────────────
// Typ-Schritt, gefilterter Picker, Multi-Entity (Licht-Gruppe), Empty-State,
// Mismatch-Reset & Pruning kommen aus makeNeoTypedEditor — die Karte liefert nur
// das Spec. Eigener Key `device_type` (`type` ist von Lovelace belegt). Das
// Rendering bleibt entitäts-domain-basiert (neoControlDomain), unverändert.
// Sichtbarkeits-Schalter (capability-aware): steuern, welche Controls gerendert
// werden. Default = an, außer wo unten explizit `false`. Aktionen (tap/hold/
// double_tap) werden bewusst per YAML konfiguriert (siehe Doku).
const bool = (name, label) => ({ name, label, selector: { boolean: {} } });
const CONTROL_SPEC = {
  typeKey: "device_type", typeLabel: "Typ", entityLabel: "Entität (Gerät)",
  actions: true, // Aktionen-Abschnitt (tap/hold/double_tap) im Editor
  types: [
    { value: "light", label: "Licht", domains: ["light"],
      defaults: { show_toggle: true, show_brightness: true },
      fields: [bool("show_toggle", "Schalter anzeigen"), bool("show_brightness", "Helligkeit anzeigen")] },
    { value: "switch", label: "Schalter", domains: ["switch", "input_boolean"],
      defaults: { show_toggle: true },
      fields: [bool("show_toggle", "Schalter anzeigen")] },
    { value: "climate", label: "Klima", domains: ["climate"],
      defaults: { show_temperature_controls: true, show_hvac_modes: true, show_climate_presets: true },
      fields: [
        { name: "step", label: "Temperaturschritt (optional)", selector: { number: { min: 0.1, max: 5, step: 0.1, mode: "box" } } },
        bool("show_temperature_controls", "Temperatur-Steuerung anzeigen"),
        bool("show_hvac_modes", "Modi anzeigen"), bool("show_climate_presets", "Voreinstellungen anzeigen"),
        bool("show_climate_fan_modes", "Lüftungsstufen anzeigen"), bool("show_climate_swing_modes", "Schwenken anzeigen"),
        bool("show_humidity", "Luftfeuchte anzeigen"),
      ] },
    { value: "cover", label: "Cover", domains: ["cover"],
      defaults: { show_cover_controls: true, show_cover_position: true, show_cover_tilt: true },
      fields: [bool("show_cover_controls", "Auf/Stopp/Zu anzeigen"), bool("show_cover_position", "Position anzeigen"), bool("show_cover_tilt", "Neigung anzeigen")] },
    { value: "fan", label: "Ventilator", domains: ["fan"],
      defaults: { show_toggle: true, show_percentage: true, show_fan_presets: true, show_fan_oscillate: true, show_fan_direction: true },
      fields: [bool("show_toggle", "Schalter anzeigen"), bool("show_percentage", "Stufe anzeigen"), bool("show_fan_presets", "Voreinstellungen anzeigen"), bool("show_fan_oscillate", "Oszillation anzeigen"), bool("show_fan_direction", "Richtung anzeigen")] },
    { value: "media_player", label: "Media", domains: ["media_player"],
      defaults: { show_media_controls: true, show_volume: true, show_mute: true },
      fields: [bool("show_media_controls", "Transport anzeigen"), bool("show_volume", "Lautstärke anzeigen"), bool("show_mute", "Stumm anzeigen"), bool("show_source", "Quelle anzeigen"), bool("show_media_power", "Power anzeigen")] },
    { value: "lock", label: "Schloss", domains: ["lock"],
      defaults: { show_toggle: true },
      fields: [bool("show_toggle", "Schalter anzeigen")] },
    { value: "alarm_control_panel", label: "Alarm", domains: ["alarm_control_panel"],
      defaults: { show_alarm_controls: true },
      fields: [{ name: "code", label: "Code (optional, falls erforderlich)", selector: { text: {} } }, bool("show_alarm_controls", "Bedienelemente anzeigen")] },
    { value: "action", label: "Szene / Skript / Taster", domains: ["scene", "script", "button"] },
    { value: "lightgroup", label: "Licht-Gruppe", domains: ["light"], multi: true, entityLabel: "Lichter",
      defaults: { show_toggle: true, show_brightness: true },
      fields: [bool("show_toggle", "Schalter anzeigen"), bool("show_brightness", "Helligkeit anzeigen")] },
  ],
  appearance: [
    { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
    NEO_LAYOUT_FIELD,
  ],
};

customElements.define("neo-control-card-editor", makeNeoTypedEditor(CONTROL_SPEC, {
  name: "Neo Steuerung", description: "Eine Karte für alle Geräte — passt sich an", icon: "🎛️",
}));

NeoDashboardRegistry.registerCard("neo-control-card", NeoControlCard, {
  name: "Neo Steuerung",
  description: "Eine Karte für alle Geräte — passt sich automatisch an die Entität an",
});

// Neo Dashboard Kit — Display Card ("Neo Anzeige")
// EINE universelle Anzeige-Karte: erkennt die Domain und zeigt Sensorwert,
// Kamera-Snapshot oder Status. Reine Darstellung; Tap → More-Info.

// Anzeige-Typen — gemeinsame Capability-Map für Editor UND Rendering (eine
// Quelle der Wahrheit). mode: "sensor" → Wert-Layout, "camera" → Kamera-Layout.
// domains = erlaubte Entitäts-Domains (Editor-Filter + Mismatch-Reset),
// icon = Default-Icon, unit = ob eine Einheit/Format-Option sinnvoll ist.
const DISPLAY_TYPES = [
  { value: "value",    label: "Sensor / Wert",        domains: ["sensor", "input_number", "number"], icon: "gauge",   mode: "sensor", unit: true },
  { value: "status",   label: "Status",               domains: ["binary_sensor"],                     icon: "info",    mode: "sensor" },
  { value: "battery",  label: "Batterie",             domains: ["sensor"], device_class: "battery",    icon: "battery", mode: "sensor", unit: true },
  { value: "presence", label: "Person / Anwesenheit", domains: ["person", "device_tracker"],          icon: "person",  mode: "sensor" },
  { value: "weather",  label: "Wetter",               domains: ["weather"],                           icon: "partly",  mode: "weather" },
  { value: "calendar", label: "Kalender / Termin",    domains: ["calendar"],                          icon: "calendar", mode: "calendar" },
  { value: "badge",    label: "Badge / KPI",          domains: [],                                    icon: "gauge",   mode: "badge", unit: true },
  { value: "markdown", label: "Text / Markdown",      domains: [], source: "text",                    icon: "info",    mode: "markdown" },
  { value: "camera",   label: "Kamera",               domains: ["camera"],                            icon: "camera",  mode: "camera" },
];
// Wetter-Zustand → Label + Icon (basic). Pro-Wetter (Vorhersage etc.) ist Premium.
const WEATHER_COND = {
  "sunny": { label: "Sonnig", icon: "sun" },
  "clear-night": { label: "Klar", icon: "moon" },
  "cloudy": { label: "Bewölkt", icon: "cloud" },
  "partlycloudy": { label: "Teils bewölkt", icon: "partly" },
  "rainy": { label: "Regen", icon: "rain" },
  "pouring": { label: "Starkregen", icon: "rain" },
  "snowy": { label: "Schnee", icon: "snow" },
  "snowy-rainy": { label: "Schneeregen", icon: "snow" },
  "windy": { label: "Windig", icon: "wind" },
  "windy-variant": { label: "Windig", icon: "wind" },
  "fog": { label: "Nebel", icon: "fog" },
  "hail": { label: "Hagel", icon: "snow" },
  "lightning": { label: "Gewitter", icon: "storm" },
  "lightning-rainy": { label: "Gewitter", icon: "storm" },
  "exceptional": { label: "Extrem", icon: "warning" },
};
// Capability-Spec: treibt Editor (Generator) UND Rendering aus einer Quelle.
const DISPLAY_SPEC = {
  typeKey: "display_type", typeLabel: "Typ", entityLabel: "Entität",
  types: DISPLAY_TYPES,
  actions: true, actionDefaults: { tapDefault: "more-info" }, // Default-Tap = More-Info
  appearance: [
    { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
    NEO_LAYOUT_FIELD,
  ],
};
const displayTypeDef = (t) => neoTypeDef(DISPLAY_SPEC, t);
// Domains, die per Service ein-/ausschaltbar sind (für tap_action: toggle).
const TOGGLABLE = new Set(["light", "switch", "input_boolean", "fan", "automation", "script", "siren", "humidifier", "remote", "media_player"]);
// Effektiver Typ — Render-seitig (Editor nutzt dieselbe Ableitung über das Spec).
function neoDisplayType(config) { return neoCapabilityType(config, DISPLAY_SPEC); }

class NeoDisplayCard extends NeoBaseCard {
  getCardSize() {
    const k = this._kind();
    if (k === "camera") return 3;
    if (k === "badge") return 1;
    return 2;
  }

  // Render-Art: empty (kein Typ & keine Entität), camera oder sensor.
  _kind() {
    const t = neoDisplayType(this._config);
    if (t) return displayTypeDef(t)?.mode || "sensor";
    return this._config?.entity ? "sensor" : "empty"; // Legacy-Entität ohne Typ bleibt sichtbar
  }
  _typeIcon() { return displayTypeDef(neoDisplayType(this._config))?.icon || "gauge"; }
  _acc() { return NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint; }

  render() {
    const k = this._kind();
    if (k === "empty") return this._renderEmpty(); // kein Typ & keine Entität
    if (k === "camera") return this._renderCamera();
    if (k === "weather") return this._renderWeather();
    if (k === "calendar") return this._renderCalendar();
    if (k === "badge") return this._renderBadge();
    if (k === "markdown") return this._renderMarkdown();
    return this._renderSensor();
  }

  // Neutraler Empty-State: kein Typ gewählt → keine implizite Default-Karte.
  _renderEmpty() {
    const msg = this._t("Wähle einen Anzeige-Typ, um die Vorschau zu starten");
    return `
      <div class="neo-card" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:12px;text-align:center;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px dashed var(--neo-line2);">
        <div style="width:40px;height:40px;border-radius:20px;display:flex;align-items:center;justify-content:center;
          background:var(--neo-fill1);border:1px solid var(--neo-line2);">${neoIcon("gauge", { size: 20, color: "var(--neo-text3)" })}</div>
        <div style="font-size:14px;color:var(--neo-text2);max-width:220px;line-height:1.4;">${escapeHtml(msg)}</div>
      </div>`;
  }

  _renderSensor() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const value = s?.state ?? "—";
    const unit = this._config?.unit ?? a.unit_of_measurement ?? "";
    const name = this._config?.name || a.friendly_name || id || this._t("Wert");
    const icon = this._config?.icon || this._typeIcon();
    const acc = this._acc();
    const sub = this._config?.sub || "";
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);">
        <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);
          border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 19, color: acc.c })}</div>
        <div style="margin-top:auto;">
          <div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:0.6px;">${escapeHtml(name)}</div>
          <div style="display:flex;align-items:baseline;gap:3px;margin-top:4px;">
            <span style="font-size:26px;font-weight:500;letter-spacing:-0.5px;">${escapeHtml(value)}</span>
            <span style="font-size:13px;color:var(--neo-text2);">${escapeHtml(unit)}</span>
          </div>
          ${sub ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${escapeHtml(sub)}</div>` : ""}
        </div>
      </div>`;
  }

  _renderWeather() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const meta = WEATHER_COND[s?.state] || { label: s?.state || "—", icon: "cloud" };
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    const unit = this._config?.unit || this._hass?.config?.unit_system?.temperature || "°";
    const temp = a.temperature;
    const name = this._config?.name || a.friendly_name || id || this._t("Wetter");
    const icon = this._config?.icon || meta.icon;
    const sub = this._config?.sub || this._t(meta.label);
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);">
        <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);
          border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 19, color: acc.c })}</div>
        <div style="margin-top:auto;">
          <div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:0.6px;">${escapeHtml(name)}</div>
          <div style="display:flex;align-items:baseline;gap:3px;margin-top:4px;">
            <span style="font-size:26px;font-weight:500;letter-spacing:-0.5px;">${escapeHtml(temp != null ? temp : "—")}</span>
            <span style="font-size:13px;color:var(--neo-text2);">${escapeHtml(unit)}</span>
          </div>
          ${sub ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${escapeHtml(sub)}</div>` : ""}
        </div>
      </div>`;
  }

  // Kalender: nächster Termin (Titel + Zeitpunkt). Bewusst keine Agenda/Liste.
  _calWhen(a) {
    const raw = a.start_time;
    if (!raw) return "";
    const d = new Date(String(raw).replace(" ", "T"));
    if (isNaN(d.getTime())) return String(raw);
    const lang = this._hass?.locale?.language || this._hass?.language || "de";
    const date = d.toLocaleDateString(lang, { weekday: "short", day: "2-digit", month: "2-digit" });
    if (a.all_day) return date;
    return `${date} · ${d.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}`;
  }
  _renderCalendar() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.violet;
    const name = this._config?.name || a.friendly_name || id || this._t("Kalender");
    const icon = this._config?.icon || "calendar";
    const title = a.message || this._t("Keine Termine");
    const when = this._calWhen(a);
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);">
        <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);
          border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 19, color: acc.c })}</div>
        <div style="margin-top:auto;">
          <div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:0.6px;">${escapeHtml(name)}</div>
          <div style="font-size:16px;font-weight:600;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(title)}</div>
          ${when ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${escapeHtml(when)}</div>` : ""}
        </div>
      </div>`;
  }

  // Badge / KPI: kompakte Kennzahl (beliebige Entität). Klein, übersichtsgeeignet.
  _renderBadge() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = this._acc();
    const value = s ? (s.state ?? "—") : "—";
    const unit = this._config?.unit ?? a.unit_of_measurement ?? "";
    const label = this._config?.name || a.friendly_name || id || this._t("Kennzahl");
    const icon = this._config?.icon || "gauge";
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:96px;display:flex;align-items:center;gap:14px;cursor:pointer;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);">
        <div style="width:40px;height:40px;border-radius:20px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);
          border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 20, color: acc.c })}</div>
        <div style="min-width:0;">
          <div style="display:flex;align-items:baseline;gap:3px;">
            <span style="font-size:24px;font-weight:600;letter-spacing:-0.5px;">${escapeHtml(value)}</span>
            <span style="font-size:13px;color:var(--neo-text2);">${escapeHtml(unit)}</span>
          </div>
          <div style="font-size:12px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:0.5px;
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(label)}</div>
        </div>
      </div>`;
  }

  // Text / Markdown: freie Quelle, sichere Minimal-Darstellung (kein Template-Engine).
  _mdSafe(text) {
    const esc = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return esc
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<i>$2</i>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");
  }
  _renderMarkdown() {
    const title = this._config?.name || "";
    const content = this._config?.content || "";
    const body = content
      ? this._mdSafe(content)
      : `<span style="color:var(--neo-text3);">${this._t("Text / Markdown eingeben …")}</span>`;
    return `
      <div class="neo-card" id="card" style="
        padding:16px;min-height:96px;display:flex;flex-direction:column;gap:6px;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);">
        ${title ? `<div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:0.6px;">${escapeHtml(title)}</div>` : ""}
        <div style="font-size:14px;color:var(--neo-text1);line-height:1.5;">${body}</div>
      </div>`;
  }

  _renderCamera() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    const name = this._config?.name || a.friendly_name || id || this._t("Kamera");
    const icon = this._config?.icon || "camera";
    const pic = safeUrl(a.entity_picture);
    const image = pic
      ? `<img src="${escapeAttr(pic)}" alt="${escapeAttr(name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />`
      : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
           background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);">${neoIcon(icon, { size: 40, color: acc.c })}</div>`;
    return `
      <div class="neo-card" id="card" role="button" style="
        position:relative;overflow:hidden;min-height:190px;display:flex;cursor:pointer;
        border:1px solid var(--neo-line2);">
        ${image}
        <div style="position:absolute;left:0;right:0;bottom:0;padding:12px 14px;display:flex;align-items:center;gap:8px;
          background:linear-gradient(0deg,rgba(0,0,0,.65) 0%,rgba(0,0,0,.15) 60%,transparent 100%);">
          ${neoIcon(icon, { size: 16, color: "#fff" })}
          <span style="font-size:14px;font-weight:600;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
        </div>
      </div>`;
  }

  _bindEvents() {
    const id = this._config?.entity;
    // Aktions-System: Default-Tap = More-Info. "toggle" nur, wenn die Entität
    // togglebar ist (sonst ignorieren — kein kaputter Service-Aufruf).
    this._bindCardActions(this.shadowRoot.getElementById("card"), {
      entity: id,
      toggle: () => {
        if (!id) return;
        const dom = id.split(".")[0];
        if (!TOGGLABLE.has(dom)) return;
        const s = this._state(id);
        this._callService(dom, s?.state === "on" ? "turn_off" : "turn_on", { entity_id: id });
      },
      tapDefault: () => { if (id) this._modCtx().moreInfo(id); },
    });
  }

  static getConfigElement() { return document.createElement("neo-display-card-editor"); }
  static getStubConfig() { return {}; }
}

// ── Editor: aus dem Capability-Spec generiert (Referenz für Premium/Community) ──
// Typ-Schritt, gefilterter Picker, Empty-State, Reset & Pruning kommen komplett
// aus makeNeoTypedEditor — die Karte liefert nur DISPLAY_SPEC.
customElements.define("neo-display-card-editor", makeNeoTypedEditor(DISPLAY_SPEC, {
  name: "Neo Anzeige", description: "Sensor · Kamera · Status", icon: "📊",
}));

NeoDashboardRegistry.registerCard("neo-display-card", NeoDisplayCard, {
  name: "Neo Anzeige",
  description: "Sensorwert, Kamera oder Status — passt sich an die Entität an",
});

// Neo Dashboard Kit — Header / Divider Card
// Reiner Layout-Baustein zum Strukturieren von Dashboards (keine Entität):
// "Überschrift" (Icon + Titel + Untertitel) oder "Trenner" (Linie mit Label).

class NeoHeaderCard extends NeoBaseCard {
  getCardSize() { return 1; }

  render() {
    const variant = this._config?.variant || "header";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    const title = this._config?.title || "";
    // Nur klickbar wirken, wenn auch eine Aktion konfiguriert ist.
    const cursor = this._hasAnyAction() ? "cursor:pointer;" : "";

    if (variant === "divider") {
      const lbl = title
        ? `<span style="font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--neo-text3);">${escapeHtml(title)}</span>
           <div style="flex:1;height:1px;background:var(--neo-line2);"></div>`
        : "";
      return `<div id="card" style="display:flex;align-items:center;gap:12px;padding:8px 2px;${cursor}">
        <div style="flex:1;height:1px;background:var(--neo-line2);"></div>${lbl}</div>`;
    }

    const subtitle = this._config?.subtitle || "";
    const icon = this._config?.icon;
    const lead = icon
      ? `<div style="width:34px;height:34px;border-radius:17px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
           background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 18, color: acc.c })}</div>`
      : `<div style="width:4px;height:28px;border-radius:2px;flex-shrink:0;background:${acc.c};"></div>`;

    return `
      <div id="card" style="display:flex;align-items:center;gap:12px;padding:8px 4px;${cursor}">
        ${lead}
        <div style="min-width:0;">
          <div style="font-size:18px;font-weight:700;letter-spacing:-.2px;color:var(--neo-text1);
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(title)}</div>
          ${subtitle ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:1px;">${escapeHtml(subtitle)}</div>` : ""}
        </div>
      </div>`;
  }

  // Aktions-System (navigate/url/call-service/none; Default: none).
  // Header und Trenner bleiben ohne konfigurierte Aktion reine Layout-Bausteine.
  _bindEvents() {
    this._bindCardActions(this.shadowRoot.getElementById("card"), {});
  }

  static getConfigElement() { return document.createElement("neo-header-card-editor"); }
  static getStubConfig() { return { variant: "header", title: "Überschrift" }; }
}

// ── Editor: konditionales Schema (Referenzmuster für Progressive Disclosure) ──
// Erst "Typ" wählen → danach erscheinen nur die für die Variante relevanten Felder.
// Schema ist eine Funktion (config) => schema[]; makeNeoEditor baut das Formular
// dank rebuildKeys:["variant"] nur bei Varianten-Wechsel neu (kein Fokusverlust)
// und entfernt beim Wechsel die nicht mehr gültigen Keys aus der Config.
const variantField = {
  name: "variant", label: "Typ", selector: { select: { mode: "dropdown", options: [
    { value: "header", label: "Überschrift" },
    { value: "divider", label: "Trenner" },
  ] } },
};

customElements.define("neo-header-card-editor", makeNeoEditor((config) => {
  // Trenner: nur das optionale Label ist relevant — keine Titel/Untertitel/Icon/Farbe.
  if (config?.variant === "divider") {
    return [
      variantField,
      {
        type: "expandable", title: "Inhalt", icon: "mdi:tune-variant", expanded: true,
        schema: [
          { name: "title", label: "Trenner-Label (optional)", selector: { text: {} } },
        ],
      },
    ];
  }
  // Überschrift: vollständige Inhalts- und Darstellungs-Optionen.
  return [
    variantField,
    {
      type: "expandable", title: "Inhalt", icon: "mdi:tune-variant", expanded: true,
      schema: [
        { name: "title", label: "Titel", selector: { text: {} } },
        { name: "subtitle", label: "Untertitel (optional)", selector: { text: {} } },
      ],
    },
    {
      type: "expandable", title: "Darstellung", icon: "mdi:palette",
      schema: [
        // Eigenes Icon-Feld: nativer HA-Picker + Neo-Icon-Raster (icon-picker.js).
        { name: "icon", label: "Icon (optional)", selector: NEO_ICON_SELECTOR },
        { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
      ],
    },
    // Aktionen (Default-Tap = none). navigate · url · perform-action · none.
    neoActionFields({ tapDefault: "none" }),
  ];
}, { name: "Neo Header", description: "Überschrift / Trenner", icon: "🔖", rebuildKeys: ["variant"], normalizeConfig: neoCleanActions }));

NeoDashboardRegistry.registerCard("neo-header-card", NeoHeaderCard, {
  name: "Neo Header",
  description: "Überschrift / Trenner zum Strukturieren",
});

// Neo Dashboard Kit — Extension loader (cards & modules)
// Loads extension code (cards or modules) via script injection. Re-loading the
// same ID is intentional: the registries overwrite the entry, which is exactly
// how updates go live without a page reload.
// Used by the neo-card wrapper at runtime and by its editor's paste-code area.
// Returns { ok, modules, cards } — the manifests that registered while the
// pasted code ran (new installs AND updates of existing IDs). The two lists are
// kept strictly separate: `modules` comes only from registerModule, `cards`
// only from registerCard. A module is never reported as a card.

function neoLoadModule(code) {
  if (!code || !code.trim()) return { ok: false, modules: [], cards: [], error: "leerer Code" };

  const modules = [];
  const cards = [];
  const originalRegisterModule = window.NeoDashboard?.registerModule;
  const originalRegisterCard = window.NeoDashboard?.registerCard;

  // Inline-Scripts werfen ihre Laufzeitfehler NICHT an appendChild, sondern als
  // synchrones globales "error"-Event. Ohne dieses Abfangen würde ein Fehler
  // (z. B. veraltetes Bundle → fehlende API) stumm verpuffen und es sähe so aus,
  // als hätte der Code einfach nichts registriert. Wir fangen ihn auf, damit der
  // Editor eine klare, handlungsleitende Meldung zeigen kann.
  let loadError = null;
  const onErr = (e) => { loadError = (e && (e.message || (e.error && e.error.message))) || "Laufzeitfehler"; };
  window.addEventListener("error", onErr, true);

  try {
    // Capture both new installs and updates. The editor needs the touched ID;
    // diffing only "new IDs" fails when an existing module/card is updated.
    if (window.NeoDashboard) {
      window.NeoDashboard.registerModule = (manifest) => {
        const res = originalRegisterModule ? originalRegisterModule.call(window.NeoDashboard, manifest) : null;
        if (manifest?.id) modules.push(res || manifest);
        return res;
      };
      window.NeoDashboard.registerCard = (type, cls, meta = {}) => {
        const res = originalRegisterCard ? originalRegisterCard.call(window.NeoDashboard, type, cls, meta) : null;
        if (type) cards.push({ type, ...(meta || {}) });
        return res;
      };
    }

    const s = document.createElement("script");
    s.textContent = code;
    document.head.appendChild(s);

    // Live-Swap aller neo-card-Instanzen auf die (neue) Modul-Version – kein Reload nötig.
    window.dispatchEvent(new CustomEvent("neo-module-changed"));
    // `modules` and `cards` are reported separately and never cross-mapped, so
    // the editor can tell a pasted module from a pasted card reliably.
    // `error` is set only when the injected code threw at runtime AND registered
    // nothing useful (lets the editor distinguish "stale bundle / broken code"
    // from "code simply had no registerModule/registerCard call").
    const error = (!modules.length && !cards.length) ? loadError : null;
    return { ok: true, modules, cards, error };
  } catch (e) {
    console.error("[Neo Module] Fehler beim Laden:", e);
    return { ok: false, modules: [], cards: [], error: e?.message || String(e) };
  } finally {
    window.removeEventListener("error", onErr, true);
    if (window.NeoDashboard) {
      if (originalRegisterModule) window.NeoDashboard.registerModule = originalRegisterModule;
      if (originalRegisterCard) window.NeoDashboard.registerCard = originalRegisterCard;
    }
  }
}

// Neo Dashboard Kit — Store (cards & modules)
// Talks to the "Neo Dashboard Tools" integration. Persists store items
// (cards & modules) server-side (file-based) so the dashboard config stays clean.
// Falls back gracefully (available=false) when not installed.

// Modul-Code der letzten erfolgreichen Sitzung. Der Cache wird beim Start
// SYNCHRON (vor dem ersten Karten-Render) injiziert, damit Store-Karten sofort
// registriert sind und NICHT bei jedem Aufruf „Modul wird geladen …" aufblitzen.
// Der WS-Abgleich (_init) bleibt Quelle der Wahrheit und aktualisiert den Cache.
// Schlüssel ist origin-gebunden (localStorage) → pro HA-Instanz eindeutig.
const CACHE_KEY = "neo-modules-cache";
// Format-Version des Cache-Envelopes. NUR erhöhen, wenn sich das gecachte
// Format oder die erwartete Modul-API inkompatibel ändert — dann wird ein alter
// Cache beim Lesen verworfen (einmaliges Flackern, danach frisch befüllt). An
// die Bundle-Version bewusst NICHT gekoppelt, damit normale Updates den Cache
// nicht bei jedem Release invalidieren.
const CACHE_VERSION = 1;

const NeoStore = {
  _hass: null, _initStarted: false, _available: false, _loaded: false, _cache: [], _seeded: false,

  // Cache-Helfer: robust gegen deaktiviertes/volles localStorage (Sonderkontexte).
  // Envelope: { v: CACHE_VERSION, modules: [{name, code}] }. Ein Envelope mit
  // abweichender Version (oder das alte reine Array-Format) wird verworfen.
  _readCache() {
    try {
      const raw = window.localStorage?.getItem(CACHE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!data || data.v !== CACHE_VERSION || !Array.isArray(data.modules)) return [];
      return data.modules;
    } catch (e) { return []; }
  },
  _writeCache(modules) {
    try {
      window.localStorage?.setItem(
        CACHE_KEY,
        JSON.stringify({ v: CACHE_VERSION, modules: modules || [] }),
      );
    } catch (e) { /* Quota/blockiert → Cache ist nur ein Beschleuniger, ignorieren */ }
  },
  _clearCache() {
    try { window.localStorage?.removeItem(CACHE_KEY); } catch (e) { /* ignorieren */ }
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
      // Ist die Integration wirklich weg (WS-Command nicht registriert →
      // „unknown_command"), den Cache leeren, damit gecachte Karten beim
      // nächsten Reload nicht als „Geister" hängenbleiben. Bloße Verbindungs-
      // fehler (Timeout etc.) lassen den funktionierenden Cache unberührt.
      if (e?.code === "unknown_command") this._clearCache();
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

// Neo Dashboard Kit — SHA-256 (synchron, reine JS-Implementierung, FIPS 180-4).
// Integritätsprüfung von Store-Downloads: der Hash des geladenen Codes muss zur
// sha256-Signatur im Store-Index passen (siehe scripts/validate-store.mjs).
// Bewusst NICHT crypto.subtle: das ist in unsicheren Kontexten (HA über http im
// LAN) nicht verfügbar und wäre async. Eingaben sind ≤ 1 MiB (Store-Limit).

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

// SHA-256-Hex der UTF-8-Bytes des übergebenen Strings.
function neoSha256Hex(input) {
  const data = new TextEncoder().encode(String(input ?? ""));
  const bitLen = data.length * 8;
  // Padding: 0x80, Nullen bis Länge ≡ 56 (mod 64), dann 64-bit Big-Endian-Bitlänge.
  const padded = new Uint8Array((((data.length + 8) >> 6) + 1) << 6);
  padded.set(data);
  padded[data.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000));
  dv.setUint32(padded.length - 4, bitLen >>> 0);

  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const w = new Uint32Array(64);
  const rr = (x, n) => (x >>> n) | (x << (32 - n));

  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
  }
  return Array.from(h, (x) => x.toString(16).padStart(8, "0")).join("");
}

// Neo Card Editor — type picker + selected card's editor + card-scoped
// module manager + always-visible "Info & Support" panel.

class NeoCardEditor extends HTMLElement {
  // Übersetzungs-Helfer: folgt der HA-Sprache (EN Standard, DE wenn HA Deutsch).
  _t(s) { return neoT(this._hass, s); }

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
    NeoStore.setHass(h); // serverseitige Modul-Persistenz initialisieren
    if (this._typeForm) this._typeForm.hass = h;
    if (this._sub) this._sub.hass = h;
    (this._modForms || []).forEach((f) => { f.hass = h; });
    if (!this._installedLoaded) { this._installedLoaded = true; this._refreshInstalled(); }
    // Sprache der UI folgt HA. Ändert sie sich (oder erstes hass), neu aufbauen.
    const lang = neoLang(h);
    if (this._builtLang !== lang) { this._builtLang = lang; if (this._built) this._build(); }
  }

  // Re-render der Editor-Sektionen, wenn Karten/Module registriert, aktualisiert
  // oder entfernt werden (Store-Install, Code einfügen, Entfernen, Live-Update).
  connectedCallback() {
    this._onMods = () => this._scheduleReactiveRefresh();
    window.addEventListener("neo-module-changed", this._onMods);
    window.addEventListener("neo-modules-loaded", this._onMods);
  }
  disconnectedCallback() {
    window.removeEventListener("neo-module-changed", this._onMods);
    window.removeEventListener("neo-modules-loaded", this._onMods);
  }

  // Aktualisiert Kartentyp-Picker + Modul-Sektion sofort, aber sicher & sparsam:
  // mehrere Events im selben Frame werden zu EINEM Rebuild zusammengefasst (rAF),
  // und der Picker wird nie neu gebaut, während sein Dropdown offen ist (es würde
  // sonst zuklappen).
  _scheduleReactiveRefresh() {
    if (this._refreshScheduled) return;
    this._refreshScheduled = true;
    requestAnimationFrame(() => {
      this._refreshScheduled = false;
      if (!this._built) return;
      if (this._typeBox && !this._typeMenuOpen) this._renderTypePicker();
      this._renderModulesSection();
    });
  }

  _build() {
    this._built = true;
    this.innerHTML = "";

    // Neo-Editor-Shell: geführte Sektionen im Glas-Design (USP — der Editor
    // trägt dieselbe Designsprache wie die Karten, nicht das generische HA-Grau).
    this._root = document.createElement("div");
    this._root.className = "neo-ed";
    this._root.innerHTML = this._shellStyles();
    this.appendChild(this._root);

    // ── Sektion 1: Kartentyp (eigener, gruppierter & suchbarer Picker) ──
    const typeSec = document.createElement("div");
    typeSec.className = "neo-ed-sec";
    typeSec.innerHTML =
      `<div class="neo-ed-sec-h"><span class="neo-ed-sec-ic">${neoIcon("grid", { size: 15, color: "currentColor" })}</span>${this._t("Kartentyp")}</div>`;
    this._typeBox = document.createElement("div");
    typeSec.appendChild(this._typeBox);
    this._root.appendChild(typeSec);
    this._renderTypePicker();

    // ── Geführter Hinweis / branded Landing (nur ohne Auswahl) ──
    this._hintBox = document.createElement("div");
    this._root.appendChild(this._hintBox);

    // ── Sektion 2: Einstellungen der gewählten Karte (nur mit Auswahl) ──
    this._settingsSec = document.createElement("div");
    this._settingsSec.className = "neo-ed-sec";
    this._settingsSec.innerHTML =
      `<div class="neo-ed-sec-h"><span class="neo-ed-sec-ic">${neoIcon("settings", { size: 15, color: "currentColor" })}</span>${this._t("Einstellungen")}</div>`;
    this._subContainer = document.createElement("div");
    this._settingsSec.appendChild(this._subContainer);
    this._root.appendChild(this._settingsSec);

    // ── Sektion 3: Karten-gebundene Module (style/decorate-Hooks) ──
    this._modPanel = document.createElement("div");
    this._root.appendChild(this._modPanel);
    this._renderModulesSection();

    // ── Info & Support panel (immer sichtbar — kein Aufklappen) ──
    const info = document.createElement("div");
    info.innerHTML = this._infoPanelHtml();
    this._root.appendChild(info);

    this._mountSub();
    this._updateGuidedState();
    this._builtLang = neoLang(this._hass); // verhindert unnötigen Rebuild beim 1. hass
  }

  // Einheitliche Glas-Optik für die Editor-Sektionen (Neo-Designsprache).
  _shellStyles() {
    return `<style>
      .neo-ed { display:flex; flex-direction:column; gap:12px; }
      .neo-ed-sec { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:14px;
        padding:12px 14px 14px; background:var(--neo-fill1,rgba(255,255,255,.03)); }
      .neo-ed-sec-h { display:flex; align-items:center; gap:8px; margin:0 0 10px;
        font-size:11.5px; font-weight:700; letter-spacing:.6px; text-transform:uppercase;
        color:var(--secondary-text-color,rgba(244,246,251,.72)); }
      .neo-ed-sec-ic { display:flex; color:var(--primary-color,#7C9CFF); }
      .neo-ed-landing { display:flex; flex-direction:column; align-items:center; text-align:center;
        gap:8px; padding:22px 18px; border-radius:16px;
        background:linear-gradient(160deg, rgba(124,156,255,.14) 0%, var(--neo-fill1,rgba(255,255,255,.03)) 70%);
        border:1px solid rgba(124,156,255,.24); }
      .neo-ed-landing-logo { line-height:0; filter:drop-shadow(0 6px 16px rgba(124,156,255,.35)); }
      .neo-ed-landing-title { font-size:17px; font-weight:700; color:var(--primary-text-color,#F4F6FB);
        letter-spacing:-.2px; }
      .neo-ed-landing-ver { font-size:11.5px; font-weight:700; letter-spacing:.4px; padding:2px 9px;
        border-radius:999px; color:#7C9CFF; background:rgba(124,156,255,.14); border:1px solid rgba(124,156,255,.34); }
      .neo-ed-landing-desc { font-size:13px; line-height:1.5; max-width:300px;
        color:var(--secondary-text-color,rgba(244,246,251,.72)); }
      .neo-ed-landing-desc b { color:var(--primary-text-color,#F4F6FB); }
    </style>`;
  }

  // Zeigt/versteckt Hinweis + Einstellungs-Sektion je nach Auswahl.
  _updateGuidedState() {
    const hasType = !!this._config.card_type;
    if (this._settingsSec) this._settingsSec.style.display = hasType ? "" : "none";
    // Die Modul-/Erweiterungs-Sektion bleibt IMMER sichtbar — so erreicht man
    // den Store / "Code einfügen" auch ohne vorher einen Kartentyp zu wählen.
    if (this._hintBox) {
      const ver = (window.NeoDashboard && window.NeoDashboard.version) || "";
      this._hintBox.innerHTML = hasType ? "" : `
        <div class="neo-ed-landing">
          <div class="neo-ed-landing-logo">${neoLogo({ size: 60, radius: 18 })}</div>
          <div class="neo-ed-landing-title">Neo Dashboard Kit</div>
          ${ver ? `<div class="neo-ed-landing-ver">v${ver}</div>` : ""}
          <div class="neo-ed-landing-desc">${this._t("Glassmorphism-Karten für dein Dashboard. Wähle oben einen <b>Kartentyp</b> — danach erscheinen hier die Einstellungen und rechts die Live-Vorschau.")}</div>
        </div>`;
    }
  }

  // ── Karten-gebundene Module ──────────────────────────────────
  // Zeigt nur Module, deren target zur aktuellen Karte passt. Aktivierte
  // Module + ihre Einstellungen landen in config.modules ([{ id, settings }])
  // und werden von der Karte über die style/decorate-Hooks live angewandt.
  _enabledList() { return Array.isArray(this._config.modules) ? this._config.modules : []; }
  _isModEnabled(id) { return this._enabledList().some((m) => m.id === id); }
  _modSettings(id) { return this._enabledList().find((m) => m.id === id)?.settings || {}; }
  // Default-Werte aus dem Modul-Manifest (config[].default). So sind sinnvolle
  // Vorgaben (z. B. Akzentfarbe) im Editor sofort vorausgewählt.
  _modDefaults(mod) {
    const out = {};
    (Array.isArray(mod?.config) ? mod.config : []).forEach((f) => {
      if (f && f.name && f.default !== undefined) out[f.name] = f.default;
    });
    return out;
  }

  _isInstalled(id) { return (this._installed || new Set()).has(id); }

  _renderModulesSection() {
    if (!this._modPanel) return;
    this._modForms = [];
    const type = this._config.card_type;
    this._renderedModType = type; // merken, um unnötige Rebuilds zu vermeiden
    const available = type ? NeoModules.forCard(type) : [];

    // Ohne Kartentyp = globale "Erweiterungen" (Karten & Module installieren,
    // direkt von der Startseite). Mit Kartentyp = "Module" für diese Karte.
    const heading = type ? `${this._t("Module")}${available.length ? ` (${available.length})` : ""}` : this._t("Erweiterungen");
    const emptyText = type
      ? this._t("Für diese Karte sind noch keine Module aktiv. Über <b>➕ Modul hinzufügen</b> kommst du zum Store.")
      : this._t("<b>Karten</b> &amp; <b>Module</b> installieren (Store oder Code einfügen) — oder oben einen <b>Kartentyp</b> wählen, um Module für eine Karte zu aktivieren.");

    this._modPanel.innerHTML = `
      ${this._modStyles()}
      <div class="nmod">
        <div class="nmod-h"><span>🧩</span> ${heading}</div>
        ${type && available.length ? `<div class="nmod-list"></div>` : `<div class="nmod-empty">${emptyText}</div>`}
        <div class="nmod-add" id="nmod-add"></div>
      </div>`;

    // Aktive Module zuerst (in Layer-Reihenfolge = config.modules), dann inaktive.
    // Aktive Module mit Einstellungen werden als Accordion gezeigt: nur das
    // geöffnete Modul blendet seine Settings ein (kompakte, kurze Liste).
    const list = this._modPanel.querySelector(".nmod-list");
    if (list) {
      const byId = new Map(available.map((m) => [m.id, m]));
      const active = this._enabledList().map((e) => byId.get(e.id)).filter(Boolean);
      const inactive = available.filter((m) => !this._isModEnabled(m.id));
      const activeWithCfg = active.filter((m) => Array.isArray(m.config) && m.config.length);
      const openId = this._effectiveOpenId(activeWithCfg);
      if (active.length) {
        const hint = document.createElement("div");
        hint.className = "nmod-hint";
        hint.textContent = this._t("Aktive Module — klicke ein Modul an, um die Einstellungen zu bearbeiten.");
        list.appendChild(hint);
      }
      active.forEach((mod, i) => this._renderModItem(list, mod, {
        active: true, reorder: active.length > 1, canUp: i > 0, canDown: i < active.length - 1,
        open: openId === mod.id,
      }));
      inactive.forEach((mod) => this._renderModItem(list, mod, { active: false }));
    }
    this._renderAddArea();
  }

  // Welches aktive Modul ist aufgeklappt? `_openModuleId` ist vom Nutzer
  // gesteuert (id oder null = alles zu). Solange unberührt (undefined) wird bei
  // genau einem konfigurierbaren aktiven Modul dieses automatisch geöffnet.
  _effectiveOpenId(activeWithCfg) {
    if (this._openModuleId !== undefined) return this._openModuleId;
    return activeWithCfg.length === 1 ? activeWithCfg[0].id : null;
  }

  // Accordion umschalten (reine UI — keine Config-Änderung).
  _toggleAccordion(id, isOpen) {
    this._openModuleId = isOpen ? null : id;
    this._renderModulesSection();
  }

  _renderModItem(list, mod, opts) {
    opts = opts || {};
    const on = !!opts.active;
    const expandable = on && Array.isArray(mod.config) && mod.config.length;
    const isOpen = expandable && !!opts.open;
    const item = document.createElement("div");
    item.className = "nmod-item";
    const badge = mod.author ? this._authorChip(mod.author) : "";
    const active = on ? `<span class="nmod-badge">${this._t("Aktiv")}</span>` : "";
    const rm = this._isInstalled(mod.id)
      ? `<button class="nmod-rm" title="${escapeAttr(this._t("Modul entfernen"))}" data-rm="${escapeAttr(mod.id)}">${neoIcon("trash", { size: 15, color: "currentColor" })}</button>`
      : "";
    const move = opts.reorder
      ? `<div class="nmod-move">
           <button data-up title="${this._t("Layer nach oben")}" ${opts.canUp ? "" : "disabled"}>▲</button>
           <button data-down title="${this._t("Layer nach unten")}" ${opts.canDown ? "" : "disabled"}>▼</button>
         </div>`
      : "";
    const chev = expandable
      ? `<span class="nmod-chev ${isOpen ? "open" : ""}">${neoIcon("chevD", { size: 16, color: "currentColor" })}</span>`
      : "";
    item.innerHTML = `
      <div class="nmod-row ${expandable ? "nmod-row--exp" : ""}">
        ${move}
        <span class="nmod-ic">${escapeHtml(mod.icon || "🧩")}</span>
        <div class="nmod-meta">
          <div class="nmod-name">${escapeHtml(mod.name || mod.id)}${badge}${active}</div>
          ${mod.description ? `<div class="nmod-desc">${escapeHtml(mod.description)}</div>` : ""}
        </div>
        ${rm}
        <label class="nmod-sw">
          <input type="checkbox" ${on ? "checked" : ""} />
          <span class="nmod-track"></span><span class="nmod-knob"></span>
        </label>
        ${chev}
      </div>
      ${isOpen ? `<div class="nmod-cfg"></div>` : ""}`;
    list.appendChild(item);

    item.querySelector("input[type=checkbox]")
      .addEventListener("change", (e) => this._toggleModule(mod, e.target.checked));
    item.querySelector("[data-rm]")?.addEventListener("click", (e) => { e.stopPropagation(); this._removeInstalled(mod.id); });
    item.querySelector("[data-up]")?.addEventListener("click", (e) => { e.stopPropagation(); this._moveModule(mod.id, -1); });
    item.querySelector("[data-down]")?.addEventListener("click", (e) => { e.stopPropagation(); this._moveModule(mod.id, 1); });

    // Accordion: Klick auf die Kopfzeile öffnet/schließt das Panel. Klicks auf
    // Schalter, Entfernen oder Reorder lösen den Accordion NICHT aus.
    if (expandable) {
      item.querySelector(".nmod-row").addEventListener("click", (e) => {
        if (e.target.closest(".nmod-sw, .nmod-rm, .nmod-move")) return;
        this._toggleAccordion(mod.id, isOpen);
      });
    }

    if (isOpen) {
      const form = document.createElement("ha-form");
      form.schema = mod.config;
      // Manifest-Defaults zeigen (vorausgewählt), gespeicherte Werte gewinnen.
      form.data = { ...this._modDefaults(mod), ...this._modSettings(mod.id) };
      if (this._hass) form.hass = this._hass;
      form.computeLabel = (s) => s.label || s.name;
      form.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        this._setModuleSettings(mod.id, e.detail.value);
      });
      item.querySelector(".nmod-cfg").appendChild(form);
      this._modForms.push(form);
    }
  }

  _toggleModule(mod, on) {
    const list = this._enabledList().slice();
    const idx = list.findIndex((m) => m.id === mod.id);
    if (on && idx < 0) {
      list.push({ id: mod.id, settings: this._modDefaults(mod) });
      // Frisch aktiviertes Modul mit Einstellungen automatisch aufklappen.
      if (Array.isArray(mod.config) && mod.config.length) this._openModuleId = mod.id;
    } else if (!on && idx >= 0) {
      list.splice(idx, 1);
      if (this._openModuleId === mod.id) this._openModuleId = null;
    }
    this._config = { ...this._config };
    if (list.length) this._config.modules = list;
    else delete this._config.modules;
    this._renderModulesSection();
    this._fire();
  }

  _setModuleSettings(id, settings) {
    const list = this._enabledList().map((m) => (m.id === id ? { ...m, settings } : m));
    this._config = { ...this._config, modules: list };
    this._fire(); // kein Re-Render → Eingabefokus bleibt erhalten
  }

  // Layer-Reihenfolge per ▲▼ ändern (Reihenfolge = Anwendungsreihenfolge).
  _moveModule(id, dir) {
    const list = this._enabledList().slice();
    const i = list.findIndex((m) => m.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    this._config = { ...this._config, modules: list };
    this._renderModulesSection();
    this._fire();
  }

  // ── Modul hinzufügen: Store (CDN-Index, kartengefiltert) + Code einfügen ──
  async _refreshInstalled() {
    if (!NeoStore.available()) { this._installed = new Set(); return; }
    try {
      const mods = await NeoStore.list();
      this._installed = new Set(mods.map((m) => m.name));
    } catch (e) { this._installed = new Set(); }
    this._renderModulesSection();
  }

  // Katalog-Einträge, gefiltert nach aktueller Karte (auf der Startseite: alle).
  _catalog() {
    const type = this._config.card_type;
    // Karten (kind:"card") sind eigenständige neue Kartentypen → immer zeigen.
    // Nur Module werden nach der aktuell gewählten Karte (target) gefiltert.
    return (this._storeItems || []).filter(
      (it) => it.kind === "card" || !type || NeoModules.matches(it.target, type),
    );
  }
  // Meta eines installierten Add-ons aus der Karten- bzw. Modul-Registry.
  _addonMeta(id) {
    const isCard = !!NeoDashboardRegistry.getCard(id);
    const meta = NeoDashboardRegistry.getMeta(id) || {};
    const mod = NeoModules.get(id);
    return {
      isCard,
      name: meta.name || mod?.name || id,
      icon: meta.icon || mod?.icon,
      author: meta.author || mod?.author,
      version: meta.version || mod?.version,
    };
  }
  // Vergleicht Versionsstrings (a > b?), z. B. "1.4.0" > "1.3.9".
  _verGt(a, b) {
    if (!a || !b) return false;
    const pa = String(a).split("."), pb = String(b).split(".");
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const x = parseInt(pa[i], 10) || 0, y = parseInt(pb[i], 10) || 0;
      if (x !== y) return x > y;
    }
    return false;
  }
  // Update verfügbar? Store-Version vorhanden, installierte Version vorhanden und
  // beide unterschiedlich. Store neuer → ja; installiert neuer (Downgrade) → nein;
  // unterschiedlich, aber nicht numerisch vergleichbar → ja (z. B. "dev"≠"1.0.1").
  _hasUpdate(installedV, storeV) {
    if (!installedV || !storeV) return false;
    if (String(installedV) === String(storeV)) return false;
    if (this._verGt(storeV, installedV)) return true;
    if (this._verGt(installedV, storeV)) return false;
    return true;
  }
  // Cache-Busting NUR für manuelles Installieren/Aktualisieren — so lädt jsDelivr
  // (@main) garantiert die frische Datei. Die URL in store/index.json bleibt clean.
  _cacheBustUrl(url) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}t=${Date.now()}`;
  }
  // Autor als farbiger Chip (Premium=Gold, Community=Türkis, sonst Standard) —
  // damit Herkunft/Vertrauen auf einen Blick erkennbar ist.
  _authorChip(author) {
    const a = author || "?";
    const cls = a === "Premium" ? "premium" : a === "Community" ? "community" : "standard";
    return `<span class="nmod-auth ${escapeAttr(cls)}">👤 ${escapeHtml(a)}</span>`;
  }
  // Kleine Vorschau: echtes Screenshot-Bild (image-Feld) ODER eine Icon-Kachel
  // als Fallback, damit jeder Eintrag visuell erkennbar ist.
  // Kleines 42px-Thumbnail: echtes Screenshot-Bild ODER Icon-Kachel als Fallback.
  _thumb(o) {
    const image = safeUrl(o.image);
    return image
      ? `<div class="nmod-thumb"><img src="${escapeAttr(image)}" loading="lazy" alt="" /></div>`
      : `<div class="nmod-thumb nmod-thumb--icon"><span>${escapeHtml(o.icon || "🧩")}</span></div>`;
  }
  // Kompakte Zeile: Thumbnail · Name/Beschreibung/Autor · Primär-Button rechts.
  // Screenshot (falls vorhanden) ist als „Vorschau" aufklappbar (native <details>).
  _storeRow(o) {
    const homepage = safeUrl(o.homepage);
    const image = safeUrl(o.image);
    const status = o.installed
      ? (o.hasUpdate
          ? `<span class="nmod-badge upd">⬆ ${this._t("Update")}</span>`
          : `<span class="nmod-badge ok">${this._t("✓ Installiert")}</span>`)
      : "";
    const verLine = o.hasUpdate
      ? `<span class="nmod-ver">v${escapeHtml(o.installedVersion)} → v${escapeHtml(o.storeVersion)}</span>`
      : (o.version ? `<span class="nmod-ver">v${escapeHtml(o.version)}</span>` : "");

    // Primärer Button rechts: Installieren/Aktualisieren — sonst Entfernen.
    const primary = o.installId
      ? `<button class="nmod-mini" data-install-id="${escapeAttr(o.installId)}">${this._t(o.installLabel)}</button>`
      : (o.uninstallId ? `<button class="nmod-mini ghost" data-uninstall="${escapeAttr(o.uninstallId)}">${this._t("Entfernen")}</button>` : "");
    // Sekundär-Links (klein, dezent): Entfernen (nur wenn Primär=Install/Update) + Info.
    const secondary = [
      (o.installId && o.uninstallId) ? `<button class="nmod-link" data-uninstall="${escapeAttr(o.uninstallId)}">${this._t("Entfernen")}</button>` : "",
      homepage ? `<a class="nmod-link" href="${escapeAttr(homepage)}" target="_blank" rel="noopener">${this._t("Info")}</a>` : "",
    ].filter(Boolean).join("");
    const preview = image
      ? `<details class="nmod-prevwrap"><summary>${this._t("Vorschau")}</summary><div class="nmod-prev"><img src="${escapeAttr(image)}" loading="lazy" alt="" /></div></details>`
      : "";
    // Beschreibung ODER (bei per-Code-Installierten) der Hinweis — beide als
    // einheitliche 1-Zeilen-Beschreibung, damit alle Zeilen gleich aussehen.
    const desc = o.description || o.note || "";
    const search = `${o.name || ""} ${desc} ${o.author || ""}`.toLowerCase();

    return `<div class="nmod-row" data-search="${escapeAttr(search)}">
        <div class="nmod-row-main">
          ${this._thumb(o)}
          <div class="nmod-row-mid">
            <div class="nmod-name"><span class="nmod-nm">${escapeHtml(o.name)}</span><span class="nmod-badge">${this._t(o.kind)}</span>${status}</div>
            ${desc ? `<div class="nmod-desc nmod-desc--1" title="${escapeAttr(desc)}">${escapeHtml(desc)}</div>` : ""}
            <div class="nmod-sub">${this._authorChip(o.author)}${verLine}${secondary ? `<span class="nmod-links">${secondary}</span>` : ""}</div>
          </div>
          ${primary ? `<div class="nmod-row-act">${primary}</div>` : ""}
        </div>
        ${preview}
      </div>`;
  }

  _renderAddArea() {
    const host = this._modPanel.querySelector("#nmod-add");
    if (!host) return;
    // Auf der Startseite (kein Kartentyp) standardmäßig aufgeklappt — der
    // Installations-Weg soll sofort sichtbar sein, nicht versteckt.
    const open = this._addOpen ?? !this._config.card_type;
    const tab = this._addTab || "store";
    const label = this._config.card_type ? this._t("Modul hinzufügen") : this._t("Karte oder Modul installieren");
    host.innerHTML = `
      <button class="nmod-addbtn" id="nmod-addbtn">${open ? "▾" : "➕"} ${label}</button>
      <div class="nmod-addbody" style="display:${open ? "block" : "none"}">
        <div class="nmod-tabs">
          <div class="nmod-tab ${tab === "store" ? "active" : ""}" data-tab="store">${this._t("Store")}</div>
          <div class="nmod-tab ${tab === "paste" ? "active" : ""}" data-tab="paste">${this._t("Code einfügen")}</div>
        </div>
        <div class="nmod-tabbody">${tab === "store" ? this._storeHtml() : this._pasteHtml()}</div>
        <div class="nmod-msg" id="nmod-msg"></div>
      </div>`;

    host.querySelector("#nmod-addbtn").addEventListener("click", () => {
      this._addOpen = !open;
      this._renderAddArea();
      if (this._addOpen && (this._addTab || "store") === "store" && this._storeNeedsLoad()) this._loadStoreIndex();
    });
    host.querySelectorAll(".nmod-tab").forEach((t) =>
      t.addEventListener("click", () => {
        this._addTab = t.getAttribute("data-tab");
        this._renderAddArea();
        if (this._addTab === "store" && this._storeNeedsLoad()) this._loadStoreIndex();
      }));
    this._wireAddArea();
    // Auto-Laden, wenn die Add-Area (z. B. auf der Startseite) offen startet.
    if (open && tab === "store" && this._storeNeedsLoad()) this._loadStoreIndex();
  }

  // Soll der Live-Katalog (neu) geladen werden? Noch nie geladen ODER älter als
  // die TTL → ja. So holt sich der Store frische Katalog-Daten (neue Versionen/
  // Beschreibungen), ohne dass der Nutzer „Store aktualisieren" suchen muss —
  // und ohne bei jedem Öffnen neu zu laden.
  _storeNeedsLoad() {
    if (this._storeLoading) return false;
    if (!this._storeItems) return true;
    return !this._storeFetchedAt || (Date.now() - this._storeFetchedAt) > 30000;
  }

  // Persistenter Kopf des Store-Tabs: Titel + dauerhaft sichtbarer
  // "Store aktualisieren"-Button (lädt den Live-Katalog mit Cache-Bust neu).
  _storeBar() {
    return `<div class="nmod-storebar">
        <span class="nmod-storebar-t">${this._t("Offizieller Store")}</span>
        <button class="nmod-mini ghost" id="nmod-refresh" ${this._storeLoading ? "disabled" : ""}>⟳ ${this._t("Store aktualisieren")}</button>
      </div>`;
  }

  // Kompakter, dezenter Sicherheitshinweis vor der Installation.
  _storeWarn() {
    return `<div class="nmod-warn">🛈 ${this._t("Erweiterungen führen JavaScript in Home Assistant aus. Installiere nur vertrauenswürdige Erweiterungen.")}</div>`;
  }
  // Link zu GitHub Discussions — reiner Vorschlag/Showcase, KEINE Installquelle.
  _storeSuggest() {
    return `<a class="nmod-suggest" href="${escapeAttr(NEO_LINKS.newDiscussion)}" target="_blank" rel="noopener">💬 ${this._t("Community-Beitrag vorschlagen")}</a>`;
  }
  // Ruhiger Lade-Zustand: ein paar Platzhalter-Kacheln statt Progress-Screen.
  _storeSkeleton() {
    const tile = `<div class="nmod-skel">
        <div class="nmod-skel-prev"></div>
        <div class="nmod-skel-line w60"></div>
        <div class="nmod-skel-line w35"></div>
      </div>`;
    return `<div class="nmod-skelwrap">${tile.repeat(3)}</div>
      <div class="nmod-note nmod-note--muted">${this._t("Store wird aktualisiert …")}</div>`;
  }

  _storeHtml() {
    const bar = this._storeBar();
    if (!NeoStore.available()) {
      return bar + `<div class="nmod-note">${this._t("⚠️ Für den Store wird die Integration <b>Neo Dashboard Tools</b> benötigt (serverseitiges Speichern + Laden).")}</div>` + this._storeSuggest();
    }
    if (this._storeLoading) return bar + this._storeSkeleton();
    if (this._storeErr) return bar + `<div class="nmod-note nmod-note--err">${this._t(this._storeErr)}</div>` + this._storeSuggest();

    // Katalog (offizieller Store) + installierte Add-ons, die NICHT im Katalog
    // sind (z. B. eingefügte Premium-Karten) — getrennt dargestellt.
    const catalog = this._catalog();
    const seen = new Set(catalog.map((c) => c.id));
    const extra = Array.from(this._installed || []).filter((id) => !seen.has(id));
    if (!catalog.length && !extra.length) {
      return bar + `<div class="nmod-note">${this._t("Aktuell keine Store-Module verfügbar. Premium-Karten (z. B. Wetter) fügst du über <b>Code einfügen</b> hinzu.")}</div>` + this._storeSuggest();
    }

    const mkRow = (it) => {
      const installed = this._isInstalled(it.id);
      const reg = this._addonMeta(it.id);
      const installedVersion = installed ? reg.version : null;
      const storeVersion = it.version;
      const hasUpdate = installed && this._hasUpdate(installedVersion, storeVersion);
      const showInstall = !installed || hasUpdate; // installiert & aktuell → nur Entfernen/Info
      const isCard = reg.isCard || it.kind === "card";
      return {
        isCard,
        html: this._storeRow({
          icon: it.icon || reg.icon, name: it.name || it.id, author: it.author || reg.author,
          version: installedVersion || storeVersion, installedVersion, storeVersion,
          kind: isCard ? "Karte" : "Modul",
          installed, hasUpdate, homepage: it.homepage || it.repo, image: it.image, description: it.description,
          // Per ID referenzieren (nicht Index) — bleibt korrekt, wenn sich die
          // gefilterte Liste zwischen Render und Klick ändert.
          installId: showInstall ? it.id : "", installLabel: installed ? "Aktualisieren" : "Installieren",
          uninstallId: installed ? it.id : null,
        }),
      };
    };
    const rows = catalog.map(mkRow);
    const cardRows = rows.filter((r) => r.isCard).map((r) => r.html);
    const moduleRows = rows.filter((r) => !r.isCard).map((r) => r.html);
    // Installierte ohne Katalog-Eintrag (z. B. per Code eingefügt) — eigene,
    // klar abgegrenzte Sektion; keine Store-Quelle zum Aktualisieren.
    const extraRows = extra.map((id) => {
      const reg = this._addonMeta(id);
      return this._storeRow({
        icon: reg.icon, name: reg.name, author: reg.author, version: reg.version,
        kind: reg.isCard ? "Karte" : "Modul", installed: true, uninstallId: id,
        note: this._t("Per Code eingefügt — Update durch erneutes Einfügen."),
      });
    });

    // Gruppe nur rendern, wenn sie Einträge hat (Überschrift + Zähler).
    const group = (key, title, arr) => arr.length
      ? `<div class="nmod-group" data-group="${key}"><div class="nmod-grouph">${this._t(title)}<span class="nmod-grouph-c">· ${arr.length}</span></div>${arr.join("")}</div>`
      : "";

    // Suchfeld erst ab ~6 Einträgen — bei wenigen lohnt es nicht.
    const total = cardRows.length + moduleRows.length + extraRows.length;
    const search = total >= 6
      ? `<div class="nmod-search"><span>🔎</span><input id="nmod-search" type="text" autocomplete="off" placeholder="${this._t("Store durchsuchen …")}"></div>`
      : "";

    return bar
      + this._storeWarn()
      + search
      + group("cards", "Karten", cardRows)
      + group("modules", "Module", moduleRows)
      + group("installed", "Installiert (per Code eingefügt)", extraRows)
      + this._storeSuggest();
  }

  _pasteHtml() {
    // Klarstellung: dieser Weg ist für Premium-/privat geprüften Code — NICHT
    // der öffentliche Store. Installation aus dem Store bleibt der kuratierte Weg.
    const intro = `<div class="nmod-note nmod-note--muted">${this._t("Für Premium-Code (z. B. Patreon) oder privat geprüften Test-Code. Wird nicht über den öffentlichen Store verteilt.")}</div>`;
    const note = NeoStore.available()
      ? ""
      : `<div class="nmod-note">${this._t("ℹ️ Ohne <b>Neo Dashboard Tools</b> wird das Modul nur für diese Sitzung geladen (nicht dauerhaft gespeichert).")}</div>`;
    return `${intro}${note}
      <textarea id="nmod-code" placeholder="${escapeAttr(this._t("Modul- oder Karten-Code einfügen (registerModule / registerCard, z. B. Premium-Karten) …"))}"></textarea>
      <button class="nmod-mini" id="nmod-paste-add">${this._t("Hinzufügen")}</button>`;
  }

  _wireAddArea() {
    const q = (s) => this._modPanel.querySelector(s);
    // "Store aktualisieren" — Cache leeren und Live-Katalog neu laden (auch Retry).
    q("#nmod-refresh")?.addEventListener("click", () => { this._storeItems = null; this._storeErr = null; this._loadStoreIndex(); });
    q("#nmod-paste-add")?.addEventListener("click", () => {
      const code = (q("#nmod-code").value || "").trim();
      this._pasteModule(code);
    });
    this._modPanel.querySelectorAll("[data-install-id]").forEach((b) =>
      b.addEventListener("click", () => {
        if (b.disabled) return;
        const id = b.getAttribute("data-install-id");
        b.disabled = true; // Doppelklick verhindern
        b.textContent = this._t(this._isInstalled(id) ? "Aktualisiere …" : "Installiere …");
        this._installFromStore((this._storeItems || []).find((it) => it.id === id));
      }));
    this._modPanel.querySelectorAll("[data-uninstall]").forEach((b) =>
      b.addEventListener("click", () => this._removeInstalled(b.getAttribute("data-uninstall"))));

    // Live-Suche: Zeilen per display ein-/ausblenden (kein Re-Render = kein
    // Fokusverlust); leere Gruppen werden mit ausgeblendet. Term überlebt
    // Re-Renders (z. B. nach Installation) und wird neu angewendet.
    const searchEl = q("#nmod-search");
    if (searchEl) {
      const applyFilter = (val) => {
        const term = (val || "").trim().toLowerCase();
        this._storeSearch = val || "";
        this._modPanel.querySelectorAll(".nmod-group").forEach((grp) => {
          let visible = 0;
          grp.querySelectorAll(".nmod-row").forEach((row) => {
            const hit = !term || (row.getAttribute("data-search") || "").includes(term);
            row.style.display = hit ? "" : "none";
            if (hit) visible++;
          });
          grp.style.display = visible ? "" : "none";
        });
      };
      searchEl.addEventListener("input", (e) => applyFilter(e.target.value));
      if (this._storeSearch) { searchEl.value = this._storeSearch; applyFilter(this._storeSearch); }
    }
  }

  _msg(text, err) {
    const m = this._modPanel.querySelector("#nmod-msg");
    if (m) { m.style.color = err ? "var(--error-color,#F87171)" : "var(--success-color,#5EDCB8)"; m.textContent = text; }
  }

  async _loadStoreIndex() {
    if (!NeoStore.available()) { this._renderAddArea(); return; }
    // Mindest-Sichtbarkeit des Skeleton-States: Der serverseitige Fetch ist oft
    // <50 ms (Cache) — ohne Mindestzeit würde der Lade-Zustand nur aufblitzen.
    // 400 ms geben ruhiges, klares Feedback, ohne sich künstlich langsam
    // anzufühlen. (Betrifft Timing, nicht Animation — Shimmer respektiert
    // prefers-reduced-motion weiterhin per CSS.)
    const MIN_SKELETON_MS = 400;
    const started = Date.now();
    this._storeLoading = true; this._storeErr = null; this._renderAddArea();
    try {
      // PRIMÄR: GitHub-API (Echtzeit, kein Pfad-CDN-Cache). FALLBACK: raw
      // (~5 min Cache), falls die API scheitert (z. B. Rate-Limit).
      let rawItems;
      try {
        rawItems = await this._fetchIndexArray(NEO_LINKS.modulesIndex);
      } catch (_e) {
        rawItems = await this._fetchIndexArray(NEO_LINKS.modulesIndexFallback);
      }
      this._storeItems = this._normalizeStoreItems(rawItems);
      this._storeFetchedAt = Date.now(); // für TTL-basiertes Auto-Refresh
    } catch (e) {
      this._storeItems = [];
      this._storeErr = "Store-Index konnte nicht geladen werden. Prüfe die Internetverbindung und versuche es erneut.";
    }
    // Schnelle Antworten trotzdem kurz als Lade-Zustand zeigen; langsame nicht
    // zusätzlich verzögern.
    const remaining = MIN_SKELETON_MS - (Date.now() - started);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
    this._storeLoading = false;
    this._renderAddArea();
  }

  // Lädt eine Index-URL (cache-gebustet) und gibt das Item-Array zurück.
  // Wirft, wenn die Antwort kein JSON-Array ist — damit der Aufrufer auf die
  // Fallback-Quelle ausweichen kann.
  async _fetchIndexArray(url) {
    const sep = url.includes("?") ? "&" : "?";
    const txt = await NeoStore.fetch(`${url}${sep}t=${Date.now()}`);
    const data = JSON.parse(txt); // wirft bei ungültigem JSON
    if (!Array.isArray(data)) throw new Error("index is not an array");
    return data;
  }

  // Defensive parsing: keep the store usable even if a single catalog entry is
  // broken. Invalid items are skipped (with a console warning) instead of
  // breaking the whole list. Items with a missing required field, a bad id, or
  // a foreign/invalid url are never shown or installable. Mirrors the CI rules
  // in scripts/validate-store.mjs (lightweight client-side copy).
  _normalizeStoreItems(items) {
    if (!Array.isArray(items)) {
      console.warn("[Neo Store] index is not an array — ignoring.");
      return [];
    }
    const PREFIX = "https://cdn.jsdelivr.net/gh/bkstudy2025/neo-dashboard-kit@";
    const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const SHA256_RE = /^[0-9a-f]{64}$/;
    // "target" NICHT hier: es darf ein String ("*"/Kartentyp) ODER ein Array von
    // Kartentypen sein → separat geprüft (siehe unten). Die generische Schleife
    // verlangt String und würde ein gültiges Array-Target fälschlich als „fehlend"
    // melden und den Eintrag stumm aus dem Store werfen.
    const REQUIRED = ["id", "name", "description", "author", "version", "icon", "url", "sha256"];
    const out = [];
    const seen = new Set();
    items.forEach((it, i) => {
      if (!it || typeof it !== "object" || Array.isArray(it)) {
        console.warn(`[Neo Store] item[${i}] is not an object — skipped.`);
        return;
      }
      const ref = (typeof it.id === "string" && it.id) ? it.id : `item[${i}]`;
      const missing = REQUIRED.filter((f) => typeof it[f] !== "string" || !it[f].trim());
      if (missing.length) {
        console.warn(`[Neo Store] "${ref}" skipped — missing field(s): ${missing.join(", ")}.`);
        return;
      }
      // target: nicht-leerer String ("*" / Kartentyp) ODER nicht-leeres Array
      // nicht-leerer Strings. Spiegelt das Runtime-Targeting (src/core/modules.js)
      // und die CI (scripts/validate-store.mjs). Ein auf bestimmte Karten
      // beschränktes Modul (Array-Target, z. B. neo-pulse-ring) ist gültig.
      const tgt = it.target;
      const validTarget =
        (typeof tgt === "string" && tgt.trim() !== "") ||
        (Array.isArray(tgt) && tgt.length > 0 && tgt.every((x) => typeof x === "string" && x.trim() !== ""));
      if (!validTarget) {
        console.warn(`[Neo Store] "${ref}" skipped — invalid target (need non-empty string or array of strings).`);
        return;
      }
      if (!ID_RE.test(it.id)) {
        console.warn(`[Neo Store] "${ref}" skipped — invalid id (need lowercase kebab-case).`);
        return;
      }
      if (seen.has(it.id)) {
        console.warn(`[Neo Store] "${ref}" skipped — duplicate id.`);
        return;
      }
      if (it.kind !== undefined && it.kind !== "module" && it.kind !== "card") {
        console.warn(`[Neo Store] "${ref}" skipped — invalid kind "${it.kind}".`);
        return;
      }
      if (!it.url.startsWith(PREFIX) || !it.url.endsWith(`/store/modules/${it.id}.js`)) {
        console.warn(`[Neo Store] "${ref}" skipped — url not allowed: ${it.url}`);
        return;
      }
      // Integritäts-Signatur ist Pflicht: ohne (gültige) sha256 ist der Eintrag
      // nicht installierbar — die Download-Prüfung in _installFromStore braucht sie.
      if (!SHA256_RE.test(it.sha256)) {
        console.warn(`[Neo Store] "${ref}" skipped — missing/invalid sha256 signature.`);
        return;
      }
      seen.add(it.id);
      out.push(it);
    });
    return out;
  }

  async _installFromStore(item) {
    if (!item || this._installBusy) return;
    this._installBusy = true;
    const updating = this._isInstalled(item.id);
    const name = item.name || item.id;
    this._msg(this._t(updating ? "Aktualisiere …" : "Installiere …"));
    try {
      // Cache-Busting → frische Datei (auch bei jsDelivr @main), für Install UND Update.
      const code = await NeoStore.fetch(this._cacheBustUrl(item.url));
      // Integritätsprüfung VOR dem Ausführen: Der geladene Code muss zur
      // sha256-Signatur aus dem kuratierten Index passen (CI pflegt sie via
      // validate-store.mjs). Fängt manipulierte/veraltete CDN-Inhalte ab,
      // bevor irgendetwas injiziert oder gespeichert wird.
      if (neoSha256Hex(code) !== item.sha256) {
        throw new Error(this._t("Integritätsprüfung fehlgeschlagen: Der geladene Code passt nicht zur Signatur im Store-Index. Nicht installiert."));
      }
      const res = neoLoadModule(code); // registriert das Modul sofort
      if (!res.ok) throw new Error("Code-Fehler");
      // Verifikation: der geladene Code MUSS die erwartete ID registriert haben.
      // `res.ok` heißt nur "Script eingehängt", nicht "Karte/Modul registriert".
      // Liefert das CDN/der Proxy z. B. eine HTML-Fehlerseite (content-type
      // text/html), wird sie als <script> mit stillem SyntaxError injiziert →
      // es registriert sich nichts. Ohne diese Prüfung würde der kaputte Inhalt
      // gespeichert und als "Installiert" angezeigt, taucht aber nie im Picker
      // auf (und ein Update wird wegen passender Version nie angeboten).
      const registeredIds = (res.cards || []).map((c) => c.type)
        .concat((res.modules || []).map((m) => m.id));
      if (!registeredIds.includes(item.id)) {
        // res.error gesetzt → Code warf zur Laufzeit (oft veraltetes Bundle nach
        // Kit-Update); sonst lieferte der Fetch vermutlich keinen gültigen Code.
        throw new Error(res.error
          ? this._t("Karte konnte nicht geladen werden: {err}. Falls das Kit gerade aktualisiert wurde, bitte einmal hart neu laden (Strg/Cmd+Shift+R).").replace("{err}", res.error)
          : this._t("Geladener Code registriert nicht die erwartete Karte/Modul-ID (evtl. CDN-Fehlerseite). Nicht gespeichert."));
      }
      // Sicherheitsnetz: geladene Manifest-Version muss zur Store-Version passen.
      // Schützt vor stale CDN-Inhalten (v. a. bei @main-URLs) → nicht speichern.
      const loadedVer = this._addonMeta(item.id).version;
      if (item.version && loadedVer && String(loadedVer) !== String(item.version)) {
        throw new Error(this._t("Geladene Modulversion passt nicht zur Store-Version. Vermutlich CDN-Cache."));
      }
      // Nur bei erfolgreichem Laden serverseitig speichern (keine halbe Aktualisierung).
      if (NeoStore.available()) await NeoStore.save(item.id, code);
      await this._refreshInstalled(); // re-rendert → neue Version + Badge
      this._msg(this._t(updating ? "✓ „{name}” aktualisiert." : "✓ „{name}” installiert.").replace("{name}", name));
    } catch (e) {
      this._renderAddArea(); // Buttons wiederherstellen (alte Version bleibt erhalten)
      this._msg(this._t(updating ? "Aktualisierung fehlgeschlagen: {err}" : "Installation fehlgeschlagen: {err}").replace("{err}", e?.message || e), true);
    } finally {
      this._installBusy = false;
    }
  }

  async _pasteModule(code) {
    if (!code) return this._msg(this._t("Bitte Code einfügen."), true);
    // Snapshot existing IDs so we can tell a NEW install from an UPDATE.
    const modsBefore = new Set(NeoModules.list().map((m) => m.id));
    const cardsBefore = new Set(NeoDashboardRegistry.list().map((c) => c.type));
    const res = neoLoadModule(code);
    if (!res.ok) return this._msg(this._t("Code konnte nicht geladen werden."), true);
    // registerCard → res.cards, registerModule → res.modules (no cross-mapping),
    // so a module update is never mistaken for a card.
    const card = (res.cards || [])[0];
    const mod = (res.modules || [])[0];
    if (!card && !mod) {
      // Nichts registriert. Hat der Code zur Laufzeit geworfen (res.error), liegt
      // es meist an einem veralteten Bundle (fehlende API nach einem Kit-Update)
      // → klare, handlungsleitende Meldung statt "registerCard fehlt?".
      return this._msg(res.error
        ? this._t("Karte konnte nicht geladen werden: {err}. Falls das Kit gerade aktualisiert wurde, bitte einmal hart neu laden (Strg/Cmd+Shift+R).").replace("{err}", res.error)
        : this._t("Kein Modul/Karte erkannt (registerModule/registerCard fehlt?)."), true);
    }
    const id = card?.type || mod?.id || `neo-${Date.now()}`;
    try {
      if (NeoStore.available()) await NeoStore.save(id, code);
      await this._refreshInstalled();
      let msg;
      if (card) {
        const name = card.name || card.type;
        const isNew = !cardsBefore.has(card.type);
        // Live verwendbar machen, ohne Reload: ist noch keine Karte gewählt, die
        // neue direkt auswählen + rendern. Sonst nur die Bereich-Auswahl auf ihre
        // Kategorie stellen, damit sie sofort im Dropdown auftaucht.
        if (isNew && !this._config.card_type) {
          this._selectType(card.type); // wählt aus, mountet Editor, rendert, feuert
        } else {
          this._selectedCat = this._catOf(card.author);
          this._renderTypePicker();
        }
        msg = isNew
          ? this._t("✓ Karte „{name}” hinzugefügt — oben im Kartentyp wählbar.").replace("{name}", name)
          : this._t("✓ Karte „{name}” aktualisiert.").replace("{name}", name);
      } else {
        this._renderTypePicker();
        const name = mod.name || mod.id;
        msg = modsBefore.has(mod.id)
          ? this._t("✓ Modul „{name}” aktualisiert.").replace("{name}", name)
          : this._t("✓ Modul „{name}” hinzugefügt.").replace("{name}", name);
      }
      this._msg(msg);
    } catch (e) {
      this._msg(this._t("Speichern fehlgeschlagen: {err}").replace("{err}", e?.message || e), true);
    }
  }

  async _removeInstalled(id) {
    const isCard = !!NeoDashboardRegistry.getCard(id);
    // Serverseitig löschen — Fehler sichtbar machen (nicht verschlucken).
    if (NeoStore.available()) {
      try { await NeoStore.delete(id); }
      catch (e) { return this._msg(this._t("Entfernen fehlgeschlagen: {err}").replace("{err}", e?.message || e), true); }
    }
    // Sofort live aus der Registry nehmen — beide feuern "neo-module-changed",
    // wodurch Picker + Modul-Sektion umgehend (und sicher) aktualisiert werden.
    // Karten lassen sich später erneut installieren (versionierte Tags).
    if (isCard) NeoDashboardRegistry.unregisterCard(id);
    else if (NeoModules.get(id)) NeoModules.unregister(id);
    // War die entfernte Karte gerade ausgewählt, Auswahl zurücksetzen.
    if (isCard && this._config.card_type === id) {
      this._config = { type: this._config.type };
      this._mountSub();
      this._updateGuidedState();
      this._fire();
    }
    // Aus der aktiven Konfiguration nehmen, falls als Modul aktiviert.
    if (this._isModEnabled(id)) {
      const list = this._enabledList().filter((m) => m.id !== id);
      this._config = { ...this._config };
      if (list.length) this._config.modules = list; else delete this._config.modules;
      if (this._openModuleId === id) this._openModuleId = null;
      this._fire();
    }
    await this._refreshInstalled();
    this._msg(this._t(isCard ? "Karte entfernt." : "Modul entfernt."));
  }

  _modStyles() {
    return `
      <style>
        .nmod { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:14px; padding:12px 14px 6px;
          background:var(--neo-fill1,rgba(255,255,255,.03)); }
        .nmod-h { display:flex; align-items:center; gap:8px; margin:0 0 4px;
          font-size:11.5px; font-weight:700; letter-spacing:.6px; text-transform:uppercase;
          color:var(--secondary-text-color,rgba(244,246,251,.72)); }
        .nmod-empty { font-size:12.5px; color:var(--secondary-text-color); padding:6px 0 10px; line-height:1.45; }
        .nmod-item { border-top:1px solid var(--divider-color,rgba(255,255,255,.08)); padding:11px 0; }
        .nmod-item:first-of-type { border-top:0; }
        .nmod-row { display:flex; align-items:flex-start; gap:10px; }
        .nmod-ic { font-size:18px; line-height:1.2; flex-shrink:0; }
        .nmod-meta { flex:1; min-width:0; }
        .nmod-name { font-size:13.5px; font-weight:600; color:var(--primary-text-color); display:flex; align-items:center; gap:6px; }
        .nmod-desc { font-size:12px; color:var(--secondary-text-color); margin-top:2px; line-height:1.4; }
        .nmod-badge { font-size:10px; font-weight:700; padding:1px 6px; border-radius:999px;
          color:#7C9CFF; background:rgba(124,156,255,.14); border:1px solid rgba(124,156,255,.3); }
        .nmod-sw { position:relative; width:38px; height:22px; flex-shrink:0; cursor:pointer; }
        .nmod-sw input { position:absolute; opacity:0; width:100%; height:100%; margin:0; cursor:pointer; }
        .nmod-track { position:absolute; inset:0; border-radius:11px; background:var(--neo-line5,rgba(255,255,255,.14)); transition:background .2s; }
        .nmod-knob { position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:9px; background:#fff;
          transition:transform .2s cubic-bezier(.2,.8,.2,1); box-shadow:0 1px 2px rgba(0,0,0,.3); }
        .nmod-sw input:checked ~ .nmod-track { background:var(--primary-color,#7C9CFF); }
        .nmod-sw input:checked ~ .nmod-knob { transform:translateX(16px); }
        .nmod-rm { width:28px; height:28px; flex-shrink:0; border:none; cursor:pointer; border-radius:8px;
          display:flex; align-items:center; justify-content:center; background:transparent; color:var(--error-color,#F87171); }
        .nmod-move { display:flex; flex-direction:column; gap:2px; flex-shrink:0; }
        .nmod-move button { width:22px; height:15px; line-height:1; padding:0; border:none; cursor:pointer; border-radius:5px;
          font-size:9px; color:var(--secondary-text-color); background:var(--neo-fill2,rgba(255,255,255,.06)); }
        .nmod-move button:disabled { opacity:.3; cursor:default; }
        .nmod-cfg { margin-top:8px; }
        .nmod-hint { font-size:12px; color:var(--secondary-text-color); margin:2px 0 8px; line-height:1.4; }
        .nmod-row--exp { cursor:pointer; }
        .nmod-chev { flex-shrink:0; display:flex; align-items:center; margin-left:2px;
          color:var(--secondary-text-color); transition:transform .2s; }
        .nmod-chev.open { transform:rotate(180deg); }
        .nmod-add { border-top:1px solid var(--divider-color,rgba(255,255,255,.08)); margin-top:6px; padding-top:8px; }
        .nmod-addbtn { width:100%; padding:9px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600;
          color:var(--primary-text-color); background:var(--neo-fill2,rgba(255,255,255,.06));
          border:1px dashed var(--divider-color,rgba(255,255,255,.18)); }
        .nmod-addbody { margin-top:10px; }
        .nmod-tabs { display:flex; gap:6px; margin-bottom:10px; }
        .nmod-tab { flex:1; text-align:center; padding:7px; border-radius:9px; cursor:pointer; font-size:12.5px; font-weight:600;
          color:var(--secondary-text-color); background:transparent; border:1px solid var(--divider-color,rgba(255,255,255,.12)); }
        .nmod-tab.active { color:#fff; background:var(--primary-color,#7C9CFF); border-color:transparent; }
        .nmod-note { font-size:12px; color:var(--secondary-text-color); line-height:1.45; margin:4px 0 8px; }
        .nmod-note--err { color:var(--error-color,#F87171); }
        .nmod-storebar { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:0 0 10px; }
        .nmod-storebar-t { font-size:11.5px; font-weight:700; letter-spacing:.5px; text-transform:uppercase;
          color:var(--secondary-text-color,rgba(244,246,251,.72)); }
        .nmod-storebar .nmod-mini { margin-top:0; padding:6px 10px; }
        .nmod-storebar .nmod-mini[disabled] { opacity:.5; cursor:default; }
        .nmod-note--muted { opacity:.7; }
        .nmod-warn { display:flex; gap:7px; align-items:flex-start; font-size:11.5px; line-height:1.45;
          color:var(--secondary-text-color,rgba(244,246,251,.72)); margin:0 0 10px; padding:8px 10px; border-radius:9px;
          background:var(--neo-fill1,rgba(255,255,255,.03)); border:1px solid var(--divider-color,rgba(255,255,255,.1)); }
        .nmod-subh { font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase;
          color:var(--secondary-text-color,rgba(244,246,251,.72)); margin:14px 0 8px; }
        .nmod-suggest { display:inline-flex; align-items:center; gap:6px; margin-top:10px; padding:7px 12px; border-radius:999px;
          font-size:12.5px; font-weight:600; text-decoration:none; cursor:pointer;
          color:var(--primary-text-color); background:var(--neo-fill2,rgba(255,255,255,.06));
          border:1px solid var(--neo-line2,rgba(255,255,255,.1)); }
        .nmod-suggest:hover { border-color:var(--primary-color,#7C9CFF); }
        .nmod-skelwrap { display:flex; flex-direction:column; gap:8px; }
        .nmod-skel { border:1px solid var(--divider-color,rgba(255,255,255,.08)); border-radius:12px; padding:10px; }
        .nmod-skel-prev { height:48px; border-radius:8px; margin-bottom:9px; }
        .nmod-skel-line { height:11px; border-radius:6px; margin-top:7px; }
        .nmod-skel-line.w60 { width:60%; } .nmod-skel-line.w35 { width:35%; }
        .nmod-skel-prev, .nmod-skel-line { background:linear-gradient(100deg,
          var(--neo-fill1,rgba(255,255,255,.04)) 30%, var(--neo-fill2,rgba(255,255,255,.09)) 50%,
          var(--neo-fill1,rgba(255,255,255,.04)) 70%); background-size:220% 100%; animation:nmod-shimmer 1.4s ease-in-out infinite; }
        @keyframes nmod-shimmer { 0% { background-position:180% 0; } 100% { background-position:-40% 0; } }
        @media (prefers-reduced-motion: reduce) { .nmod-skel-prev, .nmod-skel-line { animation:none; } }
        .nmod-store { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; padding:10px; margin-bottom:8px; }
        .nmod-store-h { display:flex; align-items:flex-start; gap:9px; }
        .nmod-sub { display:flex; align-items:center; gap:8px; margin-top:4px; flex-wrap:wrap; }
        .nmod-ver { font-size:11.5px; color:var(--secondary-text-color); }
        .nmod-auth { font-size:10px; font-weight:700; padding:1px 7px; border-radius:999px;
          display:inline-flex; align-items:center; gap:3px; white-space:nowrap; }
        .nmod-auth.standard { color:#c3c7cf; background:rgba(154,160,166,.16); border:1px solid rgba(154,160,166,.4); }
        .nmod-auth.premium { color:#F0B429; background:rgba(240,180,41,.14); border:1px solid rgba(240,180,41,.45); }
        .nmod-auth.community { color:#5EDCB8; background:rgba(94,220,184,.14); border:1px solid rgba(94,220,184,.42); }
        .nmod-prev { border-radius:10px; overflow:hidden; margin-bottom:9px;
          border:1px solid var(--divider-color,rgba(255,255,255,.08)); }
        .nmod-prev img { width:100%; display:block; }
        .nmod-prev--icon { height:64px; display:flex; align-items:center; justify-content:center;
          background:linear-gradient(135deg, rgba(124,156,255,.20), rgba(94,220,184,.12)); }
        .nmod-prev--icon span { font-size:34px; line-height:1; filter:drop-shadow(0 3px 8px rgba(0,0,0,.3)); }
        .nmod textarea { width:100%; box-sizing:border-box; min-height:100px; resize:vertical; border-radius:10px;
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); background:var(--secondary-background-color,#0d1020);
          color:var(--primary-text-color); font-family:ui-monospace,monospace; font-size:12px; padding:10px; }
        .nmod-badge.ok { color:#5EDCB8; background:rgba(94,220,184,.16); border-color:rgba(94,220,184,.4); }
        .nmod-badge.upd { color:#FFB26B; background:rgba(255,178,107,.16); border-color:rgba(255,178,107,.45); }
        .nmod-store-row { display:flex; gap:8px; }
        .nmod-mini { margin-top:8px; padding:7px 12px; border-radius:9px; cursor:pointer; border:none;
          background:var(--primary-color,#7C9CFF); color:#fff; font-size:12.5px; font-weight:600; }
        .nmod-mini.ghost { background:transparent; border:1px solid var(--neo-line2,rgba(255,255,255,.12)); color:var(--primary-text-color); }
        .nmod-msg { font-size:12px; margin-top:8px; min-height:14px; }

        /* ── Kompakte Store-Liste (geordnete Variante) ── */
        .nmod-search { display:flex; align-items:center; gap:8px; margin:0 0 12px;
          background:var(--neo-fill1,rgba(255,255,255,.04)); border:1px solid var(--divider-color,rgba(255,255,255,.1));
          border-radius:10px; padding:7px 11px; }
        .nmod-search input { flex:1; border:none; background:transparent; outline:none;
          color:var(--primary-text-color); font-size:12.5px; }
        .nmod-group { margin:0 0 4px; }
        .nmod-grouph { font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase;
          color:var(--secondary-text-color); margin:12px 2px 8px; }
        .nmod-grouph-c { font-weight:600; opacity:.6; margin-left:5px; }
        .nmod-row { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:11px; padding:9px;
          margin-bottom:7px; background:var(--neo-fill1,rgba(255,255,255,.03)); }
        .nmod-row-main { display:flex; align-items:center; gap:11px; min-width:0; }
        .nmod-thumb { width:42px; height:42px; flex-shrink:0; border-radius:10px; overflow:hidden;
          display:flex; align-items:center; justify-content:center; border:1px solid var(--divider-color,rgba(255,255,255,.08)); }
        .nmod-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .nmod-thumb--icon { font-size:21px; background:linear-gradient(135deg, rgba(124,156,255,.20), rgba(94,220,184,.12)); }
        .nmod-row-mid { flex:1 1 auto; min-width:0; }
        /* 1-Zeilen-Clamp OHNE white-space:nowrap → kleine min-content-Breite,
           damit lange Beschreibungen den Editor-Panel nicht horizontal aufblähen. */
        .nmod-desc--1 { margin-top:1px; overflow:hidden; display:-webkit-box;
          -webkit-box-orient:vertical; -webkit-line-clamp:1; line-clamp:1; }
        /* Namenszeile bleibt EINZEILIG: Name kürzt mit Ellipsis, Badges inline
           (kein Stapeln). Verhindert die unruhige Optik bei mehreren Badges. */
        .nmod-row .nmod-name { min-width:0; flex-wrap:nowrap; }
        .nmod-row .nmod-nm { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .nmod-row .nmod-name > .nmod-badge { flex-shrink:0; }
        /* Feste Button-Spalte rechts: jeder Button exakt gleich breit + gleiche
           Kante, egal ob/was die Zeile an Text hat. box-sizing:border-box, damit
           width:100% inkl. Padding exakt die Spaltenbreite trifft (sonst kann der
           Button je nach Client breiter werden und „springen"). */
        /* margin-left:auto pinnt den Button IMMER an die rechte Kante – auch wenn
           die mittlere Spalte bei kurzem Text nicht aufwächst (genau der Fall,
           in dem der Button sonst nach links rutschte). */
        .nmod-row-act { flex:0 0 108px; margin-left:auto; display:flex; align-items:center; justify-content:flex-end; }
        .nmod-row-act .nmod-mini { box-sizing:border-box; width:108px; margin-top:0;
          padding-left:6px; padding-right:6px; text-align:center; white-space:nowrap; }
        .nmod-links { display:inline-flex; gap:8px; align-items:center; }
        .nmod-link { background:none; border:none; padding:0; cursor:pointer; font-weight:600;
          font-size:11px; color:var(--primary-color,#7C9CFF); text-decoration:none; }
        .nmod-link:hover { text-decoration:underline; }
        .nmod-prevwrap { margin-top:8px; }
        .nmod-prevwrap summary { cursor:pointer; list-style:none; user-select:none;
          display:inline-flex; align-items:center; gap:5px; font-size:11.5px; color:var(--secondary-text-color); }
        .nmod-prevwrap summary::-webkit-details-marker { display:none; }
        .nmod-prevwrap summary::before { content:"▸"; font-size:10px; }
        .nmod-prevwrap[open] summary::before { content:"▾"; }
        .nmod-prevwrap .nmod-prev { margin-top:8px; border-radius:10px; overflow:hidden;
          border:1px solid var(--divider-color,rgba(255,255,255,.08)); }
        .nmod-prevwrap .nmod-prev img { width:100%; display:block; }
      </style>`;
  }

  _infoPanelHtml() {
    const v = (window.NeoDashboard && window.NeoDashboard.version) || "";
    const chip = (href, label, cls = "") =>
      `<a href="${href}" target="_blank" rel="noopener" class="ni-chip ${cls}">${label}</a>`;
    return `
      <style>
        .ni { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; overflow:hidden; }
        .ni-head { padding:12px 12px 0; font-size:14px; font-weight:700; color:var(--primary-text-color); }
        .ni-c { padding:8px 12px 14px; }
        .ni-sec { font-size:13px; font-weight:700; color:var(--primary-text-color); margin:14px 0 8px; }
        .ni-txt { font-size:12.5px; color:var(--secondary-text-color); line-height:1.55; }
        .ni-chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
        .ni-chip { display:inline-flex; align-items:center; gap:6px; padding:7px 12px; border-radius:999px;
          font-size:12.5px; font-weight:600; text-decoration:none; cursor:pointer;
          color:var(--primary-text-color); background:var(--neo-fill2,rgba(255,255,255,.06));
          border:1px solid var(--neo-line2,rgba(255,255,255,.1)); }
        .ni-chip.heart { color:#FFB26B; border-color:rgba(255,178,107,.4); background:rgba(255,178,107,.12); }
        .ni-chip.coffee { color:#F6C177; border-color:rgba(246,193,119,.4); background:rgba(246,193,119,.12); }
        .ni-support { margin-top:16px; padding:14px; border-radius:14px;
          background:linear-gradient(160deg, rgba(124,156,255,.12) 0%, var(--neo-fill1,rgba(255,255,255,.03)) 70%);
          border:1px solid rgba(124,156,255,.22); }
        .ni-support .ni-sec { margin-top:0; }
        .ni-thanks { display:flex; align-items:center; gap:11px; margin-top:14px; padding-top:12px;
          border-top:1px solid var(--divider-color,rgba(255,255,255,.1));
          font-size:12.5px; color:var(--secondary-text-color); line-height:1.4; }
        .ni-ava { line-height:0; flex-shrink:0; filter:drop-shadow(0 3px 8px rgba(124,156,255,.35)); }
      </style>
      <div class="ni">
        <div class="ni-head">ℹ️ ${this._t("Info &amp; Support")}${v ? ` · v${v}` : ""}</div>
        <div class="ni-c">
          <div class="ni-sec">${this._t("Ressourcen &amp; Hilfe")}</div>
          <div class="ni-txt">${this._t("Fragen oder ein Problem? Die Doku und die Community helfen weiter.")}</div>
          <div class="ni-chips">
            ${chip(NEO_LINKS.repo, this._t("📖 Dokumentation"))}
            ${chip(NEO_LINKS.issues, this._t("🐞 Probleme melden"))}
            ${chip(NEO_LINKS.newDiscussion, this._t("💬 Diskussionen"))}
          </div>

          <div class="ni-support">
            <div class="ni-sec">${this._t("❤️ Projekt unterstützen")}</div>
            <div class="ni-txt">${this._t("Hi! Ich entwickle <b>Neo Dashboard Kit</b> in meiner Freizeit und stecke viel Herzblut hinein. Wenn es dir gefällt, ist jede Unterstützung eine riesige Motivation — so kann ich weiter neue Karten &amp; Module bauen. Auf Patreon gibt es außerdem exklusive Premium-Karten und Vorlagen.")}</div>
            <div class="ni-chips">
              ${chip(NEO_LINKS.kofi, this._t("☕ Kaffee spendieren"), "coffee")}
              ${chip(NEO_LINKS.paypal, this._t("💳 PayPal"))}
              ${chip(NEO_LINKS.patreon, this._t("♥ Patreon"), "heart")}
            </div>
            <div class="ni-thanks">
              <span class="ni-ava">${neoLogo({ size: 34, radius: 10 })}</span>
              <span>${this._t("Danke, dass du Teil dieser Community bist! 🎉")}</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  _syncTypeForm() {
    // Picker NICHT neu aufbauen, während das Dropdown offen ist — sonst klappt
    // es beim nächsten setConfig-Echo (z. B. Live-Vorschau) sofort wieder zu.
    if (this._typeBox && !this._typeMenuOpen) this._renderTypePicker();
    // Modul-Sektion nur neu aufbauen, wenn sich der Kartentyp geändert hat —
    // sonst verliert das Tippen in Modul-Einstellungen den Fokus, weil HA
    // setConfig nach jeder Änderung zurück-echot.
    if (this._renderedModType !== this._config.card_type) this._renderModulesSection();
    this._updateGuidedState();
  }

  // Herkunft/Kategorie einer Karte aus dem Registry-Feld `author` ableiten:
  // Premium · Community · sonst Standard. (Einzige Quelle der Wahrheit.)
  _catOf(author) {
    return author === "Premium" ? "Premium" : author === "Community" ? "Community" : "Standard";
  }

  // Aktive Kategorie für die progressive Auswahl: Ist bereits eine Karte
  // gewählt, ist deren Kategorie maßgeblich (Auto-Erkennung für bestehende
  // Configs). Sonst die vom Nutzer gewählte Kategorie (this._selectedCat).
  _activeCat() {
    const cur = this._config.card_type;
    if (cur) return this._catOf((NeoDashboardRegistry.getMeta(cur) || {}).author);
    return this._selectedCat || null;
  }

  // Karten einer Kategorie (alphabetisch) — die Liste für den 2. Schritt.
  _cardsInCat(cat) {
    return NeoDashboardRegistry.list()
      .filter((c) => c.type !== "neo-card" && !c.hidden && this._catOf(c.author) === cat)
      .map((c) => ({ value: c.type, name: c.name, icon: c.icon || "✨" }))
      .sort((a, b) => this._t(a.name).localeCompare(this._t(b.name)));
  }

  // Anzahl Karten je Kategorie — für die Zähler in der Bereich-Auswahl.
  _catCounts() {
    const counts = { Standard: 0, Premium: 0, Community: 0 };
    NeoDashboardRegistry.list()
      .filter((c) => c.type !== "neo-card" && !c.hidden)
      .forEach((c) => { counts[this._catOf(c.author)]++; });
    return counts;
  }

  // Bereich (Kategorie) wählen — 1. Schritt der progressiven Auswahl.
  // Wechselt der Nutzer in eine ANDERE Kategorie als die der aktuell aktiven
  // Karte, wird card_type zurückgesetzt, damit keine Karte aus der falschen
  // Kategorie aktiv bleibt.
  _selectCategory(cat) {
    const cur = this._config.card_type;
    const curCat = cur ? this._catOf((NeoDashboardRegistry.getMeta(cur) || {}).author) : null;
    this._selectedCat = cat;
    if (cur && curCat !== cat) {
      this._config = { type: this._config.type }; // card_type + Stub verwerfen
      this._renderTypePicker();
      this._mountSub();
      this._renderModulesSection();
      this._updateGuidedState();
      this._fire();
      return;
    }
    this._renderTypePicker();
  }

  _selectType(newType) {
    if (!newType || newType === this._config.card_type) return;
    const cls = NeoDashboardRegistry.getCard(newType);
    const stub = cls?.getStubConfig?.() || {};
    // Bereich der neuen Karte merken, damit die Bereich-Auswahl konsistent bleibt.
    this._selectedCat = this._catOf((NeoDashboardRegistry.getMeta(newType) || {}).author);
    // Beim Typwechsel werden karten-gebundene Module zurückgesetzt (sie galten
    // für den vorherigen Typ). Keine Voreinstellungen außer dem Stub.
    this._config = { type: this._config.type, card_type: newType, ...stub };
    this._renderTypePicker();
    this._mountSub();
    this._renderModulesSection();
    this._updateGuidedState();
    this._fire();
  }

  // Progressiver Kartentyp-Picker: 1) Bereich (Standard/Premium/Community)
  // wählen, 2) Karte innerhalb des Bereichs wählen. Erst danach übernimmt die
  // gewählte Karte ihren eigenen Editor (ha-form kann keine Gruppen/Schritte).
  _renderTypePicker() {
    if (!this._typeBox) return;
    const DOT = { Standard: "#9aa0a6", Premium: "#F0B429", Community: "#5EDCB8" };
    const cur = this._config.card_type;
    const m = NeoDashboardRegistry.getMeta(cur) || {};
    const activeCat = this._activeCat();
    const counts = this._catCounts();
    const cards = activeCat ? this._cardsInCat(activeCat) : [];
    const curName = m.name ? this._t(m.name) : this._t("Karte wählen …");
    const cats = ["Standard", "Premium", "Community"];

    this._typeBox.innerHTML = `
      <style>
        .nt { position:relative; }
        .nt-step { font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase;
          color:var(--secondary-text-color,rgba(244,246,251,.72)); margin:2px 0 7px; }
        .nt-cats { display:flex; gap:6px; margin-bottom:12px; }
        .nt-cat { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; box-sizing:border-box;
          padding:9px 6px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600;
          color:var(--secondary-text-color); background:var(--secondary-background-color,#0d1020);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); transition:border-color .15s,color .15s; }
        .nt-cat:hover { color:var(--primary-text-color); }
        .nt-cat.active { color:var(--primary-text-color); border-color:var(--primary-color,#7C9CFF);
          box-shadow:0 0 0 1px var(--primary-color,#7C9CFF) inset; }
        .nt-cat-top { display:flex; align-items:center; gap:6px; }
        .nt-cat-count { font-size:10.5px; font-weight:600; opacity:.6; }
        .nt-dot { width:8px; height:8px; border-radius:4px; flex-shrink:0; }
        .nt-btn { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; box-sizing:border-box;
          padding:11px 12px; border-radius:10px; cursor:pointer; font-size:14px;
          background:var(--secondary-background-color,#0d1020); color:var(--primary-text-color);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); }
        .nt-lbl { display:flex; align-items:center; gap:8px; min-width:0; }
        .nt-nm { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .nt-cv { opacity:.6; transition:transform .2s; }
        .nt.open .nt-cv { transform:rotate(180deg); }
        .nt-panel { position:absolute; left:0; right:0; top:calc(100% + 4px); z-index:30; max-height:330px; overflow:auto;
          border-radius:10px; background:var(--card-background-color,#1b2030);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); box-shadow:0 14px 34px rgba(0,0,0,.45); }
        .nt-opt { display:flex; align-items:center; gap:9px; padding:10px 12px; cursor:pointer; font-size:14px;
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
        .nt-hint { font-size:12.5px; color:var(--secondary-text-color); padding:2px 2px 2px; line-height:1.5; }
        .nt-emptycat { font-size:12.5px; color:var(--secondary-text-color); line-height:1.5;
          padding:11px 12px; border-radius:10px; border:1px dashed var(--divider-color,rgba(255,255,255,.18));
          background:var(--neo-fill1,rgba(255,255,255,.03)); }
      </style>
      <div class="nt">
        <div class="nt-step">${this._t("Bereich wählen")}</div>
        <div class="nt-cats">
          ${cats.map((c) => `
            <div class="nt-cat ${c === activeCat ? "active" : ""}" data-cat="${escapeAttr(c)}">
              <span class="nt-cat-top"><span class="nt-dot" style="background:${escapeAttr(DOT[c])};"></span>${escapeHtml(this._t(c))}</span>
              <span class="nt-cat-count">${counts[c]}</span>
            </div>`).join("")}
        </div>
        ${activeCat ? `
          <div class="nt-step">${this._t("Karte wählen")}</div>
          ${cards.length ? `
            <div class="nt-btn" id="nt-btn">
              <span class="nt-lbl"><span class="nt-ic">${escapeHtml(m.icon || "✨")}</span><span class="nt-nm">${escapeHtml(curName)}</span></span>
              <span class="nt-cv">▾</span>
            </div>
            <div class="nt-panel" id="nt-panel" style="display:none;">
              <div class="nt-search"><input id="nt-search" type="text" placeholder="${escapeAttr(this._t("🔍 Karte suchen …"))}" /></div>
              <div id="nt-list">
                ${cards.map((it) => `<div class="nt-opt ${it.value === cur ? "sel" : ""}" data-v="${escapeAttr(it.value)}" data-s="${escapeAttr((this._t(it.name) + " " + it.name + " " + it.value).toLowerCase())}">
                  <span class="nt-ic">${escapeHtml(it.icon)}</span><span class="nt-nm">${escapeHtml(this._t(it.name))}</span>
                </div>`).join("")}
                <div class="nt-empty" id="nt-empty" style="display:none;">${this._t("Keine Treffer.")}</div>
              </div>
            </div>`
          : `<div class="nt-emptycat">${this._t("In diesem Bereich gibt es noch keine Karten.")}${activeCat !== "Standard" ? `<br>${this._t("Premium- und Community-Karten fügst du unten über <b>Erweiterungen</b> hinzu.")}` : ""}</div>`}
        ` : `<div class="nt-hint">${this._t("Wähle zuerst einen Bereich, um die passenden Karten zu sehen.")}</div>`}
      </div>`;

    // ── Schritt 1: Bereich wählen ──
    this._typeBox.querySelectorAll(".nt-cat").forEach((b) =>
      b.addEventListener("click", () => this._selectCategory(b.getAttribute("data-cat"))));

    // ── Schritt 2: Karte wählen (nur wenn der Bereich Karten enthält) ──
    const btn = this._typeBox.querySelector("#nt-btn");
    if (!btn) return;
    const root = this._typeBox.querySelector(".nt");
    const panel = this._typeBox.querySelector("#nt-panel");
    const close = () => { panel.style.display = "none"; root.classList.remove("open"); this._typeMenuOpen = false; document.removeEventListener("click", onDoc, true); };
    // composedPath() statt contains(e.target): robust über Shadow-Grenzen (HA-Dialog).
    const onDoc = (e) => { const path = e.composedPath ? e.composedPath() : []; if (!path.includes(this._typeBox)) close(); };
    const search = this._typeBox.querySelector("#nt-search");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (panel.style.display !== "none") { close(); return; }
      panel.style.display = "block"; root.classList.add("open"); this._typeMenuOpen = true;
      document.addEventListener("click", onDoc, true);
      setTimeout(() => search?.focus(), 30);
    });
    // Suche — nur innerhalb des gewählten Bereichs (der Panel enthält nur dessen Karten).
    search?.addEventListener("click", (e) => e.stopPropagation());
    search?.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let any = false;
      this._typeBox.querySelectorAll(".nt-opt").forEach((o) => {
        const hit = !q || o.getAttribute("data-s").includes(q);
        o.style.display = hit ? "" : "none"; if (hit) any = true;
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
      // Stop the sub-editor's event from bubbling to HA directly — otherwise HA
      // would receive a config without type/card_type. Keep our modules.
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
// NEO CARD — single wrapper card with a type dropdown.
// This is the ONLY card shown in HA's picker. The dropdown lists
// every registered Neo card (core + community plugins).
// ══════════════════════════════════════════════════════════════

// Dezenter Skeleton-Shimmer für den (jetzt selten sichtbaren) Warte-Platzhalter.
// Einmalig ins document.head injiziert; die Karten-Platzhalter liegen im Light-
// DOM, teilen sich also diese Klassen. prefers-reduced-motion respektiert: statt
// des Sweeps nur ein sanftes Pulsieren.
function neoEnsurePlaceholderStyle() {
  if (typeof document === "undefined" || document.getElementById("neo-card-ph-style")) return;
  const s = document.createElement("style");
  s.id = "neo-card-ph-style";
  s.textContent = `
    .neo-card-skel{position:relative;overflow:hidden;border-radius:10px;
      background:var(--divider-color,rgba(127,127,127,.16));height:13px;}
    .neo-card-skel::after{content:"";position:absolute;inset:0;transform:translateX(-100%);
      background:linear-gradient(90deg,transparent,rgba(160,160,160,.28),transparent);
      animation:neo-card-shimmer 1.4s ease-in-out infinite;}
    @keyframes neo-card-shimmer{100%{transform:translateX(100%);}}
    @media (prefers-reduced-motion:reduce){
      .neo-card-skel::after{animation:none;}
      .neo-card-skel{animation:neo-card-pulse 1.6s ease-in-out infinite;}
      @keyframes neo-card-pulse{0%,100%{opacity:.55;}50%{opacity:.9;}}
    }`;
  document.head.appendChild(s);
}

class NeoCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    // Hinweis: config.modules sind jetzt karten-gebundene Layer-Module
    // ([{ id, settings }]) — sie werden von der Karte selbst (Basis-Karte)
    // über die style/decorate-Hooks angewandt, nicht hier geladen.
    const type = this._config.card_type;

    if (!type) {
      this._placeholderLang = neoLang(this._hass);
      this.innerHTML = `
        <ha-card style="
          padding:28px 24px;border-radius:24px;text-align:center;
          display:flex;flex-direction:column;align-items:center;gap:10px;
        ">
          ${neoLogo({ size: 56, radius: 16 })}
          <div style="font-size:16px;font-weight:600;color:var(--primary-text-color);">Neo Card</div>
          <div style="font-size:13px;color:var(--secondary-text-color);max-width:240px;line-height:1.4;">
            ${neoT(this._hass, "Wähle zuerst eine Karte: Header, Steuerung oder Anzeige. Danach wählst du den passenden Typ.")}
          </div>
        </ha-card>`;
      this._child = null;
      this._childType = null;
      return;
    }

    if (!NeoDashboardRegistry.getCard(type)) {
      // Module may still be loading from the backend store — retry once ready
      this._placeholderLang = neoLang(this._hass);
      const loaded = NeoStore._loaded;
      // Ruhiger Platzhalter mit reservierter Höhe (kein Layout-Sprung beim
      // Austausch). Beim Warten ein dezenter Skeleton-Shimmer statt sofortigem
      // Text: Bei schnellem Laden (Cache/lokaler Store) würde ein Ladetext nur
      // kurz aufblitzen und wie ein Fehler wirken. Der Text wird erst nach einer
      // kurzen Schwelle nachgeblendet. Nur bei genuin unbekanntem Typ (Store
      // bereits geladen) sofort Klartext, kein Skeleton.
      if (!loaded) neoEnsurePlaceholderStyle();
      this.innerHTML = loaded
        ? `<ha-card style="padding:24px;min-height:88px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--secondary-text-color);">
            <span class="neo-ph-msg">${neoT(this._hass, "Unbekannter Neo-Kartentyp:")} ${escapeHtml(type)}</span>
          </ha-card>`
        : `<ha-card style="padding:24px;min-height:88px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:10px;color:var(--secondary-text-color);">
            <div class="neo-card-skel" style="width:55%"></div>
            <div class="neo-card-skel" style="width:80%"></div>
            <span class="neo-ph-msg" style="font-size:13px;text-align:center;"></span>
          </ha-card>`;
      this._child = null;
      this._childType = null;
      if (!loaded && !this._waitingModules) {
        this._waitingModules = true;
        // Erst nach kurzer Schwelle den Ladetext einblenden (Anti-Flackern,
        // analog zur MIN_SKELETON_MS-Logik im Store-Editor).
        this._phTimer = setTimeout(() => {
          const el = this.querySelector(".neo-ph-msg");
          if (el && !NeoStore._loaded) el.textContent = neoT(this._hass, "Modul wird geladen …");
        }, 300);
        this._onModsLoaded = () => {
          this._waitingModules = false;
          clearTimeout(this._phTimer);
          this.setConfig(this._config);
        };
        window.addEventListener("neo-modules-loaded", this._onModsLoaded, { once: true });
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
    if (this._child) { this._child.hass = h; return; }
    // Placeholder/Meldung sichtbar: Texte folgen der HA-Sprache. Neu rendern,
    // sobald die Sprache erstmals bekannt ist oder wechselt (nicht bei jedem
    // hass-Update — das käme bei jedem State-Change im System).
    if (this._config && neoLang(h) !== this._placeholderLang) this.setConfig(this._config);
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
    // Warte-Zustand aufräumen: sonst feuert der {once}-Listener noch für eine
    // längst entfernte Karte und der Ladetext-Timer läuft ins Leere.
    if (this._onModsLoaded) window.removeEventListener("neo-modules-loaded", this._onModsLoaded);
    clearTimeout(this._phTimer);
    this._waitingModules = false;
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
  // Statische Registrierung — hier gibt es noch kein hass, daher entscheidet
  // die Browser-Sprache über DE/EN im nativen HA-Karten-Picker.
  const _de = (navigator.language || "").toLowerCase().startsWith("de");
  window.customCards.push({
    type: "neo-card",
    name: "Neo Card",
    description: _de
      ? "Glassmorphism-Karten — Typ im Editor wählen"
      : "Glassmorphism cards — pick the type in the editor",
    preview: true,
    documentationURL: "https://github.com/bkstudy2025/neo-dashboard-kit",
  });
}

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
  makeTypedEditor: makeNeoTypedEditor,
  capabilityType: neoCapabilityType,
  typeDef: neoTypeDef,
  iconOptions: NEO_ICON_OPTIONS,
  iconSelector: NEO_ICON_SELECTOR, // fertiges Icon-Feld: nativer HA-Picker + Neo-Raster
  debugEnabled: neoDebugEnabled, // localStorage "neo-debug" === "1"
  log: neoLog, // console.info, nur wenn Debug aktiv (für Premium-/Community-Karten)
  accentOptions: NEO_ACCENT_OPTIONS,
  layoutOptions: NEO_LAYOUT_OPTS,
  normalizeLayout,
  viewportLayout: neoViewportLayout,
  renderReorder: neoRenderReorder,
  escapeHtml,
  escapeAttr,
  safeUrl,
  version: "1.0.0", // beim Build aus package.json ersetzt
  ready: true,
});
// Let external files that loaded first know the API is now available
window.dispatchEvent(new CustomEvent("neo-dashboard-ready"));

// Neo Dashboard Kit — Global style injector
// Eigenständiger Ersatz für die früher per "Card Mod" gesetzten Theme-Extras
// (Mobil-Header ausblenden + Glas-Dialoge) — OHNE Fremd-Abhängigkeit.
//
// Nur aktiv, wenn das Neo-Theme angewandt ist: das Theme setzt die Marker-
// Variable --neo-dashboard-theme. So bleibt die UI anderer Nutzer/Themes
// völlig unberührt. Alles defensiv (optional chaining, try/catch) — schlägt
// die HA-Struktur fehl, passiert einfach nichts.

const HEADER_CSS = `
@media only screen and (max-width:768px){
  .header{display:none!important;opacity:0!important;}
  #view{padding-top:0!important;margin-top:0!important;
        height:calc(100vh - env(safe-area-inset-top))!important;}
}`;

const DIALOG_CSS = `
.mdc-dialog__scrim{backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;
  background:rgba(0,0,0,.55)!important;}
.mdc-dialog .mdc-dialog__surface{box-shadow:none!important;}
ha-card{transition:none;}`;

// Karten auf dem Smartphone dichter stapeln. Der vertikale Abstand ZWISCHEN
// den Karten/Abschnitten kommt aus der Lovelace-View, nicht aus der Karte.
//
// Sections-View: steuert die Abstände über CSS-Custom-Properties, die durch
// Shadow-Grenzen hindurch VERERBEN. Daher reicht es, sie weit oben (:root)
// zu setzen – das ist der robuste, versionsstabile Weg (kein Shadow-Hack).
// Fallback OHNE !important, damit das Theme (das diese Variablen als Inline-
// Style setzt) immer Vorrang hat. Greift nur, wenn ein älteres Theme die Werte
// nicht selbst setzt. Werte identisch zum Theme. HA-Defaults: row 24 / col 32
// (zwischen Abschnitten), je 8 (Karten im Abschnitt).
const SPACING_VARS_CSS = `
:root{
  --ha-view-sections-row-gap:10px;
  --ha-view-sections-column-gap:16px;
  --ha-section-grid-row-gap:6px;
  --ha-section-grid-column-gap:8px;
}`;
// Masonry-View: kennt keine vererbende Variable → hier doch per Shadow-Inject
// in den View-Root. Nicht passende Selektoren sind wirkungslos.
const SPACING_CSS = `
@media only screen and (max-width:768px){
  #columns,.column{--masonry-view-card-margin:0 0 6px!important;}
  .column>*{margin-top:0!important;margin-bottom:6px!important;}
  .container{row-gap:6px!important;}
}`;

function themeActive() {
  try {
    return !!getComputedStyle(document.documentElement)
      .getPropertyValue("--neo-dashboard-theme").trim();
  } catch (e) { return false; }
}

function inject(root, id, css) {
  if (!root || root.querySelector(`#${id}`)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = css;
  root.appendChild(s);
}

// Folgt einer Kette von Elementen durch deren Shadow-Roots.
function deepShadow(path) {
  let node = document;
  for (const sel of path) {
    const found = node.querySelector ? node.querySelector(sel) : null;
    if (!found) return null;
    node = found.shadowRoot || found;
  }
  return node;
}

function apply() {
  if (!themeActive()) return;
  // 0) Sections-View-Abstände über vererbende CSS-Variablen (document-weit).
  inject(document.head, "neo-global-spacing-vars", SPACING_VARS_CSS);
  // 1) Mobil-Header ausblenden → in den Shadow-Root von hui-root.
  const hui = deepShadow(["home-assistant", "home-assistant-main", "ha-panel-lovelace", "hui-root"]);
  if (hui && hui.appendChild) inject(hui, "neo-global-header", HEADER_CSS);
  // 1b) Karten-Abstand der aktuellen View verkleinern. Die Layout-View liegt
  // (je nach HA-Version) direkt unter hui-root oder in einem hui-view-Wrapper.
  if (hui && hui.querySelector) {
    const views = [
      hui.querySelector("hui-masonry-view"),
      hui.querySelector("hui-sections-view"),
      hui.querySelector("hui-panel-view"),
    ];
    const wrap = hui.querySelector("hui-view");
    if (wrap?.shadowRoot) {
      views.push(
        wrap.shadowRoot.querySelector("hui-masonry-view"),
        wrap.shadowRoot.querySelector("hui-sections-view"),
        wrap.shadowRoot.querySelector("hui-panel-view"),
      );
    }
    views.forEach((v) => { if (v?.shadowRoot) inject(v.shadowRoot, "neo-global-spacing", SPACING_CSS); });
  }
  // 2) Glas-Look für offene More-Info-/HA-Dialoge.
  const haRoot = document.querySelector("home-assistant")?.shadowRoot;
  haRoot?.querySelectorAll?.("ha-more-info-dialog, ha-dialog").forEach((d) => {
    if (d.shadowRoot) inject(d.shadowRoot, "neo-global-dialog", DIALOG_CSS);
  });
}

function neoInitGlobalStyle() {
  if (typeof document === "undefined") return; // kein Browser (z. B. Tests)
  apply();
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("location-changed", apply);
  }
  // Dialoge werden dynamisch eingehängt → den HA-Root beobachten.
  const ha = document.querySelector?.("home-assistant");
  if (ha?.shadowRoot && typeof MutationObserver !== "undefined") {
    // Nur direkte Kinder beobachten (Dialoge werden dort eingehängt) — NICHT
    // subtree, sonst feuert apply() bei jeder DOM-Änderung im ganzen Frontend.
    try { new MutationObserver(apply).observe(ha.shadowRoot, { childList: true }); }
    catch (e) { /* ignore */ }
  }
  // Während des Frontend-Starts ein paar Versuche, dann Schluss.
  if (typeof setInterval === "function") {
    let n = 0;
    const iv = setInterval(() => { apply(); if (++n > 20) clearInterval(iv); }, 500);
  }
}

// Neo Dashboard Kit — Entry point
// Imports run in dependency order; the bundled output is shipped as the
// single root `neo-dashboard.js` that HACS loads (see rollup.config.js).

NeoStore._seedFromCache();
neoInitGlobalStyle();

console.info(
  "%c NEO DASHBOARD KIT %c v1.0.0 ",
  "background:#7C9CFF;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:700;",
  "background:#1a1f2e;color:#7C9CFF;padding:2px 6px;border-radius:0 4px 4px 0;"
);
