// neo-scene-deck.js
// Neo Dashboard Kit — Community card (full card via registerCard).
// A horizontally swipeable deck of one-tap launchers for scenes, scripts,
// buttons and automations. Big touch targets, scroll-snap, press feedback —
// built for thumbs on a phone.
//
// • Theme-adaptive (light/dark). • Mobile-first horizontal scroll with snap.
// • Simple settings: pick the entities, done. Icons are chosen automatically.

(function () {
  const start = () => {
    const { BaseCard, registerCard, makeEditor, accents, accentOptions, icon, escapeHtml, escapeAttr } =
      window.NeoDashboard;

    const TT = (hass) => {
      const d = hass?.themes?.darkMode ?? true;
      return d
        ? { t1: "var(--primary-text-color,#F4F6FB)", t2: "var(--secondary-text-color,rgba(244,246,251,.72))",
            t3: "rgba(244,246,251,.5)", tile: "rgba(255,255,255,.05)", ln: "rgba(255,255,255,.10)",
            base: "rgba(22,26,40,.5)", blur: "blur(24px) saturate(140%)", sh: "rgba(0,0,0,.45)" }
        : { t1: "var(--primary-text-color,#171B26)", t2: "var(--secondary-text-color,rgba(23,27,38,.66))",
            t3: "rgba(23,27,38,.45)", tile: "rgba(20,30,60,.05)", ln: "rgba(20,30,60,.12)",
            base: "rgba(255,255,255,.62)", blur: "blur(22px) saturate(160%)", sh: "rgba(30,40,70,.16)" };
    };
    const DICON = { scene: "scenes", script: "scenes", button: "remote", input_button: "remote",
      automation: "refresh", light: "lightbulb", switch: "outlet", cover: "blinds", lock: "lock", vacuum: "vacuum" };
    const list = (e) => Array.isArray(e) ? e : (e ? [e] : []);

    class NeoSceneDeck extends BaseCard {
      getCardSize() { return 2; }
      _acc() { return accents[this._config?.accent] || accents.violet; }
      _trackedEntities() { return list(this._config?.entities); }

      render() {
        const c = this._config || {};
        const tt = TT(this._hass);
        const acc = this._acc();
        const ids = list(c.entities);
        const title = c.title || "";
        const tiles = ids.length
          ? ids.map((id) => {
              const st = this._state(id);
              const dom = id.split(".")[0];
              const ic = DICON[dom] || "star";
              const nm = c[`name_${id}`] || st?.attributes?.friendly_name || id.split(".")[1] || id;
              return `
                <button class="nsd-tile" data-entity="${escapeAttr(id)}" style="
                  flex:0 0 auto;width:104px;scroll-snap-align:start;display:flex;flex-direction:column;gap:10px;
                  padding:14px;border:none;cursor:pointer;border-radius:18px;text-align:left;color:${tt.t1};
                  background:linear-gradient(160deg,${acc.c}26 0%,${tt.tile} 100%);
                  outline:1px solid ${tt.ln};transition:transform .12s cubic-bezier(.2,.8,.2,1),box-shadow .2s;">
                  <span style="width:40px;height:40px;border-radius:13px;display:flex;align-items:center;justify-content:center;
                    background:linear-gradient(160deg,${acc.c} 0%,${acc.c}aa 100%);box-shadow:0 6px 16px -4px ${acc.glow};">
                    ${icon(ic, { size: 20, color: "#fff" })}</span>
                  <span style="font-size:12.5px;font-weight:600;line-height:1.2;
                    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(String(nm))}</span>
                </button>`;
            }).join("")
          : `<div style="font-size:13px;color:${tt.t3};padding:8px 2px;">${this._t("Szenen, Skripte oder Tasten hinzufügen …")}</div>`;

        return `
          <style>
            .nsd-scroll{ display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;
              -webkit-overflow-scrolling:touch;scrollbar-width:none;padding:2px; }
            .nsd-scroll::-webkit-scrollbar{ display:none; }
            .nsd-tile:active{ transform:scale(.93); }
            .nsd-tile.nsd-hit{ box-shadow:0 0 0 2px ${acc.c}, 0 8px 22px -6px ${acc.glow}; }
          </style>
          <div class="neo-card" id="card" style="
            --neo-glow:0 18px 46px -20px ${acc.glow};
            padding:16px;min-height:${title ? "150px" : "128px"};display:flex;flex-direction:column;gap:12px;
            background:linear-gradient(160deg, ${tt.base} 0%, ${tt.tile} 100%);
            backdrop-filter:${tt.blur};-webkit-backdrop-filter:${tt.blur};
            border:1px solid ${tt.ln};box-shadow:0 18px 44px -20px ${tt.sh};">
            ${title ? `<div style="font-size:13px;font-weight:600;color:${tt.t2};text-transform:uppercase;letter-spacing:.6px;">${escapeHtml(String(title))}</div>` : ""}
            <div class="nsd-scroll">${tiles}</div>
          </div>`;
      }

      _activate(id) {
        const dom = id.split(".")[0];
        if (dom === "scene") this._callService("scene", "turn_on", { entity_id: id });
        else if (dom === "script") this._callService("script", "turn_on", { entity_id: id });
        else if (dom === "button") this._callService("button", "press", { entity_id: id });
        else if (dom === "input_button") this._callService("input_button", "press", { entity_id: id });
        else if (dom === "automation") this._callService("automation", "trigger", { entity_id: id });
        else if (dom === "cover") this._callService("cover", "toggle", { entity_id: id });
        else if (dom === "lock") {
          const on = this._state(id)?.state === "locked";
          this._callService("lock", on ? "unlock" : "lock", { entity_id: id });
        } else this._callService(dom, "toggle", { entity_id: id });
      }

      _bindEvents() {
        this.shadowRoot.querySelectorAll(".nsd-tile").forEach((btn) => {
          btn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const id = btn.getAttribute("data-entity");
            if (!id) return;
            btn.classList.add("nsd-hit");
            setTimeout(() => btn.classList.remove("nsd-hit"), 450);
            this._activate(id);
          });
        });
      }

      static getConfigElement() { return document.createElement("neo-scene-deck-editor"); }
      static getStubConfig() { return { accent: "violet", entities: [] }; }
    }

    const SCHEMA = [
      { name: "title", label: "Title (optional)", selector: { text: {} } },
      { name: "entities", label: "Scenes / scripts / buttons", selector: { entity: {
        domain: ["scene", "script", "button", "input_button", "automation", "light", "switch", "cover", "lock", "vacuum"], multiple: true } } },
      { name: "accent", label: "Accent", selector: { select: { mode: "dropdown", options: accentOptions } } },
    ];
    const EditorTag = "neo-scene-deck-editor";
    if (!customElements.get(EditorTag)) {
      customElements.define(EditorTag, makeEditor(SCHEMA, {
        name: "Neo Scene Deck", description: "Swipeable one-tap launchers", icon: "🎬",
      }));
    }

    registerCard("neo-scene-deck", NeoSceneDeck, {
      name: "Neo Scene Deck",
      description: "Swipeable deck of one-tap scene/script/button launchers",
      icon: "🎬",
      version: "1.0.0",
      author: "Community",
    });
  };

  if (window.NeoDashboard?.ready) start();
  else window.addEventListener("neo-dashboard-ready", start, { once: true });
})();
