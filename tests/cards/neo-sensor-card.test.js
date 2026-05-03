import { describe, it, expect } from "vitest";
import {
  validateSensorConfig,
  formatSensorValue,
  resolveSensorViewModel,
  VALID_LAYOUTS,
  VALID_SECONDARY_INFO,
} from "../../src/cards/neo-sensor-card.js";

// ============================================================================
// Test-Daten
// ============================================================================

const fakeHass = {
  states: {
    "sensor.temperatur": {
      state: "21.456",
      attributes: {
        unit_of_measurement: "°C",
        friendly_name: "Wohnzimmer",
      },
      last_changed: "2025-05-03T10:00:00.000Z",
    },
    "sensor.text": {
      state: "online",
      attributes: { friendly_name: "Status" },
      last_changed: "2025-05-03T11:00:00.000Z",
    },
    "sensor.kaputt": {
      state: "unavailable",
      attributes: { friendly_name: "Defekt" },
    },
    "sensor.unbekannt": {
      state: "unknown",
      attributes: { friendly_name: "Leer" },
    },
    "light.lampe": {
      state: "on",
      attributes: { friendly_name: "Stehlampe" },
    },
    "sensor.mit_eigenem_icon": {
      state: "5",
      attributes: { icon: "mdi:thermometer-lines", unit_of_measurement: "kWh" },
    },
  },
};

// ============================================================================
// validateSensorConfig
// ============================================================================

describe("validateSensorConfig — entity Pflicht", () => {
  it("wirft, wenn entity fehlt", () => {
    expect(() => validateSensorConfig({})).toThrow(/'entity' ist erforderlich/);
  });

  it("wirft, wenn entity leer ist", () => {
    expect(() => validateSensorConfig({ entity: "" })).toThrow(/'entity' ist erforderlich/);
  });

  it("wirft, wenn entity kein String ist", () => {
    expect(() => validateSensorConfig({ entity: 42 })).toThrow(/'entity' ist erforderlich/);
    expect(() => validateSensorConfig({ entity: null })).toThrow(/'entity' ist erforderlich/);
  });

  it("nennt den Card-Namen in der Fehlermeldung", () => {
    expect(() => validateSensorConfig({}, "NeoSensorCard"))
      .toThrow(/^NeoSensorCard:/);
  });

  it("akzeptiert eine gültige Minimal-Config", () => {
    expect(() => validateSensorConfig({ entity: "sensor.x" })).not.toThrow();
  });
});

describe("validateSensorConfig — decimals", () => {
  it("akzeptiert eine nicht-negative Ganzzahl", () => {
    expect(() => validateSensorConfig({ entity: "sensor.x", decimals: 0 })).not.toThrow();
    expect(() => validateSensorConfig({ entity: "sensor.x", decimals: 2 })).not.toThrow();
  });

  it("wirft bei negativem Wert", () => {
    expect(() => validateSensorConfig({ entity: "sensor.x", decimals: -1 }))
      .toThrow(/'decimals' muss eine nicht-negative Ganzzahl sein/);
  });

  it("wirft bei Fließkommazahl", () => {
    expect(() => validateSensorConfig({ entity: "sensor.x", decimals: 1.5 }))
      .toThrow(/'decimals' muss eine nicht-negative Ganzzahl sein/);
  });

  it("wirft bei Nicht-Zahl", () => {
    expect(() => validateSensorConfig({ entity: "sensor.x", decimals: "2" }))
      .toThrow(/'decimals' muss eine nicht-negative Ganzzahl sein/);
  });
});

describe("validateSensorConfig — layout", () => {
  it("akzeptiert compact und large", () => {
    expect(() => validateSensorConfig({ entity: "sensor.x", layout: "compact" })).not.toThrow();
    expect(() => validateSensorConfig({ entity: "sensor.x", layout: "large" })).not.toThrow();
  });

  it("wirft bei unbekanntem Wert", () => {
    expect(() => validateSensorConfig({ entity: "sensor.x", layout: "huge" }))
      .toThrow(/'layout' muss "compact" oder "large" sein/);
  });

  it("akzeptiert undefined (Default)", () => {
    expect(() => validateSensorConfig({ entity: "sensor.x" })).not.toThrow();
  });
});

