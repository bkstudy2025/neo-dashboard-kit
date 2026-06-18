// Neo Module (Store) — Cover-Positions-Slider
// Beispiel für ein DECORATE-Layer-Modul, gebunden an die Steuerungs-Karte.
// Ergänzt bei Rollladen-/Cover-Entitäten einen Positions-Slider unter den
// Auf/Stopp/Zu-Tasten (cover.set_cover_position). Eigenständig, keine Imports.
(function () {
  if (!window.NeoDashboard || !window.NeoDashboard.registerModule) return;

  window.NeoDashboard.registerModule({
    id: "neo-cover-position",
    name: "Cover-Positions-Slider",
    description: "Positions-Slider (%) für Rollläden — exakt anfahren.",
    icon: "🪟",
    target: ["neo-control-card", "neo-cover-card"],
    version: "1.0.0",
    author: "Community",
    config: [],
    decorate: function (root, ctx) {
      var id = ctx.config && ctx.config.entity;
      if (!id || id.split(".")[0] !== "cover") return; // nur für Cover
      var st = ctx.hass && ctx.hass.states[id];
      if (!st) return;
      var supported = (st.attributes.supported_features || 0) & 4; // SET_POSITION
      if (!supported) return;
      var card = root.getElementById("card");
      if (!card) return;

      var pos = typeof st.attributes.current_position === "number" ? st.attributes.current_position : 0;
      var wrap = document.createElement("div");
      wrap.style.cssText = "margin-top:10px;";
      wrap.innerHTML =
        '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--neo-text3);">' +
        '<span>Position</span><span style="font-weight:600;">' + pos + '%</span></div>' +
        '<input type="range" min="0" max="100" value="' + pos + '" ' +
        'style="width:100%;height:26px;border-radius:9px;-webkit-appearance:none;appearance:none;cursor:pointer;' +
        'background:linear-gradient(90deg,var(--neo-accent-blue,#7C9CFF) 0%,var(--neo-accent-blue,#7C9CFF) ' + pos + '%,var(--neo-line2,rgba(255,255,255,.1)) ' + pos + '%);' +
        'border:1px solid var(--neo-line1,rgba(255,255,255,.06));" />';
      var slider = wrap.querySelector("input");
      slider.addEventListener("click", function (e) { e.stopPropagation(); });
      slider.addEventListener("change", function (e) {
        ctx.callService("cover", "set_cover_position", { entity_id: id, position: +e.target.value });
      });
      card.appendChild(wrap);
    },
  });
})();
