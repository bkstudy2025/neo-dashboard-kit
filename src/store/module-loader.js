// Neo Dashboard Kit — Module loader
// Loads pasted module code (script injection, deduped). Used by the
// neo-card wrapper at runtime and by its editor's "Modul einfügen" area.
// Returns { ok, cards } where cards = metadata of newly registered cards.
import { NeoDashboardRegistry } from "../core/registry.js";

export function neoLoadModule(code) {
  if (!code || !code.trim()) return { ok: false, cards: [] };
  window.__neoModules = window.__neoModules || new Set();
  const key = code.length + ":" + code.slice(0, 96);
  if (window.__neoModules.has(key)) return { ok: true, cards: [] };
  const before = new Set(NeoDashboardRegistry.list().map((c) => c.type));
  try {
    const s = document.createElement("script");
    s.textContent = code;
    document.head.appendChild(s);
    window.__neoModules.add(key);
    const cards = NeoDashboardRegistry.list().filter((c) => !before.has(c.type));
    // Live-Swap aller neo-card-Instanzen auf die (neue) Modul-Version – kein Reload nötig.
    window.dispatchEvent(new CustomEvent("neo-module-changed"));
    return { ok: true, cards };
  } catch (e) {
    console.error("[Neo Module] Fehler beim Laden:", e);
    return { ok: false, cards: [] };
  }
}
