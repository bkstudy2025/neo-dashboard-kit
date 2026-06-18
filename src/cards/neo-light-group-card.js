// Neo Dashboard Kit — Light Group Card
// Schaltet/dimmt mehrere Lichter gemeinsam (eine Kachel). Sammel-Toggle +
// Gruppen-Helligkeit als Kern; pro-Licht-Steuerung über die jeweilige Karte.
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

class NeoLightGroupCard extends NeoBaseCard {
  getCardSize() { return 2; }

  _entities() {
    const e = this._config?.entities;
    return Array.isArray(e) ? e.filter(Boolean) : (e ? [e] : []);
  }

  // Zustand der Gruppe: Anzahl an, Ø-Helligkeit der eingeschalteten Lichter.
  _group() {
    const ids = this._entities();
    let onCount = 0, briSum = 0, briN = 0;
    ids.forEach((id) => {
      const s = this._state(id);
      if (s?.state === "on") {
        onCount++;
        const b = s.attributes?.brightness;
        if (typeof b === "number") { briSum += b; briN++; }
      }
    });
    const bri = briN ? Math.round((briSum / briN / 255) * 100) : 0;
    return { total: ids.length, onCount, anyOn: onCount > 0, bri };
  }

  render() {
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const name = this._config?.name || "Licht-Gruppe";
    const icon = this._config?.icon || "lightbulb";
    const g = this._group();
    const on = g.anyOn;
    const glow = `${acc.c}55`;
    const sub = this._config?.sub ?? `${g.onCount}/${g.total} an`;

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
          <span>Helligkeit</span><span style="font-weight:600;">${g.bri}%</span>
        </div>
        <input type="range" id="bri" min="1" max="100" value="${g.bri || 1}" style="
          width:100%;height:26px;border-radius:9px;-webkit-appearance:none;appearance:none;cursor:pointer;
          background:linear-gradient(90deg,${acc.c}cc 0%,${acc.c} ${g.bri}%,var(--neo-line2) ${g.bri}%);
          border:1px solid var(--neo-line1);" />
      </div>` : "";

    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
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
    const ids = this._entities();
    const on = this._group().anyOn;
    const toggle = () => { if (ids.length) this._callService("light", on ? "turn_off" : "turn_on", { entity_id: ids }); };

    this.shadowRoot.getElementById("toggle")?.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
    this.shadowRoot.getElementById("bri")?.addEventListener("change", (e) => {
      if (ids.length) this._callService("light", "turn_on", { entity_id: ids, brightness_pct: +e.target.value });
    });
    // Tap auf die Karte: Gruppe schalten (kein einzelnes More-Info bei mehreren).
    this.shadowRoot.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      toggle();
    });
  }

  static getConfigElement() { return document.createElement("neo-light-group-card-editor"); }
  static getStubConfig() { return {}; }
}

// ── Editor: geteiltes Sektions-Muster (Allgemein/Darstellung) ──
customElements.define("neo-light-group-card-editor", makeNeoEditor([
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entities", label: "Lichter", selector: { entity: { domain: "light", multiple: true } } },
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
], { name: "Neo Licht-Gruppe", description: "Mehrere Lichter gemeinsam schalten/dimmen", icon: "💡" }));

NeoDashboardRegistry.registerCard("neo-light-group-card", NeoLightGroupCard, {
  name: "Neo Licht-Gruppe",
  description: "Mehrere Lichter gemeinsam schalten/dimmen",
});

export { NeoLightGroupCard };
