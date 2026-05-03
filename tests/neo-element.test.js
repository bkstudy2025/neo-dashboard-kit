import { describe, it, expect, vi } from "vitest";
import { NeoElement } from "../src/core/neo-element.js";

/**
 * NeoElement erbt von LitElement (und damit von HTMLElement),
 * daher kann es in der Node-Umgebung nicht instanziiert werden.
 * Wir testen die Methoden direkt vom Prototype mit einem Mock-this.
 *
 * Sobald in Phase 3 happy-dom eingeführt ist, können diese Tests
 * problemlos auf echte new NeoElement()-Instanzen umgestellt werden.
 */

/**
 * Erzeugt ein Mock-this-Objekt, das genug Felder bereitstellt,
 * damit setConfig / _validateConfig / shouldUpdate korrekt arbeiten.
 */
function createCtx(overrides = {}) {
  return {
    constructor: { name: "NeoElement" },
    _config: undefined,
    hass: undefined,
    _validateConfig: NeoElement.prototype._validateConfig,
    _watchedEntities: NeoElement.prototype._watchedEntities,
    ...overrides,
  };
}

/**
 * Hilfsfunktion: erzeugt eine Map mit Lit-typischer changedProps-Struktur.
 * key = Property-Name, value = vorheriger Wert.
 */
function changedProps(entries) {
  return new Map(entries);
}

// ===========================================================================
// setConfig — gültige Eingaben
// ===========================================================================

describe("NeoElement.setConfig — gültige Eingaben", () => {
  it("akzeptiert ein leeres Objekt", () => {
    const ctx = createCtx();
    NeoElement.prototype.setConfig.call(ctx, {});
    expect(ctx._config).toEqual({});
  });

  it("akzeptiert ein Objekt mit Properties", () => {
    const ctx = createCtx();
    const config = { entity: "sensor.foo", title: "Test" };
    NeoElement.prototype.setConfig.call(ctx, config);
    expect(ctx._config).toBe(config);
  });
});

// ===========================================================================
// setConfig — ungültige Eingaben
// ===========================================================================

describe("NeoElement.setConfig — ungültige Eingaben", () => {
  it("wirft bei undefined", () => {
    const ctx = createCtx();
    expect(() => NeoElement.prototype.setConfig.call(ctx, undefined))
      .toThrow(/Konfiguration fehlt/);
  });

  it("wirft bei null", () => {
    const ctx = createCtx();
    expect(() => NeoElement.prototype.setConfig.call(ctx, null))
      .toThrow(/Konfiguration fehlt/);
  });

  it("wirft bei einem String", () => {
    const ctx = createCtx();
    expect(() => NeoElement.prototype.setConfig.call(ctx, "foo"))
      .toThrow(/Konfiguration muss ein Objekt sein/);
  });

  it("wirft bei einer Zahl", () => {
    const ctx = createCtx();
    expect(() => NeoElement.prototype.setConfig.call(ctx, 42))
      .toThrow(/Konfiguration muss ein Objekt sein/);
  });

  it("wirft bei einem Array", () => {
    const ctx = createCtx();
    expect(() => NeoElement.prototype.setConfig.call(ctx, [1, 2, 3]))
      .toThrow(/Konfiguration muss ein Objekt sein/);
  });

  it("wirft bei boolean", () => {
    const ctx = createCtx();
    expect(() => NeoElement.prototype.setConfig.call(ctx, true))
      .toThrow(/Konfiguration muss ein Objekt sein/);
  });

  it("nennt den Card-Namen in der Fehlermeldung", () => {
    const ctx = createCtx({ constructor: { name: "NeoFooCard" } });
    expect(() => NeoElement.prototype.setConfig.call(ctx, undefined))
      .toThrow(/NeoFooCard:/);
  });
});

// ===========================================================================
// _validateConfig — Default-Verhalten
// ===========================================================================

describe("NeoElement._validateConfig — Default-Verhalten", () => {
  it("wirft standardmäßig nicht", () => {
    const ctx = createCtx();
    expect(() => ctx._validateConfig({})).not.toThrow();
    expect(() => ctx._validateConfig({ beliebig: "wert" })).not.toThrow();
  });

  it("liefert undefined zurück", () => {
    const ctx = createCtx();
    expect(ctx._validateConfig({})).toBeUndefined();
  });
});

// ===========================================================================
// setConfig — Subklassen-Hook
// ===========================================================================

