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

export function neoInitGlobalStyle() {
  if (typeof document === "undefined") return; // kein Browser (z. B. Tests)
  apply();
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("location-changed", apply);
  }
  // Dialoge werden dynamisch eingehängt → den HA-Root beobachten.
  const ha = document.querySelector?.("home-assistant");
  if (ha?.shadowRoot && typeof MutationObserver !== "undefined") {
    try { new MutationObserver(apply).observe(ha.shadowRoot, { childList: true, subtree: true }); }
    catch (e) { /* ignore */ }
  }
  // Während des Frontend-Starts ein paar Versuche, dann Schluss.
  if (typeof setInterval === "function") {
    let n = 0;
    const iv = setInterval(() => { apply(); if (++n > 20) clearInterval(iv); }, 500);
  }
}
