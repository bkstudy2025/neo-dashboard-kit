// Neo Dashboard Kit — Header / Divider Card
// Reiner Layout-Baustein zum Strukturieren von Dashboards (keine Entität):
// "Überschrift" (Icon + Titel + Untertitel) oder "Trenner" (Linie mit Label).
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";

class NeoHeaderCard extends NeoBaseCard {
  getCardSize() { return 1; }

  render() {
    const variant = this._config?.variant || "header";
    const acc = NEO_ACCENTS[this._config?.accent] || NEO_ACCENTS.blue;
    const title = this._config?.title || "";

    if (variant === "divider") {
      const lbl = title
        ? `<span style="font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--neo-text3);">${title}</span>
           <div style="flex:1;height:1px;background:var(--neo-line2);"></div>`
        : "";
      return `<div style="display:flex;align-items:center;gap:12px;padding:8px 2px;">
        <div style="flex:1;height:1px;background:var(--neo-line2);"></div>${lbl}</div>`;
    }

    const subtitle = this._config?.subtitle || "";
    const icon = this._config?.icon;
    const lead = icon
      ? `<div style="width:34px;height:34px;border-radius:17px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
           background:linear-gradient(160deg,${acc.c}26 0%,var(--neo-fill1) 100%);border:1px solid ${acc.c}33;">${neoIcon(icon, { size: 18, color: acc.c })}</div>`
      : `<div style="width:4px;height:28px;border-radius:2px;flex-shrink:0;background:${acc.c};"></div>`;

    return `
      <div style="display:flex;align-items:center;gap:12px;padding:8px 4px;">
        ${lead}
        <div style="min-width:0;">
          <div style="font-size:18px;font-weight:700;letter-spacing:-.2px;color:var(--neo-text1);
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title}</div>
          ${subtitle ? `<div style="font-size:13px;color:var(--neo-text2);margin-top:1px;">${subtitle}</div>` : ""}
        </div>
      </div>`;
  }

  static getConfigElement() { return document.createElement("neo-header-card-editor"); }
  static getStubConfig() { return { variant: "header", title: "Überschrift" }; }
}

// ── Editor: konditionales Schema (Referenzmuster für Progressive Disclosure) ──
// Erst "Typ" wählen → danach erscheinen nur die für die Variante relevanten Felder.
// Schema ist eine Funktion (config) => schema[]; makeNeoEditor baut das Formular
// dank rebuildKeys:["variant"] nur bei Varianten-Wechsel neu (kein Fokusverlust)
// und entfernt beim Wechsel die nicht mehr gültigen Keys aus der Config.
const variantField = {
  name: "variant", label: "Typ", selector: { select: { mode: "dropdown", options: [
    { value: "header", label: "Überschrift" },
    { value: "divider", label: "Trenner" },
  ] } },
};

customElements.define("neo-header-card-editor", makeNeoEditor((config) => {
  // Trenner: nur das optionale Label ist relevant — keine Titel/Untertitel/Icon/Farbe.
  if (config?.variant === "divider") {
    return [
      variantField,
      {
        type: "expandable", title: "Inhalt", icon: "mdi:tune-variant", expanded: true,
        schema: [
          { name: "title", label: "Trenner-Label (optional)", selector: { text: {} } },
        ],
      },
    ];
  }
  // Überschrift: vollständige Inhalts- und Darstellungs-Optionen.
  return [
    variantField,
    {
      type: "expandable", title: "Inhalt", icon: "mdi:tune-variant", expanded: true,
      schema: [
        { name: "title", label: "Titel", selector: { text: {} } },
        { name: "subtitle", label: "Untertitel (optional)", selector: { text: {} } },
      ],
    },
    {
      type: "expandable", title: "Darstellung", icon: "mdi:palette",
      schema: [
        { name: "icon", label: "Icon (optional)", selector: { icon: {} } },
        { name: "accent", label: "Akzentfarbe", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
      ],
    },
  ];
}, { name: "Neo Header", description: "Überschrift / Trenner", icon: "🔖", rebuildKeys: ["variant"] }));

NeoDashboardRegistry.registerCard("neo-header-card", NeoHeaderCard, {
  name: "Neo Header",
  description: "Überschrift / Trenner zum Strukturieren",
});

export { NeoHeaderCard };
