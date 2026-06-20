// Neo Dashboard Kit — Control Card ("Neo Steuerung")
// EINE universelle Steuerungs-Karte: erkennt die Domain der gewählten Entität
// und zeigt automatisch die passende Bedienung (Toggle, +/-, Auf/Stopp/Zu,
// Transport, Scharf/Unscharf …). So bleibt der Picker kurz; alles Weitere
// kommt über Module. Aufgebaut mit einem gemeinsamen Shell-Helper, nach
// Domain gegliedert.
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoTypedEditor } from "../core/capability.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

const DEFAULT_ICON = {
  light: "lightbulb", switch: "toggle", input_boolean: "toggle", fan: "fan",
  cover: "blinds", climate: "thermo", media_player: "speaker", lock: "lock",
  scene: "scenes", script: "robot", button: "robot", lightgroup: "lightbulb",
};

// device_type → Render-Domain (nur die abweichenden Fälle; die übrigen Typ-Werte
// sind bereits identisch mit der Render-Domain). Für die Typ-Vorschau ohne Entität.
const DEVICE_TYPE_DOMAIN = { action: "scene", lightgroup: "lightgroup" };

// Domain-Ableitung — einzige Quelle der Wahrheit für Render UND Editor.
// Reihenfolge: mehrere Entitäten ⇒ Licht-Gruppe; echte Entität gewinnt; sonst
// fällt die Vorschau auf den gewählten Typ (device_type) zurück, damit die
// Live-Vorschau sofort zum Typ passt – auch wenn noch keine Entität gewählt ist.
export function neoControlDomain(config) {
  if (Array.isArray(config?.entities) && config.entities.length) return "lightgroup";
  const id = config?.entity;
  if (id) return id.split(".")[0];
  const dt = config?.device_type;
  return dt ? (DEVICE_TYPE_DOMAIN[dt] || dt) : "";
}
const ALARM_STATES = {
  disarmed: { label: "Unscharf", accent: "mint", icon: "unlock" },
  armed_home: { label: "Scharf · Zuhause", accent: "amber", icon: "lock" },
  armed_away: { label: "Scharf · Abwesend", accent: "amber", icon: "lock" },
  armed_night: { label: "Scharf · Nacht", accent: "amber", icon: "lock" },
  armed_vacation: { label: "Scharf · Urlaub", accent: "amber", icon: "lock" },
  arming: { label: "Aktiviert …", accent: "amber", icon: "lock" },
  pending: { label: "Eingang …", accent: "amber", icon: "lock" },
  triggered: { label: "ALARM", accent: "rose", icon: "bell" },
};
const MEDIA_LABEL = { playing: "Spielt", paused: "Pausiert", idle: "Bereit", off: "Aus", standby: "Standby", buffering: "Puffert", unavailable: "—" };
const COVER_LABEL = { open: "Offen", closed: "Geschlossen", opening: "Öffnet", closing: "Schließt", unavailable: "—" };

class NeoControlCard extends NeoBaseCard {
  getCardSize() { return this._domain() === "media_player" ? 3 : 2; }

  _domain() { return neoControlDomain(this._config); }
  _acc() { return NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue; }
  _name(s, fallback) { return this._config?.name || s?.attributes?.friendly_name || this._config?.entity || this._t(fallback); }

