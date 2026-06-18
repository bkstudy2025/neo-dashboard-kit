// Neo Dashboard Kit — Camera Card
// Kamera-Snapshot als Glas-Kachel; Tap → Live-Ansicht (More-Info). Folgt dem
// Sektions-Muster. Bewusst schlank — der volle Stream läuft über More-Info.
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

class NeoCameraCard extends NeoBaseCard {
  getCardSize() { return 3; }

  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    const name = this._config?.name || a.friendly_name || id || "Kamera";
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
    // Tap → More-Info (Live-Stream); Modul-tapAction hat Vorrang.
    this.shadowRoot.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (id) this._modCtx().moreInfo(id);
    });
  }

  static getConfigElement() { return document.createElement("neo-camera-card-editor"); }
  static getStubConfig() { return {}; }
}

// ── Editor: geteiltes Sektions-Muster (Allgemein/Darstellung) ──
customElements.define("neo-camera-card-editor", makeNeoEditor([
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entity", label: "Kamera-Entity", selector: { entity: { domain: "camera" } } },
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
], { name: "Neo Kamera", description: "Kamera-Snapshot mit Live über More-Info", icon: "📷" }));

NeoDashboardRegistry.registerCard("neo-camera-card", NeoCameraCard, {
  name: "Neo Kamera",
  description: "Kamera-Snapshot, Live über More-Info",
});

export { NeoCameraCard };
