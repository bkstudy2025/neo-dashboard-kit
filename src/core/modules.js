// Neo Dashboard Kit — Module registry ("Neo Module Layers")
// Karten-gebundene Erweiterungs-Module. Ein Modul ist ein deklaratives
// Manifest (mit Ziel-Karte + optionalem Config-Schema) plus optionale,
// typisierte Hooks. So bleiben die Basis-Karten schlank und alle "großen"
// Funktionen kommen aus Modulen (Premium/Community).
//
// Manifest-Form:
//   {
//     id: "neo-badge",            // eindeutig (Pflicht)
//     name, description, icon,    // Anzeige
//     target: "neo-button-card",  // Ziel-Karte, Liste, oder "*" für alle
//     version, author,            // Meta (author = Badge: Premium/Community/…)
//     config: [ ...ha-form-Schema... ],   // eigene Einstellungen (optional)
//     // Hooks (alle optional):
//     style(ctx)    -> CSS-String (in den Shadow-Root der Karte)
//     decorate(root, ctx)         -> DOM nachträglich ergänzen
//   }
// ctx = { hass, config, settings, card }

const _modules = new Map();

function matches(target, cardType) {
  if (!target || target === "*") return true;
  if (Array.isArray(target)) return target.includes(cardType);
  return target === cardType;
}

export const NeoModules = {
  register(manifest) {
    if (!manifest || !manifest.id) {
      console.warn("[Neo Module] Manifest ohne id ignoriert.");
      return;
    }
    _modules.set(manifest.id, manifest); // overwrite on update
    console.info(`[Neo Module] Registered: ${manifest.id} → ${manifest.target || "*"}`);
  },
  get(id) { return _modules.get(id); },
  list() { return Array.from(_modules.values()); },
  // Passt ein target (Manifest oder Store-Eintrag) zu einer Karte?
  matches(target, cardType) { return matches(target, cardType); },
  // Nur Module, deren target zur Karte passt (für den Editor + Anzeige).
  forCard(cardType) {
    return Array.from(_modules.values()).filter((m) => matches(m.target, cardType));
  },
};

// Öffentliche API für externe/Premium-Module.
if (window.NeoDashboard) {
  window.NeoDashboard.modules = NeoModules;
  window.NeoDashboard.registerModule = (m) => NeoModules.register(m);
}
