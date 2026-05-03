import { describe, it, expect } from "vitest";
import { findUserMapping } from "../src/core/helpers/users.js";

const mappings = [
  { user: "Marcel", person_entity: "person.marcel", avatar_icon: "mdi:account-tie" },
  { user_id: "abc123", person_entity: "person.julia", greeting_name: "Juli" },
  { user: "Gast", person_entity: "person.gast" },
];

const config = { users: mappings };

describe("findUserMapping — Match per Name", () => {
  it("findet das Mapping bei exaktem Namen", () => {
    const hass = { user: { name: "Marcel", id: "xyz999" } };
    expect(findUserMapping(hass, config)).toBe(mappings[0]);
  });

  it("findet das Mapping case-insensitive", () => {
    const hass = { user: { name: "marcel", id: "xyz999" } };
    expect(findUserMapping(hass, config)).toBe(mappings[0]);
  });

  it("findet das Mapping trotz Whitespace im hass.user.name", () => {
    const hass = { user: { name: "  Marcel  ", id: "xyz999" } };
    expect(findUserMapping(hass, config)).toBe(mappings[0]);
  });
});

describe("findUserMapping — Match per ID", () => {
  it("findet das Mapping über user_id, wenn der Name nicht matcht", () => {
    const hass = { user: { name: "IrgendwerAnders", id: "abc123" } };
    expect(findUserMapping(hass, config)).toBe(mappings[1]);
  });

  it("findet das Mapping über user_id case-insensitive", () => {
    const hass = { user: { name: "", id: "ABC123" } };
    expect(findUserMapping(hass, config)).toBe(mappings[1]);
  });
});

describe("findUserMapping — keine Treffer", () => {
  it("liefert undefined, wenn weder Name noch ID matchen", () => {
    const hass = { user: { name: "Unbekannt", id: "nope" } };
    expect(findUserMapping(hass, config)).toBeUndefined();
  });

  it("liefert das erste passende Mapping in Listenreihenfolge", () => {
    const cfg = {
      users: [
        { user: "Marcel", person_entity: "person.first" },
        { user: "Marcel", person_entity: "person.second" },
      ],
    };
    const hass = { user: { name: "Marcel", id: "" } };
    expect(findUserMapping(hass, cfg)).toBe(cfg.users[0]);
  });
});

describe("findUserMapping — leeres oder fehlendes Mapping", () => {
  it("liefert undefined bei leerem users-Array", () => {
    const hass = { user: { name: "Marcel", id: "abc" } };
    expect(findUserMapping(hass, { users: [] })).toBeUndefined();
  });

  it("liefert undefined bei fehlendem users-Property", () => {
    const hass = { user: { name: "Marcel", id: "abc" } };
    expect(findUserMapping(hass, {})).toBeUndefined();
  });

  it("liefert undefined bei undefined config", () => {
    const hass = { user: { name: "Marcel", id: "abc" } };
    expect(findUserMapping(hass, undefined)).toBeUndefined();
  });

  it("liefert undefined, wenn users kein Array ist", () => {
    const hass = { user: { name: "Marcel", id: "abc" } };
    expect(findUserMapping(hass, { users: "kein array" })).toBeUndefined();
  });
});

describe("findUserMapping — undefined / leeres hass", () => {
  it("liefert undefined bei undefined hass", () => {
    expect(findUserMapping(undefined, config)).toBeUndefined();
  });

  it("liefert undefined bei hass ohne user-Property", () => {
    expect(findUserMapping({}, config)).toBeUndefined();
  });

  it("liefert undefined bei hass.user ohne name und ohne id", () => {
    expect(findUserMapping({ user: {} }, config)).toBeUndefined();
  });
});