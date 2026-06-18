// Neo Dashboard Kit — Status Card (horizontal carousel of status pills)
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon, NEO_ICON_OPTIONS } from "../core/icons.js";
import { NEO_LAYOUT_FIELD, normalizeLayout } from "../core/layout.js";
import { neoRenderReorder } from "../core/reorder.js";

const NEO_STATUS_CSS = `
  .neo-pills-wrap { position:relative; }
  .neo-pills-scroll {
    display:flex; gap:8px; overflow-x:auto; scroll-behavior:smooth;
    padding:2px 2px; scrollbar-width:none; -ms-overflow-style:none;
  }
  .neo-pills-scroll::-webkit-scrollbar { display:none; }
  .neo-pill {
    display:flex; align-items:center; gap:8px; flex-shrink:0;
    height:40px; padding:0 16px; border-radius:999px; cursor:pointer;
    background:var(--neo-fill2,rgba(255,255,255,0.055));
    border:1px solid var(--neo-line2,rgba(255,255,255,0.08));
    font-size:14px; font-weight:600; color:var(--neo-text1,#F4F6FB);
    letter-spacing:-0.1px; white-space:nowrap;
    transition:transform .12s, background .2s; }
  .neo-pill svg { flex-shrink:0; }
  .neo-pill:active { transform:scale(0.95); }
  .neo-pills-arrow {
    position:absolute; top:50%; transform:translateY(-50%);
    width:28px; height:28px; border-radius:14px; z-index:2; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    background:var(--neo-fill2,rgba(255,255,255,0.08));
    border:1px solid var(--neo-line3,rgba(255,255,255,0.10));
    backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
    opacity:0; pointer-events:none; transition:opacity .2s; }
  .neo-pills-arrow.left { left:-2px; }
  .neo-pills-arrow.right { right:-2px; }
`;

class NeoStatusCard extends NeoBaseCard {
  getCardSize() { return 1; }

  _pills() {
    if (Array.isArray(this._config?.pills)) return this._config.pills.filter(Boolean);
    const out = [];
    for (let i = 1; i <= 8; i++) {
      const p = this._config?.[`pill${i}`];
      if (p && p.show !== false && (p.icon || p.entity || p.name)) out.push(p);
    }
    return out;
  }

  _pillText(p) {
    if (p.name) return p.name;
    const st = this._state(p.entity);
    if (!st) return "—";
    const unit = st.attributes?.unit_of_measurement;
    return unit ? `${st.state} ${unit}` : st.state;
  }

  render() {
    const pills = this._pills();
    const html = pills.map((p, i) => {
      const acc = NEO_ACCENTS[p.accent] || NEO_ACCENTS.blue;
      const text = this._pillText(p);
      const icon = p.icon ? neoIcon(p.icon, { size: 16, color: acc.c }) : "";
      return `<div class="neo-pill" data-i="${i}" ${p.entity ? `data-entity="${p.entity}"` : ""}>
        ${icon}<span>${text}</span>
      </div>`;
    }).join("");

    return `
      <style>${NEO_STATUS_CSS}</style>
      <div style="font-family:var(--neo-font,system-ui);padding:0 6px;">
        <div class="neo-pills-wrap">
          <button id="pills-left" class="neo-pills-arrow left">${neoIcon("chevL", { size: 16, color: "var(--neo-text1)" })}</button>
          <div id="pills-scroll" class="neo-pills-scroll">${html}</div>
          <button id="pills-right" class="neo-pills-arrow right">${neoIcon("chevR", { size: 16, color: "var(--neo-text1)" })}</button>
        </div>
      </div>`;
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: true, composed: true, detail: { entityId },
    }));
  }

  _bindEvents() {
    const scroller = this.shadowRoot.getElementById("pills-scroll");
    const left = this.shadowRoot.getElementById("pills-left");
    const right = this.shadowRoot.getElementById("pills-right");
    if (!scroller) return;

    const update = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const x = scroller.scrollLeft;
      this._scroll = x;
      const show = (btn, on) => {
        if (!btn) return;
        btn.style.opacity = on ? "1" : "0";
        btn.style.pointerEvents = on ? "auto" : "none";
      };
      show(left, x > 4);
      show(right, x < max - 4);
    };

    scroller.addEventListener("scroll", update);
    left?.addEventListener("click", () => scroller.scrollBy({ left: -scroller.clientWidth * 0.8, behavior: "smooth" }));
    right?.addEventListener("click", () => scroller.scrollBy({ left: scroller.clientWidth * 0.8, behavior: "smooth" }));

    // Restore scroll position across re-renders
    if (this._scroll) scroller.scrollLeft = this._scroll;
    requestAnimationFrame(update);

    this.shadowRoot.querySelectorAll("[data-entity]").forEach((el) => {
      el.addEventListener("click", () => this._moreInfo(el.getAttribute("data-entity")));
    });
  }

  static getConfigElement() { return document.createElement("neo-status-card-editor"); }
  static getStubConfig() {
    return { pills: [{ icon: "shieldOk", name: "Armed", accent: "mint" }] };
  }
}

