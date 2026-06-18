// Neo Dashboard Kit — Responsives Layout (geteilt von ALLEN Karten)
// Jede Karte erhält eine "layout"-Option: auto | mobile | tablet | desktop.
// "auto" richtet sich nach der Bildschirmbreite (Mobil-/Tablet-Dashboard),
// die festen Werte erzwingen ein Layout (z.B. Tablet-Ansicht am Desktop).

export const NEO_BP = { mobile: 640, tablet: 1024 }; // max. Breite je Stufe (px)

export const NEO_LAYOUT_OPTS = [
  { value: "auto", label: "Automatisch (Bildschirmbreite)" },
  { value: "mobile", label: "Mobil (kompakt)" },
  { value: "tablet", label: "Tablet" },
  { value: "desktop", label: "Desktop (groß)" },
];

export function normalizeLayout(v) {
  return ["mobile", "tablet", "desktop", "auto"].includes(v) ? v : "auto";
}

// Wiederverwendbares Editor-Feld für die Layout-Auswahl (alle Karten).
export const NEO_LAYOUT_FIELD = {
  name: "layout", label: "Layout / Gerät",
  selector: { select: { mode: "dropdown", options: NEO_LAYOUT_OPTS } },
};

export function neoViewportLayout() {
  const w = window.innerWidth || 1024;
  if (w <= NEO_BP.mobile) return "mobile";
  if (w <= NEO_BP.tablet) return "tablet";
  return "desktop";
}
