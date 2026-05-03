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

/**
 * Liefert eine relative deutsche Zeitangabe.
 *
 * Beispiele:
 * - gerade eben
 * - vor 1 Min.
 * - vor 5 Min.
 * - vor 2 Std.
 * - vor 1 Tag
 * - vor 3 Tagen
 */
export function formatRelativeTime(date, now = new Date()) {
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 30) return "gerade eben";
  if (diffSec < 90) return "vor 1 Min.";

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `vor ${diffMin} Min.`;

  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `vor ${diffHour} Std.`;

  const diffDay = Math.round(diffHour / 24);
  if (diffDay === 1) return "vor 1 Tag";

  return `vor ${diffDay} Tagen`;
}