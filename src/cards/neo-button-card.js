// Neo Dashboard Kit — Button Card (universal)
// Vereint Schalter / Licht+Slider / Szene / Skript / Aktion in EINER Karte
// (BubbleCard-Stil). Ersetzt die früheren Einzelkarten light/scene/quick-action.
// Der Editor nutzt das geteilte Sektions-Muster (Allgemein/Darstellung/Aktion).
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

const BUTTON_TYPES = [
  { value: "switch", label: "Schalter (Toggle)" },
  { value: "light",  label: "Licht (mit Helligkeit)" },
  { value: "scene",  label: "Szene" },
  { value: "script", label: "Skript" },
  { value: "action", label: "Aktion (Tap-Aktion)" },
];

// Standard-Icon je Button-Typ, falls keins gesetzt ist.
const DEFAULT_ICON = { switch: "toggle", light: "lightbulb", scene: "sparkle", script: "robot", action: "sparkle" };

class NeoButtonCard extends NeoBaseCard {
  getCardSize() { return this._type() === "light" ? 3 : 2; }

  _type() { return this._config?.button_type || "switch"; }

  // "Aktiv" = farbiger Glow-Zustand der Kachel.
  _isActive(s) {
    switch (this._type()) {
      case "scene":  return false;            // Szenen sind zustandslos
      case "action": return false;
      default:       return s?.state === "on"; // switch/light/script
    }
  }

  _hasToggle() { return this._type() === "switch" || this._type() === "light"; }

