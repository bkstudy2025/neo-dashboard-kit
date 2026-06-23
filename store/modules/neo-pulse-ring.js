// neo-pulse-ring.js
// Neo Dashboard Kit — Community module.
// Draws an animated conic progress ring in a corner of a Neo card, driven by a
// numeric entity (battery, humidity, CPU, …). The ring sweeps to the current
// value, glows in the chosen accent and gently breathes. Pure CSS animation —
// no timers, no network.

(function () {
  const Neo = window.NeoDashboard;
  if (!Neo || !Neo.registerModule) {
    console.warn("[Neo Pulse Ring] NeoDashboard.registerModule not found.");
    return;
  }

  const ACCENTS = {
    blue: "#7C9CFF", mint: "#5EDCB8", amber: "#FFB26B",
    violet: "#C084FC", rose: "#F87171",
  };
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  Neo.registerModule({
    id: "neo-pulse-ring",
    name: "Neo Pulse Ring",
    description: "Animated conic progress ring from a numeric entity.",
    icon: "🔆",
    version: "1.0.0",
    author: "Community",
    target: ["neo-control-card", "neo-display-card"],

    config: [
      { name: "entity", label: "Entity (numeric)", selector: { entity: {} } },
      { name: "min", label: "Min value", selector: { number: { mode: "box" } } },
      { name: "max", label: "Max value", selector: { number: { mode: "box" } } },
      {
        name: "accent", label: "Accent",
        selector: { select: { mode: "dropdown", options: [
          { value: "blue", label: "Blue" }, { value: "mint", label: "Mint" },
          { value: "amber", label: "Amber" }, { value: "violet", label: "Violet" },
          { value: "rose", label: "Rose" },
        ] } },
      },
      {
        name: "position", label: "Corner",
        selector: { select: { mode: "dropdown", options: [
          { value: "top-right", label: "Top right" },
          { value: "top-left", label: "Top left" },
          { value: "bottom-right", label: "Bottom right" },
          { value: "bottom-left", label: "Bottom left" },
        ] } },
      },
      { name: "show_value", label: "Show value", selector: { boolean: {} } },
    ],

    style() {
      return `
        @keyframes neo-pr-breathe { 0%,100%{ filter:brightness(1) } 50%{ filter:brightness(1.25) } }
        @keyframes neo-pr-spin { to { transform: rotate(360deg) } }
        .neo-pulse-ring {
          position:absolute; z-index:4; width:46px; height:46px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          animation: neo-pr-breathe 3.4s ease-in-out infinite;
          pointer-events:none;
        }
        .neo-pulse-ring .npr-track {
          position:absolute; inset:0; border-radius:50%;
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px));
                  mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px));
        }
        .neo-pulse-ring .npr-sheen {
          position:absolute; inset:-3px; border-radius:50%; opacity:.5;
          background: conic-gradient(from 0deg, transparent 0 70%, rgba(255,255,255,.7) 85%, transparent 100%);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px));
                  mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px));
          animation: neo-pr-spin 2.6s linear infinite;
        }
        .neo-pulse-ring .npr-val {
          position:relative; font-size:11px; font-weight:700; color:var(--neo-text1,#fff);
          text-shadow:0 1px 3px rgba(0,0,0,.5);
        }
        .neo-pulse-ring.top-right{ top:12px; right:12px } .neo-pulse-ring.top-left{ top:12px; left:12px }
        .neo-pulse-ring.bottom-right{ bottom:12px; right:12px } .neo-pulse-ring.bottom-left{ bottom:12px; left:12px }
      `;
    },

    decorate(root, ctx) {
      const s = ctx.settings || {};
      const card = root.querySelector(".neo-card");
      if (!card || card.querySelector(".neo-pulse-ring")) return;
      const st = s.entity ? ctx.hass?.states?.[s.entity] : null;
      if (!st) return;

      const min = Number.isFinite(+s.min) ? +s.min : 0;
      const max = Number.isFinite(+s.max) ? +s.max : 100;
      const raw = parseFloat(st.state);
      if (!Number.isFinite(raw) || max === min) return;
      const pct = clamp((raw - min) / (max - min), 0, 1);
      const col = ACCENTS[s.accent] || ACCENTS.blue;
      const deg = Math.round(pct * 360);

      const ring = document.createElement("div");
      ring.className = `neo-pulse-ring ${s.position || "top-right"}`;
      ring.style.filter = `drop-shadow(0 0 6px ${col}80)`;

      const track = document.createElement("div");
      track.className = "npr-track";
      track.style.background =
        `conic-gradient(${col} ${deg}deg, rgba(255,255,255,.10) ${deg}deg 360deg)`;
      track.style.transition = "background 600ms cubic-bezier(.2,.8,.2,1)";

      const sheen = document.createElement("div");
      sheen.className = "npr-sheen";

      ring.appendChild(track);
      ring.appendChild(sheen);

      if (s.show_value !== false) {
        const val = document.createElement("div");
        val.className = "npr-val";
        const unit = st.attributes?.unit_of_measurement || "";
        val.textContent = `${Math.round(raw)}${unit === "%" ? "%" : ""}`;
        ring.appendChild(val);
      }

      card.style.position = card.style.position || "relative";
      card.appendChild(ring);
    },
  });
})();
