import { describe, it, expect } from "vitest";
import {
  entityState,
  stateText,
  unitOf,
  friendlyName,
  isEntityOn,
  domainOf,
  stateIcon,
  lastChanged,
} from "../src/core/helpers/hass.js";

const fakeHass = {
  states: {
    "sensor.temperatur": {
      state: "21.5",
      attributes: { unit_of_measurement: "°C", friendly_name: "Wohnzimmer" },
      last_changed: "2025-05-03T10:00:00.000Z",
    },
    "light.lampe": {
      state: "on",
      attributes: { friendly_name: "Stehlampe" },
      last_changed: "2025-05-03T11:30:00.000Z",
    },
    "binary_sensor.tuer": {
      state: "off",
      attributes: {},
    },
    "sensor.kaputt": {
      state: "unavailable",
      attributes: {},
    },
    "sensor.mit_eigenem_icon": {
      state: "42",
      attributes: { icon: "mdi:thermometer-lines" },
      last_changed: "2025-05-03T12:00:00.000Z",
    },
    "exotic.entity": {
      state: "whatever",
      attributes: {},
    },
    "sensor.bad_date": {
      state: "x",
      attributes: {},
      last_changed: "nicht-ein-datum",
    },
  },
};

// ===========================================================================
// Bestehende Tests — unverändert
// ===========================================================================

describe("entityState", () => {
  it("liefert das State-Objekt", () => {
    expect(entityState(fakeHass, "sensor.temperatur")?.state).toBe("21.5");
  });

  it("toleriert fehlendes hass", () => {
    expect(entityState(undefined, "sensor.x")).toBeUndefined();
  });

  it("toleriert fehlende entityId", () => {
    expect(entityState(fakeHass, undefined)).toBeUndefined();
  });
});

describe("stateText", () => {
  it("liefert State", () => {
    expect(stateText(fakeHass, "light.lampe")).toBe("on");
  });

  it("liefert Fallback bei unbekannter Entity", () => {
    expect(stateText(fakeHass, "sensor.gibtnicht", "—")).toBe("—");
  });
});

describe("unitOf", () => {
  it("liefert Einheit", () => {
    expect(unitOf(fakeHass, "sensor.temperatur")).toBe("°C");
  });

  it("liefert leeren String wenn keine Einheit", () => {
    expect(unitOf(fakeHass, "light.lampe")).toBe("");
  });
});

describe("friendlyName", () => {
  it("liefert Friendly Name", () => {
    expect(friendlyName(fakeHass, "sensor.temperatur")).toBe("Wohnzimmer");
  });

  it("liefert Fallback wenn nicht gesetzt", () => {
    expect(friendlyName(fakeHass, "binary_sensor.tuer", "—")).toBe("—");
  });
});

describe("isEntityOn", () => {
  it("erkennt aktive Zustände", () => {
    expect(isEntityOn(fakeHass, "light.lampe")).toBe(true);
  });

  it("erkennt passive Zustände", () => {
    expect(isEntityOn(fakeHass, "binary_sensor.tuer")).toBe(false);
    expect(isEntityOn(fakeHass, "sensor.kaputt")).toBe(false);
  });
});

// ===========================================================================
// domainOf
// ===========================================================================

describe("domainOf", () => {
  it("extrahiert die Domain aus einer Standard-Entity-ID", () => {
    expect(domainOf("light.wohnzimmer")).toBe("light");
    expect(domainOf("sensor.temperature")).toBe("sensor");
    expect(domainOf("binary_sensor.tuer")).toBe("binary_sensor");
  });

  it("nimmt nur den ersten Punkt als Trenner", () => {
    expect(domainOf("light.bedroom.main")).toBe("light");
  });

  it("liefert undefined bei undefined oder null", () => {
    expect(domainOf(undefined)).toBeUndefined();
    expect(domainOf(null)).toBeUndefined();
  });

  it("liefert undefined bei leerem String", () => {
    expect(domainOf("")).toBeUndefined();
  });

  it("liefert undefined bei String ohne Punkt", () => {
    expect(domainOf("abc")).toBeUndefined();
  });

  it("liefert undefined bei leerer Domain (Punkt am Anfang)", () => {
    expect(domainOf(".name")).toBeUndefined();
  });

  it("liefert undefined bei leerer Object-ID (Punkt am Ende)", () => {
    expect(domainOf("light.")).toBeUndefined();
  });

  it("liefert undefined bei Nicht-Strings", () => {
    expect(domainOf(42)).toBeUndefined();
    expect(domainOf({})).toBeUndefined();
    expect(domainOf([])).toBeUndefined();
  });
});

// ===========================================================================
// stateIcon
// ===========================================================================

