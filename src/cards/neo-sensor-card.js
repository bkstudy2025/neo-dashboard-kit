// Neo Dashboard Kit — Sensor Card
// Zeigt einen Sensorwert als Glas-Kachel. Folgt dem geteilten Sektions-Muster
// (Allgemein/Darstellung) wie die Button-Karte; Tap öffnet More-Info, kann
// aber von einem Modul-tapAction überschrieben werden.
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
    const unit = this._config?.unit ?? s?.attributes?.unit_of_measurement ?? "";
    const name = this._config?.name || s?.attributes?.friendly_name || id || "Sensor";
    const icon = this._config?.icon || "thermo";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint;
    const sub = this._config?.sub || "";

    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
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
          ${sub ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${sub}</div>` : ""}
        </div>
      </div>`;
  }

  _bindEvents() {
    const id = this._config?.entity;
    // Tap → More-Info; ein Modul-tapAction-Hook hat Vorrang (Override).
    this.shadowRoot.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (id) this._modCtx().moreInfo(id);
    });
  }

  static getConfigElement() { return document.createElement("neo-sensor-card-editor"); }
  static getStubConfig() { return {}; } // leerer Start
}

// ── Editor: geteiltes Sektions-Muster (Allgemein/Darstellung) ──
customElements.define("neo-sensor-card-editor", makeNeoEditor([
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entity", label: "Sensor-Entity", selector: { entity: { domain: ["sensor", "binary_sensor", "input_number", "number"] } } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
    ],
  },
  {
    type: "expandable", title: "Darstellung", icon: "mdi:palette",
    schema: [
      { name: "icon", label: "Icon", selector: { icon: {} } },
      { name: "unit", label: "Einheit (optional)", selector: { text: {} } },
      { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
      NEO_LAYOUT_FIELD,
    ],
  },
], { name: "Neo Sensor", description: "Sensorwert als Glas-Kachel", icon: "📊" }));

NeoDashboardRegistry.registerCard("neo-sensor-card", NeoSensorCard, {
  name: "Neo Sensor",
  description: "Sensorwert als Glas-Kachel",
});

export { NeoSensorCard };
