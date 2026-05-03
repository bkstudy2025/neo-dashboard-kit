/**
 * Helfer rund um das Home-Assistant-State-Objekt.
 * Alle Funktionen tolerieren undefined hass / undefined entityId
 * und liefern dann sinnvolle Defaults.
 */

export function entityState(hass, entityId) {
  if (!hass || !entityId) return undefined;
  return hass.states?.[entityId];
}

export function stateText(hass, entityId, fallback = "") {
  const entity = entityState(hass, entityId);
  return entity?.state ?? fallback;
}

export function unitOf(hass, entityId) {
  return entityState(hass, entityId)?.attributes?.unit_of_measurement ?? "";
}

export function friendlyName(hass, entityId, fallback = "") {
  return entityState(hass, entityId)?.attributes?.friendly_name ?? fallback;
}

/**
 * Prüft, ob eine Entity einen "aktiven" Zustand hat.
 * Berücksichtigt typische passive Zustände als "aus".
 */
export function isEntityOn(hass, entityId) {
  const state = stateText(hass, entityId);
  const passive = ["", "off", "closed", "locked", "idle", "standby", "unknown", "unavailable"];
  return state !== undefined && !passive.includes(state);
}

/**
 * Extrahiert die Domain aus einer Entity-ID.
 *   "light.wohnzimmer" → "light"
 *   "sensor.temperature" → "sensor"
 *   "abc" / "" / null → undefined
 *
 * Eine gültige Entity-ID hat genau das Format "<domain>.<object_id>"
 * mit beiden Teilen nicht-leer.
 */
export function domainOf(entityId) {
  if (typeof entityId !== "string" || entityId.length === 0) return undefined;
  const dotIndex = entityId.indexOf(".");
  if (dotIndex <= 0 || dotIndex === entityId.length - 1) return undefined;
  return entityId.slice(0, dotIndex);
}

/**
 * Einfache Domain-Defaults für stateIcon().
 * Bewusst statisch und überschaubar. Wird bei Bedarf erweitert,
 * keine state-abhängige Logik (für die wäre HA's eigene Logik nötig).
 */
const DOMAIN_ICON_DEFAULTS = {
  sensor: "mdi:eye",
  binary_sensor: "mdi:radiobox-marked",
  light: "mdi:lightbulb",
  switch: "mdi:toggle-switch",
  climate: "mdi:thermostat",
  person: "mdi:account",
  media_player: "mdi:play-box",
  cover: "mdi:window-shutter",
  lock: "mdi:lock",
  scene: "mdi:palette",
  script: "mdi:script-text",
  automation: "mdi:robot",
};

/**
 * Liefert ein passendes Icon für eine Entity.
 * Drei-Stufen-Fallback:
 *   1. Wenn die Entity attributes.icon hat, dieses nutzen.
 *   2. Sonst Domain-Default aus DOMAIN_ICON_DEFAULTS.
 *   3. Sonst "mdi:help-circle-outline".
 */
export function stateIcon(hass, entityId) {
  const entity = entityState(hass, entityId);
  const userIcon = entity?.attributes?.icon;
  if (userIcon) return userIcon;

  const domain = domainOf(entityId);
  if (domain && DOMAIN_ICON_DEFAULTS[domain]) {
    return DOMAIN_ICON_DEFAULTS[domain];
  }

  return "mdi:help-circle-outline";
}

/**
 * Liefert das Datum der letzten Änderung einer Entity als Date-Objekt.
 * Gibt undefined zurück, wenn die Entity fehlt, last_changed fehlt
 * oder kein gültiges Datum geparst werden kann.
 */
export function lastChanged(hass, entityId) {
  const entity = entityState(hass, entityId);
  const raw = entity?.last_changed;
  if (!raw) return undefined;

  try {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return undefined;
    return date;
  } catch {
    return undefined;
  }
}