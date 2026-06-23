// neo-clock-card.js
// Neo Dashboard Kit — Community card (full card via registerCard).
// A glass clock: large live time with a breathing colon, date line, accent glow
// and a thin seconds progress bar. No entity required. Ticks via a single
// interval that only patches text — no full re-render, no network.

(function () {
  const start = () => {
    const { BaseCard, registerCard, makeEditor, accents, accentOptions, escapeHtml } =
      window.NeoDashboard;

    class NeoClockCard extends BaseCard {
      getCardSize() { return 2; }
      _acc() { return accents[this._config?.accent] || accents.violet; }

      _parts() {
        const c = this._config || {};
        const lang = this._hass?.locale?.language || this._hass?.language || "de";
        const d = new Date();
        const hh = c.use_24h === false
          ? ((d.getHours() % 12) || 12) : String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const ss = String(d.getSeconds()).padStart(2, "0");
        const ampm = c.use_24h === false ? (d.getHours() < 12 ? "AM" : "PM") : "";
        const date = d.toLocaleDateString(lang, {
          weekday: "long", day: "2-digit", month: "long",
        });
        return { hh, mm, ss, ampm, date, secPct: (d.getSeconds() + d.getMilliseconds() / 1000) / 60 };
      }

      render() {
        const c = this._config || {};
        const acc = this._acc();
        const title = c.title || "";
        return `
          <style>
            @keyframes neo-clk-blink { 0%,100%{opacity:1} 50%{opacity:.25} }
            .neo-clk-colon { animation: neo-clk-blink 1.6s steps(1,end) infinite; color:${acc.c}; }
            .neo-clk-sec { font-variant-numeric: tabular-nums; }
          </style>
          <div class="neo-card" id="card" style="
            --neo-glow:0 18px 46px -18px ${acc.glow};
            padding:20px;min-height:160px;display:flex;flex-direction:column;justify-content:center;gap:6px;
            background:
              radial-gradient(120% 140% at 100% 0%, ${acc.c}24 0%, transparent 55%),
              linear-gradient(160deg, var(--neo-fill2) 0%, var(--neo-fill0) 100%);
            backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
            border:1px solid var(--neo-line2);">
            ${title ? `<div style="font-size:11px;color:var(--neo-text3);text-transform:uppercase;letter-spacing:1px;">${escapeHtml(title)}</div>` : ""}
            <div style="display:flex;align-items:baseline;gap:2px;font-weight:600;letter-spacing:-1px;
              font-size:46px;line-height:1;color:var(--neo-text1);">
              <span id="neo-h" class="neo-clk-sec">00</span><span class="neo-clk-colon">:</span><span id="neo-m" class="neo-clk-sec">00</span>
              <span id="neo-s" class="neo-clk-sec" style="font-size:18px;color:var(--neo-text2);margin-left:4px;">00</span>
              <span id="neo-ap" style="font-size:14px;color:var(--neo-text3);margin-left:4px;"></span>
            </div>
            <div id="neo-date" style="font-size:13px;color:var(--neo-text2);"></div>
            <div style="height:4px;border-radius:3px;background:var(--neo-line2);overflow:hidden;margin-top:8px;">
              <div id="neo-sbar" style="height:100%;width:0%;border-radius:3px;background:linear-gradient(90deg,${acc.c},${acc.c}66);transition:width .25s linear;"></div>
            </div>
          </div>`;
      }

      _tick() {
        const r = this.shadowRoot; if (!r) return;
        const p = this._parts();
        const c = this._config || {};
        const set = (id, v) => { const el = r.getElementById(id); if (el) el.textContent = v; };
        set("neo-h", p.hh); set("neo-m", p.mm);
        const sEl = r.getElementById("neo-s");
        if (sEl) sEl.style.display = c.seconds === false ? "none" : "";
        set("neo-s", p.ss);
        set("neo-ap", p.ampm);
        set("neo-date", c.show_date === false ? "" : p.date);
        const bar = r.getElementById("neo-sbar");
        if (bar) bar.style.width = `${(p.secPct * 100).toFixed(1)}%`;
      }

      _bindEvents() {
        if (this._timer) clearInterval(this._timer);
        this._tick();
        this._timer = setInterval(() => this._tick(), 1000);
      }
      disconnectedCallback() {
        super.disconnectedCallback?.();
        if (this._timer) clearInterval(this._timer);
      }

      static getConfigElement() { return document.createElement("neo-clock-card-editor"); }
      static getStubConfig() { return { accent: "violet", seconds: true, show_date: true, use_24h: true }; }
    }

    const SCHEMA = [
      { name: "title", label: "Title (optional)", selector: { text: {} } },
      { name: "accent", label: "Accent", selector: { select: { mode: "dropdown", options: accentOptions } } },
      { name: "use_24h", label: "24-hour clock", selector: { boolean: {} } },
      { name: "seconds", label: "Show seconds", selector: { boolean: {} } },
      { name: "show_date", label: "Show date", selector: { boolean: {} } },
    ];
    const EditorTag = "neo-clock-card-editor";
    if (!customElements.get(EditorTag)) {
      customElements.define(EditorTag, makeEditor(SCHEMA, {
        name: "Neo Clock", description: "Live glass clock", icon: "🕒",
      }));
    }

    registerCard("neo-clock-card", NeoClockCard, {
      name: "Neo Clock",
      description: "Live glass clock with date and seconds bar",
      icon: "🕒",
      version: "1.0.0",
      author: "Community",
    });
  };

  if (window.NeoDashboard?.ready) start();
  else window.addEventListener("neo-dashboard-ready", start, { once: true });
})();