  // ── gemeinsame Bausteine ───────────────────────────────────
  _shell(acc, active, headerRight, icon, body, minH) {
    const glow = `${acc.c}55`;
    const iconBg = active ? `linear-gradient(160deg,${acc.c} 0%,${acc.c}cc 100%)` : `linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%)`;
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:${minH || 160}px;display:flex;flex-direction:column;cursor:pointer;
        background:${active ? `linear-gradient(160deg,${glow} 0%,var(--neo-fill1) 60%,var(--neo-fill0) 100%)` : "linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%)"};
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid ${active ? "var(--neo-line6)" : "var(--neo-line2)"};
        --neo-glow:0 18px 40px -16px ${active ? glow : "var(--neo-shadow1)"};
        --neo-glow-m:0 8px 22px -14px ${active ? glow : "var(--neo-shadow1)"};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
          <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
            background:${iconBg};border:1px solid ${active ? "rgba(255,255,255,0.25)" : acc.c + "33"};">${neoIcon(icon, { size: 19, color: active ? "#fff" : acc.c })}</div>
          ${headerRight || ""}
        </div>
        <div style="margin-top:auto;">${body}</div>
      </div>`;
  }
  _toggleEl(acc, on) {
    return `<div id="toggle" style="width:36px;height:22px;border-radius:11px;padding:2px;flex-shrink:0;
      background:${on ? acc.c : "var(--neo-line5)"};transition:background 200ms;cursor:pointer;">
      <div style="width:18px;height:18px;border-radius:9px;background:#fff;transform:translateX(${on ? "14px" : "0px"});
        transition:transform 220ms cubic-bezier(.2,.8,.2,1);box-shadow:0 1px 2px rgba(0,0,0,0.3);"></div></div>`;
  }
  _badge(acc, active, text) {
    return `<span style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px;
      color:${active ? acc.c : "var(--neo-text2)"};background:${active ? acc.c + "1f" : "var(--neo-fill2)"};
      border:1px solid ${active ? acc.c + "55" : "var(--neo-line2)"};">${text}</span>`;
  }
  _title(name, sub, extra) {
    return `<div style="font-size:16px;font-weight:600;">${name}</div>
      ${sub ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${sub}</div>` : ""}${extra || ""}`;
  }
  _slider(idAttr, acc, pct, label) {
    return `<div style="margin-top:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--neo-text3);">
        <span>${label}</span><span style="font-weight:600;">${pct}%</span></div>
      <input type="range" id="${idAttr}" min="1" max="100" value="${pct || 1}" style="
        width:100%;height:26px;border-radius:9px;-webkit-appearance:none;appearance:none;cursor:pointer;
        background:linear-gradient(90deg,${acc.c}cc 0%,${acc.c} ${pct}%,var(--neo-line2) ${pct}%);
        border:1px solid var(--neo-line1);" /></div>`;
  }
  _flatBtn(attr, val, label, acc, primary) {
    return `<button ${attr}="${val}" style="flex:1;height:42px;border-radius:12px;cursor:pointer;font-size:13px;font-weight:600;
      display:flex;align-items:center;justify-content:center;color:#fff;
      background:${primary ? acc.c : "var(--neo-fill2,rgba(255,255,255,.06))"};
      border:1px solid ${primary ? "transparent" : "var(--neo-line2)"};">${label}</button>`;
  }
  _iconBtn(attr, val, sym, acc) {
    return `<button ${attr}="${val}" style="width:44px;height:44px;flex-shrink:0;border-radius:22px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;color:var(--neo-text1,#fff);
      background:var(--neo-fill2,rgba(255,255,255,.06));border:1px solid var(--neo-line2);">${neoIcon(sym, { size: 18, color: "currentColor" })}</button>`;
  }

  _icon(d, fb) { return this._config?.icon || DEFAULT_ICON[d] || fb || "dot"; }

  // Neutraler Empty-State: kein Typ gewählt (und keine Entität) → keine
  // implizite Schalter-/Default-Karte, sondern eine Aufforderung.
  _renderEmpty() {
    const msg = this._t("Wähle einen Gerätetyp, um die Vorschau zu starten");
    return `
      <div class="neo-card" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:12px;text-align:center;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px dashed var(--neo-line2);">
        <div style="width:40px;height:40px;border-radius:20px;display:flex;align-items:center;justify-content:center;
          background:var(--neo-fill1);border:1px solid var(--neo-line2);">${neoIcon("plus", { size: 20, color: "var(--neo-text3)" })}</div>
        <div style="font-size:14px;color:var(--neo-text2);max-width:220px;line-height:1.4;">${msg}</div>
      </div>`;
  }

  // ── Render-Dispatch ────────────────────────────────────────
  render() {
    const d = this._domain();
    if (!d) return this._renderEmpty(); // kein Typ & keine Entität
    switch (d) {
      case "fan": return this._renderFan();
      case "cover": return this._renderCover();
      case "climate": return this._renderClimate();
      case "media_player": return this._renderMedia();
      case "alarm_control_panel": return this._renderAlarm();
      case "lock": return this._renderLock();
      case "scene": case "script": case "button": return this._renderAction(d);
      case "lightgroup": return this._renderLightGroup();
      default: return this._renderToggle(d); // light/switch/input_boolean/…
    }
  }

  // light / switch / input_boolean
  _renderToggle(d) {
    const id = this._config?.entity;
    const s = this._state(id);
    const on = s?.state === "on";
    const acc = this._acc();
    const isLight = d === "light";
    let pct = 0;
    if (isLight && on) pct = s?.attributes?.brightness ? Math.round((s.attributes.brightness / 255) * 100) : 0;
    const sub = this._config?.sub ?? (on ? (isLight ? `${pct}%` : this._t("An")) : this._t("Aus"));
    const body = this._title(this._name(s, "Schalter"), sub, isLight && on ? this._slider("bri", acc, pct, this._t("Helligkeit")) : "");
    return this._shell(acc, on, this._toggleEl(acc, on), this._icon(d), body, isLight ? 180 : 160);
  }

  _renderLock() {
    const id = this._config?.entity;
    const s = this._state(id);
    const locked = s?.state === "locked";
    const acc = NEO_ACCENTS[this._config?.accent] || (locked ? NEO_ACCENTS.mint : NEO_ACCENTS.amber);
    const sub = this._config?.sub ?? (locked ? this._t("Verriegelt") : this._t("Entriegelt"));
    const right = this._badge(acc, true, locked ? "🔒" : "🔓");
    const body = this._title(this._name(s, "Schloss"), sub);
    return this._shell(acc, locked, right, this._config?.icon || (locked ? "lock" : "unlock"), body);
  }

  _renderFan() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const on = s?.state === "on";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint;
    const pct = typeof a.percentage === "number" ? a.percentage : (on ? 100 : 0);
    const sub = this._config?.sub ?? (on ? `${pct}%` : this._t("Aus"));
    const body = this._title(this._name(s, "Ventilator"), sub, on ? this._slider("pct", acc, pct, this._t("Stufe")) : "");
    return this._shell(acc, on, this._toggleEl(acc, on), this._icon("fan"), body, 180);
  }

  _renderCover() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const state = s?.state || "unavailable";
    const acc = this._acc();
    const pos = typeof a.current_position === "number" ? a.current_position : null;
    const active = state === "open" || state === "opening" || (pos != null && pos > 0);
    const right = this._badge(acc, false, pos != null ? `${pos}${this._t("% offen")}` : this._t(COVER_LABEL[state] || state));
    const row = `<div style="display:flex;gap:8px;margin-top:10px;">
      ${this._iconBtnTxt("up", "▲", this._t("Öffnen"))}${this._iconBtnTxt("stop", "■", this._t("Stopp"))}${this._iconBtnTxt("down", "▼", this._t("Schließen"))}</div>`;
    return this._shell(acc, active, right, this._icon("cover"), this._title(this._name(s, "Rollladen"), "", row), 200);
  }
  _iconBtnTxt(val, glyph, title) {
    return `<button data-cover="${val}" title="${title}" style="flex:1;height:42px;border-radius:12px;cursor:pointer;font-size:16px;
      display:flex;align-items:center;justify-content:center;color:var(--neo-text1,#fff);
      background:var(--neo-fill2,rgba(255,255,255,.06));border:1px solid var(--neo-line2);">${glyph}</button>`;
  }

  _renderClimate() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const unit = this._hass?.config?.unit_system?.temperature || "°";
    const target = a.temperature;
    const action = a.hvac_action;
    const mode = s?.state || "off";
    const actCol = action === "cooling" ? NEO_ACCENTS.blue.c : action === "heating" ? NEO_ACCENTS.amber.c : acc.c;
    const active = (action && action !== "idle" && action !== "off") || (!action && mode !== "off" && mode !== "unavailable");
    const accE = { c: actCol, glow: actCol + "55" };
    const badge = this._t(action ? ({ heating: "Heizt", cooling: "Kühlt", drying: "Entfeuchtet", fan: "Lüftet", idle: "Bereit", off: "Aus" }[action] || action)
      : ({ heat: "Heizen", cool: "Kühlen", auto: "Auto", heat_cool: "Auto", off: "Aus" }[mode] || mode));
    const cur = a.current_temperature;
    const row = `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px;">
        ${this._iconBtn("data-temp", "dec", "minus", accE)}
        <div style="display:flex;align-items:baseline;gap:2px;"><span style="font-size:32px;font-weight:500;letter-spacing:-1px;">${target != null ? target : "—"}</span><span style="font-size:15px;color:var(--neo-text2);">${unit}</span></div>
        ${this._iconBtn("data-temp", "inc", "plus", accE)}
      </div>${cur != null ? `<div style="font-size:12px;color:var(--neo-text3);margin-top:8px;text-align:center;">${this._t("Aktuell")} ${cur}${unit}</div>` : ""}`;
    return this._shell(accE, active, this._badge(accE, active, badge), this._icon("climate"), this._title(this._name(s, "Klima"), "", row), 200);
  }

  _renderMedia() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const state = s?.state || "unavailable";
    const playing = state === "playing";
    const active = playing || state === "paused" || state === "buffering";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.violet;
    const title = a.media_title || "";
    const artist = a.media_artist || a.app_name || "";
    const name = this._name(s, "Media");
    const line2 = title ? (artist || name) : this._t(MEDIA_LABEL[state] || state);
    const transport = `<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-top:12px;">
        ${this._iconBtn("data-media", "media_previous_track", "prev", acc)}
        ${this._iconBtn("data-media", "media_play_pause", playing ? "pause" : "play", acc)}
        ${this._iconBtn("data-media", "media_next_track", "next", acc)}</div>`;
    const body = `<div style="font-size:16px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title || name}</div>
      ${line2 ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${line2}</div>` : ""}${transport}`;
    return this._shell(acc, active, this._badge(acc, false, this._t(MEDIA_LABEL[state] || state)), this._icon("media_player"), body, 200);
  }

  _renderAlarm() {
    const id = this._config?.entity;
    const s = this._state(id);
    const state = s?.state || "unavailable";
    const meta = ALARM_STATES[state] || { label: state, accent: "blue", icon: "lock" };
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS[meta.accent] || NEO_ACCENTS.blue;
    const armed = state !== "disarmed" && state !== "unavailable";
    const controls = state === "disarmed"
      ? `${this._flatBtn("data-alarm", "alarm_arm_home", this._t("Zuhause"), acc)}${this._flatBtn("data-alarm", "alarm_arm_away", this._t("Abwesend"), acc)}`
      : `${this._flatBtn("data-alarm", "alarm_disarm", this._t("Unscharf"), acc, true)}`;
    const row = `<div style="display:flex;gap:8px;margin-top:10px;">${controls}</div>`;
    return this._shell(acc, armed, this._badge(acc, armed, this._t(meta.label)), this._config?.icon || meta.icon, this._title(this._name(s, "Alarm"), "", row), 190);
  }

  _renderAction(d) {
    const id = this._config?.entity;
    const s = this._state(id);
    const acc = this._acc();
    const sub = this._config?.sub ?? this._t(d === "scene" ? "Szene" : d === "button" ? "Taster" : "Skript");
    return this._shell(acc, false, "", this._icon(d), this._title(this._name(s, "Aktion"), sub), 160);
  }

  _renderLightGroup() {
    const ids = (this._config.entities || []).filter(Boolean); // Typ-Vorschau ohne Entitäten
    let onCount = 0, briSum = 0, briN = 0;
    ids.forEach((id) => { const s = this._state(id); if (s?.state === "on") { onCount++; const b = s.attributes?.brightness; if (typeof b === "number") { briSum += b; briN++; } } });
    const bri = briN ? Math.round((briSum / briN / 255) * 100) : 0;
    const on = onCount > 0;
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const sub = this._config?.sub ?? `${onCount}/${ids.length} ${this._t("an")}`;
    const body = this._title(this._config?.name || this._t("Licht-Gruppe"), sub, on ? this._slider("bri", acc, bri, this._t("Helligkeit")) : "");
    return this._shell(acc, on, this._toggleEl(acc, on), this._config?.icon || "lightbulb", body);
  }

  // ── Events ────────────────────────────────────────────────
  _bindEvents() {
    const d = this._domain();
    const id = this._config?.entity;
    const sr = this.shadowRoot;

    sr.getElementById("toggle")?.addEventListener("click", (e) => { e.stopPropagation(); this._primaryToggle(d); });
    sr.getElementById("bri")?.addEventListener("change", (e) => {
      const ids = d === "lightgroup" ? (this._config.entities || []).filter(Boolean) : id;
      if (ids) this._callService("light", "turn_on", { entity_id: ids, brightness_pct: +e.target.value });
    });
    sr.getElementById("pct")?.addEventListener("change", (e) => { if (id) this._callService("fan", "set_percentage", { entity_id: id, percentage: +e.target.value }); });
    sr.querySelectorAll("[data-cover]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("cover", { up: "open_cover", stop: "stop_cover", down: "close_cover" }[b.getAttribute("data-cover")], { entity_id: id }); }));
    sr.querySelectorAll("[data-temp]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); this._stepTemp(b.getAttribute("data-temp") === "inc" ? 1 : -1); }));
    sr.querySelectorAll("[data-media]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("media_player", b.getAttribute("data-media"), { entity_id: id }); }));
    sr.querySelectorAll("[data-alarm]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); this._alarm(b.getAttribute("data-alarm")); }));

    sr.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (d === "scene") this._callService("scene", "turn_on", { entity_id: id });
      else if (d === "button") this._callService("button", "press", { entity_id: id });
      else if (d === "script") id?.startsWith("script.") ? this._callService("script", "turn_on", { entity_id: id }) : this._callService("script", id, {});
      else if (d === "lightgroup") this._primaryToggle(d);
      else if (id) this._modCtx().moreInfo(id);
    });
  }

  _primaryToggle(d) {
    const id = this._config?.entity;
    if (d === "lightgroup") {
      const ids = (this._config.entities || []).filter(Boolean);
      const anyOn = ids.some((x) => this._state(x)?.state === "on");
      if (ids.length) this._callService("light", anyOn ? "turn_off" : "turn_on", { entity_id: ids });
      return;
    }
    if (!id) return;
    const s = this._state(id);
    if (d === "lock") { this._callService("lock", s?.state === "locked" ? "unlock" : "lock", { entity_id: id }); return; }
    if (d === "fan") { this._callService("fan", s?.state === "on" ? "turn_off" : "turn_on", { entity_id: id }); return; }
    const domain = d === "light" ? "light" : (id.split(".")[0] || "homeassistant");
    this._callService(domain, s?.state === "on" ? "turn_off" : "turn_on", { entity_id: id });
  }
  _stepTemp(dir) {
    const id = this._config?.entity;
    const a = this._state(id)?.attributes || {};
    const step = this._config?.step || a.target_temp_step || 0.5;
    if (a.temperature == null) return;
    let v = Math.round((a.temperature + dir * step) * 10) / 10;
    if (a.min_temp != null) v = Math.max(a.min_temp, v);
    if (a.max_temp != null) v = Math.min(a.max_temp, v);
    this._callService("climate", "set_temperature", { entity_id: id, temperature: v });
  }
  _alarm(service) {
    const id = this._config?.entity;
    if (!id) return;
    const data = { entity_id: id };
    if (this._config?.code) data.code = String(this._config.code);
    this._callService("alarm_control_panel", service, data);
  }

  static getConfigElement() { return document.createElement("neo-control-card-editor"); }
  static getStubConfig() { return {}; }
}

// ── Editor: aus Capability-Spec generiert (wie Display) ──────────────────────
// Typ-Schritt, gefilterter Picker, Multi-Entity (Licht-Gruppe), Empty-State,
// Mismatch-Reset & Pruning kommen aus makeNeoTypedEditor — die Karte liefert nur
// das Spec. Eigener Key `device_type` (`type` ist von Lovelace belegt). Das
// Rendering bleibt entitäts-domain-basiert (neoControlDomain), unverändert.
const CONTROL_SPEC = {
  typeKey: "device_type", typeLabel: "Typ", entityLabel: "Entität (Gerät)",
  types: [
    { value: "light", label: "Licht", domains: ["light"] },
    { value: "switch", label: "Schalter", domains: ["switch", "input_boolean"] },
    { value: "climate", label: "Klima", domains: ["climate"],
      fields: [{ name: "step", label: "Temperaturschritt (optional)", selector: { number: { min: 0.1, max: 5, step: 0.1, mode: "box" } } }] },
    { value: "cover", label: "Cover", domains: ["cover"] },
    { value: "fan", label: "Ventilator", domains: ["fan"] },
    { value: "media_player", label: "Media", domains: ["media_player"] },
    { value: "lock", label: "Schloss", domains: ["lock"] },
    { value: "alarm_control_panel", label: "Alarm", domains: ["alarm_control_panel"],
      fields: [{ name: "code", label: "Code (optional, falls erforderlich)", selector: { text: {} } }] },
    { value: "action", label: "Szene / Skript / Taster", domains: ["scene", "script", "button"] },
    { value: "lightgroup", label: "Licht-Gruppe", domains: ["light"], multi: true, entityLabel: "Lichter" },
  ],
  appearance: [
    { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
    NEO_LAYOUT_FIELD,
  ],
};

customElements.define("neo-control-card-editor", makeNeoTypedEditor(CONTROL_SPEC, {
  name: "Neo Steuerung", description: "Eine Karte für alle Geräte — passt sich an", icon: "🎛️",
}));

NeoDashboardRegistry.registerCard("neo-control-card", NeoControlCard, {
  name: "Neo Steuerung",
  description: "Eine Karte für alle Geräte — passt sich automatisch an die Entität an",
});

export { NeoControlCard };
