// Neo Dashboard Kit — Design-Tokens
// Akzentfarben, geteiltes Karten-CSS (Shadow-DOM) und Editor-Optionen.

export const NEO_ACCENTS = {
  blue:   { c: "#7C9CFF", glow: "rgba(124,156,255,0.35)" },
  amber:  { c: "#FFB26B", glow: "rgba(255,178,107,0.35)" },
  mint:   { c: "#5EDCB8", glow: "rgba(94,220,184,0.35)" },
  violet: { c: "#C084FC", glow: "rgba(192,132,252,0.35)" },
  rose:   { c: "#F87171", glow: "rgba(248,113,113,0.35)" },
};

// Geteiltes CSS, das jede Karte in ihren Shadow-Root spiegelt.
export const NEO_CSS = `
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
export const NEO_ACCENT_OPTIONS = [
  { value: "blue", label: "Blau" },
  { value: "amber", label: "Amber" },
  { value: "mint", label: "Mint" },
  { value: "violet", label: "Violett" },
  { value: "rose", label: "Rosé" },
];
