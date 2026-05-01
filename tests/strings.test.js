import { describe, it, expect } from "vitest";
import { escapeHtml, safe, normalize } from "../src/core/helpers/strings.js";

describe("escapeHtml", () => {
  it("escaped die fünf gefährlichen Zeichen", () => {
    expect(escapeHtml(`<script>alert("x")</script>`))
      .toBe("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });

  it("escaped Apostroph und Ampersand", () => {
    expect(escapeHtml("Tom & Jerry's")).toBe("Tom &amp; Jerry&#39;s");
  });

  it("liefert leeren String bei null/undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("konvertiert Zahlen zu Strings", () => {
    expect(escapeHtml(42)).toBe("42");
  });
});

describe("safe", () => {
  it("liefert Wert wenn vorhanden", () => {
    expect(safe("hallo", "fallback")).toBe("hallo");
  });

  it("liefert Fallback bei leerem String/null/undefined", () => {
    expect(safe("", "fb")).toBe("fb");
    expect(safe(null, "fb")).toBe("fb");
    expect(safe(undefined, "fb")).toBe("fb");
  });

  it("akzeptiert 0 und false als gültige Werte", () => {
    expect(safe(0, "fb")).toBe(0);
    expect(safe(false, "fb")).toBe(false);
  });
});

describe("normalize", () => {
  it("trimmt und macht Kleinbuchstaben", () => {
    expect(normalize("  Marcel  ")).toBe("marcel");
  });

  it("toleriert null/undefined", () => {
    expect(normalize(null)).toBe("");
    expect(normalize(undefined)).toBe("");
  });
});