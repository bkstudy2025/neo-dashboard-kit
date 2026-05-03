/**
 * Zentraler Action-Helper für alle Neo-Cards.
 *
 * Behandelt die Standard-Home-Assistant-Actions (tap_action, hold_action,
 * double_tap_action) einheitlich. Cards rufen handleAction auf,
 * statt eigene Action-Logik zu implementieren.
 *
 * Unterstützte Actions:
 *   - none
 *   - more-info
 *   - toggle
 *   - navigate
 *   - url
 *   - call-service (nur String-Format wie "light.turn_on")
 *
 * Defensive Implementierung: Fehlendes hass, element, config oder
 * ungültige Action-Konfigurationen führen nie zu Exceptions.
 */

const ACTION_KEY_BY_TYPE = {
  tap: "tap_action",
  hold: "hold_action",
  double_tap: "double_tap_action",
};

/**
 * Hauptfunktion. Wird von Cards bei Tap/Hold/Double-Tap aufgerufen.
 */
export function handleAction(hass, element, config, actionType = "tap") {
  if (!config) return;

  const actionKey = ACTION_KEY_BY_TYPE[actionType];
  if (!actionKey) return;

  const action = resolveAction(config, actionKey);
  if (!action) return;

  switch (action.action) {
    case "none":
      return;
    case "more-info":
      _handleMoreInfo(element, config, action);
      return;
    case "toggle":
      _handleToggle(hass, config, action);
      return;
    case "navigate":
      _handleNavigate(element, action);
      return;
    case "url":
      _handleUrl(action);
      return;
    case "call-service":
      _handleCallService(hass, action);
      return;
    default:
      // Unbekannter action-Typ → still ignorieren, nicht crashen.
      return;
  }
}

/**
 * Wählt die passende Action aus der Config.
 * Default-Verhalten: Wenn keine Action gesetzt ist und eine Entity
 * konfiguriert ist, wird more-info als Fallback genutzt.
 */
function resolveAction(config, actionKey) {
  const configured = config[actionKey];

  if (configured && typeof configured === "object") {
    // Wenn ein Action-Objekt existiert, aber kein action-Feld hat,
    // nutzen wir more-info als Default (HA-Konvention).
    if (!configured.action) {
      return { ...configured, action: "more-info" };
    }
    return configured;
  }

  // Keine Action konfiguriert → more-info als Fallback, wenn Entity da ist.
  if (config.entity) {
    return { action: "more-info" };
  }

  return undefined;
}

function _handleMoreInfo(element, config, action) {
  const entityId = action.entity || config.entity;
  if (!entityId) return;
  if (!element || typeof element.dispatchEvent !== "function") return;

  element.dispatchEvent(
    new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId },
    })
  );
}

function _handleToggle(hass, config, action) {
  const entityId = action.entity || config.entity;
  if (!entityId) return;
  if (!hass || typeof hass.callService !== "function") return;

  hass.callService("homeassistant", "toggle", { entity_id: entityId });
}

function _handleNavigate(element, action) {
  const path = action.navigation_path;
  if (!path) return;
  if (!element || typeof element.dispatchEvent !== "function") return;

  // HA-Konvention: history.pushState + location-changed-Event,
  // damit das Lovelace-Routing reagiert.
  if (typeof history !== "undefined" && typeof history.pushState === "function") {
    history.pushState(null, "", path);
  }

  element.dispatchEvent(
    new CustomEvent("location-changed", {
      bubbles: true,
      composed: true,
      detail: { replace: false },
    })
  );
}

function _handleUrl(action) {
  const url = action.url_path;
  if (!url) return;
  if (typeof window === "undefined" || typeof window.open !== "function") return;

  window.open(url, "_blank");
}

function _handleCallService(hass, action) {
  const service = action.service;
  if (typeof service !== "string") return;

  const dotIndex = service.indexOf(".");
  if (dotIndex <= 0 || dotIndex === service.length - 1) return;

  const domain = service.slice(0, dotIndex);
  const serviceName = service.slice(dotIndex + 1);

  if (!hass || typeof hass.callService !== "function") return;

  // service_data hat Vorrang vor data; target wird zusätzlich gemerged.
  const baseData = action.service_data || action.data || {};
  const target = action.target || {};
  const serviceData = { ...baseData, ...target };

  hass.callService(domain, serviceName, serviceData);
}