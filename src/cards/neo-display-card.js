// Neo Dashboard Kit — Display Card ("Neo Anzeige")
// EINE universelle Anzeige-Karte: erkennt die Domain und zeigt Sensorwert,
// Kamera-Snapshot oder Status. Reine Darstellung; Tap → More-Info.
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

class NeoDisplayCard extends NeoBaseCard {
  getCardSize() { return this._domain() === "camera" ? 3 : 2; }

  _domain() {
    const id = this._config?.entity;
    return id ? id.split(".")[0] : "";
  }
  _acc() { return NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint; }

  render() {
    return this._domain() === "camera" ? this._renderCamera() : this._renderSensor();
  }

  _renderSensor() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const value = s?.state ?? "—";
    const unit = this._config?.unit ?? a.unit_of_measurement ?? "";
    const name = this._config?.name || a.friendly_name || id || this._t("Wert");
    const icon = this._config?.icon || "thermo";
    const acc = this._acc();
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

  _renderCamera() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    const name = this._config?.name || a.friendly_name || id || this._t("Kamera");
    const icon = this._config?.icon || "camera";
    const pic = a.entity_picture;
    const image = pic
      ? `<img src="${pic}" alt="${name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />`
      : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
           background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);">${neoIcon(icon, { size: 40, color: acc.c })}</div>`;
    return `
      <div class="neo-card" id="card" role="button" style="
        position:relative;overflow:hidden;min-height:190px;display:flex;cursor:pointer;
        border:1px solid var(--neo-line2);box-shadow:0 18px 40px -16px var(--neo-shadow1);">
        ${image}
        <div style="position:absolute;left:0;right:0;bottom:0;padding:12px 14px;display:flex;align-items:center;gap:8px;
          background:linear-gradient(0deg,rgba(0,0,0,.65) 0%,rgba(0,0,0,.15) 60%,transparent 100%);">
          ${neoIcon(icon, { size: 16, color: "#fff" })}
          <span style="font-size:14px;font-weight:600;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
        </div>
      </div>`;
  }

  _bindEvents() {
    const id = this._config?.entity;
    this.shadowRoot.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (id) this._modCtx().moreInfo(id);
    });
  }

  static getConfigElement() { return document.createElement("neo-display-card-editor"); }
  static getStubConfig() { return {}; }
}

customElements.define("neo-display-card-editor", makeNeoEditor([
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entity", label: "Entität", selector: { entity: { domain: ["sensor", "binary_sensor", "input_number", "number", "camera"] } } },
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
], { name: "Neo Anzeige", description: "Sensor · Kamera · Status", icon: "📊" }));

NeoDashboardRegistry.registerCard("neo-display-card", NeoDisplayCard, {
  name: "Neo Anzeige",
  description: "Sensorwert, Kamera oder Status — passt sich an die Entität an",
});

export { NeoDisplayCard };
