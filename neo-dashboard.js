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
    console.info(`[Neo Dashboard] Registered: ${type} (${tag})`);
  },
  unregisterCard(type) {
    if (!type || type === "neo-card") return false;
    const removed = _registry.delete(type);
    if (removed) {
      console.info(`[Neo Dashboard] Unregistered: ${type}`);
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
    console.info(`[Neo Module] Registered: ${manifest.id} → ${manifest.target || "*"}`);
    return manifest;
  },
  unregister(id) {
    if (!id) return false;
    const removed = _modules.delete(id);
    if (removed) {
      console.info(`[Neo Module] Unregistered: ${id}`);
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

// Akzent-Dropdown, von allen Karten-Editoren geteilt.
const NEO_ACCENT_OPTIONS = [
  { value: "blue", label: "Blau" },
  { value: "amber", label: "Amber" },
  { value: "mint", label: "Mint" },
  { value: "violet", label: "Violett" },
  { value: "rose", label: "Rosé" },
];

// Neo Dashboard Kit — Externe Links
// Im Editor unter "Info & Support" und vom Modul-Store genutzt.
// TODO: trage hier deine echte Patreon-/PayPal-/Ko-fi-URL ein.
const NEO_LINKS = {
  repo: "https://github.com/bkstudy2025/neo-dashboard-kit",
  issues: "https://github.com/bkstudy2025/neo-dashboard-kit/issues",
  patreon: "https://www.patreon.com/",
  paypal: "https://www.paypal.com/",
  kofi: "https://ko-fi.com/",
  // Community-Diskussionen (Support/Showcase/Wünsche). Hinweis: der Store
  // installiert NICHT aus Discussions, sondern aus dem kuratierten Katalog
  // (modulesIndex) — geprüft, versioniert, CDN-ausgeliefert.
  newDiscussion: "https://github.com/bkstudy2025/neo-dashboard-kit/discussions/new",
  // Neo Module Store — Katalog liegt im Repo unter store/, ausgeliefert über
  // jsDelivr-CDN. index.json = [{ id, name, description, target, author, version, icon, image, url }]
  // (Lässt sich später ohne Code-Änderung in ein eigenes neo-modules-Repo auslagern.)
  modulesIndex: "https://cdn.jsdelivr.net/gh/bkstudy2025/neo-dashboard-kit@main/store/index.json",
  modulesRepo: "https://github.com/bkstudy2025/neo-dashboard-kit/tree/main/store",
};

// Neo Dashboard Kit — Branding
// Das Neo-Logo (icon.png) als optimiertes 128x128-PNG, direkt eingebettet
// (Data-URI) — offline-fest, kein CDN/Netzwerk nötig. Quelle: icon.png im Repo.
// Bei Logo-Änderung neu generieren (siehe scripts/build-logo, sonst manuell).
const NEO_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAABwZUlEQVR42u39Z5gd13XnC/92qKoTOjcaOedIMAcwiRRJiRRFUZSoHG3LYWyPfcf22DOa8fD62h7bo/HYM/Y4yUFWsiSKyoFiEHMAEwiQyLkBNNA5nVRVe+/3Q1WdU6cB0p77zvvhfUaHD4Bm9+k6VXuvveJ//Rf85PWT109eP3n95PWT109e/ye+RPrnJ6+fvH7y+j9SA6xdu7YL+s7/Sfat8fTr8XHo62v9f/qz7FvJX9l7L3CN3P/n35K/DnPe/i999V3g9/ryt/4m7+MNbnv8Db73Jo913nX7+Bc+U7aO41xwKy70/n/uxrMtO3+x5wjAmi3bRzMrIIRIvhIg0v8cLn2nAOea7wMFCKTIbEnyhXMOi0OK1jVxJNcRAiEEEpFdNfksB80LAdY5hJA45wDXvEZmrIQQIAELIvd7zrrz/5/k2s46hEo+H+tyhq913846kCDTzxZCpPfQWpPW8ztMZJPvy+S6DgcmuYaz2U2kH+GS57fWtj5VtD4b51pvbf9FcCJdfpfsiXPY9ANkujZWOLDgsAReAEIQxxHGGkBmH4VL3pT8C2iB7BeitRAi3SSX3rBAJpsgBTZbUJGKh8gtdvY8TiCFbK5v9h6RPqCU6fVobaqQyeK59GGEyK6VilYqfC53fyCQOrdB0Nxg6xzWWKRsPZNUAocAaxFK4bKNyD2DkIlgudxnJvebOzHp2jgHytfJfTU3VYBKfi5kTpgBpASXCmhzN1oHymXilX2vtYLJ3zYniAKkSw9IuoxSSJx0aOVjcZgoxg8CtDM5QUo2KVnJROg0OOecQAjX9AkTgUz+Te8bjMsJRSZJyWY2D6eU7dKcP0Hpu6y1Tdczk2qcaJ6S1gK3riOlTG7cWly6KUKAtS6vGFqnKZN1m7w3OTGuuakYk3xGttTZfeAQRiSCOMdTdm3XTr6WgDUGISXOmJaANk8xzWdIF7X5HNlGu/MEyzUFROQFKPf5rbVxLU2TCqo1Bs/zkJ4gihrpmtF8/pYmSdZEW+vSAyWQQqT3KFqqN7e8yckUTfXcWsJUspxLZXeuOiN3neQn7jzNkXvwVFWK7J4AmW1gbmFTKcCJOdooL0ipmmwKQW7hhRDnB0VCJO9pU/+iTVs0r29dsvku+Xfupp5vcFsb63JaQMzVCLm1aa2YwAnXfBaXapPmAUmf1VgDUfJ7xprk2plJz57JgRMulZtUchJpSyTTNaXONU9G9otNeznnZjOV0tQIFwwuXVPDZA8rM5OT/mbyOTZREulpktln5hbRpvfg2lbq/A0T0GZ3XV74spM052Sfd9rz/5+XwfSQyNzmX/Cpc+uSt+6ZT9QUgJyAufzzNe8VnE3XRrbMsGg+U+I7ZdpBK50c1syFo/UM2Q7rvKPWdnM51WRtem+pr5CcgJx6S21/uyrOHKeWU5P5E3NTD02zkAkBIKRMfLVMpeb8lLZzlko4iU+IzJ+wTO2efwjbviHmbHrTGKbOiLjAqc42zVrbcnLnmD0xRzORaiHS5xNzbkjMEYCmU576HCKnDfL31Dy4qSfh8n5cJsDpL0gp0/cngqTnquQLSW/iTLnmykgpMuf0Qr/Qeqjsn9TGZ15solFoOmx5gWnaZAEC2fSuhVCpuky2unmSWwYyuXJTWs9TPOf5CU2fYE6EI3Inj5zmye4/W9yWmWnXICIvmK4lFO2m8o2sxBvn5Vx6wpub7/LWVaSuVc6HEe0mxmXHy7X2Uru8143gvL8Fc05R4ng4QMlEvThr0/Cr9ZutDxUkWinzsGl5u84ipGqamJaqSn9TpjerBM7ZxOSnCyma3nNrNVxeC2V2PFs4x3n2uWXLbfsBkLLpKzQd2uy9zROZCUy6Ic6mH+nS0y1aYVduA3CpSbuQoF7Ah2nXDMnnNFXrHPPQdu5SrdEMszMhcS19jBPolppyOQeweZXEc3eu6YwJ13KgMhuIlFibhF3Nw5SddkH7Sc0WQuT96+Qazc8UrZOPEDiZ+A3KtdRo3ulqnbQ5ZiInuDanJfJq3eY867kh61xHLBOEuf5CK6xJrm1bZxGESt4rLE7I7EYQNm8+XXtOIBOQuY5j+lW2D22aL69Fmz5HS02LnDZMllngROoDXNhbdU2vvt1bzwtu6tCRCUi7XXBNR5I2leuycCRJAqT/ph8gExXmRBLbWgEuNTkm9eKbD5uqIuEcipaVuqAfPse+u/yJnqNoreO82IXcvdMmBOluNBdHYmUa1+eTTS4VWGGTKEmmIiWSBJSYc92mqXAu74m2ohfR0rcuL9w5gc6vRaY42hJbeQE4z+aRz3zlpEfKVH3lDKtrz5TNNb95h8amG+3SP9kJB5GENUriZKJabSoMzeyeS2L/RBoswkmcSRwamxznZDnc3Pi+FVq+gc7N5Q1EztEVbWY2vyFNbZGkMZPnQSa5ECmbz9amoqxDCAPWJuGrM+l6n+9otkch7rwwOv8zpXRihtODI5pm3rXlVjJtnGloKQW63fO1OFROhYicpnZtHrPIH4w225U4fS5nQsQcG5hlvhAq8QuEQEqdCkC64VKBFEl2T0kEEmfiRHU6m9hZa5P3GBDOkilD0RSGC9vVfNKluZGZuXLZps5JBOUzjnnbLTIPOzVjUoPSOClyXr5IvW7bOlouXW/Xns5uiwyaay1bUZijaWCa2UuS1LAkidhaYXk+CZj4bqLp2Cf5Cy3a1IJIrWVLupOT01o0S7ufkKVFm3cvWzchUnOQJR0cglzxAITFpqfGaocWCqE0xlc4ZfGkxmmPWhxjnaVQLqKMwZkYYouKHS62WATOxQgSrZAIRiqIrj0VldUCmuozS8862pJfWXJMzLXLudqHRGBEkqlwSmGlAqURWqOER+QEUaOBEuAHBVAOETYwaaZGWYG0WXY0OTzOuixQJx/h5x0Rl9cJDiwWZ8Fg2+sIQiAdxNY0/aNME1hrcM4mUUBL6FzrBIiWIyPSBbHWNRdHtOV+cnG0TU6wRLZuX+Ty6zJdtKa6T0648xSx8kArjK/A1zgLM0D/VZfR0dnByWd34seCQProMCYKY2QUI2MHsWoWiLI/zmSn07VCornW3TEnqylaSte5dg8zr9WdSE+5SFS+UqB9nPZA+dSdYrq3i3lbN0KtxvTuA3TXY/AVIqoCAuNiFAop0ihCZBGLa2ZM8pFVZv9tGkG5dEOlmKOKU99MZFq8LZ/RzB60TEB7yte1lSIcaXal6dTk4vacpOEc0om29XJpQsZlsamSyUNK2RQAtAapEF5AHAjwJZ4uUpMeYuEAK99xIx3XXYanFF3XXMSJ7zxM/cggHUJhfIENwa85nEocDBfHSNNWTWrPEtqWnyqcy+UqUrspXJtrk09miabkp36LEIlvpwClQAcoXaAhPaLVy9j6qQ9ht61BxYLaY89z8rNfoWt2GiUsqlYjwuKEBatSQbTka6XNNAU5t9/RTNm71Pm2aW6/zV9JTYDFNZeiGUU429Tsqm/+ovvytq1ZMLCtE5F3BoVopRwQ7aFjJohIgc05eE4KnBZYKUDLtDqnEcpDeD7S83G+jwoKGCOZKpXovfV6Vn78PZjNazkVRoyGVUpL57Pyym1oXzF5/CSiWqFYKOJwWJlsniXJSYg2U9O+eJl6zZZE5vMX5CLUnLfclndo+jBglADlY3UAOsArlKlYydIP3kXp+is4N9OgbgT961dROXCS+MBxtHZEJkZk8Wnqs7RnIWXLmSWX78jKjDhk9rVoeQXNvZCyTVtlKts1S+HJwddCnJ/obCZlaHeU2pL8uailmevOTkS2+UIgpEpLoDJJ6CgBWuGUBu0jggDh+TgJVQHe5g1sfPfbUVtXM2QbqMoMi4s+BVmgGlY4rRssftd1LN++mn1f/z5jLx+h0/fxChLTkEgtIYohNi09ZltyICzNvEJSHEoc1pYyaEbV7aVi0dKNlixcBSd0+kcilCaOIqp1S7UrwLmIDueoiwZV6eMtXcBYZYaFRqJkloR1icmVKk2Vx7Q7VS7VQjJ19rKfycRs0J6mb0uA5VUY7fslUrOjeucvvE+QV/H5r1u1d9GmC0lCGEH72ZEyieuzG5I0T6PR4DyF0D7WDxAFD1EqoIolqkJR7Skz751vZenH72F2ST+T9Tr9nscSJ2g8+SLhvoOsWrGAUiHgbH2cuL/Apqsuoru/m4mhM9RnK3h+AaUdVthmMgaRA6Wkz+IEIF0qEa65Ecn30kMmRZKJTPEKCJU4TyoxYUJKjJYgPZTnIaTHeK1Ko7+TNR9/D/N2XIRxILTEKwbEwxPMX7SAjoUDjB49QTg+iy81WqnEoRRZDkWmZiivnWSqAUQulZ7lXkQrZe7cHFN9gXSWcHk9g+qdt+C+bKObYJBWADinUppLhaZeq0hPdlLZUokASIHTEqEUkdagNUJ7OD9A+QW8IECUi9QKATVdoHzt5az+5AcILr+YIRvTsJalxTKFPUfZ/8VvcO6JF5jce5Bzr75ObzFgwcpF1GkwFk2xYO1iNl62AactZ4fOIENBoVjAygYSk5ww0tg8yzXka0gihzBqCm2Si5BKIlVLsIUApwROKpTQeDrAej7T1QbVUsCyu2/lkl/5OLK7k31/+RXcRIPupYuo7D1Mh/Y49NdfZfGGjWy67R34rsjE0DCmMoPnaaRQCCtTjIVqhopJBse1FeFEUwfIpoOeJcgdjrmpuKbzKvIp4+SBVd/8hfe1O4CurdCWfHBWAKGZ8RPZokiJJdl0lEo2X0msTuJhpTyc52O9AOkFyIIHQYGqU7glS1n9/nfT/Y63cLajwGwUMVDqYFk9Zuj+73Pky9/EnB6iIMDHYcamOf3iHmpnhlm1fAk9PZ1MxRPYkmL1tjWsXTWPsRMnmRwapxQUUNIhnUQ6cNLhhEXavK1PF1CKRIWnSSchBEqlOQopUkiVBCURQuFLH6UDZq1hUjtWvO16rvv1T9G3djW7vvhdjv/tN5g+OMj8a6+BkVFe+O0/ZN0VV1AueTz5B38K0w22XHED2654K2HsMzY4iG7U8TwJ0iZhqkvSxkmdorW9WWJHCUUeWSNynmubWZ8THYg52AbVN9ByAnMpvZwJEi2nj1weXiS60mYecZYB0xIrNVYphOejtCQqesRFD1UsEkrJhF+i97YbWf5T72N2/TLGajWK0rLMC1C7D/D6X32Oyeeep2xiAgs0QogitJAETjB17BQndu9lQUcH65ctxamY8fo4HQt6uejazfiB4uypEeq1kIIfkJSbQhAmTdY4XGokskROEw6WJp6kkjgviUrwFE5IrCexniKKQ6ZsjY5L13LHv/tZNt1wBXsfeppn/8vfEb1+GN8DWepg4/vv5uzzz2N27aExeIbLP/YBauemGX/sMU68tgtnYMeO21i39iompiuMjQ4hXYiWtAAnKGT6BDL7z8mmvU/Mh2zmXNoyyoJEsF3rxDfT+64pAAvvy5cUz6+hCqRUaQ6AFhAxTdMiVeLZS4XwJCgNvocMfKQfYIISlAK01lScxKxZx9JPfoDibTdy0sTUGlWWdZbpHB5m9OsPcvT+76EmpuiQChcZTBSlmjlB/1jhKGsf2YAjr77G7IkzLF/Qz7yBLsbCCmN2htXbV7B2+3JmZ8cZGh5CK4VX8HHSkphzkUDdRFpDl8lpl1ohlURIgfI9QhyVMMIKgV8sgHXMVGbw1y/gpv/rw1xz71sZfHU/3/ujv2H4ydfoUj6FkiZqRKiFS1l5y43s//r9dFVqRGfHCZXPpXffwYmdz9FZbzB2cC+H9zxJqaeHSy57B/P7tjA1PMPs5CRCCHytkMJDCdX8I5v/ZodfNpNt+YjNpUVzBEl4/gboJNU3sPC+tiKPaNlFKTNv0iY4PJk5g0kyJwvxUIl6dFohtIfUia0nCLDlInWpqPf203fX7Sz88PuYWrqA07UKvYUiSyxMP/Q4h//xG8R7jtAVC1wUYxsx2oAnFY16nagRUvICZGzBJGqxU3pMDA6x/4XXEDN11qxeQNAhGZ0eodTnseWqtfQv6GTk1BCzExW8Qgmhknx8Eg5KHAYnZGLmhUAohdSaehTRtaqLVVcuQXUXGT4zhuvSXPmzd3Ljz9/LyJlzPPKHf8OBbzxJoS7pCspgHBJBpR7T/9Yb6VjUx+GvPkC38CgoybnXD7L02pvoXLaaE889SVe5gKlVOPr6CwweeY35/Ru5ctsd9JcWMDI8TK02iaclSvtJzI9DiSxayLzVpLgkrEDYNDTPA/HagEzuPDxE6gMwx4sUqWTJ9pJ1avetyDxpiUs1AFrjVIAMApQfQDEgDDTVwKd09RUs//iHia+6lJOugXERa8tddOw9wrHPfolzjzxJsVJDAlFYx8UREocwlunKLMUVC+hZsoCxoXPo9IQKa3EmQkuNihwn9x7h+KsHWdDVxdo1S6lFs8zEsyxZs4hLLl2Ha9QYOTWKcBrP11gbJp63SLxulcX7nqZuDUuumM+9v/NWVt66jNU3rKdv7QKu/uAdeCWfH3zm87zyuUfQE4bucjdOQmzCJIMnNRNRxMb33E08O8nII09R1AlS12/UOHXoKBff817GBk8yfewoHcWAklJUZqc5dPh5zp05yrrF27hu06100cfoxFkaZpZAeHhSYdFY6fCQeNbHpDBvnMXKCGkvUFPIQ+vJo5VkpgFEm/0XbSFhGoykXjQkSR6nFEiF1Qo8H5SP9guYsoctekwrgVu5jDXv+wC9776ToZ4uputVFpWLLK/WmP6n73Ly774Cp8/QKTQ6iiGsY53BKUFcqdPwNQvuup5tv/IBlt9+NbKkGTt2ksbYDIFXxDqBi0OwIYHysSMR+5/bTWVkmE2rVrCwr5fp2hSNTstFl29k+bIyY2fPMT5VR+sgOUAOVGY4ZVJ+jj3Hrb92PYUVAdO1WZANlq9Zx1P3P8NT//XbmMEKXeUiQmtcbHHWpOnbZI1qQcDmD7+boad3Mrv3EJ7SiDhGaUntxFGqymPjLe/k5HPP4DccHhqtBJ4PM7NnOXr8FcJahUvXXceVa64liDzGJ0eJRYRPAFbSMGGCSNbgxz7OakIdoZ1qQr9dM+wTXMhBSDTAQJIHsGl5sJU6b8G4Ei9JJA+sRFLS1QrheRAEGM+HYoDr9LFOUA866HnbrSz65EeY2rSGM9UaJemx0vcpPL+LY3/9JSaff4lOYiQWwhgZR0ilkLWYRiWkdPkWNv7S+5l/57WEZY+qNvRtWcXyi9dQb1QZPnQU5RxaC0QcI63FU4qyX+TckVGO7DpGSWs2rlqM9UJO18/Sv7yXzVctR/shpw6dJa5rCsUCsQsR0iGUJCZx/La9bROyT6OsQBiHp8s8+YXHqBydoKu3B0uEjEQT7iaFQqCpRzHBxg2sueU69n/5fvTULFIIPGsQcYTnB0wcPMjKK64n6Chz6tVX8bWPSFoKKHigio7T08c5eHwnhcjjLSvfwaXzdlCdrjIxdY5+1c9FvZcz4C+kUpnGYZIqpJXYtOKYFN5sK+uHbM8GpU6k6h1YcB9zKnxZ8aaFQ0+9fCGwaTiE0gjPw3oeqlBAeB7jxuHWrWfxJz+KeOt1HBeOethgSWcnS0bHGfz81zj+re+jxycoCYUJDdY4lHFoYHa6QqWjyMpP3MPCT74bsXoxPUJTfXk/lQOHWbh0Hm5ekUVXrWb+wl6GXt/P7PAUBb+ElBBjsNZSKpSJ646Du49y5uAgK+f3snzhQsbDCg1dY92WxazbspiJ0RHOnhnBD0rNEyKVJowNhe6AzZcsY5pZdKEDU3FsveJS6jri8OtHCGfA9wpIqTEkXrj0AiqNiKW330LQ2cGB+79Fh9BgTJKiRiKFRoSGqdNDXHPru5gcq6Otj41jwriROKHW4mkJwnJ0ZD+7jz9PSRS5fsUtrPU3cEX/1ezou4lL5l1BT3GAQ1NHqHpTSJMARG3SSUK+xCWlTNP7DiVVM12seudlJmBOF0SaNMjyUSiJxeGkRGoNSmH9ABUUiLyARkc3i++8kwU/8yHOLl/EWKVOp++zWkLjkSc5+Nefo/r6Xso4/MgSNWKsFfhOEkd1ppyj8/rL2fRrn8C76RJkKaDr7CTHP/cd9nz2a5x79AVmDg+yYOl8ivMLdK7tY/O1W6EeMXz0DMJISl4J4RTG1hEixlMFJs5N8/ITr+HqNdauXUBQ9Birj9G1oMyOHZvo7VIMnjpHWI+RIsBaKHiaw/tOMTPbYPOW5ZzYNcIDv/NNpgYn2HHPW9n+1suYmJnh9OlzuBCKXgGnNUJ6VK1h60ffw9n9hxl5didlz0fGFquSfIrGUQi6GB8eotCxguuu/xDrl17KqpXbGT5zlMmxMxgDMrTIuqZEGeNCTp09zti5Ca5fuIOlagW12OJCxcqelZwcP8Dg7HGQYDAkzXlJoSnrumsWsoRr4heNiRGrN2137SndVq44KyQIIXFKYqRKPH2lML7GFTuxpRLeRZtY8dEPMLl6BWdqs1hgebFIac8Rzn77O0y98jolB57QWJPcpBIuOQmNEG/dclbeewedN2wHT1Cq1Jh89FkG/+lBpk6cordcRgvBdGUW16vZ/p5rWHv3RRR6NGXrGHnxCC8/8CyDrwzSVehAe1mxxOJJsMKjaqdYtKaDt9x9Eeuumk+DkDisMt/vpT4a863PPs2+F8bBlhDOUDOSGTfBb/3VJ/nyX/yI44+MUFAK12m5+F3XcPkdNzM8McXjX3iEMzsPo2SZKPYQq5dz2+/8Js/83p8T7ttHt1aY0GLjCFeLcE7QkArd0c/b3/uv6erciJoydHhF6kNHmDy8hy7dSUkW6RYlijagKBUl4WNiwzLbTYECdeOII0fQofji0b/gkeHHEcWY0DWSgyoSIUC6ZhSXhfJZSdlZi+qZN/8+mYZ2zp1fAGmVAFVSvpUqSfgEGuUXqSjF0ne9jejqKzlRmWGgUGJtJWTi29/j1Jfuh2PHKWlN7ICGwboYpCRuRFSLPv33voMVn/oYYvs6AuVQ+45w8C+/yImvPIieqdFdKmGdwdiYQsHDr1tO7tzHmdeP0NfdQf+KbgpLAjbvWE1PX4kzJ09TmWhQ0gHSGpyxSCsp6yL1iYh9rxxjeniWVcuW0tEtGakO09ftI+qK13ceR8kioXEYa/FLgutu38bhPaeZPlGl1NONa2hOvnCUPc/tojzQzXU/fS9dW9cwNDHD4re9lfmfeA+uu8TwMy9SPX6ayFpCNKKzj2D1OoqXXs7S625m6w3vpKtrKY1ph8ahY0PBaqozE9RqFSZnRzk3OcipiUMcPbeXPede4eUzz1KtTLBlYCsikhRKghF1moeOP8isqmIkOOK0epiWmucWiZthoUNpnVQD2/vPbO7NzSRyUnLN8spSoqxKMlBSERtB6Awdvmb+6BSH/vrL1A4doOwMVvmYikngUM5iXcj4bEj/RdtZ84l74aK1hFrSM1lh4oePs/+b36ZwboxezyPCEcdRggaWgtDEuAA6/F7C12d56HcfYOvtW7nug1cRzFdsu3sLyy9fwnOfe4YDDx6g7PdQKBeJaeDiCF3QKL+Tvc+MMXjoh3zoFy5lYJVP3VVohLUk/UqcFLqsQBiL7yTKWoS1qDBESEu5qxszYnn8Tx7ixe+8wmUfuosb/9O/YqhYYiZUTBjDmk99iKnVm+hasJDu/kUUCh1YqWjMzhKdGuL4C8+hF1zE4gWXEE3WKBUFu17+Lk8/91X8ooewDmkT30ijCGSB2dlpdvRdxVR9hoiYkdo43z70dYYZQ6oEGodstfXlexoTtd/KAyglUVK1EEEZuMC5lkBkZsMKiRMSl+bEXVr0MVJgpCWSllCA8CTTw+eYGjpNj+9jZqrEsSQgRpmISi1Ezutn/YfvoPvOm6n0dFJqVLAvvsrez3+LqX3HKfmKslckdmGaaxBUKxUcjkJHCecMxsXoUkABxSv37+bQ0/u4+SNXsfm2VXQsldz1mzdy/JoVPPj5FxgZnKC/3InFEYaCAhHlQoGZsSmGz8yweM18QiKkEBhkAtZwjtgmNTiFbC1gLFDWErsqzmn6i2Uqx6Z5+P/5LDv+YiF24ypkFIP1UfM6mH/ZWup7TnBk9z4qJ47QGBkjHpvBzUzgopiRhavYtv1u1iy5iYNHdvHcSz+g3FVCZ3UKAzrN/oX1KtfOv5Ybt93EH3/vM9yx9V3sm9jL7undFHs9ImMQGchUXLhXx6UYAqUVUiqiKEwxgRm2LCs0SJFDKLtWp06aLrYSjKfwlEJbkDbRDzaSSDQqNrh6DWNDtDHENmJaWLrfej0LP/Au5Lq1GAmdJ05w9p++ybnvP0zgDP2FDmwMIQ7P87E2YsTUWHLFWnq6Ojn03C6CWFMu+FhbBwtdxS6ic3V+8IcPcfTJZdz48Svp2NrBmpv7+dTFt/HCNw/y4vd2ocIS2vOJoxhkiBAaz0qUqeArh5AxqCSvLkW+WyhOUtDWYqkjoiQbF2pB5EIKHUWiqmX65YN0b91Ag4iyk3T1dPLKt/+e41/5Lkt6ugiEh3QBSilEdxdaerhwmice/jOKt3j4RhCZGRQaZ5PGFCUVCoeJG/TRy4d3/DQ/OPQQu2df4Z7SPchqhPMbEEEsDY6w2V+Z2P/2jiMtdZM3IYpDrLXopNPXngdLboMRuQxHZUlgnClCWKokeFUKiSBWYKI6LqqDjfBiCxaizm42/KuPot6yg4bU9NSqzD78BPv/4StwYpDuchFUQBTHSK3RCCq1KmJ+F5d++E5Wvf0SVCBZ+MxFvPoPP2Tm8CidhQBLiIojlOcjdC9HnxnlxN4fcMP7tnDj+zbQ3Rdz509t4qodi/niHzzO9EgFXSwioxTjb01S9weEVCiRVAetdM3KmxIxwpok6WJah0U6cEJhrSXCMm/ePDoalk4EcmaWkVf3c8snP8BzUjD0vccpFT0UEhtbnLPYuIEWAYWCZGT4KBevvxEhimAbWCvAgnUCqRzMxLzv2k8wUhvjOwe/SUe5iNMGIxyxjYnRCOMSiJmL0zC+BXbNqpvWJlwB1phmtkAnmy/aioDO5QCic4pDMl96bNbS09pyemqMMRhrUdZCGKJWL6d07eWMO0P3kZOc+IevM/H485RtjN9ZJrYG52J8rahHVWZNyOJbLmbbx2/HXzmPCjExNbquXcO7Nn2MF//2Bxz40WsUQ49CUCJyBicFxS6Fi+FHf/cih3ee5O6fvYoFWyps2DjAwmXdnDs+RKkIzliMNU2nV6YECzIPp3atbmecQziLwRKJDG0rkVIxXJvkpv/rp1h3zcV8/ld+n86ObmpTU4zuP8HIW67l5n/1cQ6vW8czf/F3dBhJBwGxMRgUwsVoETA2coqObWW6Sr2EjRGsdEgr8EzM7GyVtyx4G+sGtvGZhz6NKVawUiEKMfgxVjqMSHsMaO9oMcYkmIa0c8uYtKajJMKYJPl3oa7ZNmRJHvrFhVqkcyDLfOdB1nxgYmrGMl2L6JQBx7/2XYZ/+CjdBY3vK2IcRmmMc9QnK/gLB7j833+Sy37zY9iVvZSB+pOvU3vwFQaimFqf45rfeBvv/r276dnezUhjClyIVhDHBkuVns4+Dr0wyf1/8SjS+VRtjSiNBpxxaUdvgqxVSSdEwj/g5oIpLMba5looaxPgkAEtBGPTo1x8z01c8vbr+PqnP0P06mFmX3wNu+8Ii4Xg3Lce5Vv/5vdYvG0Dd/7n38H1L2FidholY7RJGlF8HTAzNURcb7CwdzmNqJ5gF6QhdLMsskt5+6Z7eeClL3GifhitfVzcQOkanh8ilMBJi5Nxrp3AJUJmDFjX9GGUarGzKKVQSiGbp33OxuZx8WJOw2h2SJJ4s51ux+a6gAQC4SyF2DWpVJRzFIp+QuNiwUqfWhhTKxTp/8hdbPnMbxDddiXDgaRwrsbr//UBdv3BV9nzn7/Ozv/0TwRHp1DE9F+5iDv/8zu4/l9dSVxqMDU9gY/EiwNcaOkqFyj7HTgToaRGSgey0RTMPLJGOJFQsLh2SIRIkcNKOJQQaKVQUqC0YGjqLEtu3MTbfuZeHvjtP2b2pQN0d3VRQlDQBXCCnp4S5uARvvFzv8nk8VPc84f3seDGmxmfccTaQ/oeWkhsVKUyNcmC3pUYGyeaVFlEtcy7L/4op6YGeejEN9CBohHFuDikIEN8WUvYTrAg4ubGZAdWCpmus212VeUpdkCgM2RvHoGeB5RkQFSbw9E2yQbaaWzSHgJaTQ0CYgexMAhriYVDWDA2KW5KodHG0XXlNtb89D1Em5czLQT9UUT4yKv8+G+/xuyZMXpKXThfc/jZwxw/eILrPrSDi+/YRKVs2fb+rWy5YgWP/e2THH3mDB1KA4bIyqT9QqT+jVNYp1KtLlso4RYxTsvANzuQE7OmlIfSCnwPnGByfIoll67ip3/3V/jWn36eEw/vZF7PQkw1TFK+VqWnLqIQKLyG4anP/AkTd76Hd/7ir/HKukt56Qt/TzmuUygE2LjO6PAQvZ2L0MbHRzFVneVtq97PykWb+a8PfxoVJHfUkFWkaxBQJ8AiMGRdBPkCkEQkHltKYWObgFCBtXHKKwAy6XaxrRZtZ1u95M41SZOarV4uY9wQ2KQPBJsiZV1aWZM2wbNZaxMAZdpQYhw4G+NchMAgMNSdZd3734PdspkoNPQcHuLwH/wdz/3+ZxHDFbo7O8EaImkplzvxZhWP/I8HeeDffQWzZxoVxhRW+9z9S7ehCg5jHNYphFNNoZQYnE2ycA6DFQLrEjClh0SRIXPTtjOXYAZciszWWoIHIvAwcUzP6h5+9g9+lecf+AG7vvQj+ko9xLUGLo5xxoGNkDbJ/VvjwNf0d3Zx5Nvf5P7/9O9Ys2Ejd/3Kv8f0LqBSqYI0nB09RH/HIgp+J7PxDEu8Dbz9yrv53t6vMBIdxysEWGI8K5FWImgkfokMsZgErSpsUgDCpcBSkULHW0BSm+MMwrkUdOpEy+FpgxOKXLeva4elvxHBqGvhz5uwK5sDpGagUps0dAolCKMIZy1dg+M89+/+hJEfPE13UEQHfvKwUuBbQRxFhNLQ7XVw5tkR/vbXv8bY3nE8a6nVG2itcvC1Vg+dwF2wSUTOeYam2Usf27o61tQQRGihkRZ0ucYv/MHHObVnHw//yTfo7+zFOtP0IaRNm0Wdh7MeCI1wFhnX6CmXiPfv5bu//W+YPjvCB371d1l00Q1M1w3j48cJpE+52AFTHh+68hc4ee4oT536HsUOH5s661KCkg6lDUKEGBMnRZ4ceDRTw1IkjqpIk3otAbDN5dAXIIVJ+QBkjtUj11eeVpZsRhiFbApPhjhuMlfZhF1MOEfWDU2qcKTLtZcJgS814fQMUa1Gb183wjkiI6jFIWXfB2kRYYywEBLT1dPPWK3C1Nkaqy/uJ6I+h4YtEwWba5FOVZbMBD5t1c41g0qZLKBSHgaFcXFy2wJm3ATv/+33Uq83+NrvfY6ecjciNokGcRZrU33jXAL3dhoMJKxNhhCFLhbQpsETf/dfGL7mnbz9tp9hefd6dj/5MI16kfU9NzFvXomuzm7++sE/BU8QiyT0FsKmnEoxWkdI1WhxIZI0hxqX9RkKrDPnI4TndBonDCEy60kTrb63NmiwO5+YoK1tvh2CJPK0aDZVqc6lDRouheOnncY5nLpSHkIr4sggrcR0lFl55UUcfe5FvKkZSgUPzySCF8kY7Vs8oVIYdYuxI09B1ySISnlxsiYRZ01C6kizkzWNnUEKl6h/6WGdwgjD6amTfPJff5iVy5bxmV/4nyhXxorkelKopAkGhZABxaCDyakpir5CKcBIsBopYoyoIYRHV7nMgWe/w9jxQd5+w6dYecuVyGov16x8HwsLih+9/AWGwkG6Onxik3j5jqwnMEKKBoh66ne5tALYpMLIUdI4nBXtHA05WJiU+a6fCxIpuabNyJooXXsn+4UoFhIVb13Lsrj2lmXRzkSVkjiKNP6VSKcwTrPm4+/mkv/7lyletpkJEkcSv4BURYSUNKSlnp1wMYcdJKNOmcOzkz2HTUungnaCBu15QIPYVFFaMhNPcMu9V3PVW7bwPz/9d7hzMVo7bKyQwsehUmCpxjjFXXf+Ijde/RE8eolDgZIFtFVIl2gFnabbe7r7GRvazRM/+By9tp8OnSSjbBywYcVWCsUeIpmmeAWpFnU4Y8BVcTRSW24SUIizczqhs7Yw19bTmadx0nP73p21KTuHalGTpvbSZCGUo6nSjXVNZ0nY1CkUSXtuRliQ3YOwMqkrpBVFbNzEFcZItEqycKESeNYhRMTpaoOZLVtY++lV1B5/mkP3f4f65AT9uoiNNFYmrAYxAueBjXT62ek9ZH34Itcl1GSbMKn7KptOq5QSG0d0zZfc9TNvpWuB4Y6fupie0go++39/iYmj4/R29DLdCNHJqmCNQqnEnRR0ERcXcfml17BhwXae3/ldDg2+gvIFmgLWhFgZobBgYop+EakMQlTxwk60tAgb0ynL6Ehi/SQLq6xBEYFLSupSj+OpOtKBVDEuBusMSqZWJzXlNu0SbnVAtTe+St6QlcrN+du1U63k2bFcK2bOQkAp2ilRk36Xud9Pf9dmdHEOGxmUASMskQQlJJV6g5MyonTXdVz/B/+WeTdcwbRpgPbQooAmwKSlm6QxPTkMcWQwJKGZczpt4+W8fnvjTDMzaJ0liuu84+OXcPHV/VTtFMuX9RDXZzl94DS9hS5qxiGER1iNqBsISt1Yki5nT2ocltPTEYi1vOOqX+D2Sz5O0Q1gIoknAwrCRwuN0xYVSGYrE0zPHGFer0dv4NNRjFnVX2R1x0Jq1ZjAT5lRcSgsQjSIvCpChUgZtzgVs5K+u0B30HmuQNpelv+5dfY8zsVmd2k+PzaHRk3YzPbnqFBsjo5sLkY5DUJFSkFLGlYSWmTsEl6glO5F4egwgpLQDM3MMtobcMWvfIBLfvHd1BZ4TNarWBSxkBgHsbEY4zBRUtJVFLE23znr2krcNNljDU5AbAxSw8DSgOF4jDqS4UaNnkW9LF2zhplajBQe9akKbl4Ht/zap+jbuAYTOnwZJLBtK7FOMxJLjk9pVi26mQ/t+AU29l9C1JBgFYHoRtsynirgVIUnXv0iLw99hyPVnTx08MvsPfc0v/3uj/DupZcwOzWJcaljKgAVo2mgVIhWFp0SXLfTJlrAnR+ribZgLVcNbEMCifbYQKStSjmmLJeRJKe0Ma22+jxDVautWgrRxlTVJD2yBhvFWOdQ1tGYmaWnowuhJKEQeELiCYfB4vmaRhxyLJ5k+W0XcefG+djwGJNERE5gUoYOLCgfKjMx8WSJeeVeNLXE7tu08y7HiWCcTbKaaddT1HCMnQjZuqqPITtOp9/B5EiNc0dH8ESJehiyaMdWrvrUvZRXLOe5h59DxQLPKBpCUY0FohEhTYTRiuGpBj1qLe+4eBnbzjzD08ceZSIcpRSUMSbC6ZAZe5bvv/x5hPSw8TT+wTojo5fwqZtuZeOCIv/w/IPMBorOQhmnJco3BBoKShCIhOvZkDCDm5QxRIj2FL7L8QY2qWffiLOw6VnmiInzuQLnbNv/59VOkgWUTW5hUgy6zExAi/EJayye5xHWG7iVC1j74TuZUpZK3ED5XtJSLh1KOorOEjjQzme0Mk19fid6xVJmEDSAmVoE2kN6Pl5RMzkm+MN/+wgvPjGDL3oJozBR88amC5EmQ4TA8zw8z0Mphef5fOvLL7D35TE6o37qx0s88MePE85afOEhukrs+FfvhZVdVKuTeOlJM1nDcQTGKRCabitZWPARcZWJGce6xbfw0at/mR2Lr0fVPJTTBKJAwRUo+z6+H1Ms+XhdRb555Gn+/df/G9uWz+MzH7yXdQUBjSmUivG0RQGBUPhCoLEo4drZmFNa+LnElHnIn7YpK0XeQ3cuF6Q3LU/Li7TOIp1psmoYEpoS4xLGbGlT8AgJbDoSOuHuEQmyxtnk1CkMxjlm9x9h4faNnOss0/OJ99F39RUc+sL9TB8fQriYQDpcJOgUMfNLloYTzNYlVRvTMJqa6Wb+4i6u+cD1vPbAKxQaCt/XeFYwfcrw3+57kKDoUeooYyx4ApyVTV4ehIdAoqVESYPSionTIX/1H5+kf6CLmfGY6pikXCwTRxFOdBC7GEwDX/so6eHwcTLJAUibJF6ME5SlpDq+hwV9Awgxj/HJKl1ePzdveA9r+1fz6IFHOBsOE3gWJyIi29KgnR09HK5O8GsPfJ5fuvkm/uRj7+MLjz3C4cEp+sqORR2CbjlFXQYJ0ZaVaX7F5TK7OQ2QkUNZm0QPokkUSVu6cG7CwKWSbWmRK7XKpaJFmJSzOVlAonB4Jg3zYoMN6wjjkDHExlHQgv2f/Uemdu9i5UfvYmbbKsTWFVzym7/E8HOvID2NlJIQR5f2GPr+j+hd2Mfiy9dztjGGiSGizLCtcPHHbuSiy1bx/Oef5NgrpykIQWdnByZ01Bs1pE6jEG3AxMnXeDhCRCCo2gql2McTlqJfwos7GR2soWVAqVTExDE6JWzGGHAGm9UamjT74JRFm8R/KQUer5w9xMv7H+OGi25kSd86pmZqDI8aVpS38YnLF/H0sUd4YfAZIhFR1ApsTCxAxtBZ7CB2Hv/zoccZGlvKR27aRDGeTyCnuG5TEV3czmd+dJiGCJIuJ9tiCXVZnqXpH8hE++X4oSVvFNE7cZ7HmOQhckLiHMLaJteCci0iqEykjHQ0pMOaGGMhqsdEtSoikBgv8ZyLgcfIsy/wyqf/GPVPjzJ/qkrYF9DztisQ/d0QJeGo72kmXzvDj/7D33D0Hx5gRSNmftlH4/AoMdaoobd0cufv3MHbfuZaZMkxPj2F0BG+tig80AInNFbEeJ6HBmq1Busv7eKOj6wn1rNUZkOciEE0KBRAysSxxEpsnOHrEgEAi5OJBpRKoLXC0wJPOjwrkhi9KDhSO87XXvoaz+77Hn16mmU9PjOzdeKZDm5fdjs/fdFH2FZaDdMh2kpKQidNt0g6BQT9XXx91yF2HniNng7wGuBNTfGWpR1ctLjMbD1EWJW1hLYxjZ9HdydapSM5d1Ozmn47sfAc1n+boypJmTqz9K7KMWQLBLGxKBsSaMuMqbPs3rvo2nEJU9U6fizxhMbHp6tzgCCSHPzct3jlvv+OfOk1ehHEIk0jW2g4CYHGtx6v/dNLPPRrf0/wwlE2F3wKukYkLCMNw0k3y6p7N/DTf3Iv229aRL06iRABlHykFgg04HP2dIiiG88zCG+am9+1hF/93etZdVlX4oMUfLTvpdFLiopyaSu2cy0qspSIIguuPSmSIpMVKATWhUjlcF7Es4PP8Lnn/54j48+xpKdBUTQYngzpK6ziY1e9j/duuYmuUCIaEV3ap4iH0B5IQYfvUyoVQDSwYYMwAqMsgR8SuwaCKFfFzdPc2GaIK2V7BUR19827T7Q1g88t8abdLBmzl1QJAkgrpF8glIqeS7Yh167BGYs3PMbEsy/hxREiTgAJjUaD3qWLKS9bTrion8XXXkOht5ux40dwY+OUPD+BZCEJfI/q6ARnnnsVxmfp276BigNjBf2+YvyZl5g+eJLujh4q47O89swu5GSNbWuW0tmpmDGzOOkzFVaRvZbrbr6YhQvLHD96iuqUo1QIwMVoKTi0f4gTgyOsXr2Mvt4ilXqVoNdx6XVbKHUVOHzgBNOj4KtOnAHhFMpK4qLHulu2I3t8hBWceOwA0ckZPM/DiYCNm65BR32IhqBHCU6ffoWzE8dw2oJvqdsKe0++zkRliBXzeljU0UO1OktUC9m+ZAkXr1xEpTbN2YlRnC/xlEKlWb6CC7l8w3wCFeN1lzhWU3zpiUEatogRitjlwnQhzyOknjv9RHX3D9zHhTj0abWCJx20IiFCBJRMCB2d9omB3ku3otatRoQKf3SC4ZdeohBFEBqEBFOvcOqp5zDHTtG7aAHR0sUE2zaw6KpLscYyeewkKnKIUkAoLcXApxDD6WMnWHLDDipdHUSRZSBQTD6XCIDWgDIERnJy11EOP72bxV0+G9YvIRZ1YiKcFczEk6zfOJ8dV2+kMTPL0YOnkEKhlYdSASeOTrPnxdOUi2VWrVtEJAxTYY2VWxezcvsyxmernDw8RmADCtrHCB9bVKy7aTu6S6MsnPjxAcLBWZTv4fDYuvZ6iLqJazELkJw69xInZo4jtELGEb4LwRcMTp1h35k9+KrK2sULCDzB7NQ0vaWAHZuXM9CrODs6RCWqUQgUWklOjU5x6PQoofR59cws//DofgZnNUKXiRzEqeZO6l4pdWwb/U+7MKjueQP3vRFnfSYANuX5cxmVupQY6SWkT9bRdekl2PUbMS5CjJ7j9JPP0iUlRjhEDFIqfKB28CgTu3bTF3h0LVuMGZhP35WX0LduOeMnTzN7doTAS9m1ncSVCyy95XqqHSWsscwrSKaef4GpfSeStHEUIqMQT3rUJxrseX4fM6dHuHTVYpb2FojiaYQ0zIYVVDni8uuXs3JxH8cPnGPi3CTFoqZcKhDV4PVd5zh1coolS5bQP9DDucYUYb/P+uu3MH/xIo7sP8fsWEg56CAqOJbduAnVpVBOcvKxQ8SDs2jPBzy2rN2BCzsxNcN8qRgceYWh6cMURNKxY6QFW8f3JZEXceDsIQbPnWTZgh5WLeunHlYIqxU2L+rhyvWLIJpl8MxpUA6v4HFiOOSZwxWePTbO2SgAr0Bskrb7GNUUgGYaXrRj+PKzBhINkGMEbBeAFg+uoMUJRJZw8RKMXeellyBXbqA+W6ejswvdiJkcPIWOwwQGbRN1VC4UsNVZTj3/IuGRQRYsXEg8rwe3YhlLrrkShGDoyBF0rUHR86j5kiW3Xk+9XMTGlnlFzcRTO5ned4zAU5goRBoDtk5BQVF2cfrQOV5/6lX6gjKbNyxDqYgqEVULU1GFpWu72XHjZrSIOH1klLgaUCiUkMbj9JGIpx7dS61WZ8nmVcS+z7iZZd66Jay/YTvjU1VOHT2Fk5J1N16C6kow+4NPHCY6OYvWiQBsXbsDwi5s3TIgNSeHX+HkzEm0lkhi4kaE7xwyckRRRFBUnGtM8cqJPdTDMTZvWER3UTAzOU6HD9dtXsqagU5OnRphqhahy0VUQYPwEgi7jTHO0kh7GzJKXyfOH+rhmmywyQar7r5EAASiGRO0S0xKFiGT5hBkQk7kVFrDj2KKF22geMVWpsYaVJDMu3wbvetXUhkaYfbUWUpolFLENumFD/wi4bFBTjy/E20snYuWUO/rJti2jgUb1lIdGWXy1CD4ilW3v5VGRxkbx8wraCaefo6p14+gtMTapKjSJBMXMUHBJ4wFe14+wvCRM6xc2sfC+V2EUZ0Yx3gYY3XIFVevZe26pQyePMvg8TGk8Cj4SYHp4J4Rzh6cYf7CAfoXLmEkbDBbbLDumm109s3n1OA51l2+iUJfASESDRCdmEXpxARcvPZaZNidaAClOXHuZY5NHwYvJp6pcfPyHXzisvdw3bItTNWnODZ1Gq+gMT4cHx7k8OBx+ntKbFzSTdFVGB8dZWFfiSs2DVAPpzg1PEYcWpQSxC7piI6EIBIi0ZxzBaBtmET7sAnV3T9w39wJWu1jS1KeunSVbRMx45BCg6eZPj2E7yy961fR8BWTlQbFRYtZcuUlqM5upk6dI67MoLyEiSsyhoL2oBFy9tmXqex6Fb9cpLx8GW7RfAauupiunm5q50ZYcsNVNLo7MGHMvJJi/Onnmdh7FO0pjDOpwksrWyLGuRAlBUXP4+yxUXY9eZhCbLlo0xI6AogbFus049UpehYWuXLHZsp+wKG9J6lXDMViCd/rZGxwht0/PsDsWJ2lq1ajCt2MVqos2LyG9ZesR5QtTjuk8Dj244NEJ2fxtA9Oc/Ha65BRF6ZmGPA9Toy8wuDUIVwUc+n8bXzwkndx4sxBrJ3lbdsu4+DwYc7OjFJQEhHAbKPKi0f3MTozzMqBbuZ3FKhOjdCtp7hm63xWLO1laHiM0ekKztdJGjyJRbA5AcjPQZnL2N6kmu+eN3CfmMP1L/J5+zyphGw1i8q0pGuVwq/FTO7ay+zgMeYtXUDn4iVMztaZNI6u7Vvov3gjtckJps+cRUuFFkmfn2ccHb5HNDzMyJM7kcOjLFqzknBhL4VNG5i3bQOmp4tIKGJn6SnC5NPPML3vKH7gJcOsiBEyRCmBFhJfgacEWoHWPqahOfjaSU7uO8P6pYtZtbSP6co4tQimq4JaaNm6fR2XXrqF4VPjnDkxiecVUCogiEqcfHmIAy+eYKB/OYtXr2S6OkusDdZLQlwhSpz48UHC09MUtI+jwPY110Kjk6jmmOdpToy8xMnaUZRV3LP+bVCtc9+jf8wrZ/Zzx7orsV7EzjMHKHgCTBUnHcIPOH5unNeOHEP5ks2revAxVCZHWTFQ4rprluPLkMHTw9RUgLEGaxO/KwFiidwcpgvPH5rjA3AhqE+OIzXjw0+HIyiFzMbABjpRvYOjjLzwKr6NWbhuFaJYZGyyStzZyZJrLqc00M/MoROY8TECz0swrc7gaUFBCUb3H+HsK3uZ19VLafEA1f4SVZmYDudgIICpZ15i4uBpPD/Jc2ubdO+4qEEjiqjZmBoxFWsQhZgFSzuQrsi5Y3Wef3gvrmLZumklvieoVgXWFZmeqtLZXeb6G3ZQLpbY//phqlMhnlfC8zqojNU5+PRrRKM1lq5YhujyqdbrYDUlEXD60f00hqpoz0c4n+0rr8GGnUQ1y4CnOT78IqdmTuCkYP38dWydv5ShsbOs7F7EzVsvZc/IQXafPYzyJMY10qkyMZ4nqTvBrhNDDI6OsHTVfOYv7sTO1pCNaS65fBXKL7Bz/2msCgidI85YxC3NZt43QXCmPkB+ssYFp4C0wsHEEUxgIkYlY8hCa9Fo/CAA6ZjYe5CZvYdZMNBN/9IlVGqGsUlDcc0qFmxaR6NSYeLkabwsMW+TJgmvVICpKoPPvkT9zGkWL1tOceF8ZqMaIrL0lzSjTz3P9J4jeJ5IWs1VnYqporsC5q3qYt3li7j0puVcd/tq3vHerWzeuponfvgaRaGRRrLvxVMcfPEUqxcPsH7VUurTjkbNY2amwNhEjQ0bVnPRli1MDU1z4sQplA4o+2VKrsCZ3cc48PweioUSC1etSrF0hsEnDhOfqoH2EFZxyYqrsWEXUT0RgGMjL3F05hhSC86OnWHTktXcuuYKrli7mePVU3z5xW/TEI2kKVXEQJQAQ7DgeehywPhsjb2HzkAgWbS0CxHO4IkKw5UZnnltFKuKNFyUIq8z+2/bSSQvJABd/fPuu9CosiYTdXP8SjoGJSV+lkIQBwqrPEorVjKDxjZqBF5AUfiEw8Ocef45xNgo8zcsh85OJsarVLt6WHTlZQwsWczEqUFmxicoijJSSiIbIoUlEJbpQ8cYeu5VOpRi1dZVGCnwMEw+/gTVPfsoFMrUbIP+JWV+9tPv5bZPrOe6u5dx+c0L2XxRmSUrBQt7O3l55yFefmyQstbYyOH5nUwPhex64hDxRMilm9dRCIrMTEUYEzA+WqGj0MM1V1zL/N4BThw8xsT4NHgBBeUTDzc49uwBxgdHWLF2FfMWLWHvQ69hT8ygpcQ4j8tW7ICom6jhmOd5HB95ieMzhylpGK8Os/fUEW5cfTEzlXH+84N/xRk5mShXk0DWhXPEs9No18DGNZSoU+jwiEWB/YeOsWBAs3pRH0rDoYlpnnt9CqF9IhOlwJiEINLaZj2+jfw3nyRW3W8gACJFzroUNZqNcXEpWwhKobyAauzY+IkPsvQ97+DM8VO4qQrKxgjpKIYwuWcf5158mYFSQP/q5VStYKoWEaxdw8prd2DCiOHBY3hxjC8kzkZATCHwKVRrnHvmRWb2HWT+4qUsWrGYs48/zeT+E/iFAKkElcoUrlDjsresgGCMejiNiQ1hXMOXZZ747mFOH5gm0BIbCVxk8KRCuw727T7NK8/tY9nAAGuWr6BesUShR61uGZuus2rNBq66fAcTI9OcPjGEEpqOQplOVWD8yDkOPPUaC4r9jBwZp3J6lEArrCty2coduLCLKHQM+Jrjoy9zYuY4ztc41UBZyW1rr2C6epZvHf8xFP2ksUfEOAzzmOWnb1jFL955MZuXdzE0NMRM3eEVkgkgG1eUWT+vAKrB8fEaz+2fBF/RMJI4ZSqziGRAZG5K6AXon1Fdff33CSfOR4zkJlw2ETQZ5FrKhBPH84mlj3f15XTe/BYGLr6MsF6leugw0oSIRownJWJqitFnXyIaGWHZ2mWUFg0wOVOnpgosuuYyuhbPY+L4Kex0BU+BJUbFBqzB9yRTh49z9LFnWFgICEenGT12knIxKVF7nuLg3pPs23ucK67bgKeT6pxSkqiieeTLB6gMWwQKFztUpCCOCa0lkGWqM4Lnn9xPY9pyycaNdJc7GZus0yBgbLJCGGmuvPgqlsxbxInjp5keH0dLScEvImYErz2xi3iyhk6xjsoGXLriakTYTViDAc/j2NjLDM4cJfA1NmoQoLhl1Xbq9UkePvECVqcVWWkRlTH+9e3b+eBbNnPgwHGu2ryC7Wvm8cSuY9QIcI0aG1Z3s7E/QYmenKzz4t5xrBdQj1PqF5c0vmQDc504/+Q3p6rnCwdvMlCr1TvSZJ2V6ZSMhLp0smaplMr0b91MPTIQx7i4AVGIUFAOJJWnnueV3/0M4Y8eZkWnwpYE+yYnCa+5iuv/4Lfo37aORiPEimTwsXGWKI4ol4p0xQ0e/x9/w8lndlLuCIikRfgClIdWAWs3LQLPUgw60aJA0SswfKrCmWOTCcI4FFgDsXVYI5MW7CjG9zRdHQM88/Br/Pff+RuOvXCINb1L6LAaIsFEI+LA8AjL12/hFz/1y1x7zS1U6oJKzYDWdBS68UOJwke4AN8qlHXIWEAkkSbtrxAW5QzOQmQibBwSO0csFVJLhHTExlIOFDdsXsZXfvQUH/mLh/nDf3yYlQu7WLwoYHx2groJiY1r9uw5rVDCNXkNpMtPR5Zv4v6RjZsR5/X4XXjuav5PLiOYagVJMtevEYYYZxLCx5QbzzUamLBGWVlKo6Mc/KvPsv93/4iB40fZtKSXxUZy5LsPM3n0OL6n8WKHMukcHSyxjVBAl1PI6ZmkzUtpFFC3E9zz89fxoZ/bQYffw86Hh6nPxBSdz5E9Y0yPG5TQyXj3GIRNRsQr46FNgXhG4BoRhaDE+GjM5/7ifh74m/uZF/ks6xpARwJhAwYnKgw34Obb3ssn7v0l5hWW0JiJUj0a4JLW1AQGY1Je6gx775pQyeZwDamT8nZJSHRsUUnrPnUEYRiyvH8+y7o6WDLQiXWSar2OFhCSzjFQgHJIkfUykM43cLkBEjaHzLgQ6gv0hSYjZzVjQX6cfLuUuNRPMDbrLElUjlIKKSUyFml7okGbGBlbYhEhPEW31kQvvszuI4dZd+dbOXN4kKEndtJVLiC0xApFKA3aJQ0dVqZAURwKD+GJpPxZCPnYL9/BjltXEJsa3/rLl/n2557i3p+/ig//1NWcOTRFIL2E5YMIXEBsU2haTXDPFe+iOhbz8OFHqBUilOcRyD52vbSXQweO8u53voetF13O2ek6Y9UG0xKmxsdYPG8dP/3hX+Ol5x7j6deexuBQXvK0EUl/oLIS6RzKJpB6ZxMomsMmfMq+xNUcoY2QupA0wyCYrhn+8cnD/OZ7LuOfVnewoLPMN5/az8HjdQo9A5iwgtSAsk26YCFanVlt055E3o8jP4Coude6LenvzhtLywVmaDbVSzLyTSSdVsYi08YOaUlImK0FFyFMQrEiJHgRCa694NFRmeXIF76GVB5dfSWIY2aqFYSSdAXFtC0rAYvK1EYqJanVG7i+Bu//9bdy6fWrqVXrPPBXO3nyu/tZ2ruah790gE3rNjIyWEOkJ985gYh8cJJQG5QR9Nvl3LrhOvoKa/n+wa9ytn4aoxRB0aMRWb74la9y0a4D3H7r3fR0zefk6Cw1qzg1UaPb+lx72T2sWbidR57+AUdHD+CVNZoinggS3ICJ0sljrtmnn7WmK6VY0tnD0o5eDkwPUyqWUAg6Onv56vMnUPEUv/Wz1/KdH+7mv3zjNUr9CxDKIrE57Ru3Oqtc1uuYwviczM1i50JFgbTfIz9BJJtTJJMkch4e5tImg0ypJM0e6ahGmTRlaiNQmdNoZQL9NhZnHbFzhNYQWkvoYmwjBGPxiwW8YkCkLTPEXP5zH2DZbVcwVZlKBjRIhVAOrRxFHVBrVOharPi5+97L5usXMjJ2lr/6T9/nme8coavYQ4xFxgF/8Tvf59ThUaQOiK3FRQoiiY4dIlY4pahZxci4ZNv8m7huw624MEQQE8d1LBavIHl530v8j7/5E3a/+AxrOvsYCMoIo6k1NPvPTOLLFbz/hp/its234Yc+NooSm5yNrbM2GWqZTV5TiunaFA+89CCdBY/fu/UjvGVgKTZuJORb2hArOHR2FmcFh6dCZrwiIhAgLEpljlja25jCsWW+8bJtquX5Fr2pEQToJpmoE+2/I2h2BGUdny7tu8sYJ1vRZdLWJSwpaCTryW1Bw2VGRyIdGkEsk5Ym4SQ1F1EXjit/8aMsff/NLGyMUuj2OPjVH9NR6oAgYSYbrdVYdsk8PvFv72T+Ms3U8CSf/3+e4NSuWbq7y5g4REqBXyhhI4eLHEoZXBwhnEraqIVAZpZPWerKUmsYpC0lgzKzx4sjjIkp+gFRXOfr3/0Khw4c5M7r7mJecSlHZmqExmekGhGFHjesew+XrLiKR5/5IWbGIGKHsLI50IF0qINz0Ajg63sfY3j6LL91y7v41zfdwd5v/wM1Eu4CY0nY/pyj5CVEUUkDTdrYYltwtKbGFrkOm6wChGwjhrxQ24+e6+yJOWQRbdzzzYHPubhSpUADY5saQTRBpE3kffNKAouTGt8JbFFSjyPCoMxlv/pxBm6/hkpcJQgEF/3a3RQHiuz+h+9RMgVma9NsvH4l7/utdzC/R3P22Bm+9Lvf4dSeKbygxNj4RCKOVqZDlBTSCnxIePSdSuYApRBWiSR2UEv5EUw6cCF5XItzIRKdjm0xdHb57D35Cke+eICbtt7Gjk1vY2LaYzSKaeiA42M15pcW8e4rfgpCGJqK0A6UUzh02pyajm9XAtXfxYMnXuPOsUvZPtCVtJU7i7Jpz2rm5Tcxvq3eBSfe1Ln/l72yPsimWhDt7UAZtWiCI1NziIFSxGAecWIsLkpo05szB0WLazhJS7Y6T23Bo+Isal4/V//KJyjfdAnebIVdf/q36KLjyl++kzUfewt9S7p5+s8eYOO1G7n312+m1Ok4uOsEX/ujH1IZheUXL6LcaTFhCWsFSmqUFGgpqU8bTu8dQ+PhpCC2YK1AkwxNjHHUZPIsRqRTUl3S2BoLh2nUwTbQnkcc1dGiSCjrfPuVb3Fk8CjvuuydbOnbwqlpS017jExFTMeCThkkVDLSphFAQjBlRDLnIIgdQjvKxSJKSRq2gY1CrF8kSgtuSulmCT5rsk2H5CYaJRt4nfL+MhfOl4vbbdbAQ2uodJb801kD6FxXr9lWnZs8DefXlVuduHZOh1CqQZRqTbbIKOV8yUyjgVq+nMs+/QsE29cRjI6y67/8JWcefS7RKsOjXP/rd9H11otYtGEBi7oNxc4Ch588xJd+/zv4jYBINXjLe6/gttuWElPBIyBxPxsE+Bx6vcrvfOoreJQT6Hea0Uwo3iRGQh2LwWClyE2Rs4jIY9W8y+gtL+HomVeYrB1FeBFCagpFn8OTe/iLR4/xlk23ctPq26lPdnI2MlgpqYQxzguSPIgAa2OEMRgkkUx7/REYG2NtYgZ1upE2VdtWiNzg51YwZyFpD8tTu4sLx/hNri5aM5DdnOnkWrgWXFgI2Rw72mSYFbINROhspvbJjU0XiFgibNKcaUVGw5N471alUDKhkUGB2bCK3rCOS3/jl3Bbl6NPn+GlP/orxl94hf7uXoyQDD/6Go8PD3H9v38/nWvnUSRm9492853/9hC+KREUNZWpKjO1KUZcgcnhCWqTBucMhbJg8VKf2biWzAWS6Uxjlx8FmqRLQ5IO52xyGAIIFddueh8Xb7qbqKK4aNU7eWLXZzk69VTClG8kntZEcpbvvvp19h95nXsuupvNA5sZGvOYwaGUQGmNcg5nIwwxntMJfZsQCa+vzqadJwAbZR2ey5XjberJu9YYEJmFelICpq3lLns+l+M4amv3zyq8uTKxFDma2MRDFO1/bEpbKtv9gSaNvJTJ90OJiBKv3WiR0KOniyqFxHoaXSwwE1fpuuoKrv3df4/aug61/xQ7f+OPGNv5Kt3lTkwcEsYxQU8/kwcrfPu3/pHaM6d4+csv8fU/+i4lW8DXCmddk/+uJEo89e0D/O4vfIs//pXH+OHf7aUsupBOoZzAiqRIIjKSpCZyBmLnknZqJ0BoImPoLS9l84rbee61x/j773+aqdkJrt5yDyIupmo1JLJ14igmKAuOhEf4s+f/Jz849BWW9EyyoeQjKzGiLhIGUpEmzFyMzLpyjaPeqBM7UHg4Gyc8RGnLnTUuYVexLUINl3ZYKyfbaXDyjVypBkvIseY05zbT+yJnAppDCefSh/wvvGxqC6xNBy9pnFEI6aXctRblKSZnq3TffCUb/80vwsIB3Mt7eOX3/4xo8CSdfoCp13Be5lNIyh091GfqfPf378c2QjpVP1JLnA0T50gnwx01Hr4qUI47KYkufBvkJoTmc1gtKjhB0k0cNlm0BNYIjLHoQpm6KXPgzIvsO/MwV1RuZPPAVZjIoYIGcco6o5SlbiRFEYDv+O7hH7Dv9Ku8e+O7Wdd/A4OnY1zsCIRMfKQ0WeSwRLM1NhYHWFzsxdewaWABT0+O4+lSwuTpDNioxXryBqn6N2rsabVzuLZkYNIm0OITloln2s4h4/JehWgBCc9HDScjyYQTiesapzMFtY/TAcILUNoj9hUzlVnm3f5W1v7b30AsXETlyVd48b4/wQ0N4ZU8Yptg25yxyChmtjrByMw5qjMzzI5OU5utMTs9wvDUOWZDi7SlJG6WyblwfgAq6a9zUmBJWbOag5JdShIhm7Q3TkCETbqDncPEFiU1IxNDjDaOcv3lH+TeG3+fSzbdztFzL+NkgzgC6bpQrpOwXiOwjjiuEscV/MBxJDrNH7/4p3zl4H9noO8s6/oDrIwxIkphdAITxywsdPPpOz5KWXmMmYj/eNeHuKzYR1gPk5AxjZ8zVq+5IXoy4rQ126nJ4OJaNHdt3A1z5mi3ZQKb8bpoQUJcGho43AU5JFpmIgmTrLFIm8ymEdpLmLGsw+gG1YZg6Qc/woKfeg+uo5OZ7z3Ca3/y13iNKp6vcGGc1qwVLnLQKbnyIzfhuiR+GONhMCLCt4bA89j3zGFGd88iPJ3Wvy0ag0CBk2jn0MTNZvksWmnWw9L7NmkThXEmTXk7pHSEzPDky5/lhqt/mSsuey/7j/yYR17+a1wwg43n8babfpWu4iKe3vkFBodfQeoGnhSY2BBID1tUPH7mUV4feZVPXvVBQl0Hk1Q5hQAbGa5ev5n5nZ381tf+jGkR8lf3vI/bN27ipWefQGsPKWWOwFNcIKnTkor2ED99ZuveHAqUCUBrRr24gCKxaSyao4lzOXaQzPuHhBEySomMlAJZwBrDmG/Y+MmPsvDuuwllxPQD32f/n3+WrihOUK2NKJnWJU3iK1hwZc3FH3orpqPOYhSllASmxjgDFJkdO8fgC2fwvWKanUzqELFM+Ziky41dboFYhWiVN13a7GptEvolIBeNkBFeoDhzdhf7Tv6Ynv5VPL3/fmYapyiWulCeZGLqDCvnX8nt13yaA4ce5Ln9X2Fi9jidxWQEnXWSQqHMWTvKHz39Z5R9D99X6UIbwnqVTqUQNmQmqjAVh9TqDTqDQrLxwqXg6zRiScPxpJhkc1vkmsUlkbWqZRNCLzA6mjnWsBUF5Ey/zZgFBLmL52IQmXcsbJMSxhmHCwXOGJSx4CSTBc22j32MrjtuQBAz+flvc+BLX6HsB1hPQxwilZekZpxDKo2REqskU7VZVMHyzA9346oVGmGVDVfOo3PtEkxkUF6AwqIFzUlZImUVyQQ0IVdK3D8nDAI/dYySZ7QpmlY6m/IZ+KlgGFAmSc86hwoUSvtgBaGt8egzn2X/vqe4estH2Lb6naxccjEv7vsa+08+QV1WKPo+MRUUBjyYNRVQjkZYIQgN79twHXdtv555XQX++4d/GUyNhfPLfO7lx9ASDBHSU6AsUtpkT/LpOmtTms8U9yvseaQ+TdrmjOhdzGFxyzSAbY4FbqcTyXcAu4wIQOakKC9WJrmh2HkUrMCEVeqdPaz/6U9Suuk6/EbImX/8Cge/9i1UWKNqEryAZ6KEJAJAKnqKPsaTyCDA1z4FNI9/6RniQ+NUwhkW/+GddK7vQMlkqqnN7PqcjGW78Wslq5A5rHyzaUI0BT0v6RaDECW0H2CNR2wUBd8D20AWHENTe/jW0/+RLctv5fqtH+L9N/4Hjgw+zZO7H+DQyIsof4aiKoNwNITDViPWlZfzwcvezq3rL+bs7HH+cc8jLBzop6es+OzOH/D0qUHKHT3UpsYIZxs4o1EusdPZTHHZJLo+n7v5jfW9a5sHhWjleXUT8dvm6P3zHqdoYyYXSdlTxtRNnXBBL9t+/lPIS7cipyc59NdfZOSHj9G/cRVdl24nDiNEHBGH9YR9U/soGzL5zLMwPYVykoxiqFwsIXoMgREoLyWAchbjDCLlBXIXYL5otj9LkVSrbcahn8JfUtaSZApK+uxWpsMfFZIyxVKAVpKVS69icmo3tdowQRAgnMAveFgke05+j6Hx3Vy57j1cve4dfHTHZp56/X5eGPwuk/EQPoYFciG3bbmDO9ZeT0kavvzSN/jGwYc5W51C+iCFpSQ8ih3zmJydpc+DW7avQGiBX+5Aa42f8vnILCJoHlCZZ8S7wEFonxqUg3wlNLhN0gfROjTugjLUIoXIqEkzegiJwBcCYwx2YAEbf+kX0Fs3EgwOc+RvP8fozhco4mDJYhZ88kOEsSXwNFGa6TYW5k2P88Ke3YSjw/hRkchB2YEzjshZIpdM0s7YPy0Ok/IVN8ei53ALLh2onHHmOumSgdE542hdSqnmFIoAJZNWcIsg8H1OnX6JwQVb2LruFhb1rmL33q9zYvAptB8mmsFZisUOxsIhvv3Sn7Dv8FPctuVD3LnlQ1yy4mJ+tOefKISO9170XtbNX8vrwy/z9d2fZ8/oS9hCEb+7E+0aKKmwcczk2HGu27SEX7n9RrauLnH8wBA7D56ls1hES4lWCq1V6rjZ7OZTRzat0tqMHyCn2chxA4l2bdnMA4g5p9ud5xPmBw8nb5DWYlTKv6ck9UZMYfMaCr2gTw+z77/+ObUDR+grlqhEFUxkmJ2aIZ4YZ3b/IQqRgO4O1MUbqDYaSJGCSVTC6m1ElDBkOoFzGqfBEuWGH7e7OxntazJJO7HrUimESnwSKxNa+KSoYojSQZMizWgKiiipsXGVkic5d24XD3x/H9vXvYtLN9zF2677LU4MPsNLu7/MWOUgqihAagKn0B2SYzMv8vmndzO4/t28dfPd/OKO38Bzlpn6KJ/d+Vc8dugHVP0p/K5uZBQjXYiILbP1SZZ3aH7xjqt4780bCRuz/P03n+eLO48wKTX9fhmJIJAiGd/XFvAnOQxHEspmpN1ZLeC8PJBrRwhp6VrSkU/55jn+MiSJyBbXuSTXG8c4leDsMi4A64M9Nsir/+0vKQwNU+7tIgrrWM9DOgjKAfLgCK9/5s8I6oJg0wq2X3IfylMITyC1amqhON1eg0m94SSP7ohRWZ9K1geXqn8nk3FpIs39eb5OPOcUcSysl0wfdzGRNPhpLrRTdlNyfVTiUTzVgbGGUuCITZXX9n+F4bN7uPLid7Fl7Q6W9W/ixde+xsHBRwjFNIH2kSbGL2mcMzx45IscHHqFO7a+ByEifvjqA5yoHkR0e0jRCcailaDaCOmO63xww1J+7sYrWLaokx+9fIC/f3wXe89NUO7uo8fTKCXp8CVBWMdTdRb2BLksbJxEM028RhKe51nbslqAda0SvmhqANdyAudOnbbZbKCUSsS4FiOItRFYj6Bh8bXAFGJs1aL3TaOkoWfBQibPnkPWGhS1QpMAJx0+XqFIsacbPR3iF7zUEUlZNpo97C5HZ5AOQWzSjid2PUvry1yoTKpBNDoVkgbIYtJ3kBJTC5k4tIWij+80o9M1eovLuOWKj/HSwR9wYux1ZFDGR6Ocj1eOGa2+zkOPH+Xo0p1ctvGD3Hbpv+ai+Tt44fD9HJrYjSxYCk4T2xiv5HO0sY8/3/l7CJcM4fLLxQSnLyWhi/Bma1y9ZCG/dO3lXLNmPidGB/mNrzzE94+cRvgBvT0DeCKggCZwDWxllk3Le3nnLVtZM08QTkzgLy0TdPmEGGLrY23YEoQUEdRiCE2QW2IOMkg7bDoAeU5lyZ3fSyaavEAGbJxMALGGkZ0vsPrSS6guKTJ1ehbV3cWaD/800xc9x+Hv/IDZobP4nsKUJJ4UCKFQSqZ4UosWCdetS1nGbI7YmWz4Ub6UmTp2SJdApIiT8qtKNIiWybgEiUN5mjBUVMIZSn4PNszIkyLOjBxi29rtVGo+JyYqLPCXc9O2T3L83PPsPvoEY41BZEEjcXSjiFTEwTM/5uS5vVy19l1cs+5tbFp2Hy8dfJDHDjzAWHyKgp8ATgta4nSchqQSTIySkrBWZZHQfPj6t/HBq7ehRY2/f+Z5Pvfys5xrGLoKXZS0QJMOqQirdOqIO65dzV3XrUQ3RqmNjVPuLWJK83hl3zlCV0xrGklYa3Ocyc69QbUwpfbT7WOhWi61bcsapP1mqbAICzqOicIQ3w+YfOxJdo+Ps+x999K7aQtTI4bThyfoX38l2359M+cef4zBRx9HN8KEI1cm0CihBVKDkwlo07kY2+ptyVp+E79AZmzJaUinEgJiKVKSWKWQXrpoIikJK+0IXYwpTPK+j17F6PGYR+7fQ6C7Ub7lhd3f59TpIa7YcCurBzYxPuM4UTGsXHQzywa28Orhxzhw5lkiMYnyAtAOqbuIo2me2P05Tg2/yM1b7uG2ze/hkvmX8/29n+Ols08Sqhq+8hLoOQYhHdUwpGA9bl1yEb9w3a1sW76AJw/v4i+feZCXBo/T2dFBd6fEix1aFDDWEMzO8pZN3dxz/QpW92lqZ05gCzGdS5ZwaCzmi3/5BDv3TyGCfhpxmEwNS4cd5LO7bbG/a2kE10oF5+jFmUsVnzG5tiZoWZXEybIRIoyl1FEg3L+Xo//lM/Reew3z73gHxf4ljI9WkR0lltx1D31bNjJx9hxR7PC1QgQewlOgU/BYxrjVJJlqTfSyOIQClfIAZyZASpeaAIuJI2IT47kQhE34gy1svWY+t75rGxvXz+PLf7sHKyIQMcbGeAXD6dGdjE0c5tKVN7Jl/duJGr2cPTdLSc3n8rXvY9PCLew8+ENOTA/iF8ME3OGFmN6Iwcn9fOmpP2bv4qe5fd29/PwV/4Fdg0/x3QNf5sjMXlQpyUSG0yGbelbzgQ3X845NlzLEGL/9va/y6OsvMCkNfX19KCEJVJGiNNRr06zsL/OBa7Zww9oudGWS6VNjdCzuZUJJHnjwKA+9NMxEHXSxn3oYExpJZE0SGaUjeUR+jM+c/I1I/TqtpMrFfq5VU85NVbIZpi3jn3cgjEGKBlY4qAm8QgEdWyYfe4qRg4dZ/a67WH3dDYzMwumhKTpXbqJrw0ZCY5BRnUq1So+KcMZiTQzCpDN6FCIdgyadwGmBkAnrt7IBGpWMrhUiGQSVchGGNh2aGIXUwwpVG9O1GN7/q5cTyTrD8XgaNUhwIVhNHDv8Ajg7ywuHHubE4EGu2nwHy5dewfiIY2i0QX/nFm6/fBXHj7/IzhMPM+3G0UEC7VK+JDINnjj1A14/+yp3rb6Ht666lU2d6/jh8W/y0NFv4RnLB9a/m7vW3MxAl+Ib+x7iC6/9gLP1CboKBTp9hRASXyhcJUJJwwd3XM7bLllKnznL7NBpunqKdKxaxWMHz/DVR1/nxAQYv4jRgmojpmEsoQNnFc6pZg7E5ssHrn0wWHaetTWmWVUSKWN3C0UsmizVNDFzNgWByAT0YWKIBTZM8PaFcoFgYpTDf/c5xnftYu1776K0fDnnZiqo2RivU1Pu72XJpVs59fijdIddSJ0MZ5QinVEkLZ6zeNhk4IJM6NwTLZAUbIQSKC+Z4mWIibUhdDGlwLJkzTIqrk5DWRq1ITqKnfTIhUyfPpACKBKNY10EsURYie8ppsITPPjc37F22atcu/Ed9BcWMjoO9RmfLUtvZs28jTx19EH2j70M2qF0kpHs0YpqfI4v7f5TXjv1FO/bdC8f2fYhrlhwMSURsWXhOvYPv86fvvhPPHPuRQqFTroLPUgdU6SMjj10XGfzknm87y1XsGl+iamzh5lUMf2r1nImnOGLD7zMc6+P4IIOhCdohDGhi4ksREIQZ1PY8hMdxD+f00swKdbmqk5zqEREUu5N5gjI1mAFZ1PESpwkT9LagW8MrhDQWQioPv8Crxw7wvK338Tym66jtqCHsakaE55i9S9+jIEtKxjc9SqiERNgUb4ATyB8iYdpEj1YlSKThEkmA0gHKtkArSQ+krhRYWC54eM/ez2rLutgvDFCUXvMK/cydMjwT59/kNeePIfvF7GhbZoz4xzCRYSugRISr1xi36lnGD53iKs33sLG+dcQVUocH5mhr7CId238GbaPPs9jx77NqdppAr9EwYT4ylHvL/Da1B5OvHCct6+9hXvX34UowJf33c+3D/yAmcYEXeV+hFRILSiJAFuLmFf0efc113DjtrWEtXGGjp1j0dKF2G7D93e/zvef3MtQNSbu7CCMLWEMDZvce5wiiOPMAZxbCxDtWdsWaUQOFHqh7uBmgij1DZJOY5N+IRFWJNy/Wd8gYcJUbdN+AWfxAh9vcpJTX/gao088zYp3387ya69i3DhOT82w4Lpr2HLlNkTZo9BoYKXB6wwQZQ9PJF28ni+JtcDFFusiLDVwMUJYlKfRniTGcdU163nbHZfQMyCYqJylu1yiUB3gR5/fx/e/9iq1UZ8CBeIoQhhSB01iXZxMGHMJrgBbwy/4TLtJvvfa/ezr2MVb1t3BqoVbGJ4IOTFaY3n5cj5x6RpePvMoT516krr1Kegi2AkKHQpjDN868A0ODR8Apdl/bg+6pJhX7gNrkFpjIw9hBbes3czdF22j34sZPXyCzq4CK1eu5vWzp/jaN57l9XOjyKADEdSoxxXCOOFjCEWEtQkvoEFgmtBvl0QBLs2EXiCZly8V6n8WYpJm22SK/XMZcbBrjo6EZAQvsl7HeDrJpbsIFdVxWlMMitiTZ3jtz/+WhS8+x8b330u4bBHj0xMoFdMVzdLvWRasWsShc69Rkl6i5l2Udle4NES0WBJ/wVhDtTaN9hSzVBlY040xDer1mJXl9RzbN87f/PWjHHllBE90EShFWKtjY4GLHZgEFoYVJPS52RkyCd08AX6gOFE/wFdePMtliy/nxnW34vx+zkw18GWJK/vfxfquTfz4yIMcmjlMwetGqAaRrBOUethbPQzWUO7qTD5TWqQqYmZhY2c/91x+NRvmL6I2OcSkq7Fw8QqmA8PfPLyTp/ftY0rGUPIJowqhMdRsgLUxsZVE+EnJyjmscLlu4Dl9wO7NbYDq6u6778LkUK3igU2p1dsnbOU5hbLQIskRiNzAqGQKskFKR0FLpg8fZ3Dny3RIwcp1yykWPRqVGQwx26/aQn9PgZGhE2y5ai2lMrz20G7i6RBDg61XLWfZqj6ee2Y3lelZ3v+pHay6bB6zdhoX15lX6CaodvPQV1/nS3/xFCOnYnyvTFyPMWECz7LJkUnspc2yGyk1fprptCLGyKSdTUmB1IaTE0c4dHovPYFi7bxFSONxbqZOtz+PK5dtZ1Gpl7GpMSphHaVVMudAagqyQOB8PO1jI0Ufvdxz0Q18+Iqb6abI8NgoXaUC/QN9PHvqKH/+ox/wwolBbNGjISJqcY26ddQdxM4SOkeUAkujHI9jMuLWNXma28fmtWMHpWx5h28oACLfQy5FDiWcpovTYkOzBuNaDYk2XVAAZ0wTa2+NIfAD/KjB2df2MnnsKGvn97B8xTxqcZ2ZxgRrti1n9dYlFDsaBDJiz493I+oaI2Iuunop81cUiUydG965nZUXDzBpR+kueMz3enj92SG++OfP8MLjZ5CmiLaSsNpIu4QsJkrl0TmycQeifaBhS3WKxMzgYoQzCV8PdV4b3cvI1EnW9g+wcmARU9WYiaplff86rl2yFWFgeGSYSEkKXpEAjQW8UHLdou184vK7uHj+OkYnZmjIBiuW9THemOIfn32E7+1+hSkXQ0lTMbWkYwpDaBNa/diZZNZy5phnDOVz0QA5pLBz58PA8n2CqrO797434pCRUqJ1QteezNaxLajx+VWGVu45qy/YdHyMS/ACMmMXV1DwJPXhYQ7tfB6mJti8bgk9vT5nKyO4ssN5VXzpOPjiAWaGprEyZtsNq+la7NO9qAdXEkxHYywszqN+UvLl//4U3/3CK9RGBdJ5xDWDqUbEoUkag1vWJCHHbtbV80MXXVMgsnFsNHs7DUiD8izn6mMcOHMAHU+zdekyOoMyw8OzxLHHRUs2s75vFaPjE4zWJxEoVojFfGTbu7l59XWImmR4apz5A1309RT5we5n+dvnH+Lo9DCuoKkS0TA1QmJCFxHZmDhFA8XOplRwrdq+de24hzYnfg5KwOXT65mvuHjZapc/+dlIdeYMIpJKEUdpP7yQbWXXJsA8qyunvAEia1yXEqE0aIVQCulrKHjIgsJ5UHENupf3cPU7d7D6hvVMqimmqtN06JCBquPFbzxFsexz47uvoK7HoRExr9hJSXi8+vBBvvcPrzA9ElLyAmw9mTtoohAiMEmjHViBtTaBWzuRTjbNRuGotJNOtoZj4iFQSKeTf/ESIiwX4MsSoIljwypvJXdvuIMVPVsZmXHUKxGLOkt0lCs8fPhHRFGDt264CVvXzNQmmNctWbzIZ9/0Qe5/9kEOj52BToGlSt3ViAhx1mCcISbCiLT0naJ/jLPNdXZ5+vdsnxxvSghxHq7jQgLQtB8ymT2fefpxHDcFQMztOhaiCScTUqYDHFXyc5VWrpREKp2ANHyJ9BXCU4hygLOGWjzDmmuWc90Hr6Fn7TxGK6MEqs68QglrYqLGNGXtsSgoM3l4mu9/5XlefeY4AZ0IVyOqWIgEcZRstDPgYotLBhwnz2byc4vSBxNec8yKcPmpo8kMYolCCo20GqRGC4/AFhJBMA7Z0Fw2/zJuW30bfd5Szk3UcdqwfF4JZ0KGxiaRUYNVS7uZFWd4cN/DPHniVeLAIHRMI25gRUhESEyDWCQCYIVJ5v9k/knTsObVfAvgko30u9DGzx0Y+YYCkEGMpUy6X2IT44w9f/iAOJ94KO1cI2uwIW0oEWnHsEsFQUqBUALhJbTzQktUoPALAbNRBdUXc82dl3HNOy4l7Ag5WxnBI2ZVRyelyYAff30nLzx2gMaEwkNg6nVc3RFFNhnokA70wKa23tpmT7vMhlnOqTk2mU+czJEqJXwHKh1Hh1AIVFKowU/m/RAglI9rSBbZ+Vy38hpu2ngLtbrH6PgMwsbM6yzQ0xvy7JGn+N6+RxlilGIQYG2dhqgQY4hFREyEJUpa1bDp5tMccHlBPy2v0UWrBex/TQPM5ZBXCqUVcRRf4JdEbhDB3FZ02YZGbbY4SZFogWYRJxECqwVoifIUUoPyFNr3iLWlJmssWtfH2z+4gzWX9aMxHHv2DN/7/BOcPTZFQXYgI0FcryVo5EglGPo4QQm5ODc2xbq2wRYX5M10OfS8y0xfgnZSqMRUiKTzWOEhXIIi9q2HlAqlCvimhKj5rO9eyV3b7mR55zq0tpxuHOEbL36Lfef2Y8oRsY7ARBgXJ2qeCCNjDHG62SYLsNMci2kf7O0usP459o+2vg7XPi52riYQi5etdlkzaGbztacxsWkBCJ3jjRJGbcQDUnD+2Wr14iX+AE3aOacS4ZBaIpRCexLlgfAlqhAQWUtdTHL92y9CCcFT392FH3ck2ISwkfQTxAJr0pPfdPASKFlGhtCsgVv3xrBJRzvOXjiEU7QmJ2TUWCr1DWT6tUah8IWHFAWkKkAExWqJt66/Hq+oeWj3g9RUHelJYlchpo7BEKUbbrFYabDECcJZpnTvmBTdlBZv8mNx28bwuX8BivPCs4NTARA4Z5Epv4+J4/YBs3nf8s1kYA4zdTusQLQcxSbtfGIKkGCVTnLrngVlkF4yTNo5yUy9hgA6Ah8ZW2ycjJtPKAUV1gicTbWVTZ4lO/XO0ex7nJMWe1NnKckQpKQOKVFmRpuvEpYhpBBYPLRVeE6jScbFa6GRTlCNEshXyfexEiIXY4mJREgsLM5FOGKcMGkJO83kZzBv1yR6Izf9+TwhbkNx5Q6rm5MIanZ6t3UGZZBwmQw8isIoBWHIHPZOtLUcv5EmEO7CTWpOZA6WTDVFEoaJDL6kQLsQjEyKSlpjpMHJpJOmQ2qEgLgSIjLqFZNKnDFJvikDQdrk9GDzM47+hZWR/KydDIkkRJNpI2u6tC5rNJWIhJSGUHqELkIJSZh6DdpzOA+mkh5kRHrGHSbpFRTJ1LFWsG7b5jSJpmcFFzp555nnN8n6vdGeaZvaBU97RHHcPMV5ToAWovSfzSyef4MyB05sg58lY82RAmcSvmAhU1Bn2rxomjNpc66aFc1x6MmatebjZQOwmt20ItfTJFzrUvkTgTuPPiU/PUmkPfEOixBJ6dxgEmCMAGmzJFkIIiJGolBEQiJsy47TLNWk2VEpmp59Mro+TsPS1ml27s3bu+QFPHt3AeFwb7JpWqRw4zCOcgwT//IO4SbH0AXucu6Mmgx04nLMtS4Fm9hM0KRLToWgOdtXkCMuz7RILt3c7IS1rq2/oRmqzkHBzOmh+RfTqbgc6Y1L0582nWommvALm96GaZvcnjCk2BYpZ/rM2d+ujQailWV5Q23bxgjSOmQiD+bNCdIFHUdAK6WSPLJrnYi5XeItE3ChXpP/JWKaNHUpmhhDYV1r4rFLEjb57p28g5N8ZjqxNLtWyqwh7NzuIJFhTFPCKprj8M4jvju/vNEGSW02zqSj45JSedZRITApmCWPwz2ffDM3U7nF2dHW38e/YI77XK7GtvsVYk4f+JuffgfoOI6bjpslsz3iTbglXZvTcaH3urZT88bmQViXOlcuxx9k081PTQ5z1KClbeKFdeerdifyfQytcLT9JIg2eoNcY21bxVS6VsCdcf61fMkWC5rLXTObJnp+YTXXgi9cfrHe3Iyex/bWnPF7nmN3wTnBb2IK9AUyPOfzP2SUI0Jc0AfIeIaaXWa48683Z/ikyNHPiUwryJw3K1q2O2tHz1coxdxBV+kfm1sie4FbyDdKOvHmJAvk+m3bMy85FrUUyZwfs+cyIW5zkLPCjc2ZwbakSdKg8s9ogwtSALan9/PfOm9i2FzKeC2laDpSIgvzXL5w0DLA+aig2SLepvZEi6KOuXZ4briQljJdhjVoCVKr9y3njOV7/nIaSOavL1Keozmqvo39jDQtLNpJFOZSqOY1T9M/yVmrpoaRonm2xRy8RBtDvxNzAPaiydaVcTC84Um+QH93ZprOI3bJpeYvdOLnYkO0M7b9sLaFcu6NbZJs9Z4J8SaOozu/b9XlSsfkHcXzMOzn22vbhnBt5b5tvsI19zjkuLObyaG5zGhztEOWMWxS3Yn2Vqumk8Zc0r6c15pFTym/TytP4toZvtxch/qNiXrPB3qIC67XPxcFtDqDsuf+Z5yGttOPa7N5bUjTOQmjN3NCLjCw9ILJivOeNxeqnsd/7Nx5/estmrR/JlZ2Lj8fvc3INCnW5rTOzXXHRK5WP1cm8jWouSf+X+RCiwv5rO4Nu7bnYIPa8wlpZKSFyFmJuYiguWnD/EO3zRRizoQql4sq3iApIWgryoBoglnaqpM5gWpbMHFhYcqyfnaujc/4dOZS4qa0B02n74KgCnf++uTz65w/di+vTUWzJzMzs6lQSdHSXNl4V3fh1K4TpJnH5GdSJA06bVpjTpErfeMb76UA7Zwday6yc3Nsp5gjRYI30kBujog6l/TmN7lqLgxIadvB83znC5hBm/O8L+S1GdniwjtPAHLvt7SHlzJlFWvxY7vzBN7iLmiW5RzhSFMVTTNiXLtJypfQ2zx9R7PqcF5yRyQtXzZX/s2vrXsjs21plYsvkC3UHQW9+n85nB8H+vjf+hp/g+/3/b+8Tt//t4/zv+EZs0vMvdT4/8tne7Pf/f/Blvzk9X/C638H7/RPXj95/eT1k9dPXj95/eT1k9dPXv9/9vr/ALRI39aaP+kLAAAAAElFTkSuQmCC";

// Liefert ein <img> mit dem Neo-Logo (quadratischer Badge).
function neoLogo({ size = 46, radius = 13 } = {}) {
  return `<img src="${NEO_LOGO}" alt="Neo" width="${size}" height="${size}" ` +
    `style="width:${size}px;height:${size}px;border-radius:${radius}px;object-fit:cover;display:block;" />`;
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
  // Erweiterungen / Module
  "Module": "Modules",
  "Erweiterungen": "Extensions",
  "Für diese Karte sind noch keine Module aktiv. Über <b>➕ Modul hinzufügen</b> kommst du zum Store.":
    "No modules are active for this card yet. Use <b>➕ Add module</b> to open the store.",
  "<b>Karten</b> &amp; <b>Module</b> installieren (Store oder Code einfügen) — oder oben einen <b>Kartentyp</b> wählen, um Module für eine Karte zu aktivieren.":
    "Install <b>cards</b> &amp; <b>modules</b> (store or paste code) — or pick a <b>card type</b> above to enable modules for a card.",
  "Modul hinzufügen": "Add module",
  "Karte oder Modul installieren": "Install card or module",
  "Store": "Store",
  "Code einfügen": "Paste code",
  "Installiert": "Installed",
  // Store
  "⚠️ Für den Store wird die Integration <b>Neo Dashboard Tools</b> benötigt (serverseitiges Speichern + Laden).":
    "⚠️ The store needs the <b>Neo Dashboard Tools</b> integration (server-side save + load).",
  "Lade Store …": "Loading store …",
  "Store-Index konnte nicht geladen werden.": "Could not load the store index.",
  "Erneut": "Retry",
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
  "Hinzufügen": "Add",
  // Meldungen
  "Bitte Code einfügen.": "Please paste some code.",
  "Code konnte nicht geladen werden.": "Could not load the code.",
  "Kein Modul/Karte erkannt (registerModule/registerCard fehlt?).":
    "No module/card detected (missing registerModule/registerCard?).",
  "✓ Karte „{name}” hinzugefügt — oben im Kartentyp wählbar.":
    "✓ Card “{name}” added — selectable in the card type above.",
  "✓ Modul „{name}” hinzugefügt.": "✓ Module “{name}” added.",
  "Speichern fehlgeschlagen: {err}": "Saving failed: {err}",
  "Installiere …": "Installing …",
  "✓ „{name}” installiert.": "✓ “{name}” installed.",
  "Installation fehlgeschlagen: {err}": "Installation failed: {err}",
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
  "Unscharf": "Disarmed", "Zuhause": "Home", "Abwesend": "Away", "Alarm": "Alarm",
  "Scharf · Zuhause": "Armed · Home", "Scharf · Abwesend": "Armed · Away",
  "Scharf · Nacht": "Armed · Night", "Scharf · Urlaub": "Armed · Vacation",
  "Aktiviert …": "Arming …", "Eingang …": "Entry …", "ALARM": "ALARM",
  "Szene": "Scene", "Taster": "Button", "Skript": "Script", "Aktion": "Action",
  "an": "on",
  "Wert": "Value", "Kamera": "Camera", "Sensor": "Sensor", "Licht-Gruppe": "Light group",

  // ── Editor: Feld-Labels & Abschnitte (zentral in makeEditor übersetzt) ──
  "Allgemein": "General", "Darstellung": "Appearance",
  "Entität": "Entity", "Entität (Gerät)": "Entity (device)",
  "Name (optional)": "Name (optional)", "Untertitel (optional)": "Subtitle (optional)",
  "Icon": "Icon", "Icon (optional)": "Icon (optional)",
  "Akzentfarbe": "Accent color", "Akzentfarbe (optional)": "Accent color (optional)",
  "Einheit (optional)": "Unit (optional)", "Lichter": "Lights",
  "Code (optional, falls erforderlich)": "Code (optional, if required)",
  "Typ": "Type", "Titel (bei Trenner optional)": "Title (optional for divider)",
  "Layout / Gerät": "Layout / device",
  // Optionen
  "Blau": "Blue", "Amber": "Amber", "Mint": "Mint", "Violett": "Violet", "Rosé": "Rosé",
  "Automatisch (Bildschirmbreite)": "Automatic (screen width)",
  "Mobil (kompakt)": "Mobile (compact)", "Tablet": "Tablet", "Desktop (groß)": "Desktop (large)",
  "Überschrift": "Heading", "Trenner": "Divider",
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

function makeNeoEditor(schema, meta = {}) {
  return class extends HTMLElement {
    setConfig(config) {
      this._config = { ...config };
      if (this._form) this._form.data = this._config;
      else this._build();
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
      this._form.schema = neoTranslateSchema(this._hass, schema);
      this._form.data = this._config || {};
      if (this._hass) this._form.hass = this._hass;
      this._form.computeLabel = (s) => neoT(this._hass, s.label || s.name);
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
  _callService(domain, service, data = {}) { this._hass?.callService(domain, service, data); }
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

class NeoControlCard extends NeoBaseCard {
  getCardSize() { return this._domain() === "media_player" ? 3 : 2; }

  _domain() {
    if (Array.isArray(this._config?.entities) && this._config.entities.length) return "lightgroup";
    const id = this._config?.entity;
    return id ? id.split(".")[0] : "";
  }
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
        box-shadow:${active ? `0 18px 40px -16px ${glow}` : "0 18px 40px -16px var(--neo-shadow1)"};">
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
      border:1px solid ${active ? acc.c + "55" : "var(--neo-line2)"};">${text}</span>`;
  }
  _title(name, sub, extra) {
    return `<div style="font-size:16px;font-weight:600;">${name}</div>
      ${sub ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${sub}</div>` : ""}${extra || ""}`;
  }
  _slider(idAttr, acc, pct, label) {
    return `<div style="margin-top:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--neo-text3);">
        <span>${label}</span><span style="font-weight:600;">${pct}%</span></div>
      <input type="range" id="${idAttr}" min="1" max="100" value="${pct || 1}" style="
        width:100%;height:26px;border-radius:9px;-webkit-appearance:none;appearance:none;cursor:pointer;
        background:linear-gradient(90deg,${acc.c}cc 0%,${acc.c} ${pct}%,var(--neo-line2) ${pct}%);
        border:1px solid var(--neo-line1);" /></div>`;
  }
  _flatBtn(attr, val, label, acc, primary) {
    return `<button ${attr}="${val}" style="flex:1;height:42px;border-radius:12px;cursor:pointer;font-size:13px;font-weight:600;
      display:flex;align-items:center;justify-content:center;color:#fff;
      background:${primary ? acc.c : "var(--neo-fill2,rgba(255,255,255,.06))"};
      border:1px solid ${primary ? "transparent" : "var(--neo-line2)"};">${label}</button>`;
  }
  _iconBtn(attr, val, sym, acc) {
    return `<button ${attr}="${val}" style="width:44px;height:44px;flex-shrink:0;border-radius:22px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;color:var(--neo-text1,#fff);
      background:var(--neo-fill2,rgba(255,255,255,.06));border:1px solid var(--neo-line2);">${neoIcon(sym, { size: 18, color: "currentColor" })}</button>`;
  }

  _icon(d, fb) { return this._config?.icon || DEFAULT_ICON[d] || fb || "dot"; }

  // ── Render-Dispatch ────────────────────────────────────────
  render() {
    const d = this._domain();
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
    const on = s?.state === "on";
    const acc = this._acc();
    const isLight = d === "light";
    let pct = 0;
    if (isLight && on) pct = s?.attributes?.brightness ? Math.round((s.attributes.brightness / 255) * 100) : 0;
    const sub = this._config?.sub ?? (on ? (isLight ? `${pct}%` : this._t("An")) : this._t("Aus"));
    const body = this._title(this._name(s, "Schalter"), sub, isLight && on ? this._slider("bri", acc, pct, this._t("Helligkeit")) : "");
    return this._shell(acc, on, this._toggleEl(acc, on), this._icon(d), body, isLight ? 180 : 160);
  }

  _renderLock() {
    const id = this._config?.entity;
    const s = this._state(id);
    const locked = s?.state === "locked";
    const acc = NEO_ACCENTS[this._config?.accent] || (locked ? NEO_ACCENTS.mint : NEO_ACCENTS.amber);
    const sub = this._config?.sub ?? (locked ? this._t("Verriegelt") : this._t("Entriegelt"));
    const right = this._badge(acc, true, locked ? "🔒" : "🔓");
    const body = this._title(this._name(s, "Schloss"), sub);
    return this._shell(acc, locked, right, this._config?.icon || (locked ? "lock" : "unlock"), body);
  }

  _renderFan() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const on = s?.state === "on";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint;
    const pct = typeof a.percentage === "number" ? a.percentage : (on ? 100 : 0);
    const sub = this._config?.sub ?? (on ? `${pct}%` : this._t("Aus"));
    const body = this._title(this._name(s, "Ventilator"), sub, on ? this._slider("pct", acc, pct, this._t("Stufe")) : "");
    return this._shell(acc, on, this._toggleEl(acc, on), this._icon("fan"), body, 180);
  }

  _renderCover() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const state = s?.state || "unavailable";
    const acc = this._acc();
    const pos = typeof a.current_position === "number" ? a.current_position : null;
    const active = state === "open" || state === "opening" || (pos != null && pos > 0);
    const right = this._badge(acc, false, pos != null ? `${pos}${this._t("% offen")}` : this._t(COVER_LABEL[state] || state));
    const row = `<div style="display:flex;gap:8px;margin-top:10px;">
      ${this._iconBtnTxt("up", "▲", this._t("Öffnen"))}${this._iconBtnTxt("stop", "■", this._t("Stopp"))}${this._iconBtnTxt("down", "▼", this._t("Schließen"))}</div>`;
    return this._shell(acc, active, right, this._icon("cover"), this._title(this._name(s, "Rollladen"), "", row), 200);
  }
  _iconBtnTxt(val, glyph, title) {
    return `<button data-cover="${val}" title="${title}" style="flex:1;height:42px;border-radius:12px;cursor:pointer;font-size:16px;
      display:flex;align-items:center;justify-content:center;color:var(--neo-text1,#fff);
      background:var(--neo-fill2,rgba(255,255,255,.06));border:1px solid var(--neo-line2);">${glyph}</button>`;
  }

  _renderClimate() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const unit = this._hass?.config?.unit_system?.temperature || "°";
    const target = a.temperature;
    const action = a.hvac_action;
    const mode = s?.state || "off";
    const actCol = action === "cooling" ? NEO_ACCENTS.blue.c : action === "heating" ? NEO_ACCENTS.amber.c : acc.c;
    const active = (action && action !== "idle" && action !== "off") || (!action && mode !== "off" && mode !== "unavailable");
    const accE = { c: actCol, glow: actCol + "55" };
    const badge = this._t(action ? ({ heating: "Heizt", cooling: "Kühlt", drying: "Entfeuchtet", fan: "Lüftet", idle: "Bereit", off: "Aus" }[action] || action)
      : ({ heat: "Heizen", cool: "Kühlen", auto: "Auto", heat_cool: "Auto", off: "Aus" }[mode] || mode));
    const cur = a.current_temperature;
    const row = `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px;">
        ${this._iconBtn("data-temp", "dec", "minus", accE)}
        <div style="display:flex;align-items:baseline;gap:2px;"><span style="font-size:32px;font-weight:500;letter-spacing:-1px;">${target != null ? target : "—"}</span><span style="font-size:15px;color:var(--neo-text2);">${unit}</span></div>
        ${this._iconBtn("data-temp", "inc", "plus", accE)}
      </div>${cur != null ? `<div style="font-size:12px;color:var(--neo-text3);margin-top:8px;text-align:center;">${this._t("Aktuell")} ${cur}${unit}</div>` : ""}`;
    return this._shell(accE, active, this._badge(accE, active, badge), this._icon("climate"), this._title(this._name(s, "Klima"), "", row), 200);
  }

  _renderMedia() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const state = s?.state || "unavailable";
    const playing = state === "playing";
    const active = playing || state === "paused" || state === "buffering";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.violet;
    const title = a.media_title || "";
    const artist = a.media_artist || a.app_name || "";
    const name = this._name(s, "Media");
    const line2 = title ? (artist || name) : this._t(MEDIA_LABEL[state] || state);
    const transport = `<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-top:12px;">
        ${this._iconBtn("data-media", "media_previous_track", "prev", acc)}
        ${this._iconBtn("data-media", "media_play_pause", playing ? "pause" : "play", acc)}
        ${this._iconBtn("data-media", "media_next_track", "next", acc)}</div>`;
    const body = `<div style="font-size:16px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title || name}</div>
      ${line2 ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${line2}</div>` : ""}${transport}`;
    return this._shell(acc, active, this._badge(acc, false, this._t(MEDIA_LABEL[state] || state)), this._icon("media_player"), body, 200);
  }

  _renderAlarm() {
    const id = this._config?.entity;
    const s = this._state(id);
    const state = s?.state || "unavailable";
    const meta = ALARM_STATES[state] || { label: state, accent: "blue", icon: "lock" };
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS[meta.accent] || NEO_ACCENTS.blue;
    const armed = state !== "disarmed" && state !== "unavailable";
    const controls = state === "disarmed"
      ? `${this._flatBtn("data-alarm", "alarm_arm_home", this._t("Zuhause"), acc)}${this._flatBtn("data-alarm", "alarm_arm_away", this._t("Abwesend"), acc)}`
      : `${this._flatBtn("data-alarm", "alarm_disarm", this._t("Unscharf"), acc, true)}`;
    const row = `<div style="display:flex;gap:8px;margin-top:10px;">${controls}</div>`;
    return this._shell(acc, armed, this._badge(acc, armed, this._t(meta.label)), this._config?.icon || meta.icon, this._title(this._name(s, "Alarm"), "", row), 190);
  }

  _renderAction(d) {
    const id = this._config?.entity;
    const s = this._state(id);
    const acc = this._acc();
    const sub = this._config?.sub ?? this._t(d === "scene" ? "Szene" : d === "button" ? "Taster" : "Skript");
    return this._shell(acc, false, "", this._icon(d), this._title(this._name(s, "Aktion"), sub), 160);
  }

  _renderLightGroup() {
    const ids = this._config.entities.filter(Boolean);
    let onCount = 0, briSum = 0, briN = 0;
    ids.forEach((id) => { const s = this._state(id); if (s?.state === "on") { onCount++; const b = s.attributes?.brightness; if (typeof b === "number") { briSum += b; briN++; } } });
    const bri = briN ? Math.round((briSum / briN / 255) * 100) : 0;
    const on = onCount > 0;
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const sub = this._config?.sub ?? `${onCount}/${ids.length} ${this._t("an")}`;
    const body = this._title(this._config?.name || this._t("Licht-Gruppe"), sub, on ? this._slider("bri", acc, bri, this._t("Helligkeit")) : "");
    return this._shell(acc, on, this._toggleEl(acc, on), this._config?.icon || "lightbulb", body);
  }

  // ── Events ────────────────────────────────────────────────
  _bindEvents() {
    const d = this._domain();
    const id = this._config?.entity;
    const sr = this.shadowRoot;

    sr.getElementById("toggle")?.addEventListener("click", (e) => { e.stopPropagation(); this._primaryToggle(d); });
    sr.getElementById("bri")?.addEventListener("change", (e) => {
      const ids = d === "lightgroup" ? this._config.entities.filter(Boolean) : id;
      if (ids) this._callService("light", "turn_on", { entity_id: ids, brightness_pct: +e.target.value });
    });
    sr.getElementById("pct")?.addEventListener("change", (e) => { if (id) this._callService("fan", "set_percentage", { entity_id: id, percentage: +e.target.value }); });
    sr.querySelectorAll("[data-cover]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("cover", { up: "open_cover", stop: "stop_cover", down: "close_cover" }[b.getAttribute("data-cover")], { entity_id: id }); }));
    sr.querySelectorAll("[data-temp]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); this._stepTemp(b.getAttribute("data-temp") === "inc" ? 1 : -1); }));
    sr.querySelectorAll("[data-media]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("media_player", b.getAttribute("data-media"), { entity_id: id }); }));
    sr.querySelectorAll("[data-alarm]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); this._alarm(b.getAttribute("data-alarm")); }));

    sr.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (d === "scene") this._callService("scene", "turn_on", { entity_id: id });
      else if (d === "button") this._callService("button", "press", { entity_id: id });
      else if (d === "script") id?.startsWith("script.") ? this._callService("script", "turn_on", { entity_id: id }) : this._callService("script", id, {});
      else if (d === "lightgroup") this._primaryToggle(d);
      else if (id) this._modCtx().moreInfo(id);
    });
  }

  _primaryToggle(d) {
    const id = this._config?.entity;
    if (d === "lightgroup") {
      const ids = this._config.entities.filter(Boolean);
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

// ── Editor: bewusst minimal (Laien-tauglich) — Entität wählen, fertig. ──
customElements.define("neo-control-card-editor", makeNeoEditor([
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entity", label: "Entität (Gerät)", selector: { entity: {} } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
    ],
  },
  {
    type: "expandable", title: "Darstellung", icon: "mdi:palette",
    schema: [
      { name: "icon", label: "Icon (optional)", selector: { icon: {} } },
      { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
      NEO_LAYOUT_FIELD,
    ],
  },
], { name: "Neo Steuerung", description: "Eine Karte für alle Geräte — passt sich an", icon: "🎛️" }));

NeoDashboardRegistry.registerCard("neo-control-card", NeoControlCard, {
  name: "Neo Steuerung",
  description: "Eine Karte für alle Geräte — passt sich automatisch an die Entität an",
});

// Neo Dashboard Kit — Display Card ("Neo Anzeige")
// EINE universelle Anzeige-Karte: erkennt die Domain und zeigt Sensorwert,
// Kamera-Snapshot oder Status. Reine Darstellung; Tap → More-Info.

class NeoDisplayCard extends NeoBaseCard {
  getCardSize() { return this._domain() === "camera" ? 3 : 2; }

  _domain() {
    const id = this._config?.entity;
    return id ? id.split(".")[0] : "";
  }
  _acc() { return NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint; }

  render() {
    return this._domain() === "camera" ? this._renderCamera() : this._renderSensor();
  }

  _renderSensor() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const value = s?.state ?? "—";
    const unit = this._config?.unit ?? a.unit_of_measurement ?? "";
    const name = this._config?.name || a.friendly_name || id || this._t("Wert");
    const icon = this._config?.icon || "thermo";
    const acc = this._acc();
    const sub = this._config?.sub || "";
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
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
          ${sub ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${sub}</div>` : ""}
        </div>
      </div>`;
  }

  _renderCamera() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    const name = this._config?.name || a.friendly_name || id || this._t("Kamera");
    const icon = this._config?.icon || "camera";
    const pic = a.entity_picture;
    const image = pic
      ? `<img src="${pic}" alt="${name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />`
      : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
           background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);">${neoIcon(icon, { size: 40, color: acc.c })}</div>`;
    return `
      <div class="neo-card" id="card" role="button" style="
        position:relative;overflow:hidden;min-height:190px;display:flex;cursor:pointer;
        border:1px solid var(--neo-line2);box-shadow:0 18px 40px -16px var(--neo-shadow1);">
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
    this.shadowRoot.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (id) this._modCtx().moreInfo(id);
    });
  }

  static getConfigElement() { return document.createElement("neo-display-card-editor"); }
  static getStubConfig() { return {}; }
}

customElements.define("neo-display-card-editor", makeNeoEditor([
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entity", label: "Entität", selector: { entity: { domain: ["sensor", "binary_sensor", "input_number", "number", "camera"] } } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
    ],
  },
  {
    type: "expandable", title: "Darstellung", icon: "mdi:palette",
    schema: [
      { name: "icon", label: "Icon", selector: { icon: {} } },
      { name: "unit", label: "Einheit (optional)", selector: { text: {} } },
      { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
      NEO_LAYOUT_FIELD,
    ],
  },
], { name: "Neo Anzeige", description: "Sensor · Kamera · Status", icon: "📊" }));

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

    if (variant === "divider") {
      const lbl = title
        ? `<span style="font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--neo-text3);">${title}</span>
           <div style="flex:1;height:1px;background:var(--neo-line2);"></div>`
        : "";
      return `<div style="display:flex;align-items:center;gap:12px;padding:8px 2px;">
        <div style="flex:1;height:1px;background:var(--neo-line2);"></div>${lbl}</div>`;
    }

    const subtitle = this._config?.subtitle || "";
    const icon = this._config?.icon;
    const lead = icon
      ? `<div style="width:34px;height:34px;border-radius:17px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
           background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 18, color: acc.c })}</div>`
      : `<div style="width:4px;height:28px;border-radius:2px;flex-shrink:0;background:${acc.c};"></div>`;

    return `
      <div style="display:flex;align-items:center;gap:12px;padding:8px 4px;">
        ${lead}
        <div style="min-width:0;">
          <div style="font-size:18px;font-weight:700;letter-spacing:-.2px;color:var(--neo-text1);
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title}</div>
          ${subtitle ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:1px;">${subtitle}</div>` : ""}
        </div>
      </div>`;
  }

  static getConfigElement() { return document.createElement("neo-header-card-editor"); }
  static getStubConfig() { return { variant: "header", title: "Überschrift" }; }
}

// ── Editor: geteiltes Sektions-Muster (Inhalt/Darstellung) ──
customElements.define("neo-header-card-editor", makeNeoEditor([
  { name: "variant", label: "Typ", selector: { select: { mode: "dropdown", options: [
    { value: "header", label: "Überschrift" },
    { value: "divider", label: "Trenner" },
  ] } } },
  {
    type: "expandable", title: "Inhalt", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "title", label: "Titel (bei Trenner optional)", selector: { text: {} } },
      { name: "subtitle", label: "Untertitel (optional)", selector: { text: {} } },
    ],
  },
  {
    type: "expandable", title: "Darstellung", icon: "mdi:palette",
    schema: [
      { name: "icon", label: "Icon (optional)", selector: { icon: {} } },
      { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
    ],
  },
], { name: "Neo Header", description: "Überschrift / Trenner", icon: "🔖" }));

NeoDashboardRegistry.registerCard("neo-header-card", NeoHeaderCard, {
  name: "Neo Header",
  description: "Überschrift / Trenner zum Strukturieren",
});

// Neo Module — Status-Badge
// Beispiel für ein DECORATE-Modul, gebunden an die Steuerungs-Karte.
// Zeigt eine kleine Eck-Badge mit dem Status/Wert einer Entität.

NeoModules.register({
  id: "neo-badge",
  name: "Status-Badge",
  description: "Kleine Eck-Badge mit dem Wert/Status einer Entität.",
  icon: "🏷️",
  target: "neo-control-card",
  version: "1.0.0",
  author: "Neo",
  config: [
    { name: "badge_entity", label: "Entität", selector: { entity: {} } },
    { name: "badge_color", label: "Farbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
  ],
  decorate(root, ctx) {
    const ent = ctx.settings?.badge_entity;
    if (!ent) return;
    const stObj = ctx.hass?.states?.[ent];
    if (!stObj) return;
    const acc = NEO_ACCENTS[ctx.settings?.badge_color] || NEO_ACCENTS.rose;
    const card = root.getElementById("card") || root.querySelector(".neo-card");
    if (!card) return;
    const badge = document.createElement("div");
    badge.textContent = stObj.state;
    badge.style.cssText =
      `position:absolute;top:12px;right:12px;z-index:3;min-width:18px;height:18px;padding:0 6px;` +
      `display:flex;align-items:center;justify-content:center;border-radius:9px;` +
      `font-size:11px;font-weight:700;color:#fff;background:${acc.c};box-shadow:0 2px 8px ${acc.glow};`;
    card.appendChild(badge);
  },
});

