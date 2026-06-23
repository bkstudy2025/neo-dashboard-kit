// neo-tilt-shine.js
// Neo Dashboard Kit — Community module.
// Gives ANY Neo card a tactile, premium feel: a subtle 3D tilt that follows the
// pointer plus a moving specular glare. Works without an entity. Respects
// prefers-reduced-motion. Pure pointer events — no timers, no network.

(function () {
  const Neo = window.NeoDashboard;
  if (!Neo || !Neo.registerModule) {
    console.warn("[Neo Tilt Shine] NeoDashboard.registerModule not found.");
    return;
  }

  const reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  Neo.registerModule({
    id: "neo-tilt-shine",
    name: "Neo Tilt Shine",
    description: "Pointer-reactive 3D tilt and specular glare for any Neo card.",
    icon: "💠",
    version: "1.0.0",
    author: "Community",
    target: "*",

    config: [
      {
        name: "strength", label: "Tilt strength",
        selector: { select: { mode: "dropdown", options: [
          { value: "subtle", label: "Subtle" },
          { value: "medium", label: "Medium" },
          { value: "strong", label: "Strong" },
        ] } },
      },
      { name: "glare", label: "Show glare", selector: { boolean: {} } },
    ],

    style() {
      return `
        .neo-card.neo-tilt {
          transform-style: preserve-3d;
          transition: transform 320ms cubic-bezier(.2,.8,.2,1);
          will-change: transform;
        }
        .neo-tilt-glare {
          position:absolute; inset:0; z-index:2; border-radius:inherit;
          opacity:0; transition:opacity 240ms ease; pointer-events:none;
          mix-blend-mode:screen;
          background: radial-gradient(180px circle at var(--gx,50%) var(--gy,50%),
                      rgba(255,255,255,.28), transparent 60%);
        }
        .neo-card.neo-tilt:hover .neo-tilt-glare { opacity:1; }
      `;
    },

    decorate(root, ctx) {
      const card = root.querySelector(".neo-card");
      if (!card || card.dataset.neoTilt === "1") return;
      card.dataset.neoTilt = "1";
      card.classList.add("neo-tilt");

      const s = ctx.settings || {};
      const MAX = reduce ? 0 : ({ subtle: 4, medium: 8, strong: 13 }[s.strength] || 8);

      let glare = null;
      if (s.glare !== false) {
        glare = document.createElement("div");
        glare.className = "neo-tilt-glare";
        card.appendChild(glare);
      }

      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const ry = (px - 0.5) * 2 * MAX;
        const rx = (0.5 - py) * 2 * MAX;
        card.style.transform =
          `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        if (glare) {
          glare.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
          glare.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
        }
      };
      const reset = () => { card.style.transform = "perspective(900px)"; };

      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", reset);
    },
  });
})();
