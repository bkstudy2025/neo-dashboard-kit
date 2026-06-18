// Neo Dashboard Kit — Fan Card (Legacy-Alias)
// Ersetzt durch "Neo Steuerung" (neo-control-card). Versteckt für Kompatibilität.
import { NeoControlCard } from "./neo-control-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";

class NeoFanCard extends NeoControlCard {}

NeoDashboardRegistry.registerCard("neo-fan-card", NeoFanCard, {
  name: "Neo Ventilator",
  description: "(ersetzt durch Neo Steuerung)",
  hidden: true,
});

export { NeoFanCard };
