import { normalize } from "./strings.js";

/**
 * Findet das passende User-Mapping aus config.users
 * für den aktuell angemeldeten HA-User.
 * Matching wahlweise per Name oder per User-ID.
 */
export function findUserMapping(hass, config) {
  const mappings = Array.isArray(config?.users) ? config.users : [];
  const currentName = normalize(hass?.user?.name);
  const currentId = normalize(hass?.user?.id);

  return mappings.find((item) => {
    const user = normalize(item?.user);
    const id = normalize(item?.user_id);
    return (user && user === currentName) || (id && id === currentId);
  });
}