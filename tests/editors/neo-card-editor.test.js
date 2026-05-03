import { describe, it, expect } from "vitest";
import {
  normalizeSchema,
  prepareConfigChangedDetail,
} from "../../src/editors/neo-card-editor.js";
import { NeoSensorCard } from "../../src/cards/neo-sensor-card.js";

// ============================================================================
// normalizeSchema
// ============================================================================

describe("normalizeSchema", () => {
  it("liefert das Schema, wenn es ein Array ist", () => {
    const schema = [{ name: "entity" }, { name: "name" }];
    expect(normalizeSchema(schema)).toBe(schema);
  });

  it("liefert leeres Array bei undefined", () => {
    expect(normalizeSchema(undefined)).toEqual([]);
  });

  it("liefert leeres Array bei null", () => {
    expect(normalizeSchema(null)).toEqual([]);
  });

  it("liefert leeres Array bei Nicht-Array", () => {
    expect(normalizeSchema("foo")).toEqual([]);
    expect(normalizeSchema(42)).toEqual([]);
    expect(normalizeSchema({})).toEqual([]);
  });

  it("liefert leeres Array bei leerem Array", () => {
    expect(normalizeSchema([])).toEqual([]);
  });
});

// ============================================================================
// prepareConfigChangedDetail
// ============================================================================

describe("prepareConfigChangedDetail", () => {
  it("verpackt einen gültigen Config-Wert in detail.config", () => {
    const value = { entity: "sensor.x", name: "Test" };
    const result = prepareConfigChangedDetail(value);
    expect(result).toEqual({ config: value });
  });

  it("liefert leeres config-Objekt bei undefined", () => {
    expect(prepareConfigChangedDetail(undefined)).toEqual({ config: {} });
  });

  it("liefert leeres config-Objekt bei null", () => {
    expect(prepareConfigChangedDetail(null)).toEqual({ config: {} });
  });

  it("liefert leeres config-Objekt bei String", () => {
    expect(prepareConfigChangedDetail("foo")).toEqual({ config: {} });
  });

  it("liefert leeres config-Objekt bei Array", () => {
    expect(prepareConfigChangedDetail([1, 2, 3])).toEqual({ config: {} });
  });

  it("liefert leeres config-Objekt bei Zahl", () => {
    expect(prepareConfigChangedDetail(42)).toEqual({ config: {} });
  });

  it("akzeptiert ein leeres Objekt als gültige Config", () => {
    expect(prepareConfigChangedDetail({})).toEqual({ config: {} });
  });
});

// ============================================================================
// Sensor-Card Schema
// ============================================================================

describe("NeoSensorCard.getConfigSchema", () => {
  it("gibt ein Array zurück", () => {
    const schema = NeoSensorCard.getConfigSchema();
    expect(Array.isArray(schema)).toBe(true);
    expect(schema.length).toBeGreaterThan(0);
  });

  it("enthält entity als required Feld", () => {
    const schema = NeoSensorCard.getConfigSchema();
    const entity = schema.find((field) => field.name === "entity");
    expect(entity).toBeDefined();
    expect(entity.required).toBe(true);
  });

  it("entity hat einen Entity-Selector mit sensor und binary_sensor Domain", () => {
    const schema = NeoSensorCard.getConfigSchema();
    const entity = schema.find((field) => field.name === "entity");
    expect(entity.selector?.entity?.domain).toEqual(["sensor", "binary_sensor"]);
  });

  it("enthält name als optionales Text-Feld", () => {
    const schema = NeoSensorCard.getConfigSchema();
    const name = schema.find((field) => field.name === "name");
    expect(name).toBeDefined();
    expect(name.required).toBeFalsy();
    expect(name.selector?.text).toBeDefined();
  });

  it("enthält icon mit Icon-Selector", () => {
    const schema = NeoSensorCard.getConfigSchema();
    const icon = schema.find((field) => field.name === "icon");
    expect(icon).toBeDefined();
    expect(icon.selector?.icon).toBeDefined();
  });

  it("enthält unit mit Text-Selector", () => {
    const schema = NeoSensorCard.getConfigSchema();
    const unit = schema.find((field) => field.name === "unit");
    expect(unit).toBeDefined();
    expect(unit.selector?.text).toBeDefined();
  });

  it("enthält decimals mit Number-Selector und Bereich 0..10", () => {
    const schema = NeoSensorCard.getConfigSchema();
    const decimals = schema.find((field) => field.name === "decimals");
    expect(decimals).toBeDefined();
    expect(decimals.selector?.number?.min).toBe(0);
    expect(decimals.selector?.number?.max).toBe(10);
    expect(decimals.selector?.number?.mode).toBe("box");
  });

  it("enthält secondary_info als Select mit allen erlaubten Werten", () => {
    const schema = NeoSensorCard.getConfigSchema();
    const secondary = schema.find((field) => field.name === "secondary_info");
    expect(secondary).toBeDefined();
    const options = secondary.selector?.select?.options;
    expect(options).toBeDefined();
    const values = options.map((o) => (typeof o === "string" ? o : o.value));
    expect(values).toContain("none");
    expect(values).toContain("last_changed");
    expect(values).toContain("entity_id");
  });

  it("enthält layout als Select mit compact und large", () => {
    const schema = NeoSensorCard.getConfigSchema();
    const layout = schema.find((field) => field.name === "layout");
    expect(layout).toBeDefined();
    const options = layout.selector?.select?.options;
    expect(options).toBeDefined();
    const values = options.map((o) => (typeof o === "string" ? o : o.value));
    expect(values).toContain("compact");
    expect(values).toContain("large");
  });

  it("enthält tap_action mit ui_action-Selector", () => {
    const schema = NeoSensorCard.getConfigSchema();
    const tap = schema.find((field) => field.name === "tap_action");
    expect(tap).toBeDefined();
    expect(tap.selector?.ui_action).toBeDefined();
  });

  it("enthält hold_action mit ui_action-Selector", () => {
    const schema = NeoSensorCard.getConfigSchema();
    const hold = schema.find((field) => field.name === "hold_action");
    expect(hold).toBeDefined();
    expect(hold.selector?.ui_action).toBeDefined();
  });

  it("enthält double_tap_action mit ui_action-Selector", () => {
    const schema = NeoSensorCard.getConfigSchema();
    const dtap = schema.find((field) => field.name === "double_tap_action");
    expect(dtap).toBeDefined();
    expect(dtap.selector?.ui_action).toBeDefined();
  });
});