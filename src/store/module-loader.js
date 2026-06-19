// Neo Dashboard Kit — Module loader
// Loads pasted module code (script injection, deduped). Used by the
// neo-card wrapper at runtime and by its editor's "Modul einfügen" area.
// Returns { ok, modules, cards } where modules/cards are the manifests that
// registered while the pasted code ran — including updates of existing IDs.

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

    // Backward compatibility for the current editor: it already accepts
    // res.cards for updates. Expose touched modules there too so an existing
    // module update is never misreported as "no module/card detected".
    const editorCards = cards.length ? cards : modules.map((m) => ({ type: m.id, name: m.name || m.id, isModule: true }));

    // Live-Swap aller neo-card-Instanzen auf die (neue) Modul-Version – kein Reload nötig.
    window.dispatchEvent(new CustomEvent("neo-module-changed"));
    return { ok: true, modules, cards: editorCards };
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
