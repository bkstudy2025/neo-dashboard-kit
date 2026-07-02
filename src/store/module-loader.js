// Neo Dashboard Kit — Extension loader (cards & modules)
// Loads extension code (cards or modules) via script injection. Re-loading the
// same ID is intentional: the registries overwrite the entry, which is exactly
// how updates go live without a page reload.
// Used by the neo-card wrapper at runtime and by its editor's paste-code area.
// Returns { ok, modules, cards } — the manifests that registered while the
// pasted code ran (new installs AND updates of existing IDs). The two lists are
// kept strictly separate: `modules` comes only from registerModule, `cards`
// only from registerCard. A module is never reported as a card.

export function neoLoadModule(code) {
  if (!code || !code.trim()) return { ok: false, modules: [], cards: [], error: "leerer Code" };

  const modules = [];
  const cards = [];
  const originalRegisterModule = window.NeoDashboard?.registerModule;
  const originalRegisterCard = window.NeoDashboard?.registerCard;

  // Inline-Scripts werfen ihre Laufzeitfehler NICHT an appendChild, sondern als
  // synchrones globales "error"-Event. Ohne dieses Abfangen würde ein Fehler
  // (z. B. veraltetes Bundle → fehlende API) stumm verpuffen und es sähe so aus,
  // als hätte der Code einfach nichts registriert. Wir fangen ihn auf, damit der
  // Editor eine klare, handlungsleitende Meldung zeigen kann.
  let loadError = null;
  const onErr = (e) => { loadError = (e && (e.message || (e.error && e.error.message))) || "Laufzeitfehler"; };
  window.addEventListener("error", onErr, true);

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

    // Live-Swap aller neo-card-Instanzen auf die (neue) Modul-Version – kein Reload nötig.
    window.dispatchEvent(new CustomEvent("neo-module-changed"));
    // `modules` and `cards` are reported separately and never cross-mapped, so
    // the editor can tell a pasted module from a pasted card reliably.
    // `error` is set only when the injected code threw at runtime AND registered
    // nothing useful (lets the editor distinguish "stale bundle / broken code"
    // from "code simply had no registerModule/registerCard call").
    const error = (!modules.length && !cards.length) ? loadError : null;
    return { ok: true, modules, cards, error };
  } catch (e) {
    console.error("[Neo Module] Fehler beim Laden:", e);
    return { ok: false, modules: [], cards: [], error: e?.message || String(e) };
  } finally {
    window.removeEventListener("error", onErr, true);
    if (window.NeoDashboard) {
      if (originalRegisterModule) window.NeoDashboard.registerModule = originalRegisterModule;
      if (originalRegisterCard) window.NeoDashboard.registerCard = originalRegisterCard;
    }
  }
}
