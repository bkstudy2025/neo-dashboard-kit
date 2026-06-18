// Neo Dashboard Kit — Cover Card (Legacy-Alias)
// Ersetzt durch "Neo Steuerung" (neo-control-card). Versteckt für Kompatibilität.
import { NeoControlCard } from "./neo-control-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";

class NeoCoverCard extends NeoControlCard {}

NeoDashboardRegistry.registerCard("neo-cover-card", NeoCoverCard, {
  name: "Neo Cover",
  description: "(ersetzt durch Neo Steuerung)",
  hidden: true,
});

export { NeoCoverCard };
