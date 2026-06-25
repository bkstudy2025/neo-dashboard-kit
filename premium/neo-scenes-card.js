// Neo Dashboard Kit — Scenes Carousel Card (Premium)
// Private/premium card: reference-style mobile scenes carousel.

(function () {
  function init() {
    const NEO = window.NeoDashboard;
    if (!NEO || !NEO.BaseCard) {
      window.addEventListener("neo-dashboard-ready", init, { once: true });
      setTimeout(init, 300);
      return;
    }
    if (customElements.get("neo-scenes-card")) return;

    const { BaseCard, icon, accents, registerCard, makeEditor, accentOptions, escapeHtml } = NEO;
    const layoutOptions = NEO.layoutOptions || [{ value: "auto", label: "Automatisch" }];

    const EMOJI = [
      [/(zuhause|daheim|home|heim)/i, "🏠"],
      [/(entspann|relax|chill|ruhe|wellness)/i, "🌿"],
      [/(film|kino|movie|tv|media|serie)/i, "🎬"],
      [/(nacht|schlaf|sleep|night|bett|bed)/i, "🌙"],
      [/(abwesend|verlass|weg|away|urlaub|vacation|leave)/i, "🧳"],
      [/(morgen|aufwach|morning|wake|guten morgen)/i, "☀️"],
      [/(arbeit|work|fokus|focus|büro|office)/i, "💻"],
      [/(party|feier|gäste|guest)/i, "🎉"],
      [/(ess|dinner|koch|cook|küche)/i, "🍽️"],
      [/(lese|read|buch)/i, "📖"],
    ];

    const LINE = [
      [/(zuhause|daheim|home|heim)/i, "home"],
      [/(entspann|relax|chill|ruhe|wellness)/i, "leaf"],
      [/(film|kino|movie|tv|media|serie)/i, "tv"],
      [/(nacht|schlaf|sleep|night|bett|bed)/i, "moon"],
      [/(abwesend|verlass|weg|away|urlaub|vacation|leave)/i, "key"],
      [/(morgen|aufwach|morning|wake)/i, "sun"],
      [/(arbeit|work|fokus|focus|büro|office)/i, "devices"],
      [/(party|feier|gäste|guest)/i, "sparkle"],
      [/(ess|dinner|koch|cook|küche)/i, "coffee"],
      [/(lese|read|buch)/i, "info"],
    ];

    const titleCase = (s) => String(s || "").replace(/[_-]+/g, " ").trim().replace(/\b\p{L}/gu, (c) => c.toUpperCase());
    const hay = (sc) => `${sc?.name || ""} ${sc?.entity || ""}`;
    const isGlyph = (v) => typeof v === "string" && (v.includes(":") || /^[\x20-\x7E]+$/.test(v));

    function guessEmoji(name, id) {
      const text = `${name || ""} ${id || ""}`;
      for (const [re, em] of EMOJI) if (re.test(text)) return em;
      return "✨";
    }

    function lineIconFor(sc) {
      if (isGlyph(sc.icon)) return sc.icon;
      for (const [re, ic] of LINE) if (re.test(hay(sc))) return ic;
      return "scenes";
    }

    function renderIcon(val, size, color) {
      if (typeof val === "string" && val.includes(":")) return icon(val, { size, color });
      if (typeof val === "string" && /^[\x20-\x7E]+$/.test(val)) return icon(val, { size, color });
      return `<span style="font-size:${Math.round(size * 1.08)}px;line-height:1;display:block;filter:drop-shadow(0 7px 7px rgba(0,0,0,.45));">${escapeHtml(val || "✨")}</span>`;
    }

    function premiumHomeIcon(size) {
      const px = Math.round(size * 1.38);
      return `<svg width="${px}" height="${px}" viewBox="0 0 64 64" aria-hidden="true" style="display:block;overflow:visible;transform:translateY(-1px);filter:drop-shadow(0 8px 7px rgba(0,0,0,.50)) drop-shadow(0 0 7px rgba(164,158,255,.32));">
        <defs>
          <linearGradient id="neoHomeRoof" x1="20" y1="10" x2="45" y2="39" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f1ff"/><stop offset=".43" stop-color="#d7d7ec"/><stop offset="1" stop-color="#8d91b7"/></linearGradient>
          <linearGradient id="neoHomeBody" x1="18" y1="24" x2="45" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f8f7ff"/><stop offset=".48" stop-color="#d7d8ea"/><stop offset="1" stop-color="#9ba0bd"/></linearGradient>
          <linearGradient id="neoHomeSide" x1="38" y1="23" x2="51" y2="53" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#c3c5df"/><stop offset="1" stop-color="#777eaa"/></linearGradient>
          <linearGradient id="neoHomeDoor" x1="29" y1="37" x2="35" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4a5177"/><stop offset="1" stop-color="#242a49"/></linearGradient>
        </defs>
        <path d="M13.7 31.5 31.8 15.2c.75-.68 1.9-.68 2.66 0l18.2 16.3c.9.8.32 2.28-.9 2.28h-4.2v16.5c0 1.42-1.16 2.58-2.58 2.58H21.36a2.58 2.58 0 0 1-2.58-2.58v-16.5h-4.2c-1.22 0-1.8-1.48-.88-2.28Z" fill="url(#neoHomeBody)"/>
        <path d="M33.3 15.1 52.1 32c.65.58.24 1.66-.64 1.66h-4.03v16.72c0 1.37-1.1 2.48-2.48 2.48h-5.6V29.2l-6.05-14.1Z" fill="url(#neoHomeSide)" opacity=".64"/>
        <path d="M12.7 29.4 31.7 12.1a2.25 2.25 0 0 1 3.03 0l19 17.3c.76.7.27 1.96-.76 1.96h-5.68L33.2 18.5 19.1 31.36h-5.66c-1.03 0-1.53-1.27-.75-1.96Z" fill="url(#neoHomeRoof)"/>
        <path d="M25.9 52.86V41.1c0-1.1.9-2 2-2h8.3c1.1 0 2 .9 2 2v11.76H25.9Z" fill="url(#neoHomeDoor)" opacity=".92"/>
        <path d="M20.9 32.6 32.1 22.25 43.7 32.7" fill="none" stroke="rgba(255,255,255,.46)" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M18.4 31.3 31.7 19.25" fill="none" stroke="#fff" stroke-opacity=".52" stroke-width="2.1" stroke-linecap="round"/>
      </svg>`;
    }

    function renderActiveIcon(sc, size) {
      if (/(zuhause|daheim|home|heim)/i.test(hay(sc))) return premiumHomeIcon(size);
      return renderIcon(sc.icon || lineIconFor(sc), size, "#d9dced");
    }

    class NeoScenesCard extends BaseCard {
      getCardSize() { return 2; }

      _scenes() {
        const cfg = this._config || {};
        const raw = Array.isArray(cfg.scenes) && cfg.scenes.length ? cfg.scenes : (Array.isArray(cfg.entities) ? cfg.entities : []);
        return raw.map((it) => {
          const item = typeof it === "string" ? { entity: it } : (it || {});
          const id = item.entity || "";
          const st = this._state(id);
          const name = item.name || st?.attributes?.friendly_name || (id ? titleCase(id.split(".")[1]) : "Szene");
          return { entity: id, name, icon: item.icon || st?.attributes?.icon || guessEmoji(name, id) };
        }).filter((x) => x.entity);
      }

      _activeEntity(scenes) {
        if (this._selected && scenes.some((s) => s.entity === this._selected)) return this._selected;
        let best = null, bestT = -1;
        for (const s of scenes) {
          const t = Date.parse(this._state(s.entity)?.state || "");
          if (!Number.isNaN(t) && t > bestT) { bestT = t; best = s.entity; }
        }
        return best || scenes[0]?.entity || null;
      }

      render() {
        const cfg = this._config || {};
        const acc = accents[cfg.accent] || accents.violet;
        const title = cfg.title ?? "Szenen";
        const scenes = this._scenes();
        const active = this._activeEntity(scenes);
        const mob = this._isMobile();

        // Mobile-Dashboard dimensions: 44pt/48dp touch-target best practice.
        const D = mob
          ? { minH: 96, basis: 104, max: 120, pad: "12px 10px", gap: 10, radius: 18, box: 48, iconSz: 32, label: 12, title: 16, allSz: 12, arrow: 32, glowPad: 18, trimV: 10, trimH: 6, outerPad: 14 }
          : { minH: 152, basis: 148, max: 176, pad: "24px 14px", gap: 14, radius: 22, box: 64, iconSz: 44, label: 16, title: 18, allSz: 13, arrow: 34, glowPad: 24, trimV: 16, trimH: 10, outerPad: 16 };

        if (!scenes.length) {
          return `<div class="neo-card" style="padding:${D.outerPad}px;min-height:120px;display:flex;flex-direction:column;justify-content:center;"><div style="font-size:${D.title}px;font-weight:700;">${escapeHtml(title)}</div><div style="font-size:13px;color:var(--neo-text2);margin-top:6px;">Keine Szenen konfiguriert.</div></div>`;
        }

        const tiles = scenes.map((sc) => {
          const on = sc.entity === active;
          const tileBg = on
            ? `linear-gradient(180deg,rgba(121,120,221,.32) 0%,rgba(71,76,161,.20) 18%,rgba(25,30,64,.99) 48%,rgba(9,13,31,1) 100%),radial-gradient(ellipse 82% 92% at 0% 47%,rgba(136,118,255,.18) 0%,rgba(95,105,230,.07) 42%,transparent 72%),radial-gradient(ellipse 82% 92% at 100% 47%,rgba(111,126,245,.16) 0%,rgba(74,95,221,.06) 44%,transparent 74%),linear-gradient(180deg,rgba(22,27,58,1) 0%,rgba(12,17,39,1) 100%)`
            : "linear-gradient(180deg,rgba(26,31,54,.92) 0%,rgba(12,17,35,.97) 100%)";
          const tileBorder = on ? "1.15px solid rgba(119,126,242,.76)" : "1px solid rgba(145,155,190,.16)";
          const tileShadow = on
            ? "box-shadow:0 0 0 1px rgba(66,89,205,.25),0 0 9px rgba(114,112,238,.23),0 0 20px rgba(72,91,213,.13),0 12px 24px rgba(0,0,0,.44),inset 0 1px 0 rgba(255,255,255,.22),inset 11px 0 22px rgba(131,113,255,.13),inset -11px 0 22px rgba(75,101,226,.12),inset 0 20px 34px rgba(152,148,244,.12),inset 0 -23px 30px rgba(0,0,0,.35);"
            : "box-shadow:inset 0 1px 0 rgba(255,255,255,.06);";
          const edge = on ? `<span style="pointer-events:none;position:absolute;left:-1px;top:20%;bottom:20%;width:1px;border-radius:99px;background:linear-gradient(180deg,transparent,rgba(143,132,255,.48),rgba(87,107,226,.32),transparent);box-shadow:0 0 7px rgba(128,119,255,.22);opacity:.68;"></span><span style="pointer-events:none;position:absolute;right:-1px;top:20%;bottom:20%;width:1px;border-radius:99px;background:linear-gradient(180deg,transparent,rgba(137,138,255,.44),rgba(75,99,218,.30),transparent);box-shadow:0 0 7px rgba(91,112,232,.20);opacity:.64;"></span>` : "";
          return `<button class="neo-scene-tile" data-scene="${escapeHtml(sc.entity)}" aria-pressed="${on ? "true" : "false"}" title="${escapeHtml(sc.name)}" style="flex:1 0 ${D.basis}px;max-width:${D.max}px;min-height:${D.minH}px;scroll-snap-align:start;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${mob ? 8 : 10}px;padding:${D.pad};border-radius:${D.radius}px;cursor:pointer;touch-action:manipulation;user-select:none;background:${tileBg};border:${tileBorder};${tileShadow}color:var(--neo-text1);font:inherit;transition:transform .12s ease,box-shadow .2s ease,border-color .2s ease;">
            ${edge}
            <div style="position:relative;z-index:1;width:${D.box}px;height:${D.box}px;display:flex;align-items:center;justify-content:center;">${on ? renderActiveIcon(sc, D.iconSz) : renderIcon(sc.icon, D.iconSz, "var(--neo-text2)")}</div>
            <div style="position:relative;z-index:1;font-size:${D.label}px;font-weight:600;line-height:1.2;text-align:center;max-width:100%;color:${on ? "rgba(245,247,255,.92)" : "var(--neo-text2)"};text-shadow:${on ? "0 1px 8px rgba(0,0,0,.45)" : "none"};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(sc.name)}</div>
          </button>`;
        }).join("");

        const arrow = (dir, ic) => `<button class="neo-scene-arrow" data-arrow="${dir}" aria-label="${dir === "prev" ? "Zurück" : "Weiter"}" style="position:absolute;top:50%;${dir === "prev" ? "left:-2px" : "right:-2px"};transform:translateY(-50%);z-index:2;width:${D.arrow}px;height:${D.arrow}px;border-radius:${D.arrow / 2}px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:var(--neo-fill2);border:1px solid var(--neo-line6);color:var(--neo-text1);box-shadow:0 6px 18px -6px rgba(0,0,0,.55);backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);opacity:${dir === "prev" ? "0" : "1"};pointer-events:${dir === "prev" ? "none" : "auto"};transition:none;">${icon(ic, { size: mob ? 16 : 18 })}</button>`;

        return `<div class="neo-card" style="padding:${D.outerPad}px;display:flex;flex-direction:column;gap:${mob ? 10 : 14}px;overflow:visible;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div style="font-size:${D.title}px;font-weight:700;letter-spacing:.2px;">${escapeHtml(title)}</div>
            <button id="show-all" style="display:flex;align-items:center;gap:6px;cursor:pointer;background:none;border:none;padding:0;font:inherit;color:${acc.c};font-size:${D.allSz}px;font-weight:600;">Alle anzeigen<span style="width:22px;height:22px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:${acc.c}22;">${icon("chevR", { size: 14, color: acc.c })}</span></button>
          </div>
          <div style="position:relative;margin:-${D.trimV}px -${D.trimH}px;">
            ${arrow("prev", "chevL")}${arrow("next", "chevR")}
            <div id="track" style="display:flex;gap:${D.gap}px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-padding:0 ${D.glowPad}px;padding:${D.glowPad}px;scrollbar-width:none;-ms-overflow-style:none;">${tiles}</div>
          </div>
        </div>`;
      }

      _bindEvents() {
        const sr = this.shadowRoot;
        const track = sr.getElementById("track");
        const activate = (id) => {
          if (!id) return;
          this._selected = id;
          const domain = id.split(".")[0];
          const service = domain === "input_button" ? "press" : domain === "button" ? "press" : domain === "automation" ? "trigger" : "turn_on";
          this._callService(domain, service, { entity_id: id });
          this._render();
        };

        sr.querySelectorAll("[data-scene]").forEach((el) => {
          el.addEventListener("click", (e) => { e.stopPropagation(); e.preventDefault(); activate(el.getAttribute("data-scene")); });
          el.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.stopPropagation(); e.preventDefault(); activate(el.getAttribute("data-scene"));
          });
        });

        sr.getElementById("show-all")?.addEventListener("click", (e) => {
          e.stopPropagation();
          const first = this._scenes()[0]?.entity;
          if (first) this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: first }, bubbles: true, composed: true }));
        });

        if (!track) return;
        const prev = sr.querySelector('[data-arrow="prev"]');
        const next = sr.querySelector('[data-arrow="next"]');
        const step = () => Math.max(track.clientWidth * 0.8, 130);
        sr.querySelectorAll("[data-arrow]").forEach((btn) => btn.addEventListener("click", (e) => {
          e.stopPropagation();
          track.scrollBy({ left: (btn.getAttribute("data-arrow") === "prev" ? -1 : 1) * step(), behavior: "smooth" });
        }));
        const update = () => {
          const max = track.scrollWidth - track.clientWidth;
          const set = (el, on) => { if (el) { el.style.opacity = on ? "1" : "0"; el.style.pointerEvents = on ? "auto" : "none"; } };
          set(prev, track.scrollLeft > 8);
          set(next, max > 8 && track.scrollLeft < max - 8);
        };
        track.addEventListener("scroll", update, { passive: true });
        if (this._scrollLeft) track.scrollLeft = this._scrollLeft;
        requestAnimationFrame(update);
        if (this._ro) this._ro.disconnect();
        this._ro = new ResizeObserver(update);
        this._ro.observe(track);
      }

      disconnectedCallback() {
        super.disconnectedCallback?.();
        if (this._ro) { this._ro.disconnect(); this._ro = null; }
      }

      static getConfigElement() { return document.createElement(ED_TAG); }
      static getStubConfig() { return { title: "Szenen", accent: "violet", entities: [], layout: "auto" }; }
    }

    window.__neoEdSeq = (window.__neoEdSeq || 0) + 1;
    const ED_TAG = `neo-scenes-card-editor-${window.__neoEdSeq}`;
    customElements.define(ED_TAG, makeEditor([
      { name: "title", label: "Titel", selector: { text: {} } },
      { name: "entities", label: "Szenen", selector: { entity: { domain: ["scene", "script"], multiple: true } } },
      { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: accentOptions } } },
      { name: "layout", label: "Layout / Gerät", selector: { select: { mode: "dropdown", options: layoutOptions } } },
    ], { name: "Neo Szenen (Premium)", description: "Mobile Premium-Szenen im Referenzlook", icon: "🎬" }));

    registerCard("neo-scenes-card", NeoScenesCard, {
      name: "Neo Szenen",
      description: "Premium-Szenen als mobiles Karussell mit Glow",
      icon: "🎬",
      version: "1.5.0",
      author: "Premium",
    });

    console.info("[Neo Premium] neo-scenes-card geladen v1.5.0");
  }

  init();
})();
