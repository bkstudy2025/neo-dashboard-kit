// neo-spark-card.js
// Neo Dashboard Kit — Community card (full card via registerCard).
// A sensor card with a LIVE mini graph. It keeps a rolling buffer of recent
// values (collected while the dashboard is open) and renders them as animated
// bars or a smooth sparkline, with the current value and a trend arrow.
// No history API, no network — purely the live state stream.

(function () {
  const start = () => {
    const { BaseCard, registerCard, makeEditor, accents, accentOptions, escapeHtml } =
      window.NeoDashboard;
    const CAP = 40;

    class NeoSparkCard extends BaseCard {
      constructor() { super(); this._buf = []; }
      getCardSize() { return 2; }
      _acc() { return accents[this._config?.accent] || accents.mint; }

      _push() {
        const id = this._config?.entity;
        const st = id ? this._state(id) : null;
        const v = st ? parseFloat(st.state) : NaN;
        if (!Number.isFinite(v)) return;
        if (this._buf.length && this._buf[this._buf.length - 1] === v) return;
        this._buf.push(v);
        if (this._buf.length > CAP) this._buf.shift();
      }

      _bars(acc) {
        const n = Math.max(8, Math.min(CAP, +this._config?.bars || 24));
        const data = this._buf.slice(-n);
        if (data.length < 2) {
          return `<div style="font-size:12px;color:var(--neo-text3);">${this._t("Sammle Live-Daten …")}</div>`;
        }
        const lo = Math.min(...data), hi = Math.max(...data), span = hi - lo || 1;
        return `<div style="display:flex;align-items:flex-end;gap:3px;height:48px;">` +
          data.map((v, i) => {
            const h = 14 + ((v - lo) / span) * 84; // 14%..98%
            const fade = 0.35 + (i / data.length) * 0.65;
            return `<div style="flex:1;height:${h.toFixed(1)}%;border-radius:3px;opacity:${fade.toFixed(2)};
              background:linear-gradient(180deg,${acc.c},${acc.c}55);
              transition:height .4s cubic-bezier(.2,.8,.2,1);"></div>`;
          }).join("") + `</div>`;
      }

      _line(acc) {
        const n = Math.max(8, Math.min(CAP, +this._config?.bars || 24));
        const data = this._buf.slice(-n);
        if (data.length < 2) {
          return `<div style="font-size:12px;color:var(--neo-text3);">${this._t("Sammle Live-Daten …")}</div>`;
        }
        const lo = Math.min(...data), hi = Math.max(...data), span = hi - lo || 1;
        const W = 100, H = 48;
        const pts = data.map((v, i) => {
          const x = (i / (data.length - 1)) * W;
          const y = H - 4 - ((v - lo) / span) * (H - 8);
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        });
        const area = `0,${H} ${pts.join(" ")} ${W},${H}`;
        const uid = "sg" + Math.random().toString(36).slice(2, 7);
        return `
          <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:48px;display:block;">
            <defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${acc.c}" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="${acc.c}" stop-opacity="0"/>
            </linearGradient></defs>
            <polygon points="${area}" fill="url(#${uid})"></polygon>
            <polyline points="${pts.join(" ")}" fill="none" stroke="${acc.c}" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline>
          </svg>`;
      }

      render() {
        this._push();
        const c = this._config || {};
        const acc = this._acc();
        const st = c.entity ? this._state(c.entity) : null;
        const a = st?.attributes || {};
        const value = st ? (st.state ?? "—") : "—";
        const unit = c.unit ?? a.unit_of_measurement ?? "";
        const name = c.name || a.friendly_name || c.entity || this._t("Sensor");
        const b = this._buf;
        let trend = "", tcol = "var(--neo-text3)";
        if (b.length >= 2) {
          const diff = b[b.length - 1] - b[b.length - 2];
          if (diff > 0) { trend = "▲"; tcol = acc.c; }
          else if (diff < 0) { trend = "▼"; tcol = "var(--neo-text2)"; }
          else { trend = "▪"; }
        }
        const graph = c.graph === "line" ? this._line(acc) : this._bars(acc);
        return `
          <div class="neo-card" id="card" role="button" style="
            --neo-glow:0 18px 44px -18px ${acc.glow};
            padding:16px;min-height:160px;display:flex;flex-direction:column;gap:10px;cursor:pointer;
            background:linear-gradient(160deg, var(--neo-fill2) 0%, var(--neo-fill0) 100%);
            backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
            border:1px solid var(--neo-line2);">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
              <div style="min-width:0;">
                <div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:.6px;
                  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(name)}</div>
                <div style="display:flex;align-items:baseline;gap:4px;margin-top:3px;">
                  <span style="font-size:28px;font-weight:600;letter-spacing:-.5px;">${escapeHtml(String(value))}</span>
                  <span style="font-size:13px;color:var(--neo-text2);">${escapeHtml(String(unit))}</span>
                </div>
              </div>
              <div style="font-size:16px;font-weight:700;color:${tcol};">${trend}</div>
            </div>
            ${graph}
          </div>`;
      }

      _bindEvents() {
        const id = this._config?.entity;
        this._bindCardActions(this.shadowRoot.getElementById("card"), {
          entity: id,
          tapDefault: () => { if (id) this._modCtx().moreInfo(id); },
        });
      }

      static getConfigElement() { return document.createElement("neo-spark-card-editor"); }
      static getStubConfig() { return { accent: "mint", graph: "bars", bars: 24 }; }
    }

    const SCHEMA = [
      { name: "entity", label: "Sensor entity", selector: { entity: { domain: ["sensor", "input_number", "number"] } } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "accent", label: "Accent", selector: { select: { mode: "dropdown", options: accentOptions } } },
      { name: "graph", label: "Graph style", selector: { select: { mode: "dropdown", options: [
        { value: "bars", label: "Bars" }, { value: "line", label: "Line" },
      ] } } },
      { name: "bars", label: "Samples (8–40)", selector: { number: { min: 8, max: 40, mode: "slider" } } },
    ];
    const EditorTag = "neo-spark-card-editor";
    if (!customElements.get(EditorTag)) {
      customElements.define(EditorTag, makeEditor(SCHEMA, {
        name: "Neo Spark", description: "Live mini graph", icon: "📈",
      }));
    }

    registerCard("neo-spark-card", NeoSparkCard, {
      name: "Neo Spark",
      description: "Sensor card with a live sparkline and trend",
      icon: "📈",
      version: "1.0.0",
      author: "Community",
    });
  };

  if (window.NeoDashboard?.ready) start();
  else window.addEventListener("neo-dashboard-ready", start, { once: true });
})();
