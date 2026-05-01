/**
 * Liefert ein deutsches Datum: "Freitag, 1. Mai".
 */
export function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/**
 * Liefert eine deutsche Uhrzeit: "14:32".
 */
export function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Tageszeit-abhängige deutsche Begrüßung.
 */
export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "Gute Nacht";
  if (hour < 11) return "Guten Morgen";
  if (hour < 17) return "Guten Tag";
  if (hour < 22) return "Guten Abend";
  return "Gute Nacht";
}