// Neo Module — Akzent-Glow
// Beispiel für ein STYLE-Modul, gebunden an ALLE Karten (target "*").
// Legt einen sanft pulsierenden Leuchtrahmen über die Karte.

NeoModules.register({
  id: "neo-glow",
  name: "Akzent-Glow",
  description: "Sanft pulsierender Leuchtrahmen in der Akzentfarbe.",
  icon: "✨",
  target: "*",
  version: "1.0.0",
  author: "Neo",
  config: [],
  style() {
    return `
      .neo-card { animation: neoGlowPulse 2.6s ease-in-out infinite; }
      @keyframes neoGlowPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(124,156,255,0); }
        50%      { box-shadow: 0 0 24px 2px rgba(124,156,255,.40); }
      }`;
  },
});

// Neo Dashboard Kit — Module loader
// Loads pasted module code (script injection, deduped). Used by the
// neo-card wrapper at runtime and by its editor's "Modul einfügen" area.
// Returns { ok, modules, cards } where modules/cards are the manifests that
// registered while the pasted code ran — including updates of existing IDs.

function neoLoadModule(code) {
  if (!code || !code.trim()) return { ok: false, modules: [], cards: [] };
  window.__neoModules = window.__neoModules || new Set();

  const modules = [];
  const cards = [];
  const originalRegisterModule = window.NeoDashboard?.registerModule;
  const originalRegisterCard = window.NeoDashboard?.registerCard;

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

    const key = code.length + ":" + code.slice(0, 96);
    window.__neoModules.add(key);

    // Backward compatibility for the current editor: it already accepts
    // res.cards for updates. Expose touched modules there too so an existing
    // module update is never misreported as "no module/card detected".
    const editorCards = cards.length ? cards : modules.map((m) => ({ type: m.id, name: m.name || m.id, isModule: true }));

    // Live-Swap aller neo-card-Instanzen auf die (neue) Modul-Version – kein Reload nötig.
    window.dispatchEvent(new CustomEvent("neo-module-changed"));
    return { ok: true, modules, cards: editorCards };
  } catch (e) {
    console.error("[Neo Module] Fehler beim Laden:", e);
    return { ok: false, modules: [], cards: [] };
  } finally {
    if (window.NeoDashboard) {
      if (originalRegisterModule) window.NeoDashboard.registerModule = originalRegisterModule;
      if (originalRegisterCard) window.NeoDashboard.registerCard = originalRegisterCard;
    }
  }
}