describe("stateIcon — attributes.icon hat Vorrang", () => {
  it("nutzt das benutzerdefinierte Icon, wenn vorhanden", () => {
    expect(stateIcon(fakeHass, "sensor.mit_eigenem_icon")).toBe("mdi:thermometer-lines");
  });

  it("ignoriert den Domain-Default, wenn ein eigenes Icon gesetzt ist", () => {
    // sensor.* würde sonst "mdi:eye" liefern, hier aber das custom Icon
    expect(stateIcon(fakeHass, "sensor.mit_eigenem_icon")).not.toBe("mdi:eye");
  });
});

describe("stateIcon — Domain-Defaults", () => {
  it("liefert mdi:eye für sensor", () => {
    expect(stateIcon(fakeHass, "sensor.temperatur")).toBe("mdi:eye");
  });

  it("liefert mdi:lightbulb für light", () => {
    expect(stateIcon(fakeHass, "light.lampe")).toBe("mdi:lightbulb");
  });

  it("liefert mdi:radiobox-marked für binary_sensor", () => {
    expect(stateIcon(fakeHass, "binary_sensor.tuer")).toBe("mdi:radiobox-marked");
  });

  it("Domain-Default funktioniert auch ohne Entity in hass.states", () => {
    expect(stateIcon(fakeHass, "switch.gibtnicht")).toBe("mdi:toggle-switch");
    expect(stateIcon(fakeHass, "climate.gibtnicht")).toBe("mdi:thermostat");
    expect(stateIcon(fakeHass, "person.gibtnicht")).toBe("mdi:account");
    expect(stateIcon(fakeHass, "media_player.gibtnicht")).toBe("mdi:play-box");
    expect(stateIcon(fakeHass, "cover.gibtnicht")).toBe("mdi:window-shutter");
    expect(stateIcon(fakeHass, "lock.gibtnicht")).toBe("mdi:lock");
    expect(stateIcon(fakeHass, "scene.gibtnicht")).toBe("mdi:palette");
    expect(stateIcon(fakeHass, "script.gibtnicht")).toBe("mdi:script-text");
    expect(stateIcon(fakeHass, "automation.gibtnicht")).toBe("mdi:robot");
  });
});

describe("stateIcon — Fallback bei unbekannter Domain", () => {
  it("liefert mdi:help-circle-outline für unbekannte Domains", () => {
    expect(stateIcon(fakeHass, "exotic.entity")).toBe("mdi:help-circle-outline");
  });

  it("liefert mdi:help-circle-outline für ungültige Entity-IDs", () => {
    expect(stateIcon(fakeHass, "abc")).toBe("mdi:help-circle-outline");
    expect(stateIcon(fakeHass, "")).toBe("mdi:help-circle-outline");
  });
});

describe("stateIcon — Fehlende Entity / fehlendes hass", () => {
  it("crasht nicht bei fehlendem hass", () => {
    expect(stateIcon(undefined, "light.lampe")).toBe("mdi:lightbulb");
  });

  it("crasht nicht bei fehlender entityId", () => {
    expect(stateIcon(fakeHass, undefined)).toBe("mdi:help-circle-outline");
  });

  it("crasht nicht, wenn beide fehlen", () => {
    expect(stateIcon(undefined, undefined)).toBe("mdi:help-circle-outline");
  });
});

// ===========================================================================
// lastChanged
// ===========================================================================

describe("lastChanged", () => {
  it("liefert ein Date-Objekt aus last_changed", () => {
    const result = lastChanged(fakeHass, "sensor.temperatur");
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe("2025-05-03T10:00:00.000Z");
  });

  it("liefert das korrekte Datum für eine andere Entity", () => {
    const result = lastChanged(fakeHass, "light.lampe");
    expect(result.toISOString()).toBe("2025-05-03T11:30:00.000Z");
  });

  it("liefert undefined, wenn last_changed fehlt", () => {
    expect(lastChanged(fakeHass, "binary_sensor.tuer")).toBeUndefined();
    expect(lastChanged(fakeHass, "sensor.kaputt")).toBeUndefined();
  });

  it("liefert undefined bei ungültigem Datum-String", () => {
    expect(lastChanged(fakeHass, "sensor.bad_date")).toBeUndefined();
  });

  it("liefert undefined bei unbekannter Entity", () => {
    expect(lastChanged(fakeHass, "sensor.gibtnicht")).toBeUndefined();
  });

  it("liefert undefined bei fehlendem hass", () => {
    expect(lastChanged(undefined, "sensor.temperatur")).toBeUndefined();
  });

  it("liefert undefined bei fehlender entityId", () => {
    expect(lastChanged(fakeHass, undefined)).toBeUndefined();
  });
});