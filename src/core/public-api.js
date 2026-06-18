// ══════════════════════════════════════════════════════════════
// PUBLIC API — external/premium cards (separate JS files) use this
// to build cards that plug into the neo-card dropdown automatically.
//   const { BaseCard, icon, accents, registerCard, makeEditor } = window.NeoDashboard;
// ══════════════════════════════════════════════════════════════
import { NeoBaseCard } from "./base-card.js";
import { neoIcon, NEO_ICON_OPTIONS } from "./icons.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "./tokens.js";
import { makeNeoEditor } from "./editor-factory.js";
import { NEO_LAYOUT_OPTS, normalizeLayout, neoViewportLayout } from "./layout.js";
import { neoRenderReorder } from "./reorder.js";

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
