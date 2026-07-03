// Neo Dashboard Kit — Debug-Logging
// Registrierungs- und Modul-Logs sind standardmäßig STUMM, damit die Browser-
// Konsole übersichtlich bleibt. Der Versions-Banner bleibt immer sichtbar.
//
// Aktivieren (für Support/Entwicklung) in der Browser-Konsole:
//   localStorage.setItem("neo-debug", "1");   // + Seite neu laden
// Deaktivieren:
//   localStorage.removeItem("neo-debug");

export function neoDebugEnabled() {
  try {
    return window.localStorage?.getItem("neo-debug") === "1";
  } catch (_e) {
    return false; // localStorage kann in Sonderkontexten blockiert sein
  }
}

export function neoLog(...args) {
  if (neoDebugEnabled()) console.info(...args);
}
