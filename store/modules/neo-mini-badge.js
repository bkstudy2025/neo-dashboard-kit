// neo-mini-badge.js
// Free community module example for Neo Dashboard Kit.
// Adds a small badge to supported Neo cards.

(function () {
  const Neo = window.NeoDashboard;
  if (!Neo || !Neo.registerModule) {
    console.warn("[Neo Mini Badge] NeoDashboard.registerModule not found.");
    return;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  Neo.registerModule({
    id: "neo-mini-badge",
    name: "Neo Mini Badge",
    description: "Shows a small secondary badge on Neo cards.",
    icon: "🏷️",
    version: "1.0.0",
    author: "Community",
    target: ["neo-control-card", "neo-display-card"],

    config: [
      {
        name: "entity",
        label: "Badge entity",
        selector: { entity: {} }
      },
      {
        name: "attribute",
        label: "Attribute optional",
        selector: { text: {} }
      },
      {
        name: "label",
        label: "Fallback label optional",
        selector: { text: {} }
      },
      {
        name: "position",
        label: "Position",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "top-right", label: "Top right" },
              { value: "bottom-right", label: "Bottom right" },
              { value: "bottom-left", label: "Bottom left" }
            ]
          }
        }
      }
    ],

    style() {
      return `
        .neo-mini-badge {
          position: absolute;
          z-index: 3;
          min-width: 26px;
          height: 24px;
          padding: 0 8px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: var(--neo-text1, #fff);
          background: var(--neo-fill2, rgba(255,255,255,.08));
          border: 1px solid var(--neo-line2, rgba(255,255,255,.14));
          backdrop-filter: blur(10px);
          pointer-events: none;
        }

        .neo-mini-badge.top-right {
          top: 14px;
          right: 56px;
        }

        .neo-mini-badge.bottom-right {
          right: 14px;
          bottom: 14px;
        }

        .neo-mini-badge.bottom-left {
          left: 14px;
          bottom: 14px;
        }
      `;
    },

    decorate(root, ctx) {
      const settings = ctx.settings || {};
      const card = root.querySelector(".neo-card");
      if (!card || card.querySelector(".neo-mini-badge")) return;

      const entityId = settings.entity;
      const stateObj = entityId ? ctx.hass?.states?.[entityId] : null;

      let value = settings.label || "";

      if (stateObj) {
        if (settings.attribute) {
          value = stateObj.attributes?.[settings.attribute] ?? settings.label ?? "";
        } else {
          const unit = stateObj.attributes?.unit_of_measurement || "";
          value = `${stateObj.state}${unit}`;
        }
      }

      if (!value) return;

      const badge = document.createElement("div");
      badge.className = `neo-mini-badge ${settings.position || "top-right"}`;
      badge.innerHTML = escapeHtml(value);

      card.style.position = card.style.position || "relative";
      card.appendChild(badge);
    }
  });
})();
