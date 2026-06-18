// Neo Dashboard Kit — Scene Card
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

class NeoSceneCard extends NeoBaseCard {
  getCardSize() { return 2; }
  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const active = s?.state === "on";
    const name = this._config?.name || s?.attributes?.friendly_name || id || "Scene";
    const sub = this._config?.sub || "";
    const icon = this._config?.icon || "sparkle";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.violet;
    return `
      <div class="neo-card" id="card" role="button" style="padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
        background:${active ? `linear-gradient(160deg,${acc.glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${active ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${active ? `0 18px 40px -16px ${acc.glow}` : "0 18px 40px -16px var(--neo-shadow1)"};
      ">
        <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
          background:${active ? `linear-gradient(160deg,${acc.c} 0%,${acc.c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
          border:1px solid ${active ? "rgba(255,255,255,0.25)" : acc.c + "33"};">${neoIcon(icon, { size: 19, color: active ? "#fff" : acc.c })}</div>
        <div style="margin-top:auto;">
          <div style="font-size:16px;font-weight:600;">${name}</div>
          ${sub ? `<div style="font-size:12px;color:var(--neo-text2);margin-top:2px;">${sub}</div>` : ""}
        </div>
      </div>`;
  }
  _bindEvents() {
    const id = this._config?.entity;
    this.shadowRoot.getElementById("card")?.addEventListener("click", () => {
      this._callService("scene", "turn_on", { entity_id: id });
    });
  }
  static getConfigElement() { return document.createElement("neo-scene-card-editor"); }
  static getStubConfig() { return { entity: "scene.movie_night", name: "Movie Night", icon: "sparkle", accent: "violet" }; }
}

customElements.define("neo-scene-card-editor", makeNeoEditor([
  { name: "entity", label: "Szenen-Entity", selector: { entity: { domain: "scene" } } },
  { name: "name", label: "Name (optional)", selector: { text: {} } },
  { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
  { name: "icon", label: "Icon", selector: { icon: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
  NEO_LAYOUT_FIELD,
], { name: "Neo Szene", description: "Szene per Tap aktivieren", icon: "🎬" }));

// Legacy: durch die universelle neo-button-card (button_type: scene) ersetzt.
// hidden → nicht mehr im Dropdown, rendert aber bestehende Dashboards weiter.
NeoDashboardRegistry.registerCard("neo-scene-card", NeoSceneCard, {
  name: "Neo Szene",
  description: "Szene per Tap aktivieren",
  hidden: true,
});
