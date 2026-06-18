// Neo Dashboard Kit — Fan Card (Ventilator)
// Glas-Kachel mit An/Aus + Stufen-Slider (Prozent) als Kern-Steuerung;
// Oszillation/Modus/Richtung über Tap → More-Info. Folgt dem Sektions-Muster.
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

class NeoFanCard extends NeoBaseCard {
  getCardSize() { return 3; }

  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const on = s?.state === "on";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint;
    const name = this._config?.name || a.friendly_name || id || "Ventilator";
    const icon = this._config?.icon || "fan";
    const pct = typeof a.percentage === "number" ? a.percentage : (on ? 100 : 0);
    const glow = `${acc.c}55`;
    const sub = this._config?.sub ?? (on ? `${pct}%` : "Aus");

    const toggleHtml = `
      <div id="toggle" style="width:36px;height:22px;border-radius:11px;padding:2px;flex-shrink:0;
        background:${on ? acc.c : "var(--neo-line5)"};transition:background 200ms;cursor:pointer;">
        <div style="width:18px;height:18px;border-radius:9px;background:#fff;
          transform:translateX(${on ? "14px" : "0px"});
          transition:transform 220ms cubic-bezier(.2,.8,.2,1);box-shadow:0 1px 2px rgba(0,0,0,0.3);"></div>
      </div>`;

    const sliderHtml = on ? `
      <div style="margin-top:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--neo-text3);">
          <span>Stufe</span><span style="font-weight:600;">${pct}%</span>
        </div>
        <input type="range" id="pct" min="1" max="100" value="${pct}" style="
          width:100%;height:26px;border-radius:9px;-webkit-appearance:none;appearance:none;cursor:pointer;
          background:linear-gradient(90deg,${acc.c}cc 0%,${acc.c} ${pct}%,var(--neo-line2) ${pct}%);
          border:1px solid var(--neo-line1);" />
      </div>` : "";

    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:180px;display:flex;flex-direction:column;cursor:pointer;
        background:${on ? `linear-gradient(160deg,${glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${on ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${on ? `0 18px 40px -16px ${glow}` : "0 18px 40px -16px var(--neo-shadow1)"};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
          <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
            background:${on ? `linear-gradient(160deg,${acc.c} 0%,${acc.c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
            border:1px solid ${on ? "rgba(255,255,255,0.25)" : acc.c + "33"};">${neoIcon(icon, { size: 19, color: on ? "#fff" : acc.c })}</div>
          ${toggleHtml}
        </div>
        <div style="margin-top:auto;">
          <div style="font-size:16px;font-weight:600;">${name}</div>
          ${sub ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${sub}</div>` : ""}
          ${sliderHtml}
        </div>
      </div>`;
  }

  _bindEvents() {
    const id = this._config?.entity;
    const on = this._state(id)?.state === "on";

    this.shadowRoot.getElementById("toggle")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (id) this._callService("fan", on ? "turn_off" : "turn_on", { entity_id: id });
    });
    this.shadowRoot.getElementById("pct")?.addEventListener("change", (e) => {
      if (id) this._callService("fan", "set_percentage", { entity_id: id, percentage: +e.target.value });
    });
    // Tap auf die Karte → More-Info; Modul-tapAction hat Vorrang.
    this.shadowRoot.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (id) this._modCtx().moreInfo(id);
    });
  }

  static getConfigElement() { return document.createElement("neo-fan-card-editor"); }
  static getStubConfig() { return {}; }
}

// ── Editor: geteiltes Sektions-Muster (Allgemein/Darstellung) ──
customElements.define("neo-fan-card-editor", makeNeoEditor([
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entity", label: "Ventilator-Entity", selector: { entity: { domain: "fan" } } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
    ],
  },
  {
    type: "expandable", title: "Darstellung", icon: "mdi:palette",
    schema: [
      { name: "icon", label: "Icon", selector: { icon: {} } },
      { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
      NEO_LAYOUT_FIELD,
    ],
  },
], { name: "Neo Ventilator", description: "Ventilator mit An/Aus + Stufe", icon: "🌀" }));

NeoDashboardRegistry.registerCard("neo-fan-card", NeoFanCard, {
  name: "Neo Ventilator",
  description: "Ventilator mit An/Aus + Stufe",
});

export { NeoFanCard };
