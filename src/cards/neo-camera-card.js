// Neo Dashboard Kit — Camera Card (Legacy-Alias)
// Ersetzt durch "Neo Anzeige" (neo-display-card). Versteckt für Kompatibilität.
import { NeoDisplayCard } from "./neo-display-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";

class NeoCameraCard extends NeoDisplayCard {}

NeoDashboardRegistry.registerCard("neo-camera-card", NeoCameraCard, {
  name: "Neo Kamera",
  description: "(ersetzt durch Neo Anzeige)",
  hidden: true,
});

export { NeoCameraCard };
