import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleAction } from "../src/core/helpers/actions.js";

/**
 * Helper: erzeugt ein Mock-Element mit gespyter dispatchEvent-Funktion.
 */
function createElement() {
  return { dispatchEvent: vi.fn() };
}

/**
 * Helper: erzeugt ein Mock-hass mit gespyter callService-Funktion.
 */
function createHass() {
  return { callService: vi.fn() };
}

// ===========================================================================
// Defensive Verhaltensweisen
// ===========================================================================

describe("handleAction — defensives Verhalten", () => {
  it("crasht nicht, wenn config fehlt", () => {
    expect(() => handleAction(createHass(), createElement(), undefined)).not.toThrow();
  });

  it("crasht nicht, wenn config null ist", () => {
    expect(() => handleAction(createHass(), createElement(), null)).not.toThrow();
  });

  it("crasht nicht, wenn hass fehlt", () => {
    const element = createElement();
    expect(() => handleAction(undefined, element, { entity: "light.x" })).not.toThrow();
  });

  it("crasht nicht, wenn element fehlt", () => {
    const hass = createHass();
    expect(() => handleAction(hass, undefined, { entity: "light.x" })).not.toThrow();
  });

  it("ignoriert ungültigen actionType", () => {
    const element = createElement();
    handleAction(createHass(), element, { entity: "light.x" }, "unbekannt");
    expect(element.dispatchEvent).not.toHaveBeenCalled();
  });

  it("ignoriert unbekannte action-Werte ohne Crash", () => {
    const element = createElement();
    const hass = createHass();
    expect(() =>
      handleAction(hass, element, { tap_action: { action: "weird-action" } })
    ).not.toThrow();
    expect(element.dispatchEvent).not.toHaveBeenCalled();
    expect(hass.callService).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Default-Verhalten: keine Action konfiguriert
// ===========================================================================

describe("handleAction — keine Action konfiguriert", () => {
  it("feuert more-info, wenn entity vorhanden ist", () => {
    const element = createElement();
    handleAction(createHass(), element, { entity: "light.lampe" });

    expect(element.dispatchEvent).toHaveBeenCalledTimes(1);
    const event = element.dispatchEvent.mock.calls[0][0];
    expect(event.type).toBe("hass-more-info");
    expect(event.detail.entityId).toBe("light.lampe");
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it("macht nichts, wenn weder Action noch entity vorhanden", () => {
    const element = createElement();
    const hass = createHass();
    handleAction(hass, element, {});
    expect(element.dispatchEvent).not.toHaveBeenCalled();
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("nutzt more-info als Default, wenn Action-Objekt ohne action-Feld vorliegt", () => {
    const element = createElement();
    handleAction(createHass(), element, {
      entity: "light.x",
      tap_action: { entity: "light.special" },
    });
    const event = element.dispatchEvent.mock.calls[0][0];
    expect(event.detail.entityId).toBe("light.special");
  });
});

// ===========================================================================
// none
// ===========================================================================

describe("handleAction — none", () => {
  it("dispatcht kein Event und ruft keinen Service", () => {
    const element = createElement();
    const hass = createHass();
    handleAction(hass, element, {
      entity: "light.x",
      tap_action: { action: "none" },
    });
    expect(element.dispatchEvent).not.toHaveBeenCalled();
    expect(hass.callService).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// more-info
// ===========================================================================

describe("handleAction — more-info", () => {
  it("nutzt action.entity, wenn gesetzt", () => {
    const element = createElement();
    handleAction(createHass(), element, {
      entity: "light.default",
      tap_action: { action: "more-info", entity: "sensor.spezial" },
    });
    const event = element.dispatchEvent.mock.calls[0][0];
    expect(event.detail.entityId).toBe("sensor.spezial");
  });

  it("nutzt config.entity, wenn action.entity fehlt", () => {
    const element = createElement();
    handleAction(createHass(), element, {
      entity: "light.default",
      tap_action: { action: "more-info" },
    });
    const event = element.dispatchEvent.mock.calls[0][0];
    expect(event.detail.entityId).toBe("light.default");
  });

  it("macht nichts, wenn keine entity verfügbar ist", () => {
    const element = createElement();
    handleAction(createHass(), element, {
      tap_action: { action: "more-info" },
    });
    expect(element.dispatchEvent).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// toggle
// ===========================================================================

describe("handleAction — toggle", () => {
  it("ruft homeassistant.toggle mit config.entity", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      entity: "light.lampe",
      tap_action: { action: "toggle" },
    });
    expect(hass.callService).toHaveBeenCalledWith("homeassistant", "toggle", {
      entity_id: "light.lampe",
    });
  });

  it("nutzt action.entity, wenn gesetzt", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      entity: "light.default",
      tap_action: { action: "toggle", entity: "switch.special" },
    });
    expect(hass.callService).toHaveBeenCalledWith("homeassistant", "toggle", {
      entity_id: "switch.special",
    });
  });

  it("ruft nichts auf, wenn keine entity verfügbar", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      tap_action: { action: "toggle" },
    });
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("crasht nicht, wenn hass.callService fehlt", () => {
    expect(() =>
      handleAction({}, createElement(), {
        entity: "light.x",
        tap_action: { action: "toggle" },
      })
    ).not.toThrow();
  });
});

// ===========================================================================
// navigate
// ===========================================================================

describe("handleAction — navigate", () => {
  let pushStateSpy;

  beforeEach(() => {
    if (typeof history !== "undefined") {
      pushStateSpy = vi.spyOn(history, "pushState").mockImplementation(() => {});
    }
  });

  afterEach(() => {
    pushStateSpy?.mockRestore();
  });

  it("dispatcht location-changed mit replace: false", () => {
    const element = createElement();
    handleAction(createHass(), element, {
      tap_action: { action: "navigate", navigation_path: "/lovelace/wohnzimmer" },
    });

    expect(element.dispatchEvent).toHaveBeenCalledTimes(1);
    const event = element.dispatchEvent.mock.calls[0][0];
    expect(event.type).toBe("location-changed");
    expect(event.detail.replace).toBe(false);
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it("ruft history.pushState mit dem Pfad auf", () => {
    if (!pushStateSpy) return;
    handleAction(createHass(), createElement(), {
      tap_action: { action: "navigate", navigation_path: "/lovelace/foo" },
    });
    expect(pushStateSpy).toHaveBeenCalledWith(null, "", "/lovelace/foo");
  });

  it("macht nichts, wenn navigation_path fehlt", () => {
    const element = createElement();
    handleAction(createHass(), element, {
      tap_action: { action: "navigate" },
    });
    expect(element.dispatchEvent).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// url
// ===========================================================================

describe("handleAction — url", () => {
  let openSpy;

  beforeEach(() => {
    openSpy = vi.fn();
    vi.stubGlobal("window", { open: openSpy });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("öffnet URL in neuem Tab", () => {
    handleAction(createHass(), createElement(), {
      tap_action: { action: "url", url_path: "https://example.com" },
    });
    expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank");
  });

  it("macht nichts, wenn url_path fehlt", () => {
    handleAction(createHass(), createElement(), {
      tap_action: { action: "url" },
    });
    expect(openSpy).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// call-service
// ===========================================================================

describe("handleAction — call-service", () => {
  it("zerlegt service-String in domain und service", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      tap_action: { action: "call-service", service: "light.turn_on" },
    });
    expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", {});
  });

  it("nutzt service_data als Service-Daten", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      tap_action: {
        action: "call-service",
        service: "light.turn_on",
        service_data: { brightness: 200 },
      },
    });
    expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", {
      brightness: 200,
    });
  });

  it("nutzt data als Service-Daten, wenn service_data fehlt", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      tap_action: {
        action: "call-service",
        service: "light.turn_on",
        data: { brightness: 100 },
      },
    });
    expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", {
      brightness: 100,
    });
  });

  it("bevorzugt service_data vor data, wenn beide gesetzt sind", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      tap_action: {
        action: "call-service",
        service: "light.turn_on",
        service_data: { brightness: 200 },
        data: { brightness: 100 },
      },
    });
    expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", {
      brightness: 200,
    });
  });

  it("merged target in die Service-Daten", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      tap_action: {
        action: "call-service",
        service: "light.turn_on",
        service_data: { brightness: 200 },
        target: { entity_id: "light.flur" },
      },
    });
    expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", {
      brightness: 200,
      entity_id: "light.flur",
    });
  });

  it("akzeptiert target ohne weitere service_data", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      tap_action: {
        action: "call-service",
        service: "light.turn_on",
        target: { entity_id: "light.flur" },
      },
    });
    expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", {
      entity_id: "light.flur",
    });
  });

  it("ruft nichts auf, wenn service kein String ist", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      tap_action: { action: "call-service", service: { domain: "light", service: "turn_on" } },
    });
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("ruft nichts auf, wenn service-String keinen Punkt enthält", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      tap_action: { action: "call-service", service: "turn_on" },
    });
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("ruft nichts auf, wenn service-String mit Punkt beginnt", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      tap_action: { action: "call-service", service: ".turn_on" },
    });
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("ruft nichts auf, wenn service-String mit Punkt endet", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      tap_action: { action: "call-service", service: "light." },
    });
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("crasht nicht, wenn hass.callService fehlt", () => {
    expect(() =>
      handleAction({}, createElement(), {
        tap_action: { action: "call-service", service: "light.turn_on" },
      })
    ).not.toThrow();
  });
});

