// Neo Dashboard Kit — Sensor Card (Legacy-Alias)
// Ersetzt durch "Neo Anzeige" (neo-display-card). Versteckt für Kompatibilität.
import { NeoDisplayCard } from "./neo-display-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";

class NeoSensorCard extends NeoDisplayCard {}

NeoDashboardRegistry.registerCard("neo-sensor-card", NeoSensorCard, {
  name: "Neo Sensor",
  description: "(ersetzt durch Neo Anzeige)",
  hidden: true,
});

export { NeoSensorCard };
