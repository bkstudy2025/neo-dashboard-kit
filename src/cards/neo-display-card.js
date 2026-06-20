// Neo Dashboard Kit — Display Card ("Neo Anzeige")
// EINE universelle Anzeige-Karte: erkennt die Domain und zeigt Sensorwert,
// Kamera-Snapshot oder Status. Reine Darstellung; Tap → More-Info.
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

// Anzeige-Typen — gemeinsame Capability-Map für Editor UND Rendering (eine
// Quelle der Wahrheit). mode: "sensor" → Wert-Layout, "camera" → Kamera-Layout.
// domains = erlaubte Entitäts-Domains (Editor-Filter + Mismatch-Reset),
// icon = Default-Icon, unit = ob eine Einheit/Format-Option sinnvoll ist.
const DISPLAY_TYPES = [
  { value: "value",    label: "Sensor / Wert",        domains: ["sensor", "input_number", "number"], icon: "gauge",   mode: "sensor", unit: true },
  { value: "status",   label: "Status",               domains: ["binary_sensor"],                     icon: "info",    mode: "sensor" },
  { value: "battery",  label: "Batterie",             domains: ["sensor"], device_class: "battery",    icon: "battery", mode: "sensor", unit: true },
  { value: "presence", label: "Person / Anwesenheit", domains: ["person", "device_tracker"],          icon: "person",  mode: "sensor" },
  { value: "weather",  label: "Wetter",               domains: ["weather"],                           icon: "partly",  mode: "weather" },
  { value: "calendar", label: "Kalender / Termin",    domains: ["calendar"],                          icon: "calendar", mode: "calendar" },
  { value: "camera",   label: "Kamera",               domains: ["camera"],                            icon: "camera",  mode: "camera" },
];
// Wetter-Zustand → Label + Icon (basic). Pro-Wetter (Vorhersage etc.) ist Premium.
const WEATHER_COND = {
  "sunny": { label: "Sonnig", icon: "sun" },
  "clear-night": { label: "Klar", icon: "moon" },
  "cloudy": { label: "Bewölkt", icon: "cloud" },
  "partlycloudy": { label: "Teils bewölkt", icon: "partly" },
  "rainy": { label: "Regen", icon: "rain" },
  "pouring": { label: "Starkregen", icon: "rain" },
  "snowy": { label: "Schnee", icon: "snow" },
  "snowy-rainy": { label: "Schneeregen", icon: "snow" },
  "windy": { label: "Windig", icon: "wind" },
  "windy-variant": { label: "Windig", icon: "wind" },
  "fog": { label: "Nebel", icon: "fog" },
  "hail": { label: "Hagel", icon: "snow" },
  "lightning": { label: "Gewitter", icon: "storm" },
  "lightning-rainy": { label: "Gewitter", icon: "storm" },
  "exceptional": { label: "Extrem", icon: "warning" },
};
const DISPLAY_TYPE_OPTIONS = DISPLAY_TYPES.map(({ value, label }) => ({ value, label }));
// Entitäts-Domain → Anzeige-Typ (für Legacy-Migration ohne expliziten Typ).
const DISPLAY_TYPE_BY_DOMAIN = {
  sensor: "value", input_number: "value", number: "value",
  binary_sensor: "status", camera: "camera",
  person: "presence", device_tracker: "presence", weather: "weather", calendar: "calendar",
};
const displayTypeDef = (t) => DISPLAY_TYPES.find((x) => x.value === t);
// Effektiver Typ: expliziter display_type, sonst aus der Entitäts-Domain abgeleitet.
export function neoDisplayType(config) {
  if (config?.display_type) return config.display_type;
  const id = config?.entity;
  const d = id ? id.split(".")[0] : "";
  return DISPLAY_TYPE_BY_DOMAIN[d] || "";
}