// ── Status editor — one HA-managed ha-form with a dynamic slot count ──
// All inputs are native ha-form (reliable). The list grows automatically:
// there is always one empty "Neue Pill" slot; fill it to add another.
// Set a pill's icon to "— (keine)" and clear its text to remove it.
const NEO_PILL_ICON_OPTIONS = [{ value: "none", label: "— (keine / entfernen)" }, ...NEO_ICON_OPTIONS];
const NEO_PILL_FIELDS = [
  { name: "icon", label: "Icon", selector: { select: { mode: "dropdown", options: NEO_PILL_ICON_OPTIONS } } },
  { name: "name", label: "Text (leer = Entity-Status)", selector: { text: {} } },
  { name: "entity", label: "Entity (optional)", selector: { entity: {} } },
  { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
];

class NeoStatusCardEditor extends HTMLElement {
  setConfig(config) {
    // Editor owns the model; ignore HA's config echoes after first build.
    if (this._form) { this._config = { ...config }; return; }
    this._config = { ...config };
    this._pills = this._extract(config);
    this._build();
  }
  set hass(h) { this._hass = h; if (this._form) this._form.hass = h; }

  _extract(config) {
    if (Array.isArray(config.pills)) return config.pills.filter(Boolean).map((p) => ({ ...p }));
    const out = [];
    for (let i = 1; i <= 30; i++) {
      const p = config[`pill${i}`];
      if (this._present(p)) out.push({ ...p });
    }
    return out;
  }
  _present(p) { return !!(p && ((p.icon && p.icon !== "none") || p.name || p.entity)); }

  _schema() {
    const slots = this._pills.length + 1; // trailing empty slot = add
    const arr = [NEO_LAYOUT_FIELD];
    for (let i = 0; i < slots; i++) {
      const last = i === this._pills.length;
      const p = this._pills[i] || {};
      const title = last ? "➕ Neue Pill" : `${i + 1}. ${p.name || p.entity || "Pill"}`;
      arr.push({ type: "expandable", name: `p${i}`, title, schema: NEO_PILL_FIELDS });
    }
    return arr;
  }
  _data() {
    const d = { layout: normalizeLayout(this._config.layout) };
    this._pills.forEach((p, i) => (d[`p${i}`] = p));
    d[`p${this._pills.length}`] = {};
    return d;
  }

  _build() {
    this.innerHTML = "";
    const header = document.createElement("div");
    header.innerHTML = `
      <style>
        .neo-ed-head { display:flex; align-items:center; gap:14px; padding:14px 16px; margin-bottom:14px;
          border-radius:16px; background:linear-gradient(135deg, rgba(124,156,255,0.18), rgba(124,156,255,0.04));
          border:1px solid rgba(124,156,255,0.25); }
        .neo-ed-ic { width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;
          font-size:24px;background:linear-gradient(160deg,#7C9CFF,#7C9CFFcc);box-shadow:0 4px 14px rgba(124,156,255,.35); }
      </style>
      <div class="neo-ed-head">
        <div class="neo-ed-ic">🏷️</div>
        <div>
          <div style="font-size:16px;font-weight:600;color:var(--primary-text-color)">Neo Status-Leiste</div>
          <div style="font-size:12.5px;color:var(--secondary-text-color)">Leeren Slot füllen = neue Pill · Icon „—" = entfernen</div>
        </div>
      </div>`;
    this.appendChild(header);

    // Reihenfolge ändern (▲ ▼ 🗑)
    this._reorderEl = document.createElement("div");
    this.appendChild(this._reorderEl);
    this._renderReorder();

    this._form = document.createElement("ha-form");
    this._form.schema = this._schema();
    this._form.data = this._data();
    if (this._hass) this._form.hass = this._hass;
    this._form.computeLabel = (s) => s.label || s.name;
    this._form.addEventListener("value-changed", (e) => this._onChange(e));
    this.appendChild(this._form);
  }

  _renderReorder() {
    if (!this._reorderEl) return;
    neoRenderReorder(this._reorderEl, this._pills,
      (p, i) => p.name || p.entity || `Pill ${i + 1}`,
      (next) => {
        this._pills = next;
        this._form.schema = this._schema();
        this._form.data = this._data();
        this._renderReorder();
        this._fire();
      });
  }

  _onChange(e) {
    e.stopPropagation();
    const v = e.detail.value || {};
    const next = [];
    for (let i = 0; i <= this._pills.length; i++) {
      const p = v[`p${i}`];
      if (this._present(p)) next.push(p);
    }
    const countChanged = next.length !== this._pills.length;
    this._pills = next;
    this._config.layout = normalizeLayout(v.layout);
    if (countChanged) this._form.schema = this._schema(); // grow / shrink slots
    this._form.data = this._data();
    this._renderReorder();
    this._fire();
  }

  _fire() {
    const out = { ...this._config };
    for (let i = 1; i <= 30; i++) delete out[`pill${i}`]; // drop legacy keys
    out.pills = this._pills;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: out }, bubbles: true, composed: true,
    }));
  }
}

customElements.define("neo-status-card-editor", NeoStatusCardEditor);
// Vorübergehend versteckt, bis auf das neue Sektions-Muster umgebaut.
// hidden → nicht im Picker, rendert aber bestehende Dashboards weiter.
NeoDashboardRegistry.registerCard("neo-status-card", NeoStatusCard, {
  name: "Neo Status-Leiste",
  description: "Scrollbare Status-Pills mit Pfeilen",
  hidden: true,
});
