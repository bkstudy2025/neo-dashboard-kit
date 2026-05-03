import "./cards/neo-demo-card.js";
import "./cards/neo-header-card.js";
import "./cards/neo-sensor-card.js";

const NEO_VERSION = "0.4.0-dev";

/**
 * Registriert eine Card im globalen window.customCards-Array,
 * sodass sie im Lovelace-Card-Picker auftaucht.
 * Verhindert doppelte Einträge, falls das Bundle mehrfach geladen wird.
 */
function registerCard({ type, name, description, preview }) {
  if (!window.customCards) {
    window.customCards = [];
  }
  if (window.customCards.some((c) => c.type === type)) {
    return;
  }
  window.customCards.push({
    type,
    name,
    description,
    preview: preview ?? false,
  });
}

registerCard({
  type: "neo-demo-card",
  name: "Neo Demo Card",
  description: "Demo-Karte zum Testen des Neo-Fundaments.",
  preview: false,
});

registerCard({
  type: "neo-header-card",
  name: "Neo Header Card",
  description: "Persönlicher Header mit Begrüßung, Avatar und Status.",
  preview: true,
});

registerCard({
  type: "neo-sensor-card",
  name: "Neo Sensor Card",
  description: "Anzeige eines Sensors mit Icon, Wert und optionaler Sekundär-Info.",
  preview: true,
});

console.info(
  `%cNeo Dashboard Kit ${NEO_VERSION}%c geladen`,
  "color:#5dade2;font-weight:900",
  "color:inherit"
);