/**
 * Escape-Funktion gegen XSS. Pflicht für alle dynamischen Werte,
 * die als HTML/Attribut gerendert werden — vor allem User-Strings,
 * Friendly-Names und Entity-Picture-URLs.
 */
export function escapeHtml(value) {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Liefert fallback, wenn value leer/null/undefined.
 */
export function safe(value, fallback = "") {
  return value === undefined || value === null || value === "" ? fallback : value;
}

/**
 * Normalisiert Strings für Vergleiche (Trim + lowercase).
 */
export function normalize(value) {
  return String(value || "").trim().toLowerCase();
}