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
import { escapeAttr, escapeHtml } from "../core/html.js";
import {
  isUnavailable, supportsBrightness,
  supportsFanPercentage, supportsFanPreset, supportsFanOscillate, supportsFanDirection,
  supportsCoverPosition, supportsCoverTilt,
  supportsClimateTemperature, supportsClimateHvacModes, supportsClimatePresetModes,
  supportsClimateFanModes, supportsClimateSwingModes, supportsClimateHumidity,
  supportsMediaVolume, supportsMediaMute, supportsMediaSource,
} from "../core/capabilities.js";

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
// Cover device_class → Icon + Label (kompakt; nur sinnvolle Fälle).
const COVER_DEVICE = {
  blind: { icon: "blinds", label: "Jalousie" }, shutter: { icon: "blinds", label: "Rollladen" },
  curtain: { icon: "blinds", label: "Vorhang" }, garage: { icon: "garage", label: "Garage" },
  door: { icon: "door", label: "Tür" }, gate: { icon: "gate", label: "Tor" },
  window: { icon: "window", label: "Fenster" }, awning: { icon: "blinds", label: "Markise" },
  shade: { icon: "blinds", label: "Rollo" },
};
const HVAC_LABEL = { off: "Aus", heat: "Heizen", cool: "Kühlen", auto: "Auto", heat_cool: "Auto", dry: "Entfeuchten", fan_only: "Lüften" };

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
      border:1px solid ${active ? acc.c + "55" : "var(--neo-line2)"};">${escapeHtml(text)}</span>`;
  }
  _title(name, sub, extra) {
    return `<div style="font-size:16px;font-weight:600;">${escapeHtml(name)}</div>
      ${sub ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${escapeHtml(sub)}</div>` : ""}${extra || ""}`;
  }
  // Option mit Default (fehlt der Key → Default; explizit false bleibt false).
  _opt(name, def) { const v = this._config?.[name]; return v == null ? def : v; }

  _slider(idAttr, acc, pct, label, min = 1) {
    const n = Number(pct) || 0;
    const v = Math.max(min, Math.min(100, n));
    return `<div style="margin-top:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--neo-text3);">
        <span>${escapeHtml(label)}</span><span style="font-weight:600;">${escapeHtml(Math.round(n))}%</span></div>
      <input type="range" id="${idAttr}" min="${min}" max="100" value="${v}" style="
        width:100%;height:26px;border-radius:9px;-webkit-appearance:none;appearance:none;cursor:pointer;
        background:linear-gradient(90deg,${acc.c}cc 0%,${acc.c} ${n}%,var(--neo-line2) ${n}%);
        border:1px solid var(--neo-line1);" /></div>`;
  }
  // Kompakte Auswahl-Chips. `list` = String[] ODER {value,label}[]. `current`
  // markiert den aktiven Chip. data-Attribut = `data-${attr}` (für bindEvents).
  _chips(attr, list, current, acc, label) {
    const arr = (Array.isArray(list) ? list : [])
      .map((x) => (x && typeof x === "object") ? x : { value: x, label: x })
      .filter((x) => x.value != null);
    if (!arr.length) return "";
    const items = arr.map((o) => {
      const on = String(o.value) === String(current);
      return `<button data-${attr}="${escapeAttr(o.value)}" style="padding:6px 11px;border-radius:999px;font-size:12px;cursor:pointer;white-space:nowrap;
        color:${on ? "#fff" : "var(--neo-text2)"};background:${on ? acc.c : "var(--neo-fill2)"};
        border:1px solid ${on ? "transparent" : "var(--neo-line2)"};">${escapeHtml(o.label)}</button>`;
    }).join("");
    return `<div style="margin-top:8px;">
      ${label ? `<div style="font-size:12px;color:var(--neo-text3);margin-bottom:6px;">${escapeHtml(label)}</div>` : ""}
      <div style="display:flex;flex-wrap:wrap;gap:6px;">${items}</div></div>`;
  }
  // Kleiner, kompakter (Toggle-)Button mit Icon + Label.
  _miniBtn(attr, val, icon, label, active, acc) {
    return `<button data-${attr}="${escapeAttr(val)}" title="${escapeAttr(label)}" style="flex:1;height:38px;border-radius:11px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;
      color:${active ? "#fff" : "var(--neo-text2)"};background:${active ? acc.c : "var(--neo-fill2)"};
      border:1px solid ${active ? "transparent" : "var(--neo-line2)"};">${neoIcon(icon, { size: 15, color: active ? "#fff" : "currentColor" })}<span>${escapeHtml(label)}</span></button>`;
  }
  _flatBtn(attr, val, label, acc, primary) {
    return `<button ${attr}="${val}" style="flex:1;height:42px;border-radius:12px;cursor:pointer;font-size:13px;font-weight:600;
      display:flex;align-items:center;justify-content:center;color:#fff;
      background:${primary ? acc.c : "var(--neo-fill2,rgba(255,255,255,.06))"};
      border:1px solid ${primary ? "transparent" : "var(--neo-line2)"};">${escapeHtml(label)}</button>`;
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
        <div style="font-size:14px;color:var(--neo-text2);max-width:220px;line-height:1.4;">${escapeHtml(msg)}</div>
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
    const unavail = isUnavailable(s);
    const on = s?.state === "on";
    const acc = this._acc();
    const isLight = d === "light";
    const showToggle = this._opt("show_toggle", true);
    const dimmable = isLight && supportsBrightness(s);
    const showBri = isLight && this._opt("show_brightness", true) && dimmable && on && !unavail;
    let pct = 0;
    if (dimmable && on) pct = s?.attributes?.brightness != null ? Math.round((s.attributes.brightness / 255) * 100) : 0;
    let sub;
    if (unavail) sub = this._config?.sub ?? this._t("Nicht verfügbar");
    else if (dimmable) sub = this._config?.sub ?? (on ? `${pct}%` : this._t("Aus"));
    else sub = this._config?.sub ?? (on ? this._t("An") : this._t("Aus"));
    const right = unavail ? this._badge(acc, false, "—") : (showToggle ? this._toggleEl(acc, on) : "");
    const body = this._title(this._name(s, "Schalter"), sub, showBri ? this._slider("bri", acc, pct, this._t("Helligkeit")) : "");
    return this._shell(acc, on && !unavail, right, this._icon(d), body, isLight ? 180 : 160);
  }

  _renderLock() {
    const id = this._config?.entity;
    const s = this._state(id);
    const unavail = isUnavailable(s);
    const locked = s?.state === "locked";
    const acc = NEO_ACCENTS[this._config?.accent] || (locked ? NEO_ACCENTS.mint : NEO_ACCENTS.amber);
    const showToggle = this._opt("show_toggle", true);
    const sub = unavail ? (this._config?.sub ?? this._t("Nicht verfügbar"))
      : (this._config?.sub ?? (locked ? this._t("Verriegelt") : this._t("Entriegelt")));
    const right = unavail ? this._badge(acc, false, "—")
      : (showToggle ? this._toggleEl(acc, locked) : this._badge(acc, true, locked ? "🔒" : "🔓"));
    const body = this._title(this._name(s, "Schloss"), sub);
    return this._shell(acc, locked && !unavail, right, this._config?.icon || (locked ? "lock" : "unlock"), body);
  }

  _renderFan() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const unavail = isUnavailable(s);
    const on = s?.state === "on";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint;
    const showToggle = this._opt("show_toggle", true);
    const pctSupported = supportsFanPercentage(s);
    const pct = typeof a.percentage === "number" ? a.percentage : (on ? 100 : 0);
    const sub = unavail ? (this._config?.sub ?? this._t("Nicht verfügbar"))
      : (this._config?.sub ?? (on ? (pctSupported ? `${pct}%` : this._t("An")) : this._t("Aus")));
    let extra = "";
    if (on && !unavail) {
      if (this._opt("show_percentage", true) && pctSupported) extra += this._slider("pct", acc, pct, this._t("Stufe"));
      if (this._opt("show_fan_presets", true) && supportsFanPreset(s))
        extra += this._chips("fan-preset", a.preset_modes, a.preset_mode, acc, this._t("Voreinstellung"));
      const btns = [];
      if (this._opt("show_fan_oscillate", true) && supportsFanOscillate(s))
        btns.push(this._miniBtn("fan-osc", "toggle", "wind", this._t("Oszillation"), !!a.oscillating, acc));
      if (this._opt("show_fan_direction", true) && supportsFanDirection(s))
        btns.push(this._miniBtn("fan-dir", "toggle", "refresh", this._t("Richtung"), a.direction === "reverse", acc));
      if (btns.length) extra += `<div style="display:flex;gap:8px;margin-top:8px;">${btns.join("")}</div>`;
    }
    const right = unavail ? this._badge(acc, false, "—") : (showToggle ? this._toggleEl(acc, on) : "");
    const body = this._title(this._name(s, "Ventilator"), sub, extra);
    return this._shell(acc, on && !unavail, right, this._icon("fan"), body, 180);
  }

  _renderCover() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const unavail = isUnavailable(s);
    const state = s?.state || "unavailable";
    const acc = this._acc();
    const dc = COVER_DEVICE[a.device_class] || {};
    const pos = typeof a.current_position === "number" ? a.current_position : null;
    const active = !unavail && (state === "open" || state === "opening" || (pos != null && pos > 0));
    const right = this._badge(acc, false, unavail ? "—"
      : (pos != null ? `${pos}${this._t("% offen")}` : this._t(COVER_LABEL[state] || state)));
    let body = "";
    if (!unavail) {
      if (this._opt("show_cover_controls", true)) {
        body += `<div style="display:flex;gap:8px;margin-top:10px;">
          ${this._iconBtnTxt("up", "▲", this._t("Öffnen"))}${this._iconBtnTxt("stop", "■", this._t("Stopp"))}${this._iconBtnTxt("down", "▼", this._t("Schließen"))}</div>`;
      }
      if (this._opt("show_cover_position", true) && supportsCoverPosition(s))
        body += this._slider("cover-pos", acc, pos != null ? pos : 0, this._t("Position"), 0);
      if (this._opt("show_cover_tilt", true) && supportsCoverTilt(s)) {
        const tilt = typeof a.current_tilt_position === "number" ? a.current_tilt_position : 0;
        body += this._slider("cover-tilt", acc, tilt, this._t("Neigung"), 0);
      }
    }
    const name = this._config?.name || a.friendly_name || this._t(dc.label || "Rollladen");
    return this._shell(acc, active, right, this._config?.icon || dc.icon || "blinds", this._title(name, "", body), 200);
  }
  _iconBtnTxt(val, glyph, title) {
    return `<button data-cover="${val}" title="${escapeAttr(title)}" style="flex:1;height:42px;border-radius:12px;cursor:pointer;font-size:16px;
      display:flex;align-items:center;justify-content:center;color:var(--neo-text1,#fff);
      background:var(--neo-fill2,rgba(255,255,255,.06));border:1px solid var(--neo-line2);">${escapeHtml(glyph)}</button>`;
  }

  _renderClimate() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const unavail = isUnavailable(s);
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const unit = this._hass?.config?.unit_system?.temperature || "°";
    const target = a.temperature;
    const action = a.hvac_action;
    const mode = s?.state || "off";
    const actCol = action === "cooling" ? NEO_ACCENTS.blue.c : action === "heating" ? NEO_ACCENTS.amber.c : acc.c;
    const active = !unavail && ((action && action !== "idle" && action !== "off") || (!action && mode !== "off"));
    const accE = { c: actCol, glow: actCol + "55" };
    const badge = unavail ? "—" : this._t(action ? ({ heating: "Heizt", cooling: "Kühlt", drying: "Entfeuchtet", fan: "Lüftet", idle: "Bereit", off: "Aus" }[action] || action)
      : (HVAC_LABEL[mode] || mode));
    const cur = a.current_temperature;
    let body = "";
    if (!unavail) {
      if (this._opt("show_temperature_controls", true) && supportsClimateTemperature(s)) {
        body += `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px;">
          ${this._iconBtn("data-temp", "dec", "minus", accE)}
          <div style="display:flex;align-items:baseline;gap:2px;"><span style="font-size:32px;font-weight:500;letter-spacing:-1px;">${escapeHtml(target != null ? target : "—")}</span><span style="font-size:15px;color:var(--neo-text2);">${escapeHtml(unit)}</span></div>
          ${this._iconBtn("data-temp", "inc", "plus", accE)}
        </div>`;
      }
      if (cur != null) body += `<div style="font-size:12px;color:var(--neo-text3);margin-top:8px;text-align:center;">${escapeHtml(this._t("Aktuell"))} ${escapeHtml(cur)}${escapeHtml(unit)}</div>`;
      if (this._opt("show_hvac_modes", true) && supportsClimateHvacModes(s))
        body += this._chips("hvac", a.hvac_modes.map((m) => ({ value: m, label: this._t(HVAC_LABEL[m] || m) })), mode, accE, this._t("Modus"));
      if (this._opt("show_climate_presets", true) && supportsClimatePresetModes(s))
        body += this._chips("climate-preset", a.preset_modes, a.preset_mode, accE, this._t("Voreinstellung"));
      if (this._opt("show_climate_fan_modes", false) && supportsClimateFanModes(s))
        body += this._chips("climate-fan", a.fan_modes, a.fan_mode, accE, this._t("Lüftung"));
      if (this._opt("show_climate_swing_modes", false) && supportsClimateSwingModes(s))
        body += this._chips("climate-swing", a.swing_modes, a.swing_mode, accE, this._t("Schwenken"));
      if (this._opt("show_humidity", false) && supportsClimateHumidity(s) && typeof a.humidity === "number")
        body += this._slider("climate-hum", accE, a.humidity, this._t("Luftfeuchte"), 0);
    }
    return this._shell(accE, active, this._badge(accE, active, badge), this._icon("climate"), this._title(this._name(s, "Klima"), "", body), 200);
  }

  _renderMedia() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const unavail = isUnavailable(s);
    const state = s?.state || "unavailable";
    const playing = state === "playing";
    const active = !unavail && (playing || state === "paused" || state === "buffering");
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.violet;
    const title = a.media_title || "";
    const artist = a.media_artist || a.app_name || "";
    const name = this._name(s, "Media");
    const line2 = title ? (artist || name) : this._t(MEDIA_LABEL[state] || state);
    let body = `<div style="font-size:16px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(title || name)}</div>
      ${line2 ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(line2)}</div>` : ""}`;
    if (!unavail) {
      const power = this._opt("show_media_power", false) ? this._iconBtn("data-media", "__power", "power", acc) : "";
      if (this._opt("show_media_controls", true)) {
        body += `<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-top:12px;">
          ${this._iconBtn("data-media", "media_previous_track", "prev", acc)}
          ${this._iconBtn("data-media", "media_play_pause", playing ? "pause" : "play", acc)}
          ${this._iconBtn("data-media", "media_next_track", "next", acc)}${power}</div>`;
      } else if (power) {
        body += `<div style="display:flex;justify-content:center;margin-top:12px;">${power}</div>`;
      }
      if (this._opt("show_volume", true) && supportsMediaVolume(s)) {
        const vol = typeof a.volume_level === "number" ? Math.round(a.volume_level * 100) : 0;
        body += this._slider("media-vol", acc, vol, this._t("Lautstärke"), 0);
      }
      if (this._opt("show_mute", true) && supportsMediaMute(s)) {
        body += `<div style="display:flex;gap:8px;margin-top:8px;">${this._miniBtn("media-mute", "toggle", "volume", this._t("Stumm"), !!a.is_volume_muted, acc)}</div>`;
      }
      if (this._opt("show_source", false) && supportsMediaSource(s))
        body += this._chips("media-source", a.source_list, a.source, acc, this._t("Quelle"));
    }
    return this._shell(acc, active, this._badge(acc, false, unavail ? "—" : this._t(MEDIA_LABEL[state] || state)), this._icon("media_player"), body, 200);
  }

  _renderAlarm() {
    const id = this._config?.entity;
    const s = this._state(id);
    const unavail = isUnavailable(s);
    const state = s?.state || "unavailable";
    const meta = ALARM_STATES[state] || { label: state, accent: "blue", icon: "lock" };
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS[meta.accent] || NEO_ACCENTS.blue;
    const armed = state !== "disarmed" && !unavail;
    let body = this._title(this._name(s, "Alarm"), "");
    if (!unavail && this._opt("show_alarm_controls", true)) {
      const controls = state === "disarmed"
        ? `${this._flatBtn("data-alarm", "alarm_arm_home", this._t("Zuhause"), acc)}${this._flatBtn("data-alarm", "alarm_arm_away", this._t("Abwesend"), acc)}`
        : `${this._flatBtn("data-alarm", "alarm_disarm", this._t("Unscharf"), acc, true)}`;
      body = this._title(this._name(s, "Alarm"), "", `<div style="display:flex;gap:8px;margin-top:10px;">${controls}</div>`);
    }
    return this._shell(acc, armed, this._badge(acc, armed, unavail ? "—" : this._t(meta.label)), this._config?.icon || meta.icon, body, 190);
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
    let total = 0, onCount = 0, briSum = 0, briN = 0, dimmable = false;
    ids.forEach((id) => {
      const s = this._state(id);
      if (isUnavailable(s)) return; // nicht verfügbare Entitäten ignorieren
      total++;
      if (s?.state === "on") {
        onCount++;
        if (supportsBrightness(s)) { dimmable = true; const b = s.attributes?.brightness; if (typeof b === "number") { briSum += b; briN++; } }
      }
    });
    const bri = briN ? Math.round((briSum / briN / 255) * 100) : 0;
    const on = onCount > 0;
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.amber;
    const showToggle = this._opt("show_toggle", true);
    const showBri = this._opt("show_brightness", true) && dimmable && on;
    const sub = this._config?.sub ?? `${onCount}/${total} ${this._t("an")}`;
    const body = this._title(this._config?.name || this._t("Licht-Gruppe"), sub, showBri ? this._slider("bri", acc, bri, this._t("Helligkeit")) : "");
    return this._shell(acc, on, showToggle ? this._toggleEl(acc, on) : "", this._config?.icon || "lightbulb", body);
  }

  // ── Events ────────────────────────────────────────────────
  _bindEvents() {
    const d = this._domain();
    const id = this._config?.entity;
    const sr = this.shadowRoot;
    const a = this._state(id)?.attributes || {};

    // Primärer Toggle (light/switch/fan/lock/lightgroup).
    sr.getElementById("toggle")?.addEventListener("click", (e) => { e.stopPropagation(); this._primaryToggle(d); });

    // Helligkeit (Licht / Licht-Gruppe).
    sr.getElementById("bri")?.addEventListener("change", (e) => {
      e.stopPropagation();
      const ids = d === "lightgroup" ? (this._config.entities || []).filter(Boolean) : id;
      if (ids) this._callService("light", "turn_on", { entity_id: ids, brightness_pct: +e.target.value });
    });

    // Ventilator: Stufe / Voreinstellung / Oszillation / Richtung.
    sr.getElementById("pct")?.addEventListener("change", (e) => { e.stopPropagation(); if (id) this._callService("fan", "set_percentage", { entity_id: id, percentage: +e.target.value }); });
    sr.querySelectorAll("[data-fan-preset]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("fan", "set_preset_mode", { entity_id: id, preset_mode: b.getAttribute("data-fan-preset") }); }));
    sr.querySelector("[data-fan-osc]")?.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("fan", "oscillate", { entity_id: id, oscillating: !a.oscillating }); });
    sr.querySelector("[data-fan-dir]")?.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("fan", "set_direction", { entity_id: id, direction: a.direction === "reverse" ? "forward" : "reverse" }); });

    // Cover: Auf/Stopp/Zu + Position + Neigung.
    sr.querySelectorAll("[data-cover]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("cover", { up: "open_cover", stop: "stop_cover", down: "close_cover" }[b.getAttribute("data-cover")], { entity_id: id }); }));
    sr.getElementById("cover-pos")?.addEventListener("change", (e) => { e.stopPropagation(); if (id) this._callService("cover", "set_cover_position", { entity_id: id, position: +e.target.value }); });
    sr.getElementById("cover-tilt")?.addEventListener("change", (e) => { e.stopPropagation(); if (id) this._callService("cover", "set_cover_tilt_position", { entity_id: id, tilt_position: +e.target.value }); });

    // Klima: Temperatur + Modi/Voreinstellungen/Lüftung/Schwenken/Luftfeuchte.
    sr.querySelectorAll("[data-temp]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); this._stepTemp(b.getAttribute("data-temp") === "inc" ? 1 : -1); }));
    sr.querySelectorAll("[data-hvac]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("climate", "set_hvac_mode", { entity_id: id, hvac_mode: b.getAttribute("data-hvac") }); }));
    sr.querySelectorAll("[data-climate-preset]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("climate", "set_preset_mode", { entity_id: id, preset_mode: b.getAttribute("data-climate-preset") }); }));
    sr.querySelectorAll("[data-climate-fan]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("climate", "set_fan_mode", { entity_id: id, fan_mode: b.getAttribute("data-climate-fan") }); }));
    sr.querySelectorAll("[data-climate-swing]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("climate", "set_swing_mode", { entity_id: id, swing_mode: b.getAttribute("data-climate-swing") }); }));
    sr.getElementById("climate-hum")?.addEventListener("change", (e) => { e.stopPropagation(); if (id) this._callService("climate", "set_humidity", { entity_id: id, humidity: +e.target.value }); });

    // Media: Transport + Volume + Mute + Quelle + Power.
    sr.querySelectorAll("[data-media]").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation(); if (!id) return;
      const v = b.getAttribute("data-media");
      if (v === "__power") { const st = this._state(id)?.state; this._callService("media_player", (st === "off" || st === "standby") ? "turn_on" : "turn_off", { entity_id: id }); }
      else this._callService("media_player", v, { entity_id: id });
    }));
    sr.getElementById("media-vol")?.addEventListener("change", (e) => { e.stopPropagation(); if (id) this._callService("media_player", "volume_set", { entity_id: id, volume_level: (+e.target.value) / 100 }); });
    sr.querySelector("[data-media-mute]")?.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("media_player", "volume_mute", { entity_id: id, is_volume_muted: !a.is_volume_muted }); });
    sr.querySelectorAll("[data-media-source]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (id) this._callService("media_player", "select_source", { entity_id: id, source: b.getAttribute("data-media-source") }); }));

    // Alarm.
    sr.querySelectorAll("[data-alarm]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); this._alarm(b.getAttribute("data-alarm")); }));

    // Karten-Aktionen (tap/hold/double_tap) + Modul-Tap + Domain-Defaults.
    this._bindCardActions(sr.getElementById("card"), {
      entity: id,
      toggle: () => this._primaryToggle(d),
      tapDefault: () => this._controlTapDefault(d, id),
    });
  }

  // Standard-Tap je Domain (greift nur, wenn keine eigene tap_action gesetzt ist).
  _controlTapDefault(d, id) {
    if (d === "scene") this._callService("scene", "turn_on", { entity_id: id });
    else if (d === "button") this._callService("button", "press", { entity_id: id });
    else if (d === "script") id?.startsWith("script.") ? this._callService("script", "turn_on", { entity_id: id }) : this._callService("script", id, {});
    else if (d === "lightgroup") this._primaryToggle(d);
    else if (id) this._modCtx().moreInfo(id);
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
// Sichtbarkeits-Schalter (capability-aware): steuern, welche Controls gerendert
// werden. Default = an, außer wo unten explizit `false`. Aktionen (tap/hold/
// double_tap) werden bewusst per YAML konfiguriert (siehe Doku).
const bool = (name, label) => ({ name, label, selector: { boolean: {} } });
const CONTROL_SPEC = {
  typeKey: "device_type", typeLabel: "Typ", entityLabel: "Entität (Gerät)",
  actions: true, // Aktionen-Abschnitt (tap/hold/double_tap) im Editor
  types: [
    { value: "light", label: "Licht", domains: ["light"],
      defaults: { show_toggle: true, show_brightness: true },
      fields: [bool("show_toggle", "Schalter anzeigen"), bool("show_brightness", "Helligkeit anzeigen")] },
    { value: "switch", label: "Schalter", domains: ["switch", "input_boolean"],
      defaults: { show_toggle: true },
      fields: [bool("show_toggle", "Schalter anzeigen")] },
    { value: "climate", label: "Klima", domains: ["climate"],
      defaults: { show_temperature_controls: true, show_hvac_modes: true, show_climate_presets: true },
      fields: [
        { name: "step", label: "Temperaturschritt (optional)", selector: { number: { min: 0.1, max: 5, step: 0.1, mode: "box" } } },
        bool("show_temperature_controls", "Temperatur-Steuerung anzeigen"),
        bool("show_hvac_modes", "Modi anzeigen"), bool("show_climate_presets", "Voreinstellungen anzeigen"),
        bool("show_climate_fan_modes", "Lüftungsstufen anzeigen"), bool("show_climate_swing_modes", "Schwenken anzeigen"),
        bool("show_humidity", "Luftfeuchte anzeigen"),
      ] },
    { value: "cover", label: "Cover", domains: ["cover"],
      defaults: { show_cover_controls: true, show_cover_position: true, show_cover_tilt: true },
      fields: [bool("show_cover_controls", "Auf/Stopp/Zu anzeigen"), bool("show_cover_position", "Position anzeigen"), bool("show_cover_tilt", "Neigung anzeigen")] },
    { value: "fan", label: "Ventilator", domains: ["fan"],
      defaults: { show_toggle: true, show_percentage: true, show_fan_presets: true, show_fan_oscillate: true, show_fan_direction: true },
      fields: [bool("show_toggle", "Schalter anzeigen"), bool("show_percentage", "Stufe anzeigen"), bool("show_fan_presets", "Voreinstellungen anzeigen"), bool("show_fan_oscillate", "Oszillation anzeigen"), bool("show_fan_direction", "Richtung anzeigen")] },
    { value: "media_player", label: "Media", domains: ["media_player"],
      defaults: { show_media_controls: true, show_volume: true, show_mute: true },
      fields: [bool("show_media_controls", "Transport anzeigen"), bool("show_volume", "Lautstärke anzeigen"), bool("show_mute", "Stumm anzeigen"), bool("show_source", "Quelle anzeigen"), bool("show_media_power", "Power anzeigen")] },
    { value: "lock", label: "Schloss", domains: ["lock"],
      defaults: { show_toggle: true },
      fields: [bool("show_toggle", "Schalter anzeigen")] },
    { value: "alarm_control_panel", label: "Alarm", domains: ["alarm_control_panel"],
      defaults: { show_alarm_controls: true },
      fields: [{ name: "code", label: "Code (optional, falls erforderlich)", selector: { text: {} } }, bool("show_alarm_controls", "Bedienelemente anzeigen")] },
    { value: "action", label: "Szene / Skript / Taster", domains: ["scene", "script", "button"] },
    { value: "lightgroup", label: "Licht-Gruppe", domains: ["light"], multi: true, entityLabel: "Lichter",
      defaults: { show_toggle: true, show_brightness: true },
      fields: [bool("show_toggle", "Schalter anzeigen"), bool("show_brightness", "Helligkeit anzeigen")] },
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
