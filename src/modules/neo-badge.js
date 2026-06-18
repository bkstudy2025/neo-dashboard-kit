// Neo Module — Status-Badge
// Beispiel für ein DECORATE-Modul, gebunden an die Button-Karte.
// Zeigt eine kleine Eck-Badge mit dem Status/Wert einer Entität.
import { NeoModules } from "../core/modules.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";

NeoModules.register({
  id: "neo-badge",
  name: "Status-Badge",
  description: "Kleine Eck-Badge mit dem Wert/Status einer Entität.",
  icon: "🏷️",
  target: "neo-button-card",
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
