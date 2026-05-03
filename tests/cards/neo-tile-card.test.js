import { describe, it, expect } from "vitest";
import {
  validateTileConfig,
  resolveTileTapAction,
  resolveTileViewModel,
  VALID_LAYOUTS,
  VALID_SECONDARY_INFO,
  INTERACTIVE_DOMAINS,
  NeoTileCard,
} from "../../src/cards/neo-tile-card.js";

// ============================================================================
// Test-Daten
// ============================================================================

const fakeHass = {
  states: {
    "light.lampe_an": {
      state: "on",
      attributes: { friendly_name: "Stehlampe" },
      last_changed: "2025-05-03T11:00:00.000Z",
    },
    "light.lampe_aus": {
      state: "off",
      attributes: { friendly_name: "Esstisch" },
    },
    "switch.steckdose": {
      state: "on",
      attributes: { friendly_name: "Steckdose Küche" },
    },
    "input_boolean.modus": {
      state: "off",
      attributes: { friendly_name: "Modus" },
    },
    "fan.deckenventilator": {
      state: "on",
      attributes: { friendly_name: "Ventilator" },
    },
    "scene.entspannen": {
      state: "scening",
      attributes: { friendly_name: "Entspannen" },
    },
    "script.morgen": {
      state: "off",
      attributes: { friendly_name: "Morgenroutine" },
    },
    "sensor.unbekannt_status": {
      state: "unknown",
      attributes: { friendly_name: "Defekt" },
    },
    "switch.kaputt": {
      state: "unavailable",
      attributes: { friendly_name: "Defekt" },
    },
    "media_player.spotify": {
      state: "playing",
      attributes: { friendly_name: "Spotify" },
    },
    "light.eigenes_icon": {
      state: "on",
      attributes: { icon: "mdi:lamp", friendly_name: "Custom" },
    },
  },
};

// ============================================================================
// validateTileConfig
// ============================================================================

describe("validateTileConfig — entity Pflicht", () => {
  it("wirft, wenn entity fehlt", () => {
    expect(() => validateTileConfig({})).toThrow(/'entity' ist erforderlich/);
  });

  it("wirft, wenn entity leer ist", () => {
    expect(() => validateTileConfig({ entity: "" })).toThrow(/'entity' ist erforderlich/);
  });

  it("wirft, wenn entity kein String ist", () => {
    expect(() => validateTileConfig({ entity: 42 })).toThrow(/'entity' ist erforderlich/);
    expect(() => validateTileConfig({ entity: null })).toThrow(/'entity' ist erforderlich/);
  });

  it("nennt den Card-Namen in der Fehlermeldung", () => {
    expect(() => validateTileConfig({}, "NeoTileCard"))
      .toThrow(/^NeoTileCard:/);
  });

  it("akzeptiert eine gültige Minimal-Config", () => {
    expect(() => validateTileConfig({ entity: "light.x" })).not.toThrow();
  });
});

describe("validateTileConfig — show_state", () => {
  it("akzeptiert true", () => {
    expect(() => validateTileConfig({ entity: "light.x", show_state: true })).not.toThrow();
  });

  it("akzeptiert false", () => {
    expect(() => validateTileConfig({ entity: "light.x", show_state: false })).not.toThrow();
  });

  it("wirft bei String", () => {
    expect(() => validateTileConfig({ entity: "light.x", show_state: "true" }))
      .toThrow(/'show_state' muss boolean sein/);
  });

  it("wirft bei Zahl", () => {
    expect(() => validateTileConfig({ entity: "light.x", show_state: 1 }))
      .toThrow(/'show_state' muss boolean sein/);
  });
});

describe("validateTileConfig — layout", () => {
  it("akzeptiert compact und large", () => {
    expect(() => validateTileConfig({ entity: "light.x", layout: "compact" })).not.toThrow();
    expect(() => validateTileConfig({ entity: "light.x", layout: "large" })).not.toThrow();
  });

  it("wirft bei unbekanntem Wert", () => {
    expect(() => validateTileConfig({ entity: "light.x", layout: "huge" }))
      .toThrow(/'layout' muss "compact" oder "large" sein/);
  });
});

