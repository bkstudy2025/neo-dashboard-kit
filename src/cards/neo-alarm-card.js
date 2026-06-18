// Neo Dashboard Kit — Alarm Card (Legacy-Alias)
// Ersetzt durch "Neo Steuerung" (neo-control-card). Versteckt für Kompatibilität.
import { NeoControlCard } from "./neo-control-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";

class NeoAlarmCard extends NeoControlCard {}

NeoDashboardRegistry.registerCard("neo-alarm-card", NeoAlarmCard, {
  name: "Neo Alarm",
  description: "(ersetzt durch Neo Steuerung)",
  hidden: true,
});

export { NeoAlarmCard };
