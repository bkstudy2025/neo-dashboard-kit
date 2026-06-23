// neo-greeting-hero.js
// Neo Dashboard Kit — Community card (full card via registerCard).
// A page-header "hero": a time-of-day greeting with the user's name, the date,
// and an optional weather glance. Designed to sit at the top of a dashboard.
//
// • Theme-adaptive: reads hass.themes.darkMode and adapts text/glass/shadow for
//   BOTH light and dark themes (uses HA theme variables where possible).
// • Mobile-first: compact layout, large type, no overflow on small screens.
// • Dead-simple settings: just a name; everything else is optional.

(function () {
  const start = () => {
    const { BaseCard, registerCard, makeEditor, accents, accentOptions, icon, escapeHtml } =
      window.NeoDashboard;

    // Theme tokens — the heart of light/dark support.
    const TT = (hass) => {
      const d = hass?.themes?.darkMode ?? true;
      return d
        ? { t1: "var(--primary-text-color,#F4F6FB)", t2: "var(--secondary-text-color,rgba(244,246,251,.72))",
            t3: "rgba(244,246,251,.5)", f1: "rgba(255,255,255,.06)", ln: "rgba(255,255,255,.12)",
            base: "rgba(22,26,40,.55)", blur: "blur(24px) saturate(140%)", sh: "rgba(0,0,0,.45)" }
        : { t1: "var(--primary-text-color,#171B26)", t2: "var(--secondary-text-color,rgba(23,27,38,.66))",
            t3: "rgba(23,27,38,.45)", f1: "rgba(20,30,60,.05)", ln: "rgba(20,30,60,.12)",
            base: "rgba(255,255,255,.62)", blur: "blur(22px) saturate(160%)", sh: "rgba(30,40,70,.16)" };
    };

    const WCOND = {
      "sunny": "sun", "clear-night": "moon", "cloudy": "cloud", "partlycloudy": "partly",
      "rainy": "rain", "pouring": "rain", "snowy": "snow", "snowy-rainy": "snow",
      "lightning": "storm", "lightning-rainy": "storm", "fog": "fog", "windy": "wind",
    };

    class NeoGreetingHero extends BaseCard {
      getCardSize() { return 2; }
      _acc() { return accents[this._config?.accent] || accents.blue; }
      _isDe() { return (this._hass?.locale?.language || this._hass?.language || "de").startsWith("de"); }

      _greeting() {
        const h = new Date().getHours();
        const de = this._isDe();
        if (h < 5) return { txt: de ? "Gute Nacht" : "Good night", ic: "moon" };
        if (h < 11) return { txt: de ? "Guten Morgen" : "Good morning", ic: "sun" };
        if (h < 17) return { txt: de ? "Guten Tag" : "Good afternoon", ic: "sun" };
        if (h < 22) return { txt: de ? "Guten Abend" : "Good evening", ic: "partly" };
        return { txt: de ? "Gute Nacht" : "Good night", ic: "moon" };
      }

      render() {
        const c = this._config || {};
        const acc = this._acc();
        const tt = TT(this._hass);
        const g = this._greeting();
        const lang = this._hass?.locale?.language || this._hass?.language || "de";
        const date = new Date().toLocaleDateString(lang, { weekday: "long", day: "2-digit", month: "long" });
        const name = c.name ? `, ${c.name}` : "";
        const mobile = this._isMobile();

        // Optional weather glance.
        let weather = "";
        if (c.weather_entity) {
          const st = this._state(c.weather_entity);
          const a = st?.attributes || {};
          if (st) {
            const ic = WCOND[st.state] || "cloud";
            const unit = this._hass?.config?.unit_system?.temperature || "°";
            weather = `
              <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:14px;
                background:${tt.f1};border:1px solid ${tt.ln};backdrop-filter:${tt.blur};-webkit-backdrop-filter:${tt.blur};">
                ${icon(ic, { size: 20, color: acc.c })}
                <span style="font-size:18px;font-weight:600;color:${tt.t1};">${a.temperature != null ? Math.round(a.temperature) + unit : "—"}</span>
              </div>`;
          }
        }

        return `
          <div class="neo-card" id="card" role="button" style="
            --neo-glow:0 20px 50px -20px ${acc.glow};
            padding:${mobile ? "16px" : "20px"};min-height:${mobile ? "108px" : "128px"};
            display:flex;align-items:center;gap:16px;cursor:pointer;
            background:
              radial-gradient(130% 130% at 0% 0%, ${acc.c}22 0%, transparent 55%),
              linear-gradient(160deg, ${tt.base} 0%, ${tt.f1} 100%);
            backdrop-filter:${tt.blur};-webkit-backdrop-filter:${tt.blur};
            border:1px solid ${tt.ln};box-shadow:0 18px 44px -20px ${tt.sh};">
            <div style="width:${mobile ? "44px" : "52px"};height:${mobile ? "44px" : "52px"};border-radius:50%;flex-shrink:0;
              display:flex;align-items:center;justify-content:center;
              background:linear-gradient(160deg,${acc.c} 0%,${acc.c}aa 100%);
              box-shadow:0 8px 22px -6px ${acc.glow};">
              ${icon(g.ic, { size: mobile ? 22 : 26, color: "#fff" })}
            </div>
            <div style="min-width:0;flex:1;">
              <div style="font-size:${mobile ? "20px" : "24px"};font-weight:700;letter-spacing:-.5px;color:${tt.t1};
                overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(g.txt)}${escapeHtml(name)}</div>
              <div style="font-size:13px;color:${tt.t2};margin-top:2px;text-transform:capitalize;
                overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(date)}</div>
            </div>
            ${weather}
          </div>`;
      }

      _bindEvents() {
        if (this._timer) clearInterval(this._timer);
        // Refresh greeting/date across hour/day boundaries (cheap, 60s).
        this._timer = setInterval(() => this._render(), 60000);
        const id = this._config?.weather_entity;
        this._bindCardActions(this.shadowRoot.getElementById("card"), {
          entity: id,
          tapDefault: () => { if (id) this._modCtx().moreInfo(id); },
        });
      }
      disconnectedCallback() { super.disconnectedCallback?.(); if (this._timer) clearInterval(this._timer); }

      static getConfigElement() { return document.createElement("neo-greeting-hero-editor"); }
      static getStubConfig() { return { accent: "blue" }; }
    }

    const SCHEMA = [
      { name: "name", label: "Your name (optional)", selector: { text: {} } },
      { name: "weather_entity", label: "Weather (optional)", selector: { entity: { domain: "weather" } } },
      { name: "accent", label: "Accent", selector: { select: { mode: "dropdown", options: accentOptions } } },
    ];
    const EditorTag = "neo-greeting-hero-editor";
    if (!customElements.get(EditorTag)) {
      customElements.define(EditorTag, makeEditor(SCHEMA, {
        name: "Neo Greeting Hero", description: "Time-aware page header", icon: "👋",
      }));
    }

    registerCard("neo-greeting-hero", NeoGreetingHero, {
      name: "Neo Greeting Hero",
      description: "Time-aware greeting header with date and weather glance",
      icon: "👋",
      version: "1.0.0",
      author: "Community",
    });
  };

  if (window.NeoDashboard?.ready) start();
  else window.addEventListener("neo-dashboard-ready", start, { once: true });
})();
