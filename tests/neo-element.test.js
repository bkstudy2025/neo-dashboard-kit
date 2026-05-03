import { describe, it, expect, vi } from "vitest";
import { NeoElement } from "../src/core/neo-element.js";

/**
 * NeoElement erbt von LitElement (und damit von HTMLElement),
 * daher kann es in der Node-Umgebung nicht instanziiert werden.
 * Wir testen die Methoden direkt vom Prototype mit einem Mock-this.
 *
 * Sobald in Schritt 1.6 happy-dom eingeführt ist, können diese Tests
 * problemlos auf echte new NeoElement()-Instanzen umgestellt werden.
 */

/**
 * Erzeugt ein Mock-this-Objekt, das genug Felder bereitstellt,
 * damit setConfig / _validateConfig korrekt arbeiten.
 */
function createCtx(overrides = {}) {
  return {
    constructor: { name: "NeoElement" },
    _config: undefined,
    _validateConfig: NeoElement.prototype._validateConfig,
    ...overrides,
  };
}

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
        // Zum Zeitpunkt der Validierung darf _config noch der alte sein
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