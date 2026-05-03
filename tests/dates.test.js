import { describe, it, expect } from "vitest";
import { formatDate, formatTime, greeting, formatRelativeTime } from "../src/core/helpers/dates.js";

describe("formatDate", () => {
  // 1. Mai 2025 war ein Donnerstag.
  const date = new Date(2025, 4, 1, 14, 32);

  it("enthält den Wochentag auf Deutsch", () => {
    expect(formatDate(date)).toContain("Donnerstag");
  });

  it("enthält den Tag", () => {
    expect(formatDate(date)).toContain("1");
  });

  it("enthält den Monatsnamen auf Deutsch", () => {
    expect(formatDate(date)).toContain("Mai");
  });

  it("liefert einen nicht-leeren String ohne Argument (Default = jetzt)", () => {
    const result = formatDate();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatTime", () => {
  it("formatiert eine konkrete Zeit als HH:MM", () => {
    const date = new Date(2025, 4, 1, 14, 32);
    expect(formatTime(date)).toBe("14:32");
  });

  it("nutzt zweistellige Stunden mit führender Null", () => {
    const date = new Date(2025, 4, 1, 7, 5);
    expect(formatTime(date)).toBe("07:05");
  });

  it("matcht das HH:MM-Muster ohne Argument", () => {
    expect(formatTime()).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("greeting", () => {
  // Hilfsfunktion: erzeugt ein Date mit gewünschter Stunde.
  const at = (hour, minute = 0) => new Date(2025, 4, 1, hour, minute);

  describe("Gute Nacht (vor 5 Uhr und ab 22 Uhr)", () => {
    it("um 00:00", () => expect(greeting(at(0))).toBe("Gute Nacht"));
    it("um 03:00", () => expect(greeting(at(3))).toBe("Gute Nacht"));
    it("um 04:59", () => expect(greeting(at(4, 59))).toBe("Gute Nacht"));
    it("um 22:00", () => expect(greeting(at(22))).toBe("Gute Nacht"));
    it("um 23:59", () => expect(greeting(at(23, 59))).toBe("Gute Nacht"));
  });

  describe("Guten Morgen (5 bis vor 11 Uhr)", () => {
    it("um 05:00", () => expect(greeting(at(5))).toBe("Guten Morgen"));
    it("um 08:00", () => expect(greeting(at(8))).toBe("Guten Morgen"));
    it("um 10:59", () => expect(greeting(at(10, 59))).toBe("Guten Morgen"));
  });

  describe("Guten Tag (11 bis vor 17 Uhr)", () => {
    it("um 11:00", () => expect(greeting(at(11))).toBe("Guten Tag"));
    it("um 14:00", () => expect(greeting(at(14))).toBe("Guten Tag"));
    it("um 16:59", () => expect(greeting(at(16, 59))).toBe("Guten Tag"));
  });

  describe("Guten Abend (17 bis vor 22 Uhr)", () => {
    it("um 17:00", () => expect(greeting(at(17))).toBe("Guten Abend"));
    it("um 19:30", () => expect(greeting(at(19, 30))).toBe("Guten Abend"));
    it("um 21:59", () => expect(greeting(at(21, 59))).toBe("Guten Abend"));
  });

  it("liefert ohne Argument einen der definierten Werte", () => {
    const valid = ["Gute Nacht", "Guten Morgen", "Guten Tag", "Guten Abend"];
    expect(valid).toContain(greeting());
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2025-05-03T12:00:00.000Z");

  it("liefert 'gerade eben' für sehr kurze Differenzen", () => {
    const date = new Date(now.getTime() - 10 * 1000);
    expect(formatRelativeTime(date, now)).toBe("gerade eben");
  });

  it("liefert 'vor 1 Min.' für 1 Minute", () => {
    const date = new Date(now.getTime() - 60 * 1000);
    expect(formatRelativeTime(date, now)).toBe("vor 1 Min.");
  });

  it("liefert Minuten für unter 1 Stunde", () => {
    const date = new Date(now.getTime() - 30 * 60 * 1000);
    expect(formatRelativeTime(date, now)).toBe("vor 30 Min.");
  });

  it("liefert Stunden für unter 1 Tag", () => {
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date, now)).toBe("vor 3 Std.");
  });

  it("liefert 'vor 1 Tag' für genau 1 Tag", () => {
    const date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date, now)).toBe("vor 1 Tag");
  });

  it("liefert Tage für mehrere Tage", () => {
    const date = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date, now)).toBe("vor 5 Tagen");
  });
});