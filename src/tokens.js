// Neo Dashboard Kit — Design Tokens
// Mirrors the original prototype tokens, adapted for Web Components

export const accent = {
  blue:   { c: "#7C9CFF", glow: "rgba(124,156,255,0.35)" },
  amber:  { c: "#FFB26B", glow: "rgba(255,178,107,0.35)" },
  mint:   { c: "#5EDCB8", glow: "rgba(94,220,184,0.35)" },
  violet: { c: "#C084FC", glow: "rgba(192,132,252,0.35)" },
  rose:   { c: "#F87171", glow: "rgba(248,113,113,0.35)" },
};

export const text = {
  primary:   "var(--neo-text1, #F4F6FB)",
  secondary: "var(--neo-text2, rgba(244,246,251,0.72))",
  tertiary:  "var(--neo-text3, rgba(244,246,251,0.50))",
};

export const status = {
  on:      "#5EDCB8",
  off:     "rgba(244,246,251,0.30)",
  warning: "#FFB26B",
  danger:  "#F87171",
};

export const CSS_VARS = `
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
    --neo-text4: rgba(244,246,251,0.30);
    --neo-shadow1: rgba(0,0,0,0.55);
    --neo-shadow2: rgba(0,0,0,0.5);
    --neo-blur: blur(24px) saturate(140%);
    --neo-radius: 24px;
    --neo-font: -apple-system, "SF Pro Display", "Inter", system-ui, sans-serif;
  }

  :host([theme="light"]) {
    --neo-fill0: rgba(255,255,255,0.97);
    --neo-fill1: rgba(255,255,255,0.99);
    --neo-fill2: rgba(255,255,255,1);
    --neo-line1: rgba(28,40,72,0.08);
    --neo-line2: rgba(28,40,72,0.11);
    --neo-line3: rgba(28,40,72,0.13);
    --neo-line4: rgba(28,40,72,0.15);
    --neo-line5: rgba(28,40,72,0.18);
    --neo-line6: rgba(28,40,72,0.22);
    --neo-text1: #0F1626;
    --neo-text2: rgba(15,22,38,0.62);
    --neo-text3: rgba(15,22,38,0.42);
    --neo-text4: rgba(15,22,38,0.26);
    --neo-shadow1: rgba(40,55,95,0.22);
    --neo-shadow2: rgba(40,55,95,0.16);
    --neo-blur: none;
  }
`;

export const BASE_CARD_STYLES = `
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 0; height: 0; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  @keyframes togglePulse {
    0% { box-shadow: 0 0 0 0 var(--pulse-c); }
    100% { box-shadow: 0 0 0 16px transparent; }
  }
  .neo-card {
    position: relative;
    border-radius: var(--neo-radius);
    overflow: hidden;
    font-family: var(--neo-font);
    color: var(--neo-text1);
    transition: all 240ms cubic-bezier(.2,.8,.2,1);
  }
  .neo-card:active { transform: scale(0.975); }
`;