describe("validateTileConfig — secondary_info", () => {
  it("akzeptiert alle erlaubten Werte", () => {
    for (const value of VALID_SECONDARY_INFO) {
      expect(() => validateTileConfig({ entity: "light.x", secondary_info: value })).not.toThrow();
    }
  });

  it("wirft bei unbekanntem Wert", () => {
    expect(() => validateTileConfig({ entity: "light.x", secondary_info: "blah" }))
      .toThrow(/'secondary_info' muss/);
  });
});

// ============================================================================
// resolveTileTapAction
// ============================================================================

describe("resolveTileTapAction — explizite tap_action", () => {
  it("nutzt explizit gesetzte tap_action unverändert", () => {
    const config = {
      entity: "light.x",
      tap_action: { action: "navigate", navigation_path: "/foo" },
    };
    expect(resolveTileTapAction(config)).toEqual({
      action: "navigate",
      navigation_path: "/foo",
    });
  });

  it("ignoriert Domain-Default, wenn tap_action gesetzt ist", () => {
    const config = {
      entity: "light.x",
      tap_action: { action: "more-info" },
    };
    expect(resolveTileTapAction(config)).toEqual({ action: "more-info" });
  });
});

describe("resolveTileTapAction — Domain-Defaults Toggle", () => {
  it("light → toggle", () => {
    expect(resolveTileTapAction({ entity: "light.x" })).toEqual({ action: "toggle" });
  });

  it("switch → toggle", () => {
    expect(resolveTileTapAction({ entity: "switch.x" })).toEqual({ action: "toggle" });
  });

  it("input_boolean → toggle", () => {
    expect(resolveTileTapAction({ entity: "input_boolean.x" })).toEqual({ action: "toggle" });
  });

  it("fan → toggle", () => {
    expect(resolveTileTapAction({ entity: "fan.x" })).toEqual({ action: "toggle" });
  });
});

describe("resolveTileTapAction — Domain-Defaults call-service", () => {
  it("scene → call-service scene.turn_on mit target entity_id", () => {
    expect(resolveTileTapAction({ entity: "scene.entspannen" })).toEqual({
      action: "call-service",
      service: "scene.turn_on",
      target: { entity_id: "scene.entspannen" },
    });
  });

  it("script → call-service script.turn_on mit target entity_id", () => {
    expect(resolveTileTapAction({ entity: "script.morgen" })).toEqual({
      action: "call-service",
      service: "script.turn_on",
      target: { entity_id: "script.morgen" },
    });
  });
});

describe("resolveTileTapAction — Fallback", () => {
  it("unbekannte Domain → more-info", () => {
    expect(resolveTileTapAction({ entity: "media_player.x" })).toEqual({ action: "more-info" });
  });

  it("sensor → more-info", () => {
    expect(resolveTileTapAction({ entity: "sensor.x" })).toEqual({ action: "more-info" });
  });

  it("ohne entity → more-info", () => {
    expect(resolveTileTapAction({})).toEqual({ action: "more-info" });
  });

  it("ohne config → more-info", () => {
    expect(resolveTileTapAction(undefined)).toEqual({ action: "more-info" });
  });
});

// ============================================================================
// resolveTileViewModel — gültige Entity
// ============================================================================

describe("resolveTileViewModel — gültige Entity", () => {
  it("liefert Name, Icon und stateText", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "light.lampe_an" });
    expect(vm.status).toBe("ok");
    expect(vm.name).toBe("Stehlampe");
    expect(vm.icon).toBe("mdi:lightbulb");
    expect(vm.stateText).toBe("on");
  });

  it("name aus config überschreibt friendly_name", () => {
    const vm = resolveTileViewModel(fakeHass, {
      entity: "light.lampe_an",
      name: "Mein Licht",
    });
    expect(vm.name).toBe("Mein Licht");
  });

  it("icon aus config überschreibt stateIcon-Default", () => {
    const vm = resolveTileViewModel(fakeHass, {
      entity: "light.lampe_an",
      icon: "mdi:fire",
    });
    expect(vm.icon).toBe("mdi:fire");
  });

  it("nutzt attributes.icon, wenn config.icon nicht gesetzt", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "light.eigenes_icon" });
    expect(vm.icon).toBe("mdi:lamp");
  });
});