// Invarianten: Legacy → Typ migrieren; Entität passend zum Typ halten.
function normalizeDisplayConfig(config) {
  const cfg = { ...config };
  if (!cfg.display_type) {
    const id = cfg.entity; const d = id ? id.split(".")[0] : "";
    const t = DISPLAY_TYPE_BY_DOMAIN[d];
    if (t) cfg.display_type = t;
  }
  const t = cfg.display_type;
  if (!t) return cfg;
  const def = displayTypeDef(t);
  const d = cfg.entity ? cfg.entity.split(".")[0] : "";
  if (d && def && !def.domains.includes(d)) delete cfg.entity; // Typ/Entität-Mismatch → zurücksetzen
  return cfg;
}

class NeoDisplayCard extends NeoBaseCard {
  getCardSize() { return this._kind() === "camera" ? 3 : 2; }

  // Render-Art: empty (kein Typ & keine Entität), camera oder sensor.
  _kind() {
    const t = neoDisplayType(this._config);
    if (t) return displayTypeDef(t)?.mode || "sensor";
    return this._config?.entity ? "sensor" : "empty"; // Legacy-Entität ohne Typ bleibt sichtbar
  }
  _typeIcon() { return displayTypeDef(neoDisplayType(this._config))?.icon || "gauge"; }
  _acc() { return NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.mint; }

  render() {
    const k = this._kind();
    if (k === "empty") return this._renderEmpty(); // kein Typ & keine Entität
    if (k === "camera") return this._renderCamera();
    if (k === "weather") return this._renderWeather();
    if (k === "calendar") return this._renderCalendar();
    return this._renderSensor();
  }

  // Neutraler Empty-State: kein Typ gewählt → keine implizite Default-Karte.
  _renderEmpty() {
    const msg = this._t("Wähle einen Anzeige-Typ, um die Vorschau zu starten");
    return `
      <div class="neo-card" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:12px;text-align:center;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px dashed var(--neo-line2);">
        <div style="width:40px;height:40px;border-radius:20px;display:flex;align-items:center;justify-content:center;
          background:var(--neo-fill1);border:1px solid var(--neo-line2);">${neoIcon("gauge", { size: 20, color: "var(--neo-text3)" })}</div>
        <div style="font-size:14px;color:var(--neo-text2);max-width:220px;line-height:1.4;">${msg}</div>
      </div>`;
  }

