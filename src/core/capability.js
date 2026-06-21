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
//       multi?: true,                 // Multi-Entity → 'entities' statt 'entity' (z. B. Licht-Gruppe)
//       entityLabel?: "Lichter",      // eigenes Label für den (Multi-)Picker
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
import { neoActionFields, neoCleanActions } from "./action-editor.js";

const domainOf = (id) => (id ? String(id).split(".")[0] : "");
export const neoTypeDef = (spec, t) => spec.types.find((x) => x.value === t);

// Entitäts-Domain → Typ (Legacy-Migration; erste passende Domain gewinnt).
function typeByDomain(spec, d) {
  if (!d) return "";
  const hit = spec.types.find((x) => Array.isArray(x.domains) && x.domains.includes(d));
  return hit ? hit.value : "";
}

// Effektiver Typ: expliziter typeKey, sonst aus Entität/Entities abgeleitet.
export function neoCapabilityType(config, spec) {
  if (config?.[spec.typeKey]) return config[spec.typeKey];
  if (config?.entities?.length) {
    const m = spec.types.find((x) => x.multi);
    if (m) return m.value; // Multi-Entity-Typ (z. B. Licht-Gruppe)
  }
  return typeByDomain(spec, domainOf(config?.entity)) || "";
}

// Invarianten: Legacy → Typ migrieren; Quelle (Entität/Entities) passend halten.
export function neoCapabilityNormalize(config, spec) {
  const cfg = { ...config };
  if (!cfg[spec.typeKey]) {
    const m = spec.types.find((x) => x.multi);
    if (cfg.entities?.length && m) cfg[spec.typeKey] = m.value;
    else { const t = typeByDomain(spec, domainOf(cfg.entity)); if (t) cfg[spec.typeKey] = t; }
  }
  neoCleanActions(cfg); // leere/Default-Aktionen verwerfen (Editor schreibt undefined bei „Standard")
  const t = cfg[spec.typeKey];
  if (!t) return cfg;
  const def = neoTypeDef(spec, t);
  // Sichtbarkeits-Defaults explizit setzen, damit die Editor-Schalter den
  // tatsächlichen (Default = an) Zustand anzeigen. Nur fehlende Keys, nie
  // explizite false-Werte überschreiben (bestehende YAML bleibt unangetastet).
  if (def?.defaults) for (const [k, v] of Object.entries(def.defaults)) if (cfg[k] == null) cfg[k] = v;
  if (def?.source === "text") { delete cfg.entity; delete cfg.entities; return cfg; } // Text-Quelle: keine Entität
  if (def?.multi) { delete cfg.entity; return cfg; }   // Multi nutzt 'entities'
  delete cfg.entities;                                 // Single-Typ nutzt 'entity'
  const d = domainOf(cfg.entity);
  if (d && def && def.domains?.length && !def.domains.includes(d)) delete cfg.entity; // Mismatch-Reset
  return cfg;
}

// Konditionales ha-form-Schema aus dem Spec (für makeNeoEditor).
function buildCapabilitySchema(config, spec) {
  const t = neoCapabilityType(config, spec);
  const def = neoTypeDef(spec, t);
  const hasLegacyEntity = !!(config?.entity || config?.entities?.length);
  const entityLabel = (def && def.entityLabel) || spec.entityLabel || "Entität";
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
  } else if (def?.multi) {
    // Multi-Entity (z. B. Licht-Gruppe) → 'entities' statt 'entity'.
    general.push(
      { name: "entities", label: entityLabel,
        selector: { entity: { ...(def.domains?.length ? { domain: def.domains } : {}), multiple: true } } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
    );
    (def.fields || []).forEach((f) => general.push(f));
  } else if (t || hasLegacyEntity) {
    const entSel = def && def.domains?.length
      ? { domain: def.domains, ...(def.device_class ? { device_class: def.device_class } : {}) }
      : {}; // keine/leere Domains (z. B. Badge, Legacy) → ungefilterter Picker
    general.push(
      { name: "entity", label: entityLabel, selector: { entity: entSel } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      { name: "sub", label: "Untertitel (optional)", selector: { text: {} } },
    );
    (def?.fields || []).forEach((f) => general.push(f));
  }

  const sections = [
    { type: "expandable", title: "Allgemein", icon: "mdi:tune-variant", expanded: true, schema: general },
  ];

  // Empty-State: ohne gewählten Typ und ohne Legacy-Entität nur den Typ-Picker
  // anzeigen. Darstellungsfelder würden sonst versteckte Optionen suggerieren.
  if (t || hasLegacyEntity) {
    const appearance = [];
    if (def?.source !== "text") appearance.push({ name: "icon", label: "Icon", selector: { icon: {} } });
    if (def?.unit) appearance.push({ name: "unit", label: "Einheit (optional)", selector: { text: {} } });
    (spec.appearance || []).forEach((f) => appearance.push(f));
    sections.push({ type: "expandable", title: "Darstellung", icon: "mdi:palette", schema: appearance });

    // Aktionen (tap/hold/double_tap) — opt-in per Spec, eigener Abschnitt.
    if (spec.actions) sections.push(neoActionFields(spec.actionDefaults || {}));
  }

  return sections;
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