describe("NeoElement.setConfig — Subklassen-Hook", () => {
  it("ruft _validateConfig mit der Config auf", () => {
    const spy = vi.fn();
    const ctx = createCtx({ _validateConfig: spy });
    const config = { entity: "sensor.foo" };

    NeoElement.prototype.setConfig.call(ctx, config);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(config);
  });

  it("ruft _validateConfig vor dem Speichern auf", () => {
    let configBeiValidierung;
    const ctx = createCtx({
      _config: { alt: true },
      _validateConfig: function () {
        configBeiValidierung = this._config;
      },
    });

    NeoElement.prototype.setConfig.call(ctx, { neu: true });

    expect(configBeiValidierung).toEqual({ alt: true });
    expect(ctx._config).toEqual({ neu: true });
  });

  it("speichert _config nicht, wenn _validateConfig wirft (atomar)", () => {
    const ctx = createCtx({
      _config: { alt: true },
      _validateConfig: () => {
        throw new Error("Pflichtfeld 'entity' fehlt");
      },
    });

    expect(() => NeoElement.prototype.setConfig.call(ctx, { neu: true }))
      .toThrow(/Pflichtfeld 'entity' fehlt/);

    expect(ctx._config).toEqual({ alt: true });
  });

  it("propagiert die Fehlermeldung aus _validateConfig unverändert", () => {
    const ctx = createCtx({
      _validateConfig: () => {
        throw new Error("Sehr spezifischer Validierungsfehler");
      },
    });

    expect(() => NeoElement.prototype.setConfig.call(ctx, {}))
      .toThrow("Sehr spezifischer Validierungsfehler");
  });

  it("ruft _validateConfig nicht auf, wenn die Grundvalidierung scheitert", () => {
    const spy = vi.fn();
    const ctx = createCtx({ _validateConfig: spy });

    expect(() => NeoElement.prototype.setConfig.call(ctx, null)).toThrow();
    expect(() => NeoElement.prototype.setConfig.call(ctx, "foo")).toThrow();
    expect(() => NeoElement.prototype.setConfig.call(ctx, [])).toThrow();

    expect(spy).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// _watchedEntities — Default
// ===========================================================================

describe("NeoElement._watchedEntities — Default", () => {
  it("liefert standardmäßig null", () => {
    const ctx = createCtx();
    expect(ctx._watchedEntities()).toBeNull();
  });
});

// ===========================================================================
// shouldUpdate — Default-Verhalten ohne _watchedEntities
// ===========================================================================

describe("NeoElement.shouldUpdate — ohne _watchedEntities (Default)", () => {
  it("rendert bei Änderung von _config (nicht hass) neu", () => {
    const ctx = createCtx();
    const cp = changedProps([["_config", { alt: true }]]);
    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });

  it("rendert bei kombinierten Änderungen (hass + _config) neu", () => {
    const ctx = createCtx({ hass: { states: {} } });
    const cp = changedProps([
      ["hass", { states: {} }],
      ["_config", { alt: true }],
    ]);
    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });

  it("rendert bei reinem hass-Update neu (Default-Verhalten)", () => {
    const oldHass = { states: { "sensor.a": { state: "1" } } };
    const newHass = { states: { "sensor.a": { state: "2" } } };
    const ctx = createCtx({ hass: newHass });
    const cp = changedProps([["hass", oldHass]]);
    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });

  it("rendert beim ersten hass-Wert (oldHass undefined) neu", () => {
    const newHass = { states: {} };
    const ctx = createCtx({ hass: newHass });
    const cp = changedProps([["hass", undefined]]);
    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });

  it("rendert neu, wenn newHass plötzlich fehlt", () => {
    const oldHass = { states: {} };
    const ctx = createCtx({ hass: undefined });
    const cp = changedProps([["hass", oldHass]]);
    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });
});

// ===========================================================================
// shouldUpdate — mit gesetzter _watchedEntities
// ===========================================================================

describe("NeoElement.shouldUpdate — mit _watchedEntities", () => {
  it("rendert NICHT, wenn sich nur unrelated Entities geändert haben", () => {
    const stateA = { state: "1" };
    const stateB1 = { state: "x" };
    const stateB2 = { state: "y" };
    const oldHass = { states: { "sensor.a": stateA, "sensor.b": stateB1 } };
    const newHass = { states: { "sensor.a": stateA, "sensor.b": stateB2 } };

    const ctx = createCtx({
      hass: newHass,
      _watchedEntities: () => ["sensor.a"],
    });
    const cp = changedProps([["hass", oldHass]]);

    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(false);
  });

  it("rendert, wenn sich eine watched Entity geändert hat", () => {
    const stateA1 = { state: "1" };
    const stateA2 = { state: "2" };
    const stateB = { state: "x" };
    const oldHass = { states: { "sensor.a": stateA1, "sensor.b": stateB } };
    const newHass = { states: { "sensor.a": stateA2, "sensor.b": stateB } };

    const ctx = createCtx({
      hass: newHass,
      _watchedEntities: () => ["sensor.a"],
    });
    const cp = changedProps([["hass", oldHass]]);

    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });

  it("rendert, wenn mindestens eine von mehreren watched Entities sich ändert", () => {
    const stateA = { state: "1" };
    const stateB1 = { state: "x" };
    const stateB2 = { state: "y" };
    const oldHass = { states: { "sensor.a": stateA, "sensor.b": stateB1 } };
    const newHass = { states: { "sensor.a": stateA, "sensor.b": stateB2 } };

    const ctx = createCtx({
      hass: newHass,
      _watchedEntities: () => ["sensor.a", "sensor.b"],
    });
    const cp = changedProps([["hass", oldHass]]);

    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });

  it("rendert NICHT, wenn die watched Entity in beiden hass-States gleich ist", () => {
    const sharedState = { state: "stable" };
    const oldHass = { states: { "sensor.a": sharedState, "sensor.b": { state: "1" } } };
    const newHass = { states: { "sensor.a": sharedState, "sensor.b": { state: "2" } } };

    const ctx = createCtx({
      hass: newHass,
      _watchedEntities: () => ["sensor.a"],
    });
    const cp = changedProps([["hass", oldHass]]);

    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(false);
  });

  it("behandelt fehlende Entity in oldHass als Änderung", () => {
    const stateNew = { state: "neu" };
    const oldHass = { states: {} };
    const newHass = { states: { "sensor.a": stateNew } };

    const ctx = createCtx({
      hass: newHass,
      _watchedEntities: () => ["sensor.a"],
    });
    const cp = changedProps([["hass", oldHass]]);

    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });
});

// ===========================================================================
// shouldUpdate — ungültige _watchedEntities-Rückgaben
// ===========================================================================

describe("NeoElement.shouldUpdate — ungültige _watchedEntities-Rückgaben", () => {
  it("fällt auf Default zurück, wenn _watchedEntities null liefert", () => {
    const oldHass = { states: { "sensor.a": { state: "1" } } };
    const newHass = { states: { "sensor.a": { state: "2" } } };

    const ctx = createCtx({
      hass: newHass,
      _watchedEntities: () => null,
    });
    const cp = changedProps([["hass", oldHass]]);

    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });

  it("fällt auf Default zurück, wenn _watchedEntities undefined liefert", () => {
    const oldHass = { states: {} };
    const newHass = { states: {} };

    const ctx = createCtx({
      hass: newHass,
      _watchedEntities: () => undefined,
    });
    const cp = changedProps([["hass", oldHass]]);

    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });

  it("fällt auf Default zurück, wenn _watchedEntities ein leeres Array liefert", () => {
    const oldHass = { states: {} };
    const newHass = { states: {} };

    const ctx = createCtx({
      hass: newHass,
      _watchedEntities: () => [],
    });
    const cp = changedProps([["hass", oldHass]]);

    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });

  it("fällt auf Default zurück, wenn nach Filtern keine gültigen Entities übrig sind", () => {
    const oldHass = { states: {} };
    const newHass = { states: {} };

    const ctx = createCtx({
      hass: newHass,
      _watchedEntities: () => [null, undefined, "", 42, {}],
    });
    const cp = changedProps([["hass", oldHass]]);

    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });

  it("ignoriert ungültige Werte und nutzt nur gültige Entity-IDs", () => {
    const stateA = { state: "stable" };
    const oldHass = { states: { "sensor.a": stateA, "sensor.b": { state: "1" } } };
    const newHass = { states: { "sensor.a": stateA, "sensor.b": { state: "2" } } };

    const ctx = createCtx({
      hass: newHass,
      _watchedEntities: () => [null, "sensor.a", "", undefined],
    });
    const cp = changedProps([["hass", oldHass]]);

    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(false);
  });

  it("fällt auf Default zurück, wenn _watchedEntities kein Array liefert", () => {
    const oldHass = { states: {} };
    const newHass = { states: {} };

    const ctx = createCtx({
      hass: newHass,
      _watchedEntities: () => "sensor.a",
    });
    const cp = changedProps([["hass", oldHass]]);

    expect(NeoElement.prototype.shouldUpdate.call(ctx, cp)).toBe(true);
  });
});

// ===========================================================================
// Rückwärtskompatibilität
// ===========================================================================

describe("NeoElement — Rückwärtskompatibilität", () => {
  it("getCardSize liefert weiterhin 3 als Default", () => {
    expect(NeoElement.prototype.getCardSize.call({})).toBe(3);
  });

  it("static properties bleibt vorhanden", () => {
    expect(NeoElement.properties).toBeDefined();
    expect(NeoElement.properties.hass).toBeDefined();
    expect(NeoElement.properties._config).toBeDefined();
  });

  it("static styles bleibt vorhanden", () => {
    expect(NeoElement.styles).toBeDefined();
    expect(Array.isArray(NeoElement.styles)).toBe(true);
  });
});