  _renderSensor() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const value = s?.state ?? "—";
    const unit = this._config?.unit ?? a.unit_of_measurement ?? "";
    const name = this._config?.name || a.friendly_name || id || this._t("Wert");
    const icon = this._config?.icon || this._typeIcon();
    const acc = this._acc();
    const sub = this._config?.sub || "";
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);">
        <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);
          border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 19, color: acc.c })}</div>
        <div style="margin-top:auto;">
          <div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:0.6px;">${name}</div>
          <div style="display:flex;align-items:baseline;gap:3px;margin-top:4px;">
            <span style="font-size:26px;font-weight:500;letter-spacing:-0.5px;">${value}</span>
            <span style="font-size:13px;color:var(--neo-text2);">${unit}</span>
          </div>
          ${sub ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${sub}</div>` : ""}
        </div>
      </div>`;
  }

  _renderWeather() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const meta = WEATHER_COND[s?.state] || { label: s?.state || "—", icon: "cloud" };
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    const unit = this._config?.unit || this._hass?.config?.unit_system?.temperature || "°";
    const temp = a.temperature;
    const name = this._config?.name || a.friendly_name || id || this._t("Wetter");
    const icon = this._config?.icon || meta.icon;
    const sub = this._config?.sub || this._t(meta.label);
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);">
        <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);
          border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 19, color: acc.c })}</div>
        <div style="margin-top:auto;">
          <div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:0.6px;">${name}</div>
          <div style="display:flex;align-items:baseline;gap:3px;margin-top:4px;">
            <span style="font-size:26px;font-weight:500;letter-spacing:-0.5px;">${temp != null ? temp : "—"}</span>
            <span style="font-size:13px;color:var(--neo-text2);">${unit}</span>
          </div>
          ${sub ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${sub}</div>` : ""}
        </div>
      </div>`;
  }

  // Kalender: nächster Termin (Titel + Zeitpunkt). Bewusst keine Agenda/Liste.
  _calWhen(a) {
    const raw = a.start_time;
    if (!raw) return "";
    const d = new Date(String(raw).replace(" ", "T"));
    if (isNaN(d.getTime())) return String(raw);
    const lang = this._hass?.locale?.language || this._hass?.language || "de";
    const date = d.toLocaleDateString(lang, { weekday: "short", day: "2-digit", month: "2-digit" });
    if (a.all_day) return date;
    return `${date} · ${d.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}`;
  }
  _renderCalendar() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.violet;
    const name = this._config?.name || a.friendly_name || id || this._t("Kalender");
    const icon = this._config?.icon || "calendar";
    const title = a.message || this._t("Keine Termine");
    const when = this._calWhen(a);
    return `
      <div class="neo-card" id="card" role="button" style="
        padding:16px;min-height:160px;display:flex;flex-direction:column;cursor:pointer;
        background:linear-gradient(160deg,var(--neo-fill2) 0%,var(--neo-fill0) 100%);
        backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
        border:1px solid var(--neo-line2);">
        <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);
          border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 19, color: acc.c })}</div>
        <div style="margin-top:auto;">
          <div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:0.6px;">${name}</div>
          <div style="font-size:16px;font-weight:600;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title}</div>
          ${when ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${when}</div>` : ""}
        </div>
      </div>`;
  }

  _renderCamera() {
    const id = this._config?.entity;
    const s = this._state(id);
    const a = s?.attributes || {};
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    const name = this._config?.name || a.friendly_name || id || this._t("Kamera");
    const icon = this._config?.icon || "camera";
    const pic = a.entity_picture;
    const image = pic
      ? `<img src="${pic}" alt="${name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />`
      : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
           background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);">${neoIcon(icon, { size: 40, color: acc.c })}</div>`;
    return `
      <div class="neo-card" id="card" role="button" style="
        position:relative;overflow:hidden;min-height:190px;display:flex;cursor:pointer;
        border:1px solid var(--neo-line2);">
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
    this.shadowRoot.getElementById("card")?.addEventListener("click", (e) => {
      if (this._moduleTap(e)) return;
      if (id) this._modCtx().moreInfo(id);
    });
  }

  static getConfigElement() { return document.createElement("neo-display-card-editor"); }
  static getStubConfig() { return {}; }
}

// ── Editor: expliziter Typ-Schritt (Referenzmuster aus neo-control-card) ──
// Flow: Typ wählen → nur passende Entitäten → nur passende Format-Optionen.
// device_type-Pendant hier: `display_type` (eigener Key; `type` ist von Lovelace
// belegt). rebuildKeys + normalizeConfig liefern Empty-State-, Reset- und
// Pruning-Verhalten analog zur Control-Karte.
customElements.define("neo-display-card-editor", makeNeoEditor((config) => {
  const t = neoDisplayType(config);
  const def = displayTypeDef(t);
  const hasLegacyEntity = !!config?.entity;
  const general = [
    { name: "display_type", label: "Typ", selector: { select: { mode: "dropdown", options: DISPLAY_TYPE_OPTIONS } } },
  ];
  if (t || hasLegacyEntity) {
    const entSel = def
      ? { domain: def.domains, ...(def.device_class ? { device_class: def.device_class } : {}) }
      : {}; // Legacy/unbekannte Domain → ungefiltert, bleibt editierbar
    general.push(
      { name: "entity", label: "Entität", selector: { entity: entSel } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
    );
  }

  const appearance = [{ name: "icon", label: "Icon", selector: { icon: {} } }];
  if (def?.unit) appearance.push({ name: "unit", label: "Einheit (optional)", selector: { text: {} } });
  appearance.push(
    { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
    NEO_LAYOUT_FIELD,
  );

  return [
    { type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true, schema: general },
    { type: "expandable", title: "Darstellung", icon: "mdi:palette", schema: appearance },
  ];
}, {
  name: "Neo Anzeige", description: "Sensor · Kamera · Status", icon: "📊",
  rebuildKeys: ["display_type"], normalizeConfig: normalizeDisplayConfig,
}));

NeoDashboardRegistry.registerCard("neo-display-card", NeoDisplayCard, {
  name: "Neo Anzeige",
  description: "Sensorwert, Kamera oder Status — passt sich an die Entität an",
});

export { NeoDisplayCard };