describe("validateSensorConfig — secondary_info", () => {
  it("akzeptiert alle erlaubten Werte", () => {
    for (const value of VALID_SECONDARY_INFO) {
      expect(() => validateSensorConfig({ entity: "sensor.x", secondary_info: value })).not.toThrow();
    }
  });

  it("wirft bei unbekanntem Wert", () => {
    expect(() => validateSensorConfig({ entity: "sensor.x", secondary_info: "blah" }))
      .toThrow(/'secondary_info' muss/);
  });
});

// ============================================================================
// formatSensorValue
// ============================================================================

describe("formatSensorValue", () => {
  it("rundet numerische Werte auf decimals", () => {
    expect(formatSensorValue("21.456", 1)).toBe("21,5");
    expect(formatSensorValue("21.456", 2)).toBe("21,46");
    expect(formatSensorValue("21.456", 0)).toBe("21");
  });

  it("akzeptiert auch Komma als Dezimaltrenner", () => {
    expect(formatSensorValue("21,456", 1)).toBe("21,5");
  });

  it("ignoriert decimals bei nicht-numerischen Werten", () => {
    expect(formatSensorValue("online", 2)).toBe("online");
    expect(formatSensorValue("on", 1)).toBe("on");
  });

  it("gibt numerische Werte ohne decimals unverändert zurück", () => {
    expect(formatSensorValue("21.456", undefined)).toBe("21.456");
  });

  it("gibt leeren String bei leerem/undefined State", () => {
    expect(formatSensorValue("", 1)).toBe("");
    expect(formatSensorValue(undefined, 1)).toBe("");
    expect(formatSensorValue(null, 1)).toBe("");
  });
});

// ============================================================================
// resolveSensorViewModel
// ============================================================================

describe("resolveSensorViewModel — gültige Entity", () => {
  it("liefert Name, Icon, Wert und Einheit", () => {
    const vm = resolveSensorViewModel(fakeHass, { entity: "sensor.temperatur" });
    expect(vm.status).toBe("ok");
    expect(vm.name).toBe("Wohnzimmer");
    expect(vm.icon).toBe("mdi:eye");
    expect(vm.value).toBe("21.456");
    expect(vm.unit).toBe("°C");
  });

  it("name aus config überschreibt friendly_name", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.temperatur",
      name: "Mein Sensor",
    });
    expect(vm.name).toBe("Mein Sensor");
  });

  it("icon aus config überschreibt stateIcon-Default", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.temperatur",
      icon: "mdi:thermometer",
    });
    expect(vm.icon).toBe("mdi:thermometer");
  });

  it("nutzt attributes.icon, wenn config.icon nicht gesetzt", () => {
    const vm = resolveSensorViewModel(fakeHass, { entity: "sensor.mit_eigenem_icon" });
    expect(vm.icon).toBe("mdi:thermometer-lines");
  });

  it("unit aus config überschreibt unit_of_measurement", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.temperatur",
      unit: "Grad",
    });
    expect(vm.unit).toBe("Grad");
  });

  it("decimals rundet numerische Werte korrekt", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.temperatur",
      decimals: 1,
    });
    expect(vm.value).toBe("21,5");
  });

  it("decimals ignoriert nicht-numerische Werte", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.text",
      decimals: 2,
    });
    expect(vm.value).toBe("online");
  });
});

