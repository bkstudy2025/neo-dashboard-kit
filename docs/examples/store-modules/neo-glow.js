// Neo Module — Akzent-Glow
// Beispiel für ein STYLE-Modul, gebunden an ALLE Karten (target "*").
// Legt einen sanft pulsierenden Leuchtrahmen über die Karte.
import { NeoModules } from "../core/modules.js";

NeoModules.register({
  id: "neo-glow",
  name: "Akzent-Glow",
  description: "Sanft pulsierender Leuchtrahmen in der Akzentfarbe.",
  icon: "✨",
  target: "*",
  version: "1.0.0",
  author: "Neo",
  config: [],
  style() {
    return `
      .neo-card { animation: neoGlowPulse 2.6s ease-in-out infinite; }
      @keyframes neoGlowPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(124,156,255,0); }
        50%      { box-shadow: 0 0 24px 2px rgba(124,156,255,.40); }
      }`;
  },
});
