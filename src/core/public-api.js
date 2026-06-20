// ══════════════════════════════════════════════════════════════
// PUBLIC API — external/premium cards (separate JS files) use this
// to build cards that plug into the neo-card dropdown automatically.
//   const { BaseCard, icon, accents, registerCard, makeEditor } = window.NeoDashboard;
// ══════════════════════════════════════════════════════════════
import { NeoBaseCard } from "./base-card.js";
import { neoIcon, NEO_ICON_OPTIONS } from "./icons.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "./tokens.js";
import { makeNeoEditor } from "./editor-factory.js";
import { makeNeoTypedEditor, neoCapabilityType, neoTypeDef } from "./capability.js";
import { NEO_LAYOUT_OPTS, normalizeLayout, neoViewportLayout } from "./layout.js";
import { neoRenderReorder } from "./reorder.js";
import { escapeAttr, escapeHtml, safeUrl } from "./html.js";

Object.assign(window.NeoDashboard, {
  BaseCard: NeoBaseCard,
  icon: neoIcon,
  accents: NEO_ACCENTS,
  makeEditor: makeNeoEditor,
  makeTypedEditor: makeNeoTypedEditor,
  capabilityType: neoCapabilityType,
  typeDef: neoTypeDef,
  iconOptions: NEO_ICON_OPTIONS,
  accentOptions: NEO_ACCENT_OPTIONS,
  layoutOptions: NEO_LAYOUT_OPTS,
  normalizeLayout,
  viewportLayout: neoViewportLayout,
  renderReorder: neoRenderReorder,
  escapeHtml,
  escapeAttr,
  safeUrl,
  version: "__NEO_VERSION__", // beim Build aus package.json ersetzt
  ready: true,
});
// Let external files that loaded first know the API is now available
window.dispatchEvent(new CustomEvent("neo-dashboard-ready"));
