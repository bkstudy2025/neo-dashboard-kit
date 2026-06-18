// Neo Dashboard Kit — Media Player Card
// Glas-Kachel mit Transport (⏮ ⏯ ⏭) als Kern-Steuerung; Quelle, Lautstärke
// & Details über Tap → More-Info. Folgt dem Sektions-Muster.
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

const STATE_LABEL = {
  playing: "Spielt", paused: "Pausiert", idle: "Bereit", off: "Aus",
  standby: "Standby", buffering: "Puffert", unavailable: "—",
};

class NeoMediaCard extends NeoBaseCard {
  getCardSize() { return 3; }

  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.violet;
    const state = s?.state || "unavailable";
    const playing = state === "playing";
    const active = playing || state === "paused" || state === "buffering";
    const glow = `${acc.c}55`;

    const name = this._config?.name || a.friendly_name || id || "Media";
    const icon = this._config?.icon || "speaker";
    const title = a.media_title || "";
    const artist = a.media_artist || a.app_name || "";
    const line2 = title ? (artist || name) : (STATE_LABEL[state] || state);

    const ctl = (which, sym, title2) => `
      <button id="${which}" title="${title2}" style="width:44px;height:44px;flex-shrink:0;border-radius:22px;cursor:pointer;
        display:flex;align-items:center;justify-content:center;color:var(--neo-text1,#fff);
        background:var(--neo-fill2,rgba(255,255,255,.06));border:1px solid var(--neo-line2);">
        ${neoIcon(sym, { size: 18, color: "currentColor" })}</button>`;

    const playSym = playing ? "pause" : "play";

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
            color:var(--neo-text2);background:var(--neo-fill2);border:1px solid var(--neo-line2);">${STATE_LABEL[state] || state}</span>
        </div>
        <div style="margin-top:auto;min-width:0;">
          <div style="font-size:16px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title || name}</div>
          ${line2 ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${line2}</div>` : ""}
          <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-top:12px;">
            ${ctl("prev", "prev", "Zurück")}
            ${ctl("play", playSym, "Play/Pause")}
            ${ctl("next", "next", "Weiter")}
          </div>
        </div>
      </div>`;
  }

  _bindEvents() {
    const id = this._config?.entity;
    const svc = (service) => (e) => { e.stopPropagation(); if (id) this._callService("media_player", service, { entity_id: id }); };
    this.shadowRoot.getElementById("prev")?.addEventListener("click", svc("media_previous_track"));
    this.shadowRoot.getElementById("play")?.addEventListener("click", svc("media_play_pause"));
    this.shadowRoot.getElementById("next")?.addEventListener("click", svc("media_next_track"));
    // Tap auf die Karte → More-Info; Modul-tapAction hat Vorrang.
    this.shadowRoot.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (id) this._modCtx().moreInfo(id);
    });
  }

  static getConfigElement() { return document.createElement("neo-media-card-editor"); }
  static getStubConfig() { return {}; }
}

// ── Editor: geteiltes Sektions-Muster (Allgemein/Darstellung) ──
customElements.define("neo-media-card-editor", makeNeoEditor([
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entity", label: "Media-Player-Entity", selector: { entity: { domain: "media_player" } } },
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
], { name: "Neo Media", description: "Media-Player mit Transport", icon: "🎵" }));

NeoDashboardRegistry.registerCard("neo-media-card", NeoMediaCard, {
  name: "Neo Media",
  description: "Media-Player mit Transport",
});

export { NeoMediaCard };
