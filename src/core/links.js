// Neo Dashboard Kit — Externe Links
// Im Editor unter "Info & Support" und vom Store (Karten & Module) genutzt.
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
  // Neo Store (Karten & Module) — Katalog liegt im Repo unter store/.
  // index.json wird LIVE geladen, ganz OHNE neuen Kit-Release/Bundle:
  //  - PRIMÄR über die GitHub-API (api.github.com/.../contents/...): Echtzeit,
  //    KEIN Pfad-CDN-Cache → frisch gemergte Versionen erscheinen sofort.
  //  - FALLBACK über raw.githubusercontent.com (falls die API mal scheitert,
  //    z. B. Rate-Limit) — ~5 min CDN-Cache.
  // Beide Quellen werden serverseitig über die Integration "Neo Dashboard Tools"
  // geladen (CORS) und sind dort auf genau diesen Pfad beschränkt.
  // Die einzelnen Modul-/Karten-Dateien (url im index.json) liegen auf jsDelivr
  // und sind auf einen Commit-SHA gepinnt (unveränderlich, nie stale).
  // index.json = [{ id, kind?, name, description, target, author, version, icon, image, url, homepage }]
  modulesIndex: "https://api.github.com/repos/bkstudy2025/neo-dashboard-kit/contents/store/index.json?ref=main",
  modulesIndexFallback: "https://raw.githubusercontent.com/bkstudy2025/neo-dashboard-kit/main/store/index.json",
  modulesRepo: "https://github.com/bkstudy2025/neo-dashboard-kit/tree/main/store",
};
