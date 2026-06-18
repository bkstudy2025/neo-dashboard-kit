// Neo Dashboard Kit — Light Group Card (Legacy-Alias)
// Ersetzt durch "Neo Steuerung" (neo-control-card); diese erkennt mehrere
// Lichter über das Feld `entities`. Versteckt für Kompatibilität.
import { NeoControlCard } from "./neo-control-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";

class NeoLightGroupCard extends NeoControlCard {}

NeoDashboardRegistry.registerCard("neo-light-group-card", NeoLightGroupCard, {
  name: "Neo Licht-Gruppe",
  description: "(ersetzt durch Neo Steuerung)",
  hidden: true,
});

export { NeoLightGroupCard };
