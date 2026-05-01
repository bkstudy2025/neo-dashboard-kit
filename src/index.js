import "./cards/neo-demo-card.js";

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

console.info(
  `%cNeo Dashboard Kit ${NEO_VERSION}%c geladen`,
  "color:#5dade2;font-weight:900",
  "color:inherit"
);