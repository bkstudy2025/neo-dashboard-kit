import { lastChanged } from "./hass.js";
import { formatRelativeTime } from "./dates.js";
import { safe } from "./strings.js";

/**
 * Löst eine generische secondary_info-Konfiguration für Cards auf.
 *
 * Unterstützte Werte:
 * - none
 * - entity_id
 * - last_changed
 */
export function resolveSecondaryInfo(hass, config = {}) {
  const mode = config.secondary_info || "none";

  if (mode === "none") return "";

  if (mode === "entity_id") {
    return safe(config.entity, "");
  }

  if (mode === "last_changed") {
    const date = lastChanged(hass, config.entity);
    if (!date) return "";
    return formatRelativeTime(date);
  }

  return "";
}