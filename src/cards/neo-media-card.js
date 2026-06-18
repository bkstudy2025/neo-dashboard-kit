// Neo Dashboard Kit — Media Card (Legacy-Alias)
// Ersetzt durch "Neo Steuerung" (neo-control-card). Versteckt für Kompatibilität.
import { NeoControlCard } from "./neo-control-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";

class NeoMediaCard extends NeoControlCard {}

NeoDashboardRegistry.registerCard("neo-media-card", NeoMediaCard, {
  name: "Neo Media",
  description: "(ersetzt durch Neo Steuerung)",
  hidden: true,
});

export { NeoMediaCard };