describe("resolveSensorViewModel — fehlende Entity", () => {
  it("liefert status 'missing' und Wert '—'", () => {
    const vm = resolveSensorViewModel(fakeHass, { entity: "sensor.gibtnicht" });
    expect(vm.status).toBe("missing");
    expect(vm.value).toBe("—");
  });

  it("liefert die konfigurierte entity-ID als Name-Fallback", () => {
    const vm = resolveSensorViewModel(fakeHass, { entity: "sensor.gibtnicht" });
    expect(vm.name).toBe("sensor.gibtnicht");
  });

  it("nutzt config.name wenn gesetzt, auch bei fehlender Entity", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.gibtnicht",
      name: "Ich existiere nicht",
    });
    expect(vm.name).toBe("Ich existiere nicht");
  });

  it("liefert leere unit bei fehlender Entity", () => {
    const vm = resolveSensorViewModel(fakeHass, { entity: "sensor.gibtnicht" });
    expect(vm.unit).toBe("");
  });
});

describe("resolveSensorViewModel — unavailable / unknown", () => {
  it("erkennt unavailable als muted-Zustand", () => {
    const vm = resolveSensorViewModel(fakeHass, { entity: "sensor.kaputt" });
    expect(vm.status).toBe("muted");
    expect(vm.value).toBe("unavailable");
  });

  it("erkennt unknown als muted-Zustand", () => {
    const vm = resolveSensorViewModel(fakeHass, { entity: "sensor.unbekannt" });
    expect(vm.status).toBe("muted");
    expect(vm.value).toBe("unknown");
  });

  it("liefert leere unit bei muted-Zustand", () => {
    const vm = resolveSensorViewModel(fakeHass, { entity: "sensor.kaputt" });
    expect(vm.unit).toBe("");
  });
});

describe("resolveSensorViewModel — secondary_info", () => {
  it("liefert leeren secondary bei none", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.temperatur",
      secondary_info: "none",
    });
    expect(vm.secondary).toBe("");
  });

  it("liefert die entity-ID bei entity_id", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.temperatur",
      secondary_info: "entity_id",
    });
    expect(vm.secondary).toBe("sensor.temperatur");
  });

  it("liefert relative Zeit bei last_changed", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.temperatur",
      secondary_info: "last_changed",
    });
    expect(vm.secondary).toMatch(/vor|gerade eben/);
  });

  it("ohne secondary_info-Setting liefert leeren secondary (Default none)", () => {
    const vm = resolveSensorViewModel(fakeHass, { entity: "sensor.temperatur" });
    expect(vm.secondary).toBe("");
  });
});

describe("resolveSensorViewModel — layout", () => {
  it("Default-Layout ist compact", () => {
    const vm = resolveSensorViewModel(fakeHass, { entity: "sensor.temperatur" });
    expect(vm.layout).toBe("compact");
  });

  it("compact wird übernommen", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.temperatur",
      layout: "compact",
    });
    expect(vm.layout).toBe("compact");
  });

  it("large wird übernommen", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.temperatur",
      layout: "large",
    });
    expect(vm.layout).toBe("large");
  });

  it("ungültiger Layout-Wert fällt auf compact zurück", () => {
    const vm = resolveSensorViewModel(fakeHass, {
      entity: "sensor.temperatur",
      layout: "huge",
    });
    expect(vm.layout).toBe("compact");
  });
});

describe("resolveSensorViewModel — defensives Verhalten", () => {
  it("crasht nicht bei fehlendem hass", () => {
    const vm = resolveSensorViewModel(undefined, { entity: "sensor.x" });
    expect(vm.status).toBe("missing");
  });

  it("crasht nicht bei fehlendem config", () => {
    const vm = resolveSensorViewModel(fakeHass, undefined);
    expect(vm.status).toBe("missing");
    expect(vm.value).toBe("—");
  });
});

// ============================================================================
// Konstanten-Export
// ============================================================================

describe("Konstanten", () => {
  it("VALID_LAYOUTS enthält compact und large", () => {
    expect(VALID_LAYOUTS).toEqual(["compact", "large"]);
  });

  it("VALID_SECONDARY_INFO enthält alle drei Werte", () => {
    expect(VALID_SECONDARY_INFO).toEqual(["none", "last_changed", "entity_id"]);
  });
});