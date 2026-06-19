// Neo Dashboard Kit — Shared ha-form editor factory
// HA's <ha-form> needs real JS properties (.schema/.data) — they cannot be
// passed as stringified HTML attributes. This helper creates the element and
// binds properties correctly. meta: { name, description, icon } renders a header.
//
// Labels, Abschnitts-Titel und Select-Optionen werden über i18n nach der
// HA-Sprache übersetzt (Deutsch = Quelle, Englisch = Standard).
import { neoT, neoLang } from "./i18n.js";

// Übersetzt label / title / select-options eines ha-form-Schemas (rekursiv).
function neoTranslateSchema(hass, schema) {
  return schema.map((item) => {
    const out = { ...item };
    if (out.label) out.label = neoT(hass, out.label);
    if (out.title) out.title = neoT(hass, out.title);
    if (Array.isArray(out.schema)) out.schema = neoTranslateSchema(hass, out.schema);
    const sel = out.selector && out.selector.select;
    if (sel && Array.isArray(sel.options)) {
      out.selector = {
        ...out.selector,
        select: {
          ...sel,
          options: sel.options.map((o) =>
            (o && typeof o === "object" && "label" in o) ? { ...o, label: neoT(hass, o.label) } : o),
        },
      };
    }
    return out;
  });
}

export function makeNeoEditor(schema, meta = {}) {
  return class extends HTMLElement {
    setConfig(config) {
      this._config = { ...config };
      if (this._form) this._form.data = this._config;
      else this._build();
    }
    set hass(hass) {
      const langChanged = this._lang !== undefined && this._lang !== neoLang(hass);
      this._hass = hass;
      this._lang = neoLang(hass);
      if (this._form) {
        this._form.hass = hass;
        if (langChanged) this._build(); // Sprache gewechselt → Labels neu übersetzen
      }
    }
    _t(s) { return neoT(this._hass, s); }

    _build() {
      this.innerHTML = ""; // idempotent (auch beim Sprachwechsel-Rebuild)
      // Bubble-style header card
      const header = document.createElement("div");
      header.className = "neo-editor-header";
      header.innerHTML = `
        <style>
          .neo-editor-header {
            display:flex; align-items:center; gap:14px;
            padding:14px 16px; margin-bottom:16px;
            border-radius:16px;
            background:linear-gradient(135deg, rgba(124,156,255,0.18) 0%, rgba(124,156,255,0.04) 100%);
            border:1px solid rgba(124,156,255,0.25);
          }
          .neo-editor-icon {
            width:46px; height:46px; border-radius:13px; flex-shrink:0;
            display:flex; align-items:center; justify-content:center;
            font-size:24px;
            background:linear-gradient(160deg, #7C9CFF 0%, #7C9CFFcc 100%);
            box-shadow:0 4px 14px rgba(124,156,255,0.35);
          }
          .neo-editor-meta-name {
            font-size:16px; font-weight:600;
            color:var(--primary-text-color, #F4F6FB);
          }
          .neo-editor-meta-desc {
            font-size:12.5px; margin-top:2px;
            color:var(--secondary-text-color, rgba(244,246,251,0.72));
          }
        </style>
        <div class="neo-editor-icon">${meta.icon || "✨"}</div>
        <div>
          <div class="neo-editor-meta-name">${this._t(meta.name || "Neo Karte")}</div>
          <div class="neo-editor-meta-desc">${this._t(meta.description || "")}</div>
        </div>
      `;
      this.appendChild(header);

      this._form = document.createElement("ha-form");
      this._form.schema = neoTranslateSchema(this._hass, schema);
      this._form.data = this._config || {};
      if (this._hass) this._form.hass = this._hass;
      this._form.computeLabel = (s) => neoT(this._hass, s.label || s.name);
      this._form.addEventListener("value-changed", (e) => {
        this._config = e.detail.value;
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true, composed: true,
        }));
      });
      this.appendChild(this._form);
    }
  };
}