// ============================================================================
// resolveTileViewModel — show_state
// ============================================================================

describe("resolveTileViewModel — show_state", () => {
  it("Default ist true (zeigt State)", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "light.lampe_an" });
    expect(vm.showState).toBe(true);
  });

  it("show_state: true wird übernommen", () => {
    const vm = resolveTileViewModel(fakeHass, {
      entity: "light.lampe_an",
      show_state: true,
    });
    expect(vm.showState).toBe(true);
  });

  it("show_state: false wird erkannt", () => {
    const vm = resolveTileViewModel(fakeHass, {
      entity: "light.lampe_an",
      show_state: false,
    });
    expect(vm.showState).toBe(false);
  });
});

// ============================================================================
// resolveTileViewModel — secondary_info
// ============================================================================

describe("resolveTileViewModel — secondary_info", () => {
  it("liefert leeren secondary bei none", () => {
    const vm = resolveTileViewModel(fakeHass, {
      entity: "light.lampe_an",
      secondary_info: "none",
    });
    expect(vm.secondary).toBe("");
  });

  it("liefert die entity-ID bei entity_id", () => {
    const vm = resolveTileViewModel(fakeHass, {
      entity: "light.lampe_an",
      secondary_info: "entity_id",
    });
    expect(vm.secondary).toBe("light.lampe_an");
  });

  it("liefert relative Zeit bei last_changed", () => {
    const vm = resolveTileViewModel(fakeHass, {
      entity: "light.lampe_an",
      secondary_info: "last_changed",
    });
    expect(vm.secondary).toMatch(/vor|gerade eben/);
  });

  it("ohne secondary_info-Setting liefert leeren secondary (Default none)", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "light.lampe_an" });
    expect(vm.secondary).toBe("");
  });
});

// ============================================================================
// resolveTileViewModel — fehlende Entity
// ============================================================================

describe("resolveTileViewModel — fehlende Entity", () => {
  it("liefert status 'missing' und stateText '—'", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "light.gibtnicht" });
    expect(vm.status).toBe("missing");
    expect(vm.stateText).toBe("—");
  });

  it("isActive ist false bei missing", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "light.gibtnicht" });
    expect(vm.isActive).toBe(false);
  });

  it("liefert die konfigurierte entity-ID als Name-Fallback", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "light.gibtnicht" });
    expect(vm.name).toBe("light.gibtnicht");
  });
});

// ============================================================================
// resolveTileViewModel — unavailable / unknown
// ============================================================================

describe("resolveTileViewModel — muted Zustand", () => {
  it("erkennt unavailable als muted", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "switch.kaputt" });
    expect(vm.status).toBe("muted");
    expect(vm.stateText).toBe("unavailable");
  });

  it("erkennt unknown als muted", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "sensor.unbekannt_status" });
    expect(vm.status).toBe("muted");
    expect(vm.stateText).toBe("unknown");
  });

  it("isActive ist false bei muted", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "switch.kaputt" });
    expect(vm.isActive).toBe(false);
  });
});

// ============================================================================
// resolveTileViewModel — isActive
// ============================================================================

describe("resolveTileViewModel — isActive", () => {
  it("liefert true bei eingeschaltetem Licht", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "light.lampe_an" });
    expect(vm.isActive).toBe(true);
  });

  it("liefert false bei ausgeschaltetem Licht", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "light.lampe_aus" });
    expect(vm.isActive).toBe(false);
  });

  it("liefert true bei eingeschaltetem switch", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "switch.steckdose" });
    expect(vm.isActive).toBe(true);
  });

  it("liefert false bei ausgeschaltetem input_boolean", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "input_boolean.modus" });
    expect(vm.isActive).toBe(false);
  });
});

// ============================================================================
// resolveTileViewModel — defensives Verhalten
// ============================================================================

