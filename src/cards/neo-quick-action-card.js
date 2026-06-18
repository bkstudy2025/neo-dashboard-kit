// Neo Dashboard Kit — Quick Action Card
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

class NeoQuickActionCard extends NeoBaseCard {
  getCardSize() { return 2; }
  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const on = s?.state === "on";
    const name = this._config?.name || s?.attributes?.friendly_name || id || "Device";
    const sub = this._config?.sub || (on ? "An" : "Aus");
    const icon = this._config?.icon || "plug";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    return `
      <div class="neo-card" id="card" role="button" style="padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
        background:${on ? `linear-gradient(160deg,${acc.glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${on ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${on ? `0 18px 40px -16px ${acc.glow}` : "0 18px 40px -16px var(--neo-shadow1)"};
      ">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
            background:${on ? `linear-gradient(160deg,${acc.c} 0%,${acc.c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
            border:1px solid ${on ? "rgba(255,255,255,0.25)" : acc.c + "33"};">${neoIcon(icon, { size: 19, color: on ? "#fff" : acc.c })}</div>
          <div style="width:36px;height:22px;border-radius:11px;padding:2px;
            background:${on ? acc.c : "var(--neo-line5)"};transition:background 200ms;">
            <div style="width:18px;height:18px;border-radius:9px;background:#fff;
              transform:translateX(${on ? "14px" : "0px"});
              transition:transform 220ms cubic-bezier(.2,.8,.2,1);box-shadow:0 1px 2px rgba(0,0,0,0.3);"></div>
          </div>
        </div>
        <div style="margin-top:auto;">
          <div style="font-size:16px;font-weight:600;">${name}</div>
          <div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${sub}</div>
        </div>
      </div>`;
  }
  _bindEvents() {
    const id = this._config?.entity;
    const on = this._state(id)?.state === "on";
    const domain = id?.split(".")[0] || "homeassistant";
    this.shadowRoot.getElementById("card")?.addEventListener("click", () => {
      this._callService(domain, on ? "turn_off" : "turn_on", { entity_id: id });
    });
  }
  static getConfigElement() { return document.createElement("neo-quick-action-card-editor"); }
  static getStubConfig() { return { entity: "switch.living_room", icon: "plug", accent: "blue" }; }
}

customElements.define("neo-quick-action-card-editor", makeNeoEditor([
  { name: "entity", label: "Entity (switch, light, etc.)", selector: { entity: {} } },
  { name: "name", label: "Name (optional)", selector: { text: {} } },
  { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
  { name: "icon", label: "Icon", selector: { icon: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
  NEO_LAYOUT_FIELD,
], { name: "Neo Schnellaktion", description: "Schalter-Kachel mit Toggle", icon: "⚡" }));

// Legacy: durch die universelle neo-button-card (button_type: switch) ersetzt.
// hidden → nicht mehr im Dropdown, rendert aber bestehende Dashboards weiter.
NeoDashboardRegistry.registerCard("neo-quick-action-card", NeoQuickActionCard, {
  name: "Neo Schnellaktion",
  description: "Schalter-Kachel mit Toggle",
  hidden: true,
});
