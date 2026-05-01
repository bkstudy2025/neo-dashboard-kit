/**
 * Versucht aus einem beliebigen Wert eine Zahl zu machen.
 * Akzeptiert Komma als Dezimaltrennzeichen (deutsche Sensoren).
 * Liefert NaN, wenn keine Zahl drin ist.
 */
export function parseNumber(value) {
  if (value === undefined || value === null) return NaN;
  if (typeof value === "number") return value;
  const str = String(value).replace(",", ".").replace(/[^0-9.+-]/g, "");
  if (str === "" || str === "+" || str === "-" || str === ".") return NaN;
  return Number(str);
}

/**
 * Formatiert eine Zahl mit fester Nachkommastellen-Anzahl
 * im deutschen Format (Komma als Dezimaltrennzeichen).
 * Liefert undefined bei ungültiger Eingabe, damit Caller einen
 * Fallback-Text setzen können.
 */
export function formatNumber(value, decimals = 1) {
  const number = parseNumber(value);
  if (!Number.isFinite(number)) return undefined;
  return number.toFixed(decimals).replace(".", ",");
}

/**
 * Beschränkt eine Zahl auf einen Bereich.
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}