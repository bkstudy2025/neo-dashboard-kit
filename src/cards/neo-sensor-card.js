// Neo Dashboard Kit — Sensor Card
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

class NeoSensorCard extends NeoBaseCard {
  getCardSize() { return 2; }
  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const value = s?.state ?? "—";
    const unit = this._config?.unit || s?.attributes?.unit_of_measurement || "";
    const name = this._config?.name || s?.attributes?.friendly_name || id || "Sensor";
    const icon = this._config?.icon || "thermo";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint;
    return `
      <div class="neo-card" style="padding:16px;min-height:160px;display:flex;flex-direction:column;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);box-shadow:0 18px 40px -16px var(--neo-shadow1);">
        <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);
          border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 19, color: acc.c })}</div>
        <div style="margin-top:auto;">
          <div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:0.6px;">${name}</div>
          <div style="display:flex;align-items:baseline;gap:3px;margin-top:4px;">
            <span style="font-size:26px;font-weight:500;letter-spacing:-0.5px;">${value}</span>
            <span style="font-size:13px;color:var(--neo-text2);">${unit}</span>
          </div>
        </div>
      </div>`;
  }
  static getConfigElement() { return document.createElement("neo-sensor-card-editor"); }
  static getStubConfig() { return { entity: "sensor.temperature", icon: "thermo", accent: "mint" }; }
}

customElements.define("neo-sensor-card-editor", makeNeoEditor([
  { name: "entity", label: "Sensor-Entity", selector: { entity: { domain: "sensor" } } },
  { name: "name", label: "Name (optional)", selector: { text: {} } },
  { name: "icon", label: "Icon", selector: { icon: {} } },
  { name: "unit", label: "Einheit (optional)", selector: { text: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
  NEO_LAYOUT_FIELD,
], { name: "Neo Sensor", description: "Sensorwert mit Icon", icon: "📊" }));

// Vorübergehend versteckt, bis auf das neue Sektions-Muster umgebaut.
// hidden → nicht im Picker, rendert aber bestehende Dashboards weiter.
NeoDashboardRegistry.registerCard("neo-sensor-card", NeoSensorCard, {
  name: "Neo Sensor",
  description: "Sensorwert mit Icon",
  hidden: true,
});
