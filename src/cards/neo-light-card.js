// Neo Dashboard Kit — Light Card
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

class NeoLightCard extends NeoBaseCard {
  getCardSize() { return 3; }
  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const on = s?.state === "on";
    const bri = s?.attributes?.brightness ? Math.round((s.attributes.brightness / 255) * 100) : 0;
    const name = this._config?.name || s?.attributes?.friendly_name || id || "Light";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const c = on ? (s?.attributes?.rgb_color ? `rgb(${s.attributes.rgb_color})` : acc.c) : acc.c;
    const glow = `${c}55`;
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:180px;display:flex;flex-direction:column;cursor:pointer;
        background:${on ? `linear-gradient(160deg,${glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${on ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${on ? `0 18px 40px -16px ${glow}` : "0 18px 40px -16px var(--neo-shadow1)"};
      ">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
            background:${on ? `linear-gradient(160deg,${c} 0%,${c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
            border:1px solid ${on ? "rgba(255,255,255,0.25)" : acc.c + "33"};
            box-shadow:${on ? `0 4px 14px ${glow}` : "none"};">${neoIcon("lightbulb", { size: 19, color: on ? "#fff" : acc.c })}</div>
          <div id="toggle" style="width:36px;height:22px;border-radius:11px;padding:2px;
            background:${on ? acc.c : "var(--neo-line5)"};transition:background 200ms;cursor:pointer;">
            <div style="width:18px;height:18px;border-radius:9px;background:#fff;
              transform:translateX(${on ? "14px" : "0px"});
              transition:transform 220ms cubic-bezier(.2,.8,.2,1);box-shadow:0 1px 2px rgba(0,0,0,0.3);"></div>
          </div>
        </div>
        <div style="margin-top:auto;">
          <div style="font-size:17px;font-weight:600;margin-bottom:8px;">${name}</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--neo-text3);">
            <span>Brightness</span><span style="font-weight:600;">${on ? bri : 0}%</span>
          </div>
          <input type="range" id="bri" min="1" max="100" value="${on ? bri : 1}" style="
            width:100%;height:26px;border-radius:9px;-webkit-appearance:none;appearance:none;cursor:pointer;
            background:linear-gradient(90deg,${c}cc 0%,${c} ${on ? bri : 0}%,var(--neo-line2) ${on ? bri : 0}%);
            border:1px solid var(--neo-line1);" />
        </div>
      </div>`;
  }
  _bindEvents() {
    const id = this._config?.entity;
    const on = this._state(id)?.state === "on";
    this.shadowRoot.getElementById("toggle")?.addEventListener("click", e => {
      e.stopPropagation();
      this._callService("light", on ? "turn_off" : "turn_on", { entity_id: id });
    });
    this.shadowRoot.getElementById("bri")?.addEventListener("change", e => {
      this._callService("light", "turn_on", { entity_id: id, brightness: Math.round((+e.target.value / 100) * 255) });
    });
    this.shadowRoot.getElementById("card")?.addEventListener("click", () => {
      this._callService("light", on ? "turn_off" : "turn_on", { entity_id: id });
    });
  }
  static getConfigElement() { return document.createElement("neo-light-card-editor"); }
  static getStubConfig() { return { entity: "light.living_room", accent: "amber" }; }
}

customElements.define("neo-light-card-editor", makeNeoEditor([
  { name: "entity", label: "Licht-Entity", selector: { entity: { domain: "light" } } },
  { name: "name", label: "Name (optional)", selector: { text: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
  NEO_LAYOUT_FIELD,
], { name: "Neo Licht", description: "Licht mit Helligkeits-Slider", icon: "💡" }));

// Legacy: durch die universelle neo-button-card (button_type: light) ersetzt.
// hidden → nicht mehr im Dropdown, rendert aber bestehende Dashboards weiter.
NeoDashboardRegistry.registerCard("neo-light-card", NeoLightCard, {
  name: "Neo Licht",
  description: "Licht mit Helligkeits-Slider",
  hidden: true,
});