// ===========================================================================
// hold_action und double_tap_action
// ===========================================================================

describe("handleAction — actionType-Auswahl", () => {
  it("wählt hold_action bei actionType='hold'", () => {
    const hass = createHass();
    handleAction(
      hass,
      createElement(),
      {
        entity: "light.x",
        tap_action: { action: "more-info" },
        hold_action: { action: "toggle" },
      },
      "hold"
    );
    expect(hass.callService).toHaveBeenCalledWith("homeassistant", "toggle", {
      entity_id: "light.x",
    });
  });

  it("wählt double_tap_action bei actionType='double_tap'", () => {
    const hass = createHass();
    handleAction(
      hass,
      createElement(),
      {
        entity: "light.x",
        tap_action: { action: "more-info" },
        double_tap_action: { action: "toggle", entity: "switch.special" },
      },
      "double_tap"
    );
    expect(hass.callService).toHaveBeenCalledWith("homeassistant", "toggle", {
      entity_id: "switch.special",
    });
  });

  it("nutzt tap_action standardmäßig (kein actionType angegeben)", () => {
    const hass = createHass();
    handleAction(hass, createElement(), {
      entity: "light.x",
      tap_action: { action: "toggle" },
    });
    expect(hass.callService).toHaveBeenCalledWith("homeassistant", "toggle", {
      entity_id: "light.x",
    });
  });

  it("fällt auf more-info zurück, wenn die gewählte Action-Variante nicht definiert ist", () => {
    const element = createElement();
    handleAction(
      createHass(),
      element,
      {
        entity: "light.x",
        tap_action: { action: "toggle" },
      },
      "hold" // hold_action ist nicht definiert → Default more-info
    );
    expect(element.dispatchEvent).toHaveBeenCalledTimes(1);
    const event = element.dispatchEvent.mock.calls[0][0];
    expect(event.type).toBe("hass-more-info");
    expect(event.detail.entityId).toBe("light.x");
  });
});