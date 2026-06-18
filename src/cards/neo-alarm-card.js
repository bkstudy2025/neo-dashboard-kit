// Neo Dashboard Kit — Alarm Card (alarm_control_panel)
// Glas-Kachel: Status + Scharf (Zuhause/Abwesend) bzw. Unscharf als Kern;
// Code-Eingabe / weitere Modi über Tap → More-Info. Folgt dem Sektions-Muster.
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

const STATES = {
  disarmed:        { label: "Unscharf",          accent: "mint",  icon: "unlock" },
  armed_home:      { label: "Scharf · Zuhause",  accent: "amber", icon: "lock" },
  armed_away:      { label: "Scharf · Abwesend", accent: "amber", icon: "lock" },
  armed_night:     { label: "Scharf · Nacht",    accent: "amber", icon: "lock" },
  armed_vacation:  { label: "Scharf · Urlaub",   accent: "amber", icon: "lock" },
  arming:          { label: "Aktiviert …",       accent: "amber", icon: "lock" },
  pending:         { label: "Eingang …",         accent: "amber", icon: "lock" },
  triggered:       { label: "ALARM",             accent: "rose",  icon: "bell" },
};

class NeoAlarmCard extends NeoBaseCard {
  getCardSize() { return 3; }

  _svc(service) {
    const id = this._config?.entity;
    if (!id) return;
    const data = { entity_id: id };
    if (this._config?.code) data.code = String(this._config.code);
    this._callService("alarm_control_panel", service, data);
  }

  render() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const state = s?.state || "unavailable";
    const meta = STATES[state] || { label: state, accent: "blue", icon: "lock" };
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS[meta.accent] || NEO_ACCENTS.blue;
    const name = this._config?.name || a.friendly_name || id || "Alarm";
    const icon = this._config?.icon || meta.icon;
    const armed = state !== "disarmed" && state !== "unavailable";
    const glow = `${acc.c}55`;

    const ctl = (svc, label, primary) => `
      <button data-svc="${svc}" style="flex:1;height:42px;border-radius:12px;cursor:pointer;font-size:13px;font-weight:600;
        display:flex;align-items:center;justify-content:center;
        color:${primary ? "#fff" : "var(--neo-text1,#fff)"};
        background:${primary ? acc.c : "var(--neo-fill2,rgba(255,255,255,.06))"};
        border:1px solid ${primary ? "transparent" : "var(--neo-line2)"};">${label}</button>`;

    const controls = state === "disarmed"
      ? `${ctl("alarm_arm_home", "Zuhause")}${ctl("alarm_arm_away", "Abwesend")}`
      : `${ctl("alarm_disarm", "Unscharf", true)}`;

    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:190px;display:flex;flex-direction:column;cursor:pointer;
        background:${armed ? `linear-gradient(160deg,${glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${armed ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${armed ? `0 18px 40px -16px ${glow}` : "0 18px 40px -16px var(--neo-shadow1)"};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
          <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
            background:${armed ? `linear-gradient(160deg,${acc.c} 0%,${acc.c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
            border:1px solid ${armed ? "rgba(255,255,255,0.25)" : acc.c + "33"};">${neoIcon(icon, { size: 19, color: armed ? "#fff" : acc.c })}</div>
          <span style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px;
            color:${armed ? acc.c : "var(--neo-text2)"};background:${armed ? acc.c + "1f" : "var(--neo-fill2)"};
            border:1px solid ${armed ? acc.c + "55" : "var(--neo-line2)"};">${meta.label}</span>
        </div>
        <div style="margin-top:auto;">
          <div style="font-size:16px;font-weight:600;">${name}</div>
          <div style="display:flex;gap:8px;margin-top:10px;">${controls}</div>
        </div>
      </div>`;
  }

  _bindEvents() {
    const id = this._config?.entity;
    this.shadowRoot.querySelectorAll("[data-svc]").forEach((b) =>
      b.addEventListener("click", (e) => { e.stopPropagation(); this._svc(b.getAttribute("data-svc")); }));
    // Tap auf die Karte → More-Info (Code-Eingabe, weitere Modi); Modul-tapAction hat Vorrang.
    this.shadowRoot.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (id) this._modCtx().moreInfo(id);
    });
  }

  static getConfigElement() { return document.createElement("neo-alarm-card-editor"); }
  static getStubConfig() { return {}; }
}

// ── Editor: geteiltes Sektions-Muster (Allgemein/Darstellung) ──
customElements.define("neo-alarm-card-editor", makeNeoEditor([
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entity", label: "Alarm-Entity", selector: { entity: { domain: "alarm_control_panel" } } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "code", label: "Code (optional, falls erforderlich)", selector: { text: { type: "password" } } },
    ],
  },
  {
    type: "expandable", title: "Darstellung", icon: "mdi:palette",
    schema: [
      { name: "icon", label: "Icon (optional)", selector: { icon: {} } },
      { name: "accent", label: "Akzentfarbe (optional)", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
      NEO_LAYOUT_FIELD,
    ],
  },
], { name: "Neo Alarm", description: "Alarmanlage scharf/unscharf", icon: "🛡️" }));

NeoDashboardRegistry.registerCard("neo-alarm-card", NeoAlarmCard, {
  name: "Neo Alarm",
  description: "Alarmanlage scharf/unscharf",
});

export { NeoAlarmCard };
