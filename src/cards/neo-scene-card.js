// Neo Dashboard Kit — Scene Card
// Config: entity, name, icon (emoji), sub, accent (optional)

import { NeoBaseCard } from "../utils/base-card.js";
import { accent as ACCENTS } from "../tokens.js";
import { NeoDashboardRegistry } from "../utils/registry.js";

class NeoSceneCard extends NeoBaseCard {
  getCardSize() { return 2; }

  render() {
    const entityId = this._config?.entity;
    const stateObj = this._state(entityId);
    const active = stateObj?.state === "on";
    const name = this._config?.name || stateObj?.attributes?.friendly_name || entityId;
    const sub = this._config?.sub || "";
    const icon = this._config?.icon || "✨";
    const acc = ACCENTS[this._config?.accent] || ACCENTS.violet;

    return `
      <div class="neo-card" id="card" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;
        background:${active
          ? `linear-gradient(160deg,${acc.glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)`
          : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);
        border:1px solid ${active ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${active
          ? `0 1px 0 var(--neo-line3) inset,0 18px 40px -16px ${acc.glow}`
          : "0 1px 0 var(--neo-fill2) inset,0 18px 40px -16px var(--neo-shadow1)"};
        cursor:pointer;
      ">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="
            width:38px;height:38px;border-radius:19px;
            display:flex;align-items:center;justify-content:center;
            background:${active ? `linear-gradient(160deg,${acc.c} 0%,${acc.c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
            border:1px solid ${active ? "rgba(255,255,255,0.25)" : acc.c + "33"};
            box-shadow:${active ? `0 4px 14px ${acc.glow},inset 0 1px 0 rgba(255,255,255,0.3)` : "inset 0 1px 0 var(--neo-fill2)"};
            font-size:18px;
          ">${icon}</div>
          ${active ? `<div style="width:6px;height:6px;border-radius:3px;background:${acc.c};box-shadow:0 0 8px ${acc.c};"></div>` : ""}
        </div>
        <div style="margin-top:auto;">
          <div style="font-size:16px;font-weight:600;color:var(--neo-text1);">${name}</div>
          ${sub ? `<div style="font-size:12px;color:var(--neo-text2);margin-top:2px;">${sub}</div>` : ""}
        </div>
      </div>
    `;
  }

  _bindEvents() {
    const entityId = this._config?.entity;
    this.shadowRoot.getElementById("card")?.addEventListener("click", () => {
      this._callService("scene", "turn_on", { entity_id: entityId });
    });
  }

  static getStubConfig() {
    return { entity: "scene.movie_night", name: "Movie Night", sub: "6 devices", icon: "🎬", accent: "violet" };
  }
}

NeoDashboardRegistry.registerCard("neo-scene-card", NeoSceneCard);
export { NeoSceneCard };
