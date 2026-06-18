// Neo Dashboard Kit — Climate Card (Thermostat)
// Soll-/Ist-Temperatur als Glas-Kachel mit +/- Steuerung. Folgt dem geteilten
// Sektions-Muster (Allgemein/Darstellung). Tap öffnet More-Info, überschreibbar
// per Modul-tapAction; die +/- Tasten stellen die Zieltemperatur.
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

const MODE_LABEL = {
  heat: "Heizen", cool: "Kühlen", auto: "Auto", heat_cool: "Auto",
  dry: "Entfeuchten", fan_only: "Lüften", off: "Aus", unavailable: "—",
};
const ACTION_LABEL = {
  heating: "Heizt", cooling: "Kühlt", drying: "Entfeuchtet",
  fan: "Lüftet", idle: "Bereit", off: "Aus",
};

class NeoClimateCard extends NeoBaseCard {
  getCardSize() { return 3; }

  _step() {
    const s = this._state(this._config?.entity);
    return this._config?.step || s?.attributes?.target_temp_step || 0.5;
  }

  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const name = this._config?.name || a.friendly_name || id || "Klima";
    const icon = this._config?.icon || "thermo";
    const unit = this._hass?.config?.unit_system?.temperature || "°";
    const cur = a.current_temperature;
    const target = a.temperature;
    const mode = s?.state || "off";
    const action = a.hvac_action;

    // Farbe/Glow nach aktueller Aktion (heizen=amber, kühlen=blau).
    const actCol = action === "cooling" ? NEO_ACCENTS.blue.c
      : action === "heating" ? NEO_ACCENTS.amber.c : acc.c;
    const active = (action && action !== "idle" && action !== "off") ||
      (!action && mode !== "off" && mode !== "unavailable");
    const glow = `${actCol}55`;

    const badge = action ? (ACTION_LABEL[action] || action) : (MODE_LABEL[mode] || mode);
    const targetTxt = target != null ? target : "—";
    const curTxt = cur != null ? `Aktuell ${cur}${unit}` : "";

    const btn = (which, sym) => `
      <button id="${which}" style="width:42px;height:42px;flex-shrink:0;border-radius:21px;cursor:pointer;
        display:flex;align-items:center;justify-content:center;color:var(--neo-text1,#fff);
        background:var(--neo-fill2,rgba(255,255,255,.06));border:1px solid var(--neo-line2);">
        ${neoIcon(sym, { size: 20, color: "currentColor" })}</button>`;

    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:200px;display:flex;flex-direction:column;cursor:pointer;
        background:${active ? `linear-gradient(160deg,${glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${active ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${active ? `0 18px 40px -16px ${glow}` : "0 18px 40px -16px var(--neo-shadow1)"};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
          <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
            background:${active ? `linear-gradient(160deg,${actCol} 0%,${actCol}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
            border:1px solid ${active ? "rgba(255,255,255,0.25)" : acc.c + "33"};">${neoIcon(icon, { size: 19, color: active ? "#fff" : acc.c })}</div>
          <span style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px;
            color:${active ? actCol : "var(--neo-text2)"};background:${active ? actCol + "1f" : "var(--neo-fill2)"};
            border:1px solid ${active ? actCol + "55" : "var(--neo-line2)"};">${badge}</span>
        </div>
        <div style="margin-top:auto;">
          <div style="font-size:13px;color:var(--neo-text2);">${name}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px;">
            ${btn("dec", "minus")}
            <div style="display:flex;align-items:baseline;gap:2px;">
              <span style="font-size:32px;font-weight:500;letter-spacing:-1px;">${targetTxt}</span>
              <span style="font-size:15px;color:var(--neo-text2);">${unit}</span>
            </div>
            ${btn("inc", "plus")}
          </div>
          ${curTxt ? `<div style="font-size:12px;color:var(--neo-text3);margin-top:8px;text-align:center;">${curTxt}</div>` : ""}
        </div>
      </div>`;
  }

  _bindEvents() {
    const id = this._config?.entity;
    const target = this._state(id)?.attributes?.temperature;
    const step = this._step();

    this.shadowRoot.getElementById("dec")?.addEventListener("click", (e) => {
      e.stopPropagation(); this._setTemp(id, target, -step);
    });
    this.shadowRoot.getElementById("inc")?.addEventListener("click", (e) => {
      e.stopPropagation(); this._setTemp(id, target, step);
    });
    // Tap auf die Karte → More-Info; Modul-tapAction hat Vorrang.
    this.shadowRoot.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (id) this._modCtx().moreInfo(id);
    });
  }

  _setTemp(id, cur, delta) {
    if (!id || cur == null) return;
    const a = this._state(id)?.attributes || {};
    let v = Math.round((cur + delta) * 10) / 10;
    if (a.min_temp != null) v = Math.max(a.min_temp, v);
    if (a.max_temp != null) v = Math.min(a.max_temp, v);
    this._callService("climate", "set_temperature", { entity_id: id, temperature: v });
  }

  static getConfigElement() { return document.createElement("neo-climate-card-editor"); }
  static getStubConfig() { return {}; }
}

// ── Editor: geteiltes Sektions-Muster (Allgemein/Darstellung) ──
customElements.define("neo-climate-card-editor", makeNeoEditor([
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entity", label: "Klima-Entity", selector: { entity: { domain: "climate" } } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
    ],
  },
  {
    type: "expandable", title: "Darstellung", icon: "mdi:palette",
    schema: [
      { name: "icon", label: "Icon", selector: { icon: {} } },
      { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
      { name: "step", label: "Schrittweite (optional)", selector: { number: { min: 0.1, max: 5, step: 0.1, mode: "box" } } },
      NEO_LAYOUT_FIELD,
    ],
  },
], { name: "Neo Klima", description: "Thermostat mit +/- Steuerung", icon: "🌡️" }));

NeoDashboardRegistry.registerCard("neo-climate-card", NeoClimateCard, {
  name: "Neo Klima",
  description: "Thermostat mit +/- Steuerung",
});

export { NeoClimateCard };
