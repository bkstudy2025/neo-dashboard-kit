// Neo Dashboard Kit — Button Card (Legacy-Alias)
// Ersetzt durch die universelle "Neo Steuerung" (neo-control-card). Bleibt als
// versteckter Typ erhalten, damit bestehende Dashboards weiter rendern.
import { NeoControlCard } from "./neo-control-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";

class NeoButtonCard extends NeoControlCard {}

NeoDashboardRegistry.registerCard("neo-button-card", NeoButtonCard, {
  name: "Neo Button",
  description: "(ersetzt durch Neo Steuerung)",
  hidden: true,
});

export { NeoButtonCard };
