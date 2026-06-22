// neo-accent-wash.js
// Free community module for Neo Dashboard Kit.
// Adds an always-on or state-aware accent background gradient to Neo cards.

(function () {
  const Neo = window.NeoDashboard;
  if (!Neo || !Neo.registerModule) {
    console.warn("[Neo Accent Wash] NeoDashboard.registerModule not found.");
    return;
  }

  const COLORS = {
    blue: "91, 140, 255",
    amber: "245, 185, 66",
    mint: "72, 214, 160",
    violet: "155, 124, 255",
    rose: "255, 107, 154",
    red: "255, 95, 87",
    green: "72, 214, 109",
    cyan: "77, 216, 255",
    white: "255, 255, 255",
  };

  function normalizeList(value) {
    if (Array.isArray(value)) return value.map((x) => String(x).trim()).filter(Boolean);
    return String(value || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function isActiveState(state, activeStates) {
    if (!state || state === "unknown" || state === "unavailable") return false;
    const list = activeStates.length ? activeStates : ["on", "open", "opening", "playing", "heating", "cooling", "triggered", "locked"];
    return list.includes(state);
  }

  function colorRgb(settings) {
    const raw = String(settings.color || "blue").trim();
    return COLORS[raw] || COLORS.blue;
  }

  Neo.registerModule({
    id: "neo-accent-wash",
    name: "Neo Accent Wash",
    description: "Adds an always-on or state-aware accent background gradient to Neo cards.",
    icon: "🌈",
    version: "1.0.3",
    author: "Community",
    target: "*",

    config: [
      {
        name: "mode",
        label: "Display mode",
        default: "always",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "always", label: "Always" },
              { value: "state", label: "When entity is active" }
            ]
          }
        }
      },
      {
        name: "entity",
        label: "Entity optional (mode: when active)",
        selector: { entity: {} }
      },
      {
        name: "active_states",
        label: "Active states optional, comma-separated (mode: when active)",
        selector: { text: {} }
      },
      {
        name: "color",
        label: "Accent color",
        default: "blue",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "blue", label: "Blue" },
              { value: "amber", label: "Amber" },
              { value: "mint", label: "Mint" },
              { value: "violet", label: "Violet" },
              { value: "rose", label: "Rose" },
              { value: "red", label: "Red" },
              { value: "green", label: "Green" },
              { value: "cyan", label: "Cyan" },
              { value: "white", label: "White" }
            ]
          }
        }
      },
      {
        name: "intensity",
        label: "Intensity",
        default: 2,
        selector: { number: { min: 1, max: 5, step: 1, mode: "slider" } }
      },
      {
        name: "angle",
        label: "Gradient angle",
        default: 160,
        selector: { number: { min: 0, max: 360, step: 5, mode: "box" } }
      }
    ],

    style() {
      return `
        .neo-accent-wash-active {
          position: relative;
          overflow: hidden;
        }

        .neo-accent-wash-active::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          border-radius: inherit;
          background:
            linear-gradient(
              var(--neo-accent-wash-angle, 160deg),
              rgba(var(--neo-accent-wash-rgb, 91, 140, 255), var(--neo-accent-wash-alpha, .22)) 0%,
              rgba(var(--neo-accent-wash-rgb, 91, 140, 255), var(--neo-accent-wash-alpha-soft, .08)) 42%,
              transparent 78%
            );
        }

        .neo-accent-wash-active > * {
          position: relative;
          z-index: 1;
        }
      `;
    },

    decorate(root, ctx) {
      const settings = ctx.settings || {};
      const card = root.querySelector(".neo-card");
      if (!card) return;

      card.classList.remove("neo-accent-wash-active");
      card.style.removeProperty("--neo-accent-wash-rgb");
      card.style.removeProperty("--neo-accent-wash-alpha");
      card.style.removeProperty("--neo-accent-wash-alpha-soft");
      card.style.removeProperty("--neo-accent-wash-angle");

      const entityId = settings.entity || ctx.config?.entity;
      const hasEntity = !!entityId;
      const stateObj = hasEntity ? ctx.hass?.states?.[entityId] : null;
      const activeStates = normalizeList(settings.active_states);

      // Display mode (default: always-on so "module enabled = style visible").
      // Legacy "always_on: true" configs keep behaving as "always".
      const mode = settings.mode || "always";
      // mode "state": evaluate the entity; with no entity, still show (don't look broken).
      const active = mode !== "state" || !hasEntity || isActiveState(stateObj?.state, activeStates);
      if (!active) return;

      const rgb = colorRgb(settings);
      const intensity = Math.max(1, Math.min(5, Number(settings.intensity || 2)));
      const angle = Math.max(0, Math.min(360, Number(settings.angle || 160)));
      const alpha = 0.10 + intensity * 0.055;
      const alphaSoft = 0.03 + intensity * 0.025;

      card.style.setProperty("--neo-accent-wash-rgb", rgb);
      card.style.setProperty("--neo-accent-wash-alpha", String(alpha));
      card.style.setProperty("--neo-accent-wash-alpha-soft", String(alphaSoft));
      card.style.setProperty("--neo-accent-wash-angle", `${angle}deg`);
      card.classList.add("neo-accent-wash-active");
    }
  });
})();