// Neo Dashboard Kit — Module Store
// Talks to the "Neo Dashboard Tools" integration. Persists modules
// server-side (file-based) so the dashboard config stays clean.
// Falls back gracefully (available=false) when not installed.

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
    const res = await this._hass.connection.sendMessagePromise({ type: "neo_dashboard_tools/save", name, code });
    this._cache = this._cache.filter((m) => m.name !== name).concat([{ name, code }]);
    return res;
  },

  async delete(name) {
    const res = await this._hass.connection.sendMessagePromise({ type: "neo_dashboard_tools/delete", name });
    this._cache = this._cache.filter((m) => m.name !== name);
    NeoModules.unregister(name);
    NeoDashboardRegistry.unregisterCard?.(name);
    window.dispatchEvent(new CustomEvent("neo-module-changed"));
    return res;
  },

  // Server-side fetch of an https URL (Module Store) — avoids browser CORS.
  async fetch(url) {
    const res = await this._hass.connection.sendMessagePromise({ type: "neo_dashboard_tools/fetch", url });
    return res.content;
  },
};

window.NeoDashboard.store = NeoStore;

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

  // Re-render der Modul-Sektion, wenn (Store-)Module geladen/aktualisiert werden.
  connectedCallback() {
    this._onMods = () => { this._renderModulesSection(); };
    window.addEventListener("neo-module-changed", this._onMods);
    window.addEventListener("neo-modules-loaded", this._onMods);
  }
  disconnectedCallback() {
    window.removeEventListener("neo-module-changed", this._onMods);
    window.removeEventListener("neo-modules-loaded", this._onMods);
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
    const list = this._modPanel.querySelector(".nmod-list");
    if (list) {
      const byId = new Map(available.map((m) => [m.id, m]));
      const active = this._enabledList().map((e) => byId.get(e.id)).filter(Boolean);
      const inactive = available.filter((m) => !this._isModEnabled(m.id));
      active.forEach((mod, i) => this._renderModItem(list, mod, {
        active: true, reorder: active.length > 1, canUp: i > 0, canDown: i < active.length - 1,
      }));
      inactive.forEach((mod) => this._renderModItem(list, mod, { active: false }));
    }
    this._renderAddArea();
  }

  _renderModItem(list, mod, opts) {
    opts = opts || {};
    const on = !!opts.active;
    const item = document.createElement("div");
    item.className = "nmod-item";
    const badge = mod.author ? `<span class="nmod-badge">${mod.author}</span>` : "";
    const rm = this._isInstalled(mod.id)
      ? `<button class="nmod-rm" title="${this._t("Modul entfernen")}" data-rm="${mod.id}">${neoIcon("trash", { size: 15, color: "currentColor" })}</button>`
      : "";
    const move = opts.reorder
      ? `<div class="nmod-move">
           <button data-up title="${this._t("Layer nach oben")}" ${opts.canUp ? "" : "disabled"}>▲</button>
           <button data-down title="${this._t("Layer nach unten")}" ${opts.canDown ? "" : "disabled"}>▼</button>
         </div>`
      : "";
    item.innerHTML = `
      <div class="nmod-row">
        ${move}
        <span class="nmod-ic">${mod.icon || "🧩"}</span>
        <div class="nmod-meta">
          <div class="nmod-name">${mod.name || mod.id}${badge}</div>
          ${mod.description ? `<div class="nmod-desc">${mod.description}</div>` : ""}
        </div>
        ${rm}
        <label class="nmod-sw">
          <input type="checkbox" ${on ? "checked" : ""} />
          <span class="nmod-track"></span><span class="nmod-knob"></span>
        </label>
      </div>
      <div class="nmod-cfg"></div>`;
    list.appendChild(item);

    item.querySelector("input[type=checkbox]")
      .addEventListener("change", (e) => this._toggleModule(mod, e.target.checked));
    item.querySelector("[data-rm]")?.addEventListener("click", () => this._removeInstalled(mod.id));
    item.querySelector("[data-up]")?.addEventListener("click", () => this._moveModule(mod.id, -1));
    item.querySelector("[data-down]")?.addEventListener("click", () => this._moveModule(mod.id, 1));

    if (on && Array.isArray(mod.config) && mod.config.length) {
      const form = document.createElement("ha-form");
      form.schema = mod.config;
      form.data = this._modSettings(mod.id);
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
    if (on && idx < 0) list.push({ id: mod.id, settings: {} });
    else if (!on && idx >= 0) list.splice(idx, 1);
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
  _storeRow(o) {
    const status = o.installed
      ? (o.update
          ? ` <span class="nmod-badge upd">⬆ ${this._t("Update")} → v${o.update}</span>`
          : ` <span class="nmod-badge ok">${this._t("✓ Installiert")}</span>`)
      : "";
    return `<div class="nmod-store">
        <div class="nmod-store-h">
          <span class="nmod-ic">${o.icon || "🧩"}</span>
          <div class="nmod-meta">
            <div class="nmod-name">${o.name} <span class="nmod-badge">${this._t(o.kind)}</span>${status}</div>
            <div class="nmod-desc">${this._t("von")} ${o.author || "?"}${o.version ? " · v" + o.version : ""}</div>
          </div>
        </div>
        ${o.image ? `<img class="nmod-img" src="${o.image}" loading="lazy" />` : ""}
        ${o.description ? `<div class="nmod-desc" style="margin-top:6px;">${o.description}</div>` : ""}
        <div class="nmod-store-row">
          ${o.installAttr ? `<button class="nmod-mini" ${o.installAttr}>${this._t(o.installLabel)}</button>` : ""}
          ${o.uninstallId ? `<button class="nmod-mini ghost" data-uninstall="${o.uninstallId}">${this._t("Entfernen")}</button>` : ""}
          ${o.homepage ? `<a class="nmod-mini ghost" href="${o.homepage}" target="_blank" rel="noopener" style="text-decoration:none;">${this._t("Info")}</a>` : ""}
        </div>
        ${o.note ? `<div class="nmod-note" style="margin:6px 0 0;">${o.note}</div>` : ""}
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
      if (this._addOpen && (this._addTab || "store") === "store" && !this._storeItems) this._loadStoreIndex();
    });
    host.querySelectorAll(".nmod-tab").forEach((t) =>
      t.addEventListener("click", () => {
        this._addTab = t.getAttribute("data-tab");
        this._renderAddArea();
        if (this._addTab === "store" && !this._storeItems) this._loadStoreIndex();
      }));
    this._wireAddArea();
    // Auto-Laden, wenn die Add-Area (z. B. auf der Startseite) offen startet.
    if (open && tab === "store" && !this._storeItems && !this._storeLoading) this._loadStoreIndex();
  }

  _storeHtml() {
    if (!NeoStore.available()) {
      return `<div class="nmod-note">${this._t("⚠️ Für den Store wird die Integration <b>Neo Dashboard Tools</b> benötigt (serverseitiges Speichern + Laden).")}</div>`;
    }
    if (this._storeLoading) return `<div class="nmod-note">${this._t("Lade Store …")}</div>`;
    if (this._storeErr) return `<div class="nmod-note">${this._t(this._storeErr)} <button class="nmod-mini" id="nmod-reload">${this._t("Erneut")}</button></div>`;

    // Eine Liste: Katalog (Store) + installierte Add-ons, die NICHT im Katalog
    // sind (z. B. eingefügte Premium-Karten) — mit Version, Aktualisieren/Entfernen.
    const catalog = this._catalog();
    const seen = new Set(catalog.map((c) => c.id));
    const extra = Array.from(this._installed || []).filter((id) => !seen.has(id));
    if (!catalog.length && !extra.length) {
      return `<div class="nmod-note">${this._t("Aktuell keine Store-Module verfügbar. Premium-Karten (z. B. Wetter) fügst du über <b>Code einfügen</b> hinzu.")}</div>`;
    }

    const rows = catalog.map((it) => {
      const installed = this._isInstalled(it.id);
      const reg = this._addonMeta(it.id);
      const update = installed && this._verGt(it.version, reg.version) ? it.version : null;
      const showInstall = !installed || !!update; // installiert & aktuell → nur Entfernen/Info
      return this._storeRow({
        icon: it.icon || reg.icon, name: it.name || it.id, author: it.author || reg.author,
        version: (installed && reg.version) || it.version, kind: (reg.isCard || it.kind === "card") ? "Karte" : "Modul",
        installed, update, homepage: it.homepage || it.repo, image: it.image, description: it.description,
        // Per ID referenzieren (nicht Index) — bleibt korrekt, wenn sich die
        // gefilterte Liste zwischen Render und Klick ändert.
        installAttr: showInstall ? `data-install-id="${it.id}"` : "", installLabel: installed ? "Aktualisieren" : "Installieren",
        uninstallId: installed ? it.id : null,
      });
    });
    // Installierte ohne Katalog-Eintrag (z. B. per Code eingefügt) — keine Quelle
    // zum Aktualisieren; Hinweis erklärt den Weg.
    extra.forEach((id) => {
      const reg = this._addonMeta(id);
      rows.push(this._storeRow({
        icon: reg.icon, name: reg.name, author: reg.author, version: reg.version,
        kind: reg.isCard ? "Karte" : "Modul", installed: true, uninstallId: id,
        note: this._t("Per Code eingefügt — Update durch erneutes Einfügen."),
      }));
    });
    return rows.join("");
  }

  _pasteHtml() {
    const note = NeoStore.available()
      ? ""
      : `<div class="nmod-note">${this._t("ℹ️ Ohne <b>Neo Dashboard Tools</b> wird das Modul nur für diese Sitzung geladen (nicht dauerhaft gespeichert).")}</div>`;
    return `${note}
      <textarea id="nmod-code" placeholder="${this._t("Modul- oder Karten-Code einfügen (registerModule / registerCard, z. B. Premium-Karten) …")}"></textarea>
      <button class="nmod-mini" id="nmod-paste-add">${this._t("Hinzufügen")}</button>`;
  }

  _wireAddArea() {
    const q = (s) => this._modPanel.querySelector(s);
    q("#nmod-reload")?.addEventListener("click", () => { this._storeItems = null; this._storeErr = null; this._loadStoreIndex(); });
    q("#nmod-paste-add")?.addEventListener("click", () => {
      const code = (q("#nmod-code").value || "").trim();
      this._pasteModule(code);
    });
    this._modPanel.querySelectorAll("[data-install-id]").forEach((b) =>
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-install-id");
        this._installFromStore((this._storeItems || []).find((it) => it.id === id));
      }));
    this._modPanel.querySelectorAll("[data-uninstall]").forEach((b) =>
      b.addEventListener("click", () => this._removeInstalled(b.getAttribute("data-uninstall"))));
  }

  _msg(text, err) {
    const m = this._modPanel.querySelector("#nmod-msg");
    if (m) { m.style.color = err ? "var(--error-color,#F87171)" : "var(--success-color,#5EDCB8)"; m.textContent = text; }
  }

  async _loadStoreIndex() {
    if (!NeoStore.available()) { this._renderAddArea(); return; }
    this._storeLoading = true; this._storeErr = null; this._renderAddArea();
    try {
      const txt = await NeoStore.fetch(NEO_LINKS.modulesIndex);
      const data = JSON.parse(txt);
      this._storeItems = Array.isArray(data) ? data : (data.modules || []);
    } catch (e) {
      this._storeItems = [];
      this._storeErr = "Store-Index konnte nicht geladen werden.";
    }
    this._storeLoading = false;
    this._renderAddArea();
  }

  async _installFromStore(item) {
    if (!item) return;
    this._msg(this._t("Installiere …"));
    try {
      const code = await NeoStore.fetch(item.url);
      const res = neoLoadModule(code); // registriert das Modul sofort
      if (!res.ok) throw new Error("Code-Fehler");
      if (NeoStore.available()) await NeoStore.save(item.id, code);
      await this._refreshInstalled();
      this._msg(this._t("✓ „{name}” installiert.").replace("{name}", item.name || item.id));
    } catch (e) {
      this._msg(this._t("Installation fehlgeschlagen: {err}").replace("{err}", e?.message || e), true);
    }
  }

  async _pasteModule(code) {
    if (!code) return this._msg(this._t("Bitte Code einfügen."), true);
    const before = new Set(NeoModules.list().map((m) => m.id));
    const res = neoLoadModule(code);
    if (!res.ok) return this._msg(this._t("Code konnte nicht geladen werden."), true);
    // Erkennt BEIDES: Layer-Module (registerModule) und eigenständige Karten
    // (registerCard, z. B. Premium-Karten wie Neo Wetter).
    const addedMods = NeoModules.list().filter((m) => !before.has(m.id));
    const addedCards = res.cards || [];
    if (!addedMods.length && !addedCards.length) {
      return this._msg(this._t("Kein Modul/Karte erkannt (registerModule/registerCard fehlt?)."), true);
    }
    const id = addedMods[0]?.id || addedCards[0]?.type || `neo-${Date.now()}`;
    try {
      if (NeoStore.available()) await NeoStore.save(id, code);
      await this._refreshInstalled();
      this._renderTypePicker(); // neue Karten sofort im Kartentyp-Dropdown
      this._msg(addedCards.length
        ? this._t("✓ Karte „{name}” hinzugefügt — oben im Kartentyp wählbar.").replace("{name}", addedCards[0].name || addedCards[0].type)
        : this._t("✓ Modul „{name}” hinzugefügt.").replace("{name}", addedMods[0].name || addedMods[0].id));
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
    // Layer-Modul sofort live entladen; Karten brauchen einen Reload.
    if (!isCard && NeoModules.get(id)) NeoModules.unregister(id);
    // Aus der aktiven Konfiguration nehmen, falls aktiviert.
    if (this._isModEnabled(id)) {
      const list = this._enabledList().filter((m) => m.id !== id);
      this._config = { ...this._config };
      if (list.length) this._config.modules = list; else delete this._config.modules;
      this._fire();
    }
    await this._refreshInstalled();
    this._msg(this._t(isCard ? "Karte entfernt — zum vollständigen Entladen einmal neu laden." : "Modul entfernt."));
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
        .nmod-store { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; padding:10px; margin-bottom:8px; }
        .nmod-store-h { display:flex; align-items:flex-start; gap:9px; }
        .nmod-img { width:100%; border-radius:8px; margin-top:8px; display:block; }
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
    // Beim Typwechsel werden karten-gebundene Module zurückgesetzt (sie galten
    // für den vorherigen Typ). Keine Voreinstellungen außer dem Stub.
    this._config = { type: this._config.type, card_type: newType, ...stub };
    this._renderTypePicker();
    this._mountSub();
    this._renderModulesSection();
    this._updateGuidedState();
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
    const curName = m.name ? this._t(m.name) : (cur || this._t("Kartentyp wählen …"));
    const groups = this._typeGroups();
    // Aufklapp-Zustand je Kategorie (Standard + die aktuelle Kategorie offen,
    // Rest eingeklappt). Nutzer-Klicks werden in this._typeOpen gemerkt.
    if (!this._typeOpen) this._typeOpen = {};
    const open = (g) => (g in this._typeOpen ? this._typeOpen[g] : (g === "Standard" || g === curCat));
    this._typeBox.innerHTML = `
      <style>
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
        .nt-grp { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; letter-spacing:.6px;
          text-transform:uppercase; color:var(--secondary-text-color); padding:11px 12px; cursor:pointer; position:sticky;
          top:0; background:var(--card-background-color,#1b2030); }
        .nt-grp:hover { color:var(--primary-text-color); }
        .nt-gcv { display:inline-block; transition:transform .2s; opacity:.7; margin-left:auto; }
        .nt-section:not(.collapsed) .nt-gcv { transform:rotate(90deg); }
        .nt-section.collapsed .nt-opts { display:none; }
        .nt-gcount { font-weight:600; opacity:.6; }
        .nt-opt { display:flex; align-items:center; gap:9px; padding:9px 12px 9px 22px; cursor:pointer; font-size:14px;
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
      <div class="nt">
        <div class="nt-btn" id="nt-btn">
          <span class="nt-lbl"><span class="nt-dot" style="background:${DOT[curCat]};"></span>
            <span class="nt-ic">${m.icon || "✨"}</span><span class="nt-nm">${curName}</span></span>
          <span class="nt-cv">▾</span>
        </div>
        <div class="nt-panel" id="nt-panel" style="display:none;">
          <div class="nt-search"><input id="nt-search" type="text" placeholder="${this._t("🔍 Karte suchen …")}" /></div>
          <div id="nt-list">
          ${groups.map((grp) => `
            <div class="nt-section ${open(grp.group) ? "" : "collapsed"}" data-grp="${grp.group}">
              <div class="nt-grp" data-grp="${grp.group}"><span class="nt-dot" style="display:inline-block;background:${DOT[grp.group]};"></span>${this._t(grp.group)}<span class="nt-gcount">${grp.items.length}</span><span class="nt-gcv">›</span></div>
              <div class="nt-opts">
              ${grp.items.map((it) => `<div class="nt-opt ${it.value === cur ? "sel" : ""}" data-v="${it.value}" data-s="${(this._t(it.name) + " " + it.name + " " + it.value + " " + grp.group).toLowerCase()}">
                <span class="nt-ic">${it.icon}</span><span class="nt-nm">${this._t(it.name)}</span>
              </div>`).join("")}
              </div>
            </div>`).join("")}
          <div class="nt-empty" id="nt-empty" style="display:none;">${this._t("Keine Treffer.")}</div>
          </div>
        </div>
      </div>`;
    const root = this._typeBox.querySelector(".nt");
    const panel = this._typeBox.querySelector("#nt-panel");
    const close = () => { panel.style.display = "none"; root.classList.remove("open"); this._typeMenuOpen = false; document.removeEventListener("click", onDoc, true); };
    // composedPath() statt contains(e.target): robust über Shadow-Grenzen (HA-Dialog).
    const onDoc = (e) => { const path = e.composedPath ? e.composedPath() : []; if (!path.includes(this._typeBox)) close(); };
    const search = this._typeBox.querySelector("#nt-search");
    this._typeBox.querySelector("#nt-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (panel.style.display !== "none") { close(); return; }
      panel.style.display = "block"; root.classList.add("open"); this._typeMenuOpen = true;
      document.addEventListener("click", onDoc, true);
      setTimeout(() => search?.focus(), 30);
    });
    // Kategorie auf-/zuklappen (Akkordeon).
    this._typeBox.querySelectorAll(".nt-grp").forEach((h) =>
      h.addEventListener("click", (e) => {
        e.stopPropagation();
        const g = h.getAttribute("data-grp");
        const sec = h.closest(".nt-section");
        const collapsed = sec.classList.toggle("collapsed");
        this._typeOpen[g] = !collapsed;
      }));
    search?.addEventListener("click", (e) => e.stopPropagation());
    search?.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let any = false;
      this._typeBox.querySelectorAll(".nt-section").forEach((sec) => {
        const g = sec.getAttribute("data-grp");
        let vis = 0;
        sec.querySelectorAll(".nt-opt").forEach((o) => {
          const hit = !q || o.getAttribute("data-s").includes(q);
          o.style.display = hit ? "" : "none"; if (hit) vis++;
        });
        if (q) { sec.classList.remove("collapsed"); sec.style.display = vis ? "" : "none"; }
        else { sec.style.display = ""; sec.classList.toggle("collapsed", !open(g)); }
        if (vis) any = true;
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

class NeoCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    // Hinweis: config.modules sind jetzt karten-gebundene Layer-Module
    // ([{ id, settings }]) — sie werden von der Karte selbst (Basis-Karte)
    // über die style/decorate-Hooks angewandt, nicht hier geladen.
    const type = this._config.card_type;

    if (!type) {
      this.innerHTML = `
        <ha-card style="
          padding:28px 24px;border-radius:24px;text-align:center;
          display:flex;flex-direction:column;align-items:center;gap:10px;
        ">
          ${neoLogo({ size: 56, radius: 16 })}
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
  version: "0.2.0-beta.62", // beim Build aus package.json ersetzt
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
  // 1) Mobil-Header ausblenden → in den Shadow-Root von hui-root.
  const hui = deepShadow(["home-assistant", "home-assistant-main", "ha-panel-lovelace", "hui-root"]);
  if (hui && hui.appendChild) inject(hui, "neo-global-header", HEADER_CSS);
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

neoInitGlobalStyle();

console.info(
  "%c NEO DASHBOARD KIT %c v0.2.0-beta.62 ",
  "background:#7C9CFF;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:700;",
  "background:#1a1f2e;color:#7C9CFF;padding:2px 6px;border-radius:0 4px 4px 0;"
);
