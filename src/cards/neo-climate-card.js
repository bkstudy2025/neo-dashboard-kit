// Neo Dashboard Kit — Climate Card (Legacy-Alias)
// Ersetzt durch "Neo Steuerung" (neo-control-card). Versteckt für Kompatibilität.
import { NeoControlCard } from "./neo-control-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";

class NeoClimateCard extends NeoControlCard {}

NeoDashboardRegistry.registerCard("neo-climate-card", NeoClimateCard, {
  name: "Neo Klima",
  description: "(ersetzt durch Neo Steuerung)",
  hidden: true,
});

export { NeoClimateCard };
