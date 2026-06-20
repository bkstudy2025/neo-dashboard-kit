// ════════════════════════════════════════════════════════════════
// Neo Dashboard Kit — Premium Card Template
// ----------------------------------------------------------------
// Eine EIGENSTÄNDIGE Karten-Datei, die an das Neo Dashboard Kit
// andockt. Als separate Lovelace-Ressource laden (NACH dem Core).
// Erscheint automatisch im Dropdown der "neo-card".
//
// Nutzung der öffentlichen API:
//   window.NeoDashboard = {
//     registerCard(type, class, meta),   // Karte registrieren
//     BaseCard,                          // Basisklasse (Render + Helpers)
//     icon(name, {size,color}),          // SVG-Icon-Set
//     accents, accentOptions,            // Akzentfarben
//     iconOptions,                       // Icon-Liste für Editoren
//     makeEditor(schema, meta),          // Editor-Factory (ha-form)
//     makeTypedEditor(spec, meta),       // Typed-Editor aus Capability-Spec
//     capabilityType(config, spec),      // Typ aus typeKey/Legacy-Entity ableiten
//     typeDef(spec, type),               // Typ-Definition aus derselben Registry
//     escapeHtml, escapeAttr, safeUrl,   // Ausgabe-/URL-Sicherheit
//   }
//
// Empfehlung für neue Premium-/Community-Karten:
// - Wenn eine Karte mehrere Untertypen/Entitäts-Domains unterstützt, definiere
//   ein Capability-Spec wie die Core-Karten Display/Control und nutze
//   makeTypedEditor(spec, meta). So bleiben Typ-Picker, Empty-State,
//   Legacy-Migration, Domain-Filter und Pruning identisch zur Standard-UX.
// - Einfache Einzelzweck-Karten können weiter makeEditor(schema, meta) nutzen.
// ════════════════════════════════════════════════════════════════


// ── Typed-Card Mini-Referenz (Kommentar, keine aktive Premium-Funktion) ──
// Einfache Karte: nutze makeEditor(schema, meta), wenn die Karte genau einen
// festen Zweck hat und nur normale ha-form-Felder braucht.
//
// Getypte Karte: nutze makeTypedEditor(spec, meta), wenn die Karte mehrere
// Untertypen, Quellen oder Entity-Domains hat. Das Spec ist die einzige Quelle
// für Editor, Preview-Mode und Legacy-Ableitung:
//   const TYPED_SPEC = {
//     typeKey: "example_type",
//     typeLabel: "Typ",
//     entityLabel: "Entität",
//     types: [
//       { value: "value", label: "Wert", domains: ["sensor"], mode: "sensor" },
//       { value: "text", label: "Text", source: "text", mode: "text" },
//     ],
//     appearance: [
//       { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: accentOptions } } },
//     ],
//   };
//   const type = capabilityType(this._config, TYPED_SPEC);
//   const def = typeDef(TYPED_SPEC, type);
//   customElements.define(ED_TAG, makeTypedEditor(TYPED_SPEC, meta));
//
// Wichtig: Externe Texte vor innerHTML escapen und externe URLs nur nach
// Validierung rendern (escapeHtml/escapeAttr/safeUrl aus window.NeoDashboard).

(function () {
  function init() {
    const NEO = window.NeoDashboard;
    // Core noch nicht geladen? Kurz warten und erneut versuchen.
    if (!NEO || !NEO.BaseCard) {
      window.addEventListener("neo-dashboard-ready", init, { once: true });
      setTimeout(init, 300);
      return;
    }
    if (customElements.get("neo-example-card")) return; // schon registriert

    const { BaseCard, icon, accents, registerCard, makeEditor, makeTypedEditor, capabilityType, typeDef, accentOptions, iconOptions } = NEO;
    const layoutOptions = NEO.layoutOptions || [{ value: "auto", label: "Automatisch" }];

    // ── Die Karte ────────────────────────────────────────────────
    class NeoExampleCard extends BaseCard {
      getCardSize() { return 2; }

      render() {
        const id = this._config?.entity;
        const s = this._state(id);
        const acc = accents[this._config?.accent] || accents.blue;
        const ic = this._config?.icon || "star";
        const name = this._config?.name || s?.attributes?.friendly_name || id || "Beispiel";
        const value = s ? s.state : "—";

        // Responsives Layout (geteiltes System): "mobile" | "tablet" | "desktop".
        // layout: auto richtet sich nach der Bildschirmbreite und rendert bei
        // Breakpoint-Wechsel automatisch neu. Hier z.B. die Höhe anpassen:
        const minH = this._isMobile() ? 110 : this._isTablet() ? 130 : 140;

        return `
          <div class="neo-card" style="
            padding:16px;min-height:${minH}px;display:flex;flex-direction:column;
            background:linear-gradient(160deg, ${acc.glow} 0%, var(--neo-fill1) 60%, var(--neo-fill0) 100%);
            backdrop-filter:var(--neo-blur);-webkit-backdrop-filter:var(--neo-blur);
            border:1px solid var(--neo-line6);
            box-shadow:0 18px 40px -16px ${acc.glow};
          ">
            <div style="width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;
              background:linear-gradient(160deg,${acc.c} 0%,${acc.c}cc 100%);">
              ${icon(ic, { size: 19, color: "#fff" })}
            </div>
            <div style="margin-top:auto;">
              <div style="font-size:16px;font-weight:600;">${name}</div>
              <div style="font-size:13px;color:var(--neo-text2);margin-top:2px;">${value}</div>
            </div>
          </div>`;
      }

      static getConfigElement() { return document.createElement(ED_TAG); }
      static getStubConfig() { return { entity: "", icon: "star", accent: "blue", layout: "auto" }; }
    }

    // ── Der Editor (HA-native ha-form über die Factory) ──────────
    // Dieses aktive Beispiel ist bewusst eine einfache Karte: makeEditor reicht.
    // Für getypte Karten siehe die Typed-Card Mini-Referenz oben.
    void makeTypedEditor; void capabilityType; void typeDef;
    // WICHTIG: Editor unter VERSIONIERTEM Tag definieren (nicht festem!). So
    // gehen auch Editor-Änderungen beim Modul-Update OHNE Browser-Reload live —
    // getConfigElement() nutzt immer den aktuellen Tag. Ein fester Tag würde
    // beim Re-Import die alte Editor-Version behalten (Reload nötig).
    window.__neoEdSeq = (window.__neoEdSeq || 0) + 1;
    const ED_TAG = `neo-example-card-editor-${window.__neoEdSeq}`;
    {
      customElements.define(ED_TAG, makeEditor([
        { name: "entity", label: "Entity", selector: { entity: {} } },
        { name: "name", label: "Name (optional)", selector: { text: {} } },
        { name: "icon", label: "Icon", selector: { icon: {} } },
        { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: accentOptions } } },
        { name: "layout", label: "Layout / Gerät", selector: { select: { mode: "dropdown", options: layoutOptions } } },
      ], { name: "Neo Beispiel (Premium)", description: "Vorlage für eine externe Karte", icon: "⭐" }));
    }

    // ── Registrieren → erscheint im neo-card Dropdown ────────────
    // meta.version + meta.author werden in der Modul-Liste angezeigt.
    // author: "Premium" → goldenes Badge · sonst grünes Community-Badge.
    registerCard("neo-example-card", NeoExampleCard, {
      name: "Neo Beispiel",
      description: "Beispielkarte aus einer externen Datei",
      icon: "⭐",
      version: "1.0.0",
      author: "Community",
    });

    console.info("[Neo Premium] neo-example-card geladen");
  }

  init();
})();
