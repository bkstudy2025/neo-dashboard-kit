// Neo Dashboard Kit — Cover Card (Rollladen/Jalousie)
// Glas-Kachel mit Auf / Stopp / Zu als Kern-Steuerung; Detail (Position,
// Lamellen/Tilt) über Tap → More-Info. Folgt dem Sektions-Muster.
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

const STATE_LABEL = {
  open: "Offen", closed: "Geschlossen", opening: "Öffnet", closing: "Schließt",
  unavailable: "—",
};

class NeoCoverCard extends NeoBaseCard {
  getCardSize() { return 3; }

  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    const name = this._config?.name || a.friendly_name || id || "Rollladen";
    const icon = this._config?.icon || "blinds";
    const state = s?.state || "unavailable";
    const pos = typeof a.current_position === "number" ? a.current_position : null;
    const active = state === "open" || state === "opening" || (pos != null && pos > 0);
    const glow = `${acc.c}55`;

    const statusTxt = pos != null ? `${pos}% offen` : (STATE_LABEL[state] || state);

    const ctl = (which, glyph, title) => `
      <button id="${which}" title="${title}" style="flex:1;height:42px;border-radius:12px;cursor:pointer;
        display:flex;align-items:center;justify-content:center;font-size:16px;color:var(--neo-text1,#fff);
        background:var(--neo-fill2,rgba(255,255,255,.06));border:1px solid var(--neo-line2);">${glyph}</button>`;

    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:200px;display:flex;flex-direction:column;cursor:pointer;
        background:${active ? `linear-gradient(160deg,${glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${active ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${active ? `0 18px 40px -16px ${glow}` : "0 18px 40px -16px var(--neo-shadow1)"};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
          <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
            background:${active ? `linear-gradient(160deg,${acc.c} 0%,${acc.c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
            border:1px solid ${active ? "rgba(255,255,255,0.25)" : acc.c + "33"};">${neoIcon(icon, { size: 19, color: active ? "#fff" : acc.c })}</div>
          <span style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px;
            color:var(--neo-text2);background:var(--neo-fill2);border:1px solid var(--neo-line2);">${statusTxt}</span>
        </div>
        <div style="margin-top:auto;">
          <div style="font-size:16px;font-weight:600;">${name}</div>
          <div style="display:flex;gap:8px;margin-top:10px;">
            ${ctl("up", "▲", "Öffnen")}
            ${ctl("stop", "■", "Stopp")}
            ${ctl("down", "▼", "Schließen")}
          </div>
        </div>
      </div>`;
  }

  _bindEvents() {
    const id = this._config?.entity;
    const svc = (service) => (e) => { e.stopPropagation(); if (id) this._callService("cover", service, { entity_id: id }); };
    this.shadowRoot.getElementById("up")?.addEventListener("click", svc("open_cover"));
    this.shadowRoot.getElementById("stop")?.addEventListener("click", svc("stop_cover"));
    this.shadowRoot.getElementById("down")?.addEventListener("click", svc("close_cover"));
    // Tap auf die Karte → More-Info; Modul-tapAction hat Vorrang.
    this.shadowRoot.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (id) this._modCtx().moreInfo(id);
    });
  }

  static getConfigElement() { return document.createElement("neo-cover-card-editor"); }
  static getStubConfig() { return {}; }
}

// ── Editor: geteiltes Sektions-Muster (Allgemein/Darstellung) ──
customElements.define("neo-cover-card-editor", makeNeoEditor([
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entity", label: "Cover-Entity", selector: { entity: { domain: "cover" } } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
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
], { name: "Neo Cover", description: "Rollladen mit Auf/Stopp/Zu", icon: "🪟" }));

NeoDashboardRegistry.registerCard("neo-cover-card", NeoCoverCard, {
  name: "Neo Cover",
  description: "Rollladen mit Auf/Stopp/Zu",
});

export { NeoCoverCard };
