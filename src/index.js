import "./cards/neo-demo-card.js";
import "./cards/neo-header-card.js";
import "./editors/neo-header-card-editor.js";

const NEO_VERSION = "0.4.0-dev";

window.customCards = window.customCards || [];

if (!window.customCards.some((c) => c.type === "neo-demo-card")) {
  window.customCards.push({
    type: "neo-demo-card",
    name: "Neo Demo Card",
    description: "Demo-Karte zum Testen des Neo-Fundaments.",
    preview: false,
  });
}

if (!window.customCards.some((c) => c.type === "neo-header-card")) {
  window.customCards.push({
    type: "neo-header-card",
    name: "Neo Header Card",
    description: "Persönlicher Header mit Begrüßung, Avatar und Status.",
    preview: true,
  });
}

console.info(
  `%cNeo Dashboard Kit ${NEO_VERSION}%c geladen`,
  "color:#5dade2;font-weight:900",
  "color:inherit"
);