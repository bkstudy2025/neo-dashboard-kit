// neo-gauge-card.js
// Neo Dashboard Kit — Community card (full card via registerCard).
// A clean 270° radial gauge for any numeric entity. Smoothly animated arc,
// big centred value, min/max ticks and an optional "danger zone" that recolours
// the arc when the value gets critical.
//
// • Theme-adaptive (light/dark) via hass.themes.darkMode + HA theme variables.
// • Responsive SVG → scales perfectly on phones.
// • Simple settings: entity, min, max, accent. The rest is optional.

(function () {
  const start = () => {
    const { BaseCard, registerCard, makeEditor, accents, accentOptions, escapeHtml } =
      window.NeoDashboard;

    const TT = (hass) => {
      const d = hass?.themes?.darkMode ?? true;
      return d
        ? { t1: "var(--primary-text-color,#F4F6FB)", t2: "var(--secondary-text-color,rgba(244,246,251,.72))",
            t3: "rgba(244,246,251,.5)", track: "rgba(255,255,255,.12)", f1: "rgba(255,255,255,.05)",
            ln: "rgba(255,255,255,.10)", base: "rgba(22,26,40,.5)", blur: "blur(24px) saturate(140%)", sh: "rgba(0,0,0,.45)" }
        : { t1: "var(--primary-text-color,#171B26)", t2: "var(--secondary-text-color,rgba(23,27,38,.66))",
            t3: "rgba(23,27,38,.45)", track: "rgba(20,30,60,.12)", f1: "rgba(20,30,60,.04)",
            ln: "rgba(20,30,60,.12)", base: "rgba(255,255,255,.62)", blur: "blur(22px) saturate(160%)", sh: "rgba(30,40,70,.16)" };
    };
    const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
    const C = 2 * Math.PI * 40;        // circumference
    const ARC = 0.75 * C;              // 270° visible arc

    class NeoGaugeCard extends BaseCard {
      getCardSize() { return 2; }
      _acc() { return accents[this._config?.accent] || accents.mint; }

      render() {
        const c = this._config || {};
        const tt = TT(this._hass);
        const acc = this._acc();
        const st = c.entity ? this._state(c.entity) : null;
        const a = st?.attributes || {};
        const raw = st ? parseFloat(st.state) : NaN;
        const min = Number.isFinite(+c.min) ? +c.min : 0;
        const max = Number.isFinite(+c.max) ? +c.max : 100;
        const has = Number.isFinite(raw) && max !== min;
        const pct = has ? clamp((raw - min) / (max - min), 0, 1) : 0;
        const unit = c.unit ?? a.unit_of_measurement ?? "";
        const name = c.name || a.friendly_name || c.entity || this._t("Sensor");

        // Optional danger zone: recolour arc when value passes the threshold.
        const danger = Number.isFinite(+c.danger) ? +c.danger : null;
        const hot = danger != null && has && raw >= danger;
        const arcCol = hot ? "#F87171" : acc.c;
        const arcGlow = hot ? "rgba(248,113,113,.45)" : acc.glow;
        const valStr = has ? (st.state ?? "—") : "—";
        const uid = "g" + Math.random().toString(36).slice(2, 7);

        return `
          <div class="neo-card" id="card" role="button" style="
            --neo-glow:0 20px 50px -20px ${arcGlow};
            padding:16px;min-height:200px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;
            background:linear-gradient(160deg, ${tt.base} 0%, ${tt.f1} 100%);
            backdrop-filter:${tt.blur};-webkit-backdrop-filter:${tt.blur};
            border:1px solid ${tt.ln};box-shadow:0 18px 44px -20px ${tt.sh};">
            <div style="position:relative;width:100%;max-width:190px;aspect-ratio:1/1;">
              <svg viewBox="0 0 100 100" style="width:100%;height:100%;display:block;">
                <defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="${arcCol}"/><stop offset="100%" stop-color="${arcCol}99"/>
                </linearGradient></defs>
                <circle cx="50" cy="50" r="40" fill="none" stroke="${tt.track}" stroke-width="9"
                  stroke-linecap="round" stroke-dasharray="${ARC.toFixed(1)} ${C.toFixed(1)}"
                  transform="rotate(135 50 50)"></circle>
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#${uid})" stroke-width="9"
                  stroke-linecap="round" stroke-dasharray="${(pct * ARC).toFixed(1)} ${C.toFixed(1)}"
                  transform="rotate(135 50 50)"
                  style="transition:stroke-dasharray .7s cubic-bezier(.2,.8,.2,1),stroke .4s ease;
                  filter:drop-shadow(0 0 5px ${arcGlow});"></circle>
              </svg>
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                <div style="display:flex;align-items:baseline;gap:2px;">
                  <span style="font-size:30px;font-weight:700;letter-spacing:-1px;color:${tt.t1};">${escapeHtml(String(valStr))}</span>
                  <span style="font-size:13px;color:${tt.t2};">${escapeHtml(String(unit))}</span>
                </div>
                ${hot ? `<span style="font-size:10px;font-weight:700;letter-spacing:.5px;color:#F87171;">${this._t("KRITISCH")}</span>` : ""}
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;width:100%;max-width:190px;margin-top:-14px;
              font-size:11px;color:${tt.t3};"><span>${escapeHtml(String(min))}</span><span>${escapeHtml(String(max))}</span></div>
            <div style="font-size:13px;font-weight:600;color:${tt.t2};text-align:center;
              overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">${escapeHtml(String(name))}</div>
          </div>`;
      }

      _bindEvents() {
        const id = this._config?.entity;
        this._bindCardActions(this.shadowRoot.getElementById("card"), {
          entity: id, tapDefault: () => { if (id) this._modCtx().moreInfo(id); },
        });
      }

      static getConfigElement() { return document.createElement("neo-gauge-card-editor"); }
      static getStubConfig() { return { accent: "mint", min: 0, max: 100 }; }
    }

    const SCHEMA = [
      { name: "entity", label: "Sensor entity", selector: { entity: { domain: ["sensor", "input_number", "number"] } } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "min", label: "Min", selector: { number: { mode: "box" } } },
      { name: "max", label: "Max", selector: { number: { mode: "box" } } },
      { name: "danger", label: "Danger from (optional)", selector: { number: { mode: "box" } } },
      { name: "accent", label: "Accent", selector: { select: { mode: "dropdown", options: accentOptions } } },
    ];
    const EditorTag = "neo-gauge-card-editor";
    if (!customElements.get(EditorTag)) {
      customElements.define(EditorTag, makeEditor(SCHEMA, {
        name: "Neo Gauge", description: "270° radial gauge", icon: "⏲️",
      }));
    }

    registerCard("neo-gauge-card", NeoGaugeCard, {
      name: "Neo Gauge",
      description: "Radial gauge for any numeric sensor with a danger zone",
      icon: "⏲️",
      version: "1.0.0",
      author: "Community",
    });
  };

  if (window.NeoDashboard?.ready) start();
  else window.addEventListener("neo-dashboard-ready", start, { once: true });
})();