  render() {
    const type = this._type();
    const id = this._config?.entity;
    const s = this._state(id);
    const on = this._isActive(s);
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    const icon = this._config?.icon || DEFAULT_ICON[type] || "dot";
    const name = this._config?.name || s?.attributes?.friendly_name || id || "Button";

    // Licht: echte RGB-Farbe + Helligkeit
    let color = acc.c, bri = 0;
    if (type === "light" && on) {
      color = s?.attributes?.rgb_color ? `rgb(${s.attributes.rgb_color})` : acc.c;
      bri = s?.attributes?.brightness ? Math.round((s.attributes.brightness / 255) * 100) : 0;
    }
    const glow = `${color}55`;

    const sub = this._config?.sub ?? (type === "switch" ? (on ? "An" : "Aus") : "");

    const toggleHtml = this._hasToggle() ? `
      <div id="toggle" style="width:36px;height:22px;border-radius:11px;padding:2px;flex-shrink:0;
        background:${on ? acc.c : "var(--neo-line5)"};transition:background 200ms;cursor:pointer;">
        <div style="width:18px;height:18px;border-radius:9px;background:#fff;
          transform:translateX(${on ? "14px" : "0px"});
          transition:transform 220ms cubic-bezier(.2,.8,.2,1);box-shadow:0 1px 2px rgba(0,0,0,0.3);"></div>
      </div>` : "";

    const sliderHtml = (type === "light") ? `
      <div style="margin-top:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--neo-text3);">
          <span>Helligkeit</span><span style="font-weight:600;">${on ? bri : 0}%</span>
        </div>
        <input type="range" id="bri" min="1" max="100" value="${on ? bri : 1}" style="
          width:100%;height:26px;border-radius:9px;-webkit-appearance:none;appearance:none;cursor:pointer;
          background:linear-gradient(90deg,${color}cc 0%,${color} ${on ? bri : 0}%,var(--neo-line2) ${on ? bri : 0}%);
          border:1px solid var(--neo-line1);" />
      </div>` : "";

    const minH = type === "light" ? 180 : 160;

    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:${minH}px;display:flex;flex-direction:column;cursor:pointer;
        background:${on ? `linear-gradient(160deg,${glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${on ? "var(--neo-line6)" : "var(--neo-line2)"};
        box-shadow:${on ? `0 18px 40px -16px ${glow}` : "0 18px 40px -16px var(--neo-shadow1)"};
      ">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
          <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
            background:${on ? `linear-gradient(160deg,${color} 0%,${color}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`};
            border:1px solid ${on ? "rgba(255,255,255,0.25)" : acc.c + "33"};
            box-shadow:${on ? `0 4px 14px ${glow}` : "none"};">${neoIcon(icon, { size: 19, color: on ? "#fff" : acc.c })}</div>
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
    const type = this._type();
    const id = this._config?.entity;
    const s = this._state(id);
    const on = this._isActive(s);

    // Toggle-Schalter (nur switch/light)
    this.shadowRoot.getElementById("toggle")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggleEntity(id, on, type);
    });

    // Helligkeits-Slider (nur light)
    this.shadowRoot.getElementById("bri")?.addEventListener("change", (e) => {
      this._callService("light", "turn_on", { entity_id: id, brightness: Math.round((+e.target.value / 100) * 255) });
    });

    // Tap auf die Karte
    this.shadowRoot.getElementById("card")?.addEventListener("click", () => this._onTap(id, on, type));
  }

  _toggleEntity(id, on, type) {
    if (!id) return;
    const domain = type === "light" ? "light" : (id.split(".")[0] || "homeassistant");
    this._callService(domain, on ? "turn_off" : "turn_on", { entity_id: id });
  }

  _onTap(id, on, type) {
    // Konfigurierte Tap-Aktion hat Vorrang (außer "default").
    const ta = this._config?.tap_action;
    if (ta && ta.action && ta.action !== "default") return this._runAction(ta);

    // Standardverhalten je Typ
    switch (type) {
      case "scene":  this._callService("scene", "turn_on", { entity_id: id }); break;
      case "script": id?.startsWith("script.")
        ? this._callService("script", "turn_on", { entity_id: id })
        : this._callService("script", id, {}); break;
      case "action": /* nur konfigurierte Aktion */ break;
      default:       this._toggleEntity(id, on, type); // switch/light
    }
  }

  // Führt eine HA-ui_action aus (navigate/url/more-info/toggle/perform-action/none).
  _runAction(a) {
    const entity = a.entity || this._config?.entity;
    switch (a.action) {
      case "navigate":
        if (a.navigation_path) {
          history.pushState(null, "", a.navigation_path);
          window.dispatchEvent(new CustomEvent("location-changed"));
        }
        break;
      case "url":
        if (a.url_path) window.open(a.url_path, "_blank");
        break;
      case "toggle":
        if (entity) this._callService(entity.split(".")[0], "toggle", { entity_id: entity });
        break;
      case "more-info":
        if (entity) this.dispatchEvent(new CustomEvent("hass-more-info", {
          bubbles: true, composed: true, detail: { entityId: entity },
        }));
        break;
      case "perform-action":
      case "call-service": {
        const svc = a.perform_action || a.service;
        if (svc && svc.includes(".")) {
          const [domain, service] = svc.split(".");
          this._callService(domain, service, { ...(a.data || a.service_data || {}), ...(a.target || {}) });
        }
        break;
      }
      default: /* none */ break;
    }
  }

  static getConfigElement() { return document.createElement("neo-button-card-editor"); }
  static getStubConfig() { return { button_type: "switch", entity: "switch.living_room", accent: "blue" }; }
}

// ── Editor: geteiltes Sektions-Muster (Allgemein/Darstellung/Aktion) ──
// expandable OHNE name → die Felder bleiben flach in der Config (kein Nesting).
customElements.define("neo-button-card-editor", makeNeoEditor([
  { name: "button_type", label: "Button-Typ", selector: { select: { mode: "dropdown", options: BUTTON_TYPES } } },
  {
    type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true,
    schema: [
      { name: "entity", label: "Entity", selector: { entity: {} } },
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
  {
    type: "expandable", title: "Aktion", icon: "mdi:gesture-tap",
    schema: [
      { name: "tap_action", label: "Tap-Aktion", selector: { ui_action: {} } },
      { name: "hold_action", label: "Hold-Aktion", selector: { ui_action: {} } },
    ],
  },
], { name: "Neo Button", description: "Schalter · Licht · Szene · Skript · Aktion", icon: "⚡" }));

NeoDashboardRegistry.registerCard("neo-button-card", NeoButtonCard, {
  name: "Neo Button",
  description: "Universelle Tasten-/Kachel-Karte",
});

export { NeoButtonCard };
