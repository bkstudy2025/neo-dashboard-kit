// Neo Dashboard Kit — Sensor Card
// Config: entity, name, icon (emoji), unit, accent (optional)

import { NeoBaseCard } from "../utils/base-card.js";
import { accent as ACCENTS } from "../tokens.js";
import { NeoDashboardRegistry } from "../utils/registry.js";

class NeoSensorCard extends NeoBaseCard {
  getCardSize() { return 2; }

  render() {
    const entityId = this._config?.entity;
    const stateObj = this._state(entityId);
    const value = stateObj?.state ?? "—";
    const unit = this._config?.unit || stateObj?.attributes?.unit_of_measurement || "";
    const name = this._config?.name || stateObj?.attributes?.friendly_name || entityId;
    const icon = this._config?.icon || "📊";
    const acc = ACCENTS[this._config?.accent] || ACCENTS.mint;

    return `
      <div class="neo-card" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);
        box-shadow:0 1px 0 var(--neo-fill2) inset,0 18px 40px -16px var(--neo-shadow1);
      ">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="
            width:38px;height:38px;border-radius:19px;
            display:flex;align-items:center;justify-content:center;
            background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);
            border:1px solid ${acc.c}33;font-size:18px;
          ">${icon}</div>
        </div>
        <div style="margin-top:auto;">
          <div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:0.6px;">${name}</div>
          <div style="display:flex;align-items:baseline;gap:3px;margin-top:4px;">
            <span style="font-size:26px;font-weight:500;letter-spacing:-0.5px;color:var(--neo-text1);">${value}</span>
            <span style="font-size:13px;color:var(--neo-text2);">${unit}</span>
          </div>
        </div>
      </div>
    `;
  }

  static getStubConfig() {
    return { entity: "sensor.temperature", accent: "mint", icon: "🌡️" };
  }
}

NeoDashboardRegistry.registerCard("neo-sensor-card", NeoSensorCard);
export { NeoSensorCard };
