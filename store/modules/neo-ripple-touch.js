// neo-ripple-touch.js
// Neo Dashboard Kit — Community module.
// Adds a tactile ripple that bursts from the touch point on any Neo card — the
// small bit of feedback that makes a dashboard feel native on a phone.
// Theme-adaptive ripple tint, honours reduced-motion, pure pointer events.

(function () {
  const Neo = window.NeoDashboard;
  if (!Neo || !Neo.registerModule) {
    console.warn("[Neo Ripple Touch] NeoDashboard.registerModule not found.");
    return;
  }
  const ACC = { blue: "#7C9CFF", mint: "#5EDCB8", amber: "#FFB26B", violet: "#C084FC", rose: "#F87171" };
  const reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  Neo.registerModule({
    id: "neo-ripple-touch",
    name: "Neo Ripple Touch",
    description: "Material-style touch ripple from the tap point for any card.",
    icon: "🌊",
    version: "1.0.0",
    author: "Community",
    target: "*",

    config: [
      {
        name: "color", label: "Ripple colour",
        selector: { select: { mode: "dropdown", options: [
          { value: "auto", label: "Auto (theme)" }, { value: "blue", label: "Blue" },
          { value: "mint", label: "Mint" }, { value: "amber", label: "Amber" },
          { value: "violet", label: "Violet" }, { value: "rose", label: "Rose" },
        ] } },
      },
    ],

    style() {
      return `
        @keyframes neo-ripple { from { transform:scale(0); opacity:.55 } to { transform:scale(1); opacity:0 } }
        .neo-ripple-host { position:absolute; inset:0; z-index:7; overflow:hidden; border-radius:inherit; pointer-events:none; }
        .neo-ripple-host span { position:absolute; border-radius:50%; transform:scale(0);
          animation: neo-ripple 600ms cubic-bezier(.2,.8,.2,1) forwards; }
      `;
    },

    decorate(root, ctx) {
      if (reduce) return;
      const card = root.querySelector(".neo-card");
      if (!card || card.dataset.neoRipple === "1") return;
      card.dataset.neoRipple = "1";
      card.style.position = card.style.position || "relative";

      const host = document.createElement("div");
      host.className = "neo-ripple-host";
      card.appendChild(host);

      const dark = ctx.hass?.themes?.darkMode ?? true;
      const tint = (ctx.settings?.color && ctx.settings.color !== "auto")
        ? (ACC[ctx.settings.color] || ACC.blue)
        : (dark ? "rgba(255,255,255,.9)" : "rgba(40,55,90,.6)");

      card.addEventListener("pointerdown", (e) => {
        const r = card.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 1.1;
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const s = document.createElement("span");
        s.style.left = `${x - size / 2}px`;
        s.style.top = `${y - size / 2}px`;
        s.style.width = s.style.height = `${size}px`;
        s.style.background = `radial-gradient(circle, ${tint} 0%, transparent 70%)`;
        host.appendChild(s);
        setTimeout(() => s.remove(), 620);
      });
    },
  });
})();
