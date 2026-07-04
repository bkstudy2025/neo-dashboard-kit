// Neo Dashboard Kit — Icon-Selector für Editoren (ha-form-kompatibel)
//
// Ein Icon-Feld, das BEIDES kann:
//   1. den nativen HA-Icon-Picker einbetten (mdi:, hue: und alle registrierten
//      Sets — mit Suche und Grafik-Vorschau), und
//   2. die mitgelieferten Neo-Icons als aufklappbares Raster mit ECHTER
//      SVG-Vorschau anbieten (der native Picker kennt sie nicht, weil HAs
//      Custom-Icon-API nur gefüllte Einzel-Pfade unterstützt — die Neo-Icons
//      sind stroke-basierte Mehrfach-Shapes).
//
// Einbindung über HAs Selector-Mechanismus: ha-form rendert für den Selector
// { neo_icon: {} } das Element `ha-selector-neo_icon` und setzt hass/label/
// value als Properties; Änderungen melden wir als `value-changed` zurück —
// exakt wie native Selectors. Wertformat bleibt kompatibel: Neo-Namen ohne
// Präfix ("search"), HA-Icons mit Präfix ("mdi:sofa").
import { neoIcon, NEO_ICON_OPTIONS } from "./icons.js";
import { neoT } from "./i18n.js";
import { escapeAttr } from "./html.js";

const NEO_NAMES = new Set(NEO_ICON_OPTIONS.map((o) => o.value));