describe("resolveTileViewModel — defensives Verhalten", () => {
  it("crasht nicht bei fehlendem hass", () => {
    const vm = resolveTileViewModel(undefined, { entity: "light.x" });
    expect(vm.status).toBe("missing");
  });

  it("crasht nicht bei fehlendem config", () => {
    const vm = resolveTileViewModel(fakeHass, undefined);
    expect(vm.status).toBe("missing");
    expect(vm.stateText).toBe("—");
  });

  it("Default-Layout ist compact", () => {
    const vm = resolveTileViewModel(fakeHass, { entity: "light.lampe_an" });
    expect(vm.layout).toBe("compact");
  });

  it("ungültiger Layout-Wert fällt auf compact zurück", () => {
    const vm = resolveTileViewModel(fakeHass, {
      entity: "light.lampe_an",
      layout: "huge",
    });
    expect(vm.layout).toBe("compact");
  });
});

// ============================================================================
// Sensor-Card Schema
// ============================================================================

describe("NeoTileCard.getConfigSchema", () => {
  it("gibt ein Array zurück", () => {
    const schema = NeoTileCard.getConfigSchema();
    expect(Array.isArray(schema)).toBe(true);
    expect(schema.length).toBeGreaterThan(0);
  });

  it("enthält entity als required", () => {
    const schema = NeoTileCard.getConfigSchema();
    const entity = schema.find((f) => f.name === "entity");
    expect(entity).toBeDefined();
    expect(entity.required).toBe(true);
  });

  it("entity hat einen Entity-Selector mit interaktiven Domains", () => {
    const schema = NeoTileCard.getConfigSchema();
    const entity = schema.find((f) => f.name === "entity");
    const domains = entity.selector?.entity?.domain;
    expect(domains).toContain("light");
    expect(domains).toContain("switch");
    expect(domains).toContain("input_boolean");
    expect(domains).toContain("fan");
    expect(domains).toContain("scene");
    expect(domains).toContain("script");
  });

  it("enthält show_state mit Boolean-Selector", () => {
    const schema = NeoTileCard.getConfigSchema();
    const showState = schema.find((f) => f.name === "show_state");
    expect(showState).toBeDefined();
    expect(showState.selector?.boolean).toBeDefined();
  });

  it("enthält layout als Select mit compact und large", () => {
    const schema = NeoTileCard.getConfigSchema();
    const layout = schema.find((f) => f.name === "layout");
    expect(layout).toBeDefined();
    const values = layout.selector.select.options.map((o) =>
      typeof o === "string" ? o : o.value
    );
    expect(values).toContain("compact");
    expect(values).toContain("large");
  });

  it("enthält secondary_info als Select mit allen erlaubten Werten", () => {
    const schema = NeoTileCard.getConfigSchema();
    const secondary = schema.find((f) => f.name === "secondary_info");
    const values = secondary.selector.select.options.map((o) =>
      typeof o === "string" ? o : o.value
    );
    expect(values).toContain("none");
    expect(values).toContain("last_changed");
    expect(values).toContain("entity_id");
  });

  it("enthält tap_action mit ui_action-Selector", () => {
    const schema = NeoTileCard.getConfigSchema();
    expect(schema.find((f) => f.name === "tap_action")?.selector?.ui_action).toBeDefined();
  });

  it("enthält hold_action mit ui_action-Selector", () => {
    const schema = NeoTileCard.getConfigSchema();
    expect(schema.find((f) => f.name === "hold_action")?.selector?.ui_action).toBeDefined();
  });

  it("enthält double_tap_action mit ui_action-Selector", () => {
    const schema = NeoTileCard.getConfigSchema();
    expect(schema.find((f) => f.name === "double_tap_action")?.selector?.ui_action).toBeDefined();
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

  it("INTERACTIVE_DOMAINS enthält die 6 erwarteten Domains", () => {
    expect(INTERACTIVE_DOMAINS).toEqual([
      "light",
      "switch",
      "input_boolean",
      "fan",
      "scene",
      "script",
    ]);
  });
});