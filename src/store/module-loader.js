// Neo Dashboard Kit — Extension loader (cards & modules)
// Loads pasted extension code (cards or modules; script injection, deduped).
// Used by the neo-card wrapper at runtime and by its editor's paste-code area.
// Returns { ok, modules, cards } — the manifests that registered while the
// pasted code ran (new installs AND updates of existing IDs). The two lists are
// kept strictly separate: `modules` comes only from registerModule, `cards`
// only from registerCard. A module is never reported as a card.

export function neoLoadModule(code) {
  if (!code || !code.trim()) return { ok: false, modules: [], cards: [] };
  window.__neoModules = window.__neoModules || new Set();

  const modules = [];
  const cards = [];
  const originalRegisterModule = window.NeoDashboard?.registerModule;
  const originalRegisterCard = window.NeoDashboard?.registerCard;

  try {
    // Capture both new installs and updates. The editor needs the touched ID;
    // diffing only "new IDs" fails when an existing module/card is updated.
    if (window.NeoDashboard) {
      window.NeoDashboard.registerModule = (manifest) => {
        const res = originalRegisterModule ? originalRegisterModule.call(window.NeoDashboard, manifest) : null;
        if (manifest?.id) modules.push(res || manifest);
        return res;
      };
      window.NeoDashboard.registerCard = (type, cls, meta = {}) => {
        const res = originalRegisterCard ? originalRegisterCard.call(window.NeoDashboard, type, cls, meta) : null;
        if (type) cards.push({ type, ...(meta || {}) });
        return res;
      };
    }

    const s = document.createElement("script");
    s.textContent = code;
    document.head.appendChild(s);

    const key = code.length + ":" + code.slice(0, 96);
    window.__neoModules.add(key);

    // Live-Swap aller neo-card-Instanzen auf die (neue) Modul-Version – kein Reload nötig.
    window.dispatchEvent(new CustomEvent("neo-module-changed"));
    // `modules` and `cards` are reported separately and never cross-mapped, so
    // the editor can tell a pasted module from a pasted card reliably.
    return { ok: true, modules, cards };
  } catch (e) {
    console.error("[Neo Module] Fehler beim Laden:", e);
    return { ok: false, modules: [], cards: [] };
  } finally {
    if (window.NeoDashboard) {
      if (originalRegisterModule) window.NeoDashboard.registerModule = originalRegisterModule;
      if (originalRegisterCard) window.NeoDashboard.registerCard = originalRegisterCard;
    }
  }
}
