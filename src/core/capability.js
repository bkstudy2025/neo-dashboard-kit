// Neo Dashboard Kit — Capability registry / typed-editor generator
//
// Deklarative Struktur, mit der Standard-, Premium- und Community-Karten
// DIESELBE Editor-/Preview-/Pruning-Logik verwenden — ohne Sonder-UX. Eine Karte
// liefert nur ein Spec; daraus werden das konditionale ha-form-Schema, die
// rebuildKeys und normalizeConfig erzeugt. Bewusst entlang der echten Muster aus
// Header/Control/Display abstrahiert (nicht spekulativ).
//
// Spec-Form (card_type → supported_types → entity_domains → editor_schema →
// preview_placeholder → prune_keys):
//   {
//     typeKey:   "display_type",     // strukturbestimmender Config-Key ('type' ist von Lovelace belegt)
//     typeLabel: "Typ",
//     entityLabel: "Entität",
//     types: [ {
//       value, label, icon, mode,     // mode = Render-Art der Karte
//       domains?: [],                 // erlaubte Entitäts-Domains (Picker-Filter + Typ-Ableitung)
//       device_class?: "",            // optionaler Entity-device_class-Filter
//       source?: "text",              // 'text' → Content-Feld statt Entität
//       fields?: [],                  // zusätzliche allgemeine Felder dieses Typs (z. B. step/code)
//       unit?: true,                  // Einheiten-Feld (Darstellung)
//     } ],
//     appearance?: [],                // zusätzliche Darstellungs-Felder (z. B. accent, layout)
//   }
//
// Gemeinsame Garantien (für alle Karten gleich):
//  - Typ zuerst → danach nur passende Entität/Quelle und Optionen
//  - Kein Typ → die Karte rendert ihren Empty-State (mode-basiert, kartenseitig)
//  - Typwechsel: unpassende Entität wird verworfen, alte Keys werden geprunt
//  - Rebuild-Guard via rebuildKeys → kein Fokusverlust
//  - Editor UND Rendering leiten den Typ aus derselben Map ab (neoCapabilityType)
import { makeNeoEditor } from "./editor-factory.js";

const domainOf = (id) => (id ? String(id).split(".")[0] : "");
export const neoTypeDef = (spec, t) => spec.types.find((x) => x.value === t);

// Entitäts-Domain → Typ (Legacy-Migration; erste passende Domain gewinnt).
function typeByDomain(spec, d) {
  if (!d) return "";
  const hit = spec.types.find((x) => Array.isArray(x.domains) && x.domains.includes(d));
  return hit ? hit.value : "";
}

// Effektiver Typ: expliziter typeKey, sonst aus der Entitäts-Domain abgeleitet.
export function neoCapabilityType(config, spec) {
  return config?.[spec.typeKey] || typeByDomain(spec, domainOf(config?.entity)) || "";
}

// Invarianten: Legacy → Typ migrieren; Entität passend zum Typ halten/verwerfen.
export function neoCapabilityNormalize(config, spec) {
  const cfg = { ...config };
  if (!cfg[spec.typeKey]) {
    const t = typeByDomain(spec, domainOf(cfg.entity));
    if (t) cfg[spec.typeKey] = t;
  }
  const t = cfg[spec.typeKey];
  if (!t) return cfg;
  const def = neoTypeDef(spec, t);
  if (def?.source === "text") { delete cfg.entity; return cfg; } // Text-Quelle nutzt keine Entität
  const d = domainOf(cfg.entity);
  if (d && def && def.domains?.length && !def.domains.includes(d)) delete cfg.entity; // Mismatch (nur bei Domain-Filter)
  return cfg;
}

// Konditionales ha-form-Schema aus dem Spec (für makeNeoEditor).
function buildCapabilitySchema(config, spec) {
  const t = neoCapabilityType(config, spec);
  const def = neoTypeDef(spec, t);
  const hasLegacyEntity = !!config?.entity;
  const general = [
    {
      name: spec.typeKey, label: spec.typeLabel || "Typ",
      selector: { select: { mode: "dropdown", options: spec.types.map(({ value, label }) => ({ value, label })) } },
    },
  ];
  if (def?.source === "text") {
    general.push(
      { name: "content", label: "Text / Markdown", selector: { text: { multiline: true } } },
      { name: "name", label: "Titel (optional)", selector: { text: {} } },
    );
  } else if (t || hasLegacyEntity) {
    const entSel = def && def.domains?.length
      ? { domain: def.domains, ...(def.device_class ? { device_class: def.device_class } : {}) }
      : {}; // keine/leere Domains (z. B. Badge, Legacy) → ungefilterter Picker
    general.push(
      { name: "entity", label: spec.entityLabel || "Entität", selector: { entity: entSel } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
    );
    (def?.fields || []).forEach((f) => general.push(f));
  }

  const appearance = [];
  if (def?.source !== "text") appearance.push({ name: "icon", label: "Icon", selector: { icon: {} } });
  if (def?.unit) appearance.push({ name: "unit", label: "Einheit (optional)", selector: { text: {} } });
  (spec.appearance || []).forEach((f) => appearance.push(f));

  return [
    { type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true, schema: general },
    { type: "expandable", title: "Darstellung", icon: "mdi:palette", schema: appearance },
  ];
}

// Erzeugt die Editor-Custom-Element-Klasse aus einem Capability-Spec.
// meta: { name, description, icon } für den Editor-Kopf.
export function makeNeoTypedEditor(spec, meta = {}) {
  return makeNeoEditor((config) => buildCapabilitySchema(config, spec), {
    ...meta,
    rebuildKeys: [spec.typeKey],
    normalizeConfig: (config) => neoCapabilityNormalize(config, spec),
  });
}
