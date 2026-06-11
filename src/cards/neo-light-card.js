// Neo Dashboard Kit — Light Card
// Config: entity, name, accent (optional)

import { NeoBaseCard } from "../utils/base-card.js";
import { accent as ACCENTS } from "../tokens.js";
import { NeoDashboardRegistry } from "../utils/registry.js";

class NeoLightCard extends NeoBaseCard {
  getCardSize() { return 3; }

  render() {
    const entityId = this._config?.entity;
    const stateObj = this._state(entityId);
    const on = stateObj?.state === "on";
    const brightness = stateObj?.attributes?.brightness
      ? Math.round((stateObj.attributes.brightness / 255) * 100)
      : 0;
    const name = this._config?.name || stateObj?.attributes?.friendly_name || entityId;
    const acc = ACCENTS[this._config?.accent] || ACCENTS.amber;
    const color = on ? (stateObj?.attributes?.rgb_color
      ? `rgb(${stateObj.attributes.rgb_color.join(",")})`
      : acc.c) : acc.c;
    const glow = on ? `${color}55` : acc.glow;

    return `
      <div class="neo-card" style="
        padding: 16px;
        min-height: 180px;
        display: flex;
        flex-direction: column;
        background: ${on
          ? `linear-gradient(160deg, ${glow} 0%, var(--neo-fill1) 60%, var(--neo-fill0) 100%)`
          : "linear-gradient(160deg, var(--neo-fill2) 0%, var(--neo-fill0) 100%)"};
        backdrop-filter: var(--neo-blur);
        border: 1px solid ${on ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow: ${on
          ? `0 1px 0 var(--neo-line3) inset, 0 18px 40px -16px ${glow}`
          : "0 1px 0 var(--neo-fill2) inset, 0 18px 40px -16px var(--neo-shadow1)"};
        cursor: pointer;
      " id="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div class="icon-chip" style="
            width:38px;height:38px;border-radius:19px;
            display:flex;align-items:center;justify-content:center;
            background: ${on ? `linear-gradient(160deg,${color} 0%,${color}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
            border:1px solid ${on ? "rgba(255,255,255,0.25)" : acc.c + "33"};
            box-shadow:${on ? `0 4px 14px ${glow},inset 0 1px 0 rgba(255,255,255,0.3)` : "inset 0 1px 0 var(--neo-fill2)"};
            color:${on ? "#fff" : acc.c};
            font-size:18px;
          ">💡</div>
          <div class="toggle" style="
            width:36px;height:22px;border-radius:11px;padding:2px;
            background:${on ? acc.c : "var(--neo-line5)"};
            transition:background 200ms;cursor:pointer;
          " id="toggle">
            <div style="
              width:18px;height:18px;border-radius:9px;background:#fff;
              transform:translateX(${on ? "14px" : "0px"});
              transition:transform 220ms cubic-bezier(.2,.8,.2,1);
              box-shadow:0 1px 2px rgba(0,0,0,0.3);
            "></div>
          </div>
        </div>
        <div style="margin-top:auto;">
          <div style="font-size:17px;font-weight:600;color:var(--neo-text1);margin-bottom:8px;">${name}</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--neo-text3);">
            <span>Brightness</span>
            <span style="color:${on ? "var(--neo-text1)" : "var(--neo-text3)"};font-weight:600;">${on ? brightness : 0}%</span>
          </div>
          <input type="range" id="brightness-slider"
            min="1" max="100" value="${on ? brightness : 0}"
            style="
              width:100%;height:26px;border-radius:9px;
              -webkit-appearance:none;appearance:none;
              background:linear-gradient(90deg,${color}cc 0%,${color} ${on ? brightness : 0}%,var(--neo-line2) ${on ? brightness : 0}%);
              cursor:pointer;border:1px solid var(--neo-line1);
            "
          />
        </div>
      </div>
    `;
  }

  _bindEvents() {
    const entityId = this._config?.entity;
    const stateObj = this._state(entityId);
    const on = stateObj?.state === "on";

    this.shadowRoot.getElementById("toggle")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._callService("light", on ? "turn_off" : "turn_on", { entity_id: entityId });
    });

    this.shadowRoot.getElementById("brightness-slider")?.addEventListener("change", (e) => {
      const pct = parseInt(e.target.value);
      this._callService("light", "turn_on", {
        entity_id: entityId,
        brightness: Math.round((pct / 100) * 255),
      });
    });

    this.shadowRoot.getElementById("card")?.addEventListener("click", () => {
      this._callService("light", on ? "turn_off" : "turn_on", { entity_id: entityId });
    });
  }

  static getConfigElement() {
    return document.createElement("neo-light-card-editor");
  }

  static getStubConfig() {
    return { entity: "light.living_room", accent: "amber" };
  }
}

NeoDashboardRegistry.registerCard("neo-light-card", NeoLightCard);
export { NeoLightCard };
