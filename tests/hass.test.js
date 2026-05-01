import { describe, it, expect } from "vitest";
import {
  entityState,
  stateText,
  unitOf,
  friendlyName,
  isEntityOn,
} from "../src/core/helpers/hass.js";

const fakeHass = {
  states: {
    "sensor.temperatur": {
      state: "21.5",
      attributes: { unit_of_measurement: "°C", friendly_name: "Wohnzimmer" },
    },
    "light.lampe": {
      state: "on",
      attributes: { friendly_name: "Stehlampe" },
    },
    "binary_sensor.tuer": {
      state: "off",
      attributes: {},
    },
    "sensor.kaputt": {
      state: "unavailable",
      attributes: {},
    },
  },
};

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