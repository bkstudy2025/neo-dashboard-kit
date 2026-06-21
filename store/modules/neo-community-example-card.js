// ════════════════════════════════════════════════════════════════
// Neo Dashboard Kit — Community Example Card (Store reference)
// ----------------------------------------------------------------
// Eine eigenständige Community-Karte als REFERENZ für den Store-Workflow.
// Zeigt das Typed-Editor-Muster (makeTypedEditor / capabilityType / typeDef)
// und sichere Ausgabe (escapeHtml / escapeAttr / safeUrl). Keine externen
// Requests, keine Tokens, keine fremden CDN-Abhängigkeiten.
//
// Als Lovelace-Ressource NACH dem Core laden — oder über den Store installieren.
// Erscheint im Editor unter Bereich „Community".
// ════════════════════════════════════════════════════════════════
(function () {
  function init() {
    const NEO = window.NeoDashboard;
    // Core (inkl. Typed-API) noch nicht bereit? Auf "ready" warten und erneut.
    if (!NEO || !NEO.BaseCard || !NEO.registerCard || !NEO.makeTypedEditor) {
      window.addEventListener("neo-dashboard-ready", init, { once: true });
      setTimeout(init, 300);
      return;
    }
    if (customElements.get("neo-community-example-card")) return; // schon da

    const { BaseCard, accents, registerCard, makeTypedEditor,
            capabilityType, typeDef, accentOptions,
            escapeHtml, escapeAttr, safeUrl } = NEO;

    const CARD_TYPE = "neo-community-example-card";
    const CARD_VERSION = "0.0.1";

    // ── Capability-Spec: die einzige Quelle für Editor UND Rendering ──
    const SPEC = {
      typeKey: "example_type",     // 'type' ist von Lovelace belegt → eigener Key
      typeLabel: "Typ",
      entityLabel: "Entität",
      types: [
        { value: "sensor", label: "Sensor", mode: "sensor", domains: ["sensor"], unit: true },
        { value: "text",   label: "Text",   mode: "text",   source: "text" },
        { value: "link",   label: "Link",   mode: "link",   source: "text" },
      ],
      // Darstellungsfelder — erscheinen erst, sobald ein Typ gewählt ist.
      // 'url' demonstriert safeUrl (nur für Typ „Link" relevant).
      appearance: [
        { name: "url", label: "Link-URL (nur Typ „Link“)", selector: { text: {} } },
        { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: accentOptions } } },
      ],
    };

    class NeoCommunityExampleCard extends BaseCard {
      getCardSize() { return 2; }

      render() {
        const cfg  = this._config || {};
        const type = capabilityType(cfg, SPEC);   // "sensor" | "text" | "link" | ""
        const def  = typeDef(SPEC, type);
        const acc  = accents[cfg.accent] || accents.blue;

        // Empty-State, solange kein Typ gewählt ist.
        if (!def) {
          return `<div class="neo-card" style="padding:16px;">
            ${escapeHtml(this._t("Wähle einen Typ, um die Vorschau zu starten"))}</div>`;
        }

        let body = "";
        if (def.mode === "sensor") {
          const s = this._state(cfg.entity);
          const val  = s ? s.state : "—";
          const unit = cfg.unit || s?.attributes?.unit_of_measurement || "";
          // Zustand/Einheit kommen aus HA → immer escapen.
          body = `<div style="font-size:22px;font-weight:600;">
            ${escapeHtml(val)} ${escapeHtml(unit)}</div>`;
        } else if (def.mode === "text") {
          body = `<div style="font-size:15px;">${escapeHtml(cfg.content || "")}</div>`;
        } else if (def.mode === "link") {
          const href  = safeUrl(cfg.url);                 // ← Sicherheits-Gate
          const label = escapeHtml(cfg.content || cfg.url || "Link");
          body = href
            ? `<a href="${escapeAttr(href)}" target="_blank" rel="noopener"
                 style="color:${acc.c};">${label}</a>`
            : `<div style="opacity:.6;">${escapeHtml(this._t("Keine gültige URL"))}</div>`;
        }

        return `
          <div class="neo-card" style="padding:16px;min-height:90px;display:flex;
            flex-direction:column;gap:8px;border:1px solid var(--neo-line6);
            background:linear-gradient(160deg,${acc.glow} 0%,var(--neo-fill1) 70%);">
            <div style="font-size:13px;color:var(--neo-text2);">
              ${escapeHtml(cfg.name || "Community Example")}</div>
            ${body}
          </div>`;
      }

      // Editor unter VERSIONIERTEM Tag (Live-Update ohne Reload).
      static getConfigElement() { return document.createElement(ED_TAG); }
      static getStubConfig() { return {}; }   // leer → Karte zeigt zuerst den Typ-Picker
    }

    window.__neoEdSeq = (window.__neoEdSeq || 0) + 1;
    const ED_TAG = `${CARD_TYPE}-editor-${window.__neoEdSeq}`;
    customElements.define(ED_TAG, makeTypedEditor(SPEC, {
      name: "Community Example Card",
      description: "Beispiel-Community-Karte (Sensor · Text · Link)",
      icon: "🧪",
    }));

    registerCard(CARD_TYPE, NeoCommunityExampleCard, {
      name: "Community Example Card",
      description: "Beispiel-Community-Karte (Sensor · Text · Link) — Referenz für den Store-Workflow.",
      icon: "🧪",
      version: CARD_VERSION,
      author: "Community",   // ← Bereich „Community" im Karten-Picker
    });

    console.info("[Neo Community] neo-community-example-card geladen");
  }

  init();
})();
