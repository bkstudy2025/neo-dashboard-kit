// Neo Module (Store) — Status-Glow
// Eigenständiges Store-Modul: KEINE Imports aus dem Bundle. Es registriert
// sich selbst über die öffentliche API window.NeoDashboard.registerModule und
// ist damit komplett standalone (so wird jedes Store-/Community-Modul gebaut).
(function () {
  if (!window.NeoDashboard || !window.NeoDashboard.registerModule) return;

  window.NeoDashboard.registerModule({
    id: "neo-state-glow",
    name: "Status-Glow",
    description: "Färbt den Kartenrand je nach Zustand einer Entität (an/aus).",
    icon: "🟢",
    target: "*",
    version: "1.0.0",
    author: "Community",
    config: [
      { name: "entity", label: "Entität", selector: { entity: {} } },
      {
        name: "color",
        label: "Farbe (an)",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "green", label: "Grün" },
              { value: "blue", label: "Blau" },
              { value: "amber", label: "Bernstein" },
              { value: "rose", label: "Rosé" },
            ],
          },
        },
      },
    ],
    // style()-Hook: dynamisches CSS abhängig vom Live-Zustand der Entität.
    style: function (ctx) {
      var s = ctx.settings || {};
      var ent = s.entity;
      var st = ent && ctx.hass && ctx.hass.states[ent] ? ctx.hass.states[ent].state : null;
      var on = st === "on" || st === "home" || st === "playing" || st === "open" || st === "active";
      var map = {
        green: "94,220,184",
        blue: "124,156,255",
        amber: "240,180,41",
        rose: "244,114,182",
      };
      var rgb = map[s.color] || map.green;
      var shadow = on ? "0 0 22px 1px rgba(" + rgb + ",.55)" : "0 0 0 0 rgba(" + rgb + ",0)";
      return ".neo-card{box-shadow:" + shadow + ";transition:box-shadow .4s ease;}";
    },
  });
})();
