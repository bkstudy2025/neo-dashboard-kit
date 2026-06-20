// Neo Dashboard Kit — Externe Links
// Im Editor unter "Info & Support" und vom Modul-Store genutzt.
// TODO: trage hier deine echte Patreon-/PayPal-/Ko-fi-URL ein.
export const NEO_LINKS = {
  repo: "https://github.com/bkstudy2025/neo-dashboard-kit",
  issues: "https://github.com/bkstudy2025/neo-dashboard-kit/issues",
  patreon: "https://www.patreon.com/",
  paypal: "https://www.paypal.com/",
  kofi: "https://ko-fi.com/",
  // Community-Diskussionen (Support/Showcase/Wünsche). Hinweis: der Store
  // installiert NICHT aus Discussions, sondern aus dem kuratierten Katalog
  // (modulesIndex) — geprüft, versioniert, CDN-ausgeliefert. Der Link führt
  // direkt in die Einreichungs-Kategorie "Community Cards & Modules".
  newDiscussion: "https://github.com/bkstudy2025/neo-dashboard-kit/discussions/new?category=community-cards-modules",
  // Neo Module Store — Katalog liegt im Repo unter store/.
  // index.json wird LIVE über raw.githubusercontent.com geladen: Änderungen auf
  // main erscheinen in ~5 min bzw. sofort per "Store aktualisieren" (Cache-Bust),
  // ganz OHNE neuen Kit-Release oder neues neo-dashboard.js-Bundle.
  // Die einzelnen Modul-/Karten-Dateien (url im index.json) liegen weiter auf dem
  // jsDelivr-CDN — neue Einträge sind neue Dateien (neue URL), also nie stale.
  // index.json = [{ id, kind?, name, description, target, author, version, icon, image, url, homepage }]
  modulesIndex: "https://raw.githubusercontent.com/bkstudy2025/neo-dashboard-kit/main/store/index.json",
  modulesRepo: "https://github.com/bkstudy2025/neo-dashboard-kit/tree/main/store",
};