class NeoIconSelectorField extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._value = "";
  }

  // ── Properties, die ha-form/dynamicElement setzt ─────────────
  set hass(h) { this._hass = h; if (this._sel) this._sel.hass = h; }
  get hass() { return this._hass; }
  set selector(s) { this._selectorCfg = s; }
  get selector() { return this._selectorCfg; }
  set label(l) { this._labelTxt = l; if (this._sel) this._sel.label = l; }
  get label() { return this._labelTxt; }
  set helper(h) { this._helperTxt = h; }
  set disabled(d) { this._disabled = !!d; if (this._sel) this._sel.disabled = this._disabled; }
  // Muss an den inneren Picker durchgereicht werden: ha-selector hat
  // required=true als Default und zeigt sonst fälschlich ein Pflicht-„*".
  set required(r) { this._required = !!r; if (this._sel) this._sel.required = this._required; }
  set value(v) {
    const nv = v == null ? "" : String(v);
    if (nv === this._value) return;
    this._value = nv;
    this._sync();
  }
  get value() { return this._value; }

  connectedCallback() { if (!this._built) this._build(); }

  _t(s) { return neoT(this._hass, s); }

  _build() {
    this._built = true;
    const sr = this.shadowRoot;
    sr.innerHTML = `
      <style>
        :host { display:block; }
        #native ha-selector { display:block; }
        .neo-chip {
          display:flex; align-items:center; gap:8px; margin-top:6px;
          padding:6px 8px; border-radius:10px;
          background: var(--secondary-background-color, rgba(127,127,127,.12));
          border: 1px solid var(--divider-color, rgba(127,127,127,.25));
          color: var(--primary-text-color, inherit); font-size:13px;
        }
        .neo-chip .ic {
          width:26px; height:26px; border-radius:8px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          background: var(--card-background-color, rgba(127,127,127,.15));
        }
        .neo-chip .nm { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .neo-chip button {
          all:unset; cursor:pointer; padding:2px 6px; border-radius:6px; line-height:1;
          color: var(--secondary-text-color, inherit);
        }
        .neo-chip button:hover { background: var(--divider-color, rgba(127,127,127,.25)); }
        #toggle {
          all:unset; box-sizing:border-box; width:100%; cursor:pointer;
          display:flex; align-items:center; gap:10px;
          margin-top:8px; padding:10px 12px; border-radius:12px;
          font-size:14px; font-weight:500;
          color: var(--primary-text-color, inherit);
          background: var(--secondary-background-color, rgba(127,127,127,.08));
          border: 1px solid var(--divider-color, rgba(127,127,127,.2));
          transition: border-color .15s ease, background .15s ease;
        }
        #toggle:hover { border-color: var(--primary-color, #7C9CFF); }
        #toggle:focus-visible { outline: 2px solid var(--primary-color, #7C9CFF); outline-offset: 2px; }
        #toggle .cnt { color: var(--secondary-text-color, inherit); font-size:12px; font-weight:400; }
        #toggle .sp { flex:1; }
        #toggle .peek { display:flex; align-items:center; gap:7px; color: var(--secondary-text-color, inherit); opacity:.9; }
        #toggle .chev { display:flex; align-items:center; transition: transform .18s ease; color: var(--secondary-text-color, inherit); }
        #toggle.open .chev { transform: rotate(180deg); }
        #grid {
          display:grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap:6px;
          margin-top:6px; padding:10px; max-height:236px; overflow-y:auto;
          border-radius:12px; box-sizing:border-box;
          background: var(--secondary-background-color, rgba(127,127,127,.08));
          border: 1px solid var(--divider-color, rgba(127,127,127,.2));
        }
        #grid button {
          all:unset; box-sizing:border-box; cursor:pointer; height:42px; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          color: var(--primary-text-color, inherit);
          transition: background .12s ease, transform .12s ease, color .12s ease;
        }
        #grid button:hover {
          background: var(--divider-color, rgba(127,127,127,.25));
          color: var(--primary-color, #7C9CFF);
          transform: scale(1.08);
        }
        #grid button.sel {
          outline: 2px solid var(--primary-color, #7C9CFF);
          background: rgba(124,156,255,.16);
          color: var(--primary-color, #7C9CFF);
        }
        [hidden] { display:none !important; }
      </style>
      <div id="native"></div>
      <div id="chip" class="neo-chip" hidden></div>
      <button type="button" id="toggle">
        <span>🧩 Neo-Icons</span><span class="cnt">(${NEO_ICON_OPTIONS.length})</span>
        <span class="sp"></span>
        <span class="peek">${["lightbulb", "thermo", "camera", "bell"].map((n) => neoIcon(n, { size: 16 })).join("")}</span>
        <span class="chev">${neoIcon("chevD", { size: 16 })}</span>
      </button>
      <div id="grid" hidden></div>
    `;

    // Nativer HA-Picker über <ha-selector> (im Editor-Kontext immer definiert;
    // lädt seinerseits ha-selector-icon/ha-icon-picker nach). Fallback: Textfeld.
    const native = sr.getElementById("native");
    if (customElements.get("ha-selector")) {
      const sel = document.createElement("ha-selector");
      sel.selector = { icon: {} };
      if (this._hass) sel.hass = this._hass;
      if (this._labelTxt) sel.label = this._labelTxt;
      if (this._disabled) sel.disabled = true;
      // ha-selector-Default ist required=true (zeigt sonst fälschlich „*").
      sel.required = !!this._required;
      sel.addEventListener("value-changed", (e) => {
        e.stopPropagation(); // wir melden selbst (einheitlich für beide Quellen)
        this._set(e.detail?.value || "");
      });
      native.appendChild(sel);
      this._sel = sel;
    } else {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.placeholder = this._labelTxt || "Icon";
      inp.style.cssText = "width:100%;box-sizing:border-box;padding:8px;border-radius:8px;border:1px solid var(--divider-color,#888);background:transparent;color:inherit;";
      inp.addEventListener("change", () => this._set(inp.value.trim()));
      native.appendChild(inp);
      this._inp = inp;
    }

    // Neo-Raster: lazy befüllt beim ersten Aufklappen (~80 Inline-SVGs).
    const toggle = sr.getElementById("toggle");
    const grid = sr.getElementById("grid");
    toggle.addEventListener("click", () => {
      if (grid.hidden && !grid.childElementCount) {
        grid.innerHTML = NEO_ICON_OPTIONS.map((o) =>
          `<button type="button" data-v="${escapeAttr(o.value)}" title="${escapeAttr(o.value)}">${neoIcon(o.value, { size: 22 })}</button>`
        ).join("");
      }
      grid.hidden = !grid.hidden;
      toggle.classList.toggle("open", !grid.hidden);
      this._markSelection();
    });
    grid.addEventListener("click", (e) => {
      const b = e.target.closest?.("[data-v]");
      if (b) this._set(b.dataset.v);
    });

    // Chip: aktuelle Neo-Auswahl mit echter Vorschau (der native Picker kann
    // Neo-Namen nicht rendern) + Entfernen-Button.
    sr.getElementById("chip").addEventListener("click", (e) => {
      if (e.target.closest?.("[data-clear]")) this._set("");
    });

    this._sync();
  }

  _set(v) {
    this._value = v || "";
    this._sync();
    this.dispatchEvent(new CustomEvent("value-changed", {
      detail: { value: this._value || undefined },
      bubbles: true,
      composed: true,
    }));
  }

  _sync() {
    if (!this._built) return;
    const isNeo = NEO_NAMES.has(this._value);
    // Nativer Picker zeigt nur präfixierte Werte (Neo-Namen kennt er nicht).
    const nativeVal = (!isNeo && this._value) ? this._value : "";
    if (this._sel && this._sel.value !== nativeVal) this._sel.value = nativeVal;
    if (this._inp) this._inp.value = this._value;

    const chip = this.shadowRoot.getElementById("chip");
    if (isNeo) {
      chip.hidden = false;
      chip.innerHTML = `
        <span class="ic">${neoIcon(this._value, { size: 18 })}</span>
        <span class="nm">${escapeAttr(this._value)}</span>
        <button type="button" data-clear title="${escapeAttr(this._t("Entfernen"))}">✕</button>`;
    } else {
      chip.hidden = true;
    }
    this._markSelection();
  }

  _markSelection() {
    const grid = this.shadowRoot.getElementById("grid");
    if (!grid || grid.hidden) return;
    grid.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("sel", b.dataset.v === this._value);
    });
  }
}

if (!customElements.get("ha-selector-neo_icon")) {
  customElements.define("ha-selector-neo_icon", NeoIconSelectorField);
}
