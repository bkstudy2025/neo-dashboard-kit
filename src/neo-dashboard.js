// Neo Dashboard Kit — Main Entry Point
// Registers all core cards and exposes the plugin registry globally.

import "./utils/registry.js";
import "./cards/neo-light-card.js";
import "./cards/neo-sensor-card.js";
import "./cards/neo-scene-card.js";

console.info(
  "%c NEO DASHBOARD KIT %c v0.1.0 ",
  "background:#7C9CFF;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:700;",
  "background:#1a1f2e;color:#7C9CFF;padding:2px 6px;border-radius:0 4px 4px 0;"
);
