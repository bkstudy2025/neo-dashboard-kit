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
//    Universal Button card replaces light/scene/quick-action (kept hidden
//    below for backward compatibility with existing dashboards).
import "./cards/neo-button-card.js";
import "./cards/neo-sensor-card.js";
import "./cards/neo-climate-card.js";
import "./cards/neo-cover-card.js";
import "./cards/neo-hero-card.js";
import "./cards/neo-status-card.js";
// Legacy (hidden, render-only for existing configs)
import "./cards/neo-light-card.js";
import "./cards/neo-scene-card.js";
import "./cards/neo-quick-action-card.js";

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

console.info(
  "%c NEO DASHBOARD KIT %c v0.2.0-beta.34 ",
  "background:#7C9CFF;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:700;",
  "background:#1a1f2e;color:#7C9CFF;padding:2px 6px;border-radius:0 4px 4px 0;"
);
