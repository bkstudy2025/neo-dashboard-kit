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
