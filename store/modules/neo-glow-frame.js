// neo-glow-frame.js
// Free community module for Neo Dashboard Kit.
// Adds a subtle state-aware glow/border effect to Neo cards.

(function () {
  const Neo = window.NeoDashboard;
  if (!Neo || !Neo.registerModule) {
    console.warn("[Neo Glow Frame] NeoDashboard.registerModule not found.");
    return;
  }

  const COLOR_MAP = {
    blue: "#5b8cff",
    amber: "#f5b942",
    mint: "#48d6a0",
    violet: "#9b7cff",
    rose: "#ff6b9a",
    red: "#ff5f57",
    green: "#48d66d",
    cyan: "#4dd8ff",
    white: "#ffffff",
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

  function colorValue(settings) {
    const raw = String(settings.color || "").trim();
    if (/^#[0-9a-f]{3,8}$/i.test(raw)) return raw;
    return COLOR_MAP[raw] || COLOR_MAP.blue;
  }

  Neo.registerModule({
    id: "neo-glow-frame",
    name: "Neo Glow Frame",
    description: "Adds a subtle state-aware glow and border effect to Neo cards.",
    icon: "✨",
    version: "1.0.0",
    author: "Community",
    target: "*",

    config: [
      {
        name: "entity",
        label: "Entity optional",
        selector: { entity: {} }
      },
      {
        name: "active_states",
        label: "Active states optional, comma-separated",
        selector: { text: {} }
      },
      {
        name: "color",
        label: "Glow color",
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
        selector: { number: { min: 1, max: 5, step: 1, mode: "slider" } }
      },
      {
        name: "always_on",
        label: "Always show glow",
        selector: { boolean: {} }
      }
    ],

    style() {
      return `
        .neo-glow-frame-active {
          position: relative;
          overflow: hidden;
        }

        .neo-glow-frame-active::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          border-radius: inherit;
          border: 1px solid var(--neo-glow-frame-color, rgba(91, 140, 255, .75));
          box-shadow:
            0 0 calc(10px * var(--neo-glow-frame-intensity, 2)) var(--neo-glow-frame-soft, rgba(91, 140, 255, .28)),
            inset 0 0 calc(6px * var(--neo-glow-frame-intensity, 2)) var(--neo-glow-frame-soft, rgba(91, 140, 255, .16));
        }
      `;
    },

    decorate(root, ctx) {
      const settings = ctx.settings || {};
      const card = root.querySelector(".neo-card");
      if (!card) return;

      card.classList.remove("neo-glow-frame-active");
      card.style.removeProperty("--neo-glow-frame-color");
      card.style.removeProperty("--neo-glow-frame-soft");
      card.style.removeProperty("--neo-glow-frame-intensity");

      const entityId = settings.entity || ctx.config?.entity;
      const stateObj = entityId ? ctx.hass?.states?.[entityId] : null;
      const activeStates = normalizeList(settings.active_states);
      const active = !!settings.always_on || isActiveState(stateObj?.state, activeStates);
      if (!active) return;

      const color = colorValue(settings);
      const intensity = Math.max(1, Math.min(5, Number(settings.intensity || 2)));

      card.style.setProperty("--neo-glow-frame-color", color);
      card.style.setProperty("--neo-glow-frame-soft", `${color}44`);
      card.style.setProperty("--neo-glow-frame-intensity", String(intensity));
      card.classList.add("neo-glow-frame-active");
    }
  });
})();
