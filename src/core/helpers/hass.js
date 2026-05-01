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