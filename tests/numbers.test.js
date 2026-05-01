import { describe, it, expect } from "vitest";
import { parseNumber, formatNumber, clamp } from "../src/core/helpers/numbers.js";

describe("parseNumber", () => {
  it("akzeptiert Zahlen direkt", () => {
    expect(parseNumber(42)).toBe(42);
    expect(parseNumber(3.14)).toBe(3.14);
  });

  it("akzeptiert deutsche Dezimaldarstellung mit Komma", () => {
    expect(parseNumber("3,14")).toBe(3.14);
  });

  it("akzeptiert Werte mit Einheit", () => {
    expect(parseNumber("21,5 °C")).toBe(21.5);
    expect(parseNumber("85%")).toBe(85);
  });

  it("liefert NaN bei null/undefined/leer", () => {
    expect(parseNumber(null)).toBeNaN();
    expect(parseNumber(undefined)).toBeNaN();
  });

  it("liefert NaN bei nicht-numerischem String", () => {
    expect(parseNumber("unavailable")).toBeNaN();
  });
});

describe("formatNumber", () => {
  it("formatiert mit Komma als Dezimaltrenner", () => {
    expect(formatNumber(3.14, 2)).toBe("3,14");
  });

  it("rundet auf gewünschte Dezimalstellen", () => {
    expect(formatNumber(3.149, 2)).toBe("3,15");
  });

  it("liefert undefined bei ungültiger Eingabe", () => {
    expect(formatNumber("kaputt")).toBeUndefined();
    expect(formatNumber(null)).toBeUndefined();
  });
});

describe("clamp", () => {
  it("schneidet ab oben und unten", () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(50, 0, 100)).toBe(50);
  });
});