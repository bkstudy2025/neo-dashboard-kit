import { describe, it, expect } from "vitest";
import { resolveSecondaryInfo } from "../src/core/helpers/cards.js";

const fakeHass = {
  states: {
    "sensor.temperatur": {
      state: "21.4",
      attributes: {
        friendly_name: "Wohnzimmer Temperatur",
      },
      last_changed: "2025-05-03T10:00:00.000Z",
    },
    "sensor.ohne_datum": {
      state: "online",
      attributes: {
        friendly_name: "Ohne Datum",
      },
    },
  },
};

describe("resolveSecondaryInfo", () => {
  it("liefert leeren String bei none", () => {
    expect(
      resolveSecondaryInfo(fakeHass, {
        entity: "sensor.temperatur",
        secondary_info: "none",
      })
    ).toBe("");
  });

  it("liefert leeren String, wenn secondary_info fehlt", () => {
    expect(
      resolveSecondaryInfo(fakeHass, {
        entity: "sensor.temperatur",
      })
    ).toBe("");
  });

  it("liefert die Entity-ID bei entity_id", () => {
    expect(
      resolveSecondaryInfo(fakeHass, {
        entity: "sensor.temperatur",
        secondary_info: "entity_id",
      })
    ).toBe("sensor.temperatur");
  });

  it("liefert eine relative Zeit bei last_changed", () => {
    const result = resolveSecondaryInfo(fakeHass, {
      entity: "sensor.temperatur",
      secondary_info: "last_changed",
    });

    expect(result).toMatch(/vor|gerade eben/);
  });

  it("liefert leeren String bei last_changed ohne Datum", () => {
    expect(
      resolveSecondaryInfo(fakeHass, {
        entity: "sensor.ohne_datum",
        secondary_info: "last_changed",
      })
    ).toBe("");
  });

  it("liefert leeren String bei unbekanntem secondary_info", () => {
    expect(
      resolveSecondaryInfo(fakeHass, {
        entity: "sensor.temperatur",
        secondary_info: "irgendwas",
      })
    ).toBe("");
  });

  it("crasht nicht bei undefined hass", () => {
    expect(
      resolveSecondaryInfo(undefined, {
        entity: "sensor.temperatur",
        secondary_info: "last_changed",
      })
    ).toBe("");
  });

  it("crasht nicht bei undefined config", () => {
    expect(resolveSecondaryInfo(fakeHass, undefined)).toBe("");
  });
});