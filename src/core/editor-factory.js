// Neo Dashboard Kit — Shared ha-form editor factory
// HA's <ha-form> needs real JS properties (.schema/.data) — they
// cannot be passed as stringified HTML attributes. This helper
// creates the element and binds properties correctly.
// meta: { name, description, icon } renders a Bubble-style header.

export function makeNeoEditor(schema, meta = {}) {
  return class extends HTMLElement {
    setConfig(config) {
      this._config = { ...config };
      if (this._form) this._form.data = this._config;
      else this._build();
    }
    set hass(hass) {
      this._hass = hass;
      if (this._form) this._form.hass = hass;
    }
    _build() {
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
          <div class="neo-editor-meta-name">${meta.name || "Neo Karte"}</div>
          <div class="neo-editor-meta-desc">${meta.description || ""}</div>
        </div>
      `;
      this.appendChild(header);

      this._form = document.createElement("ha-form");
      this._form.schema = schema;
      this._form.data = this._config || {};
      if (this._hass) this._form.hass = this._hass;
      this._form.computeLabel = (s) => s.label || s.name;
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
