// Neo Dashboard Kit — Entry point
// Imports run in dependency order; the bundled output is shipped as the
// single root `neo-dashboard.js` that HACS loads (see rollup.config.js).

// 1. Theme/token fallback (side-effect: injects <style> once)
import "./core/theme-fallback.js";

// 2. Registry first — defines window.NeoDashboard before anything uses it
import "./core/registry.js";
import "./core/modules.js";

// 3. Core building blocks (pure definitions, imported by cards/wrapper)
import "./core/tokens.js";
import "./core/links.js";
import "./core/branding.js";
import "./core/icons.js";
import "./core/layout.js";
import "./core/editor-factory.js";
import "./core/reorder.js";
import "./core/base-card.js";

// 4. Core cards — each registers itself into the dropdown on import.
//    Three universal cards make up the whole picker:
//      Neo Steuerung (control, domain-adaptive) · Neo Anzeige (display) · Neo Header
//    Device-specific behaviour lives INSIDE the control card (domain dispatch);
//    extra card types come from the Store / Premium, not the core bundle.
import "./cards/neo-control-card.js";
import "./cards/neo-display-card.js";
import "./cards/neo-header-card.js";

// 4b. Built-in example modules (card-scoped extensions)
import "./modules/neo-badge.js";
import "./modules/neo-glow.js";

// 5. Module store (server-side persistence via Neo Dashboard Tools)
import "./store/module-loader.js";
import "./store/module-store.js";

// 6. The single wrapper card + its grouped editor (also imports the editor)
import "./wrapper/neo-card.js";

// 7. Public API for external/premium modules + ready event
import "./core/public-api.js";

// 8. Global polish (mobile header / glass dialogs) — self-contained, no Card Mod
import { neoInitGlobalStyle } from "./core/global-style.js";
neoInitGlobalStyle();

console.info(
  "%c NEO DASHBOARD KIT %c v__NEO_VERSION__ ",
  "background:#7C9CFF;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:700;",
  "background:#1a1f2e;color:#7C9CFF;padding:2px 6px;border-radius:0 4px 4px 0;"
);
