// Neo Dashboard Kit — Hero Card
// Begrüßung mit Name, Präsenz-Status, Müll-Badge und Action-Buttons.
import { NeoBaseCard } from "../core/base-card.js";
import { NeoDashboardRegistry } from "../core/registry.js";
import { NEO_ACCENTS, NEO_ACCENT_OPTIONS } from "../core/tokens.js";
import { neoIcon } from "../core/icons.js";
import { makeNeoEditor } from "../core/editor-factory.js";
import { NEO_LAYOUT_FIELD } from "../core/layout.js";

class NeoHeroCard extends NeoBaseCard {
  getCardSize() { return 1; }

  _greeting() {
    const h = new Date().getHours();
    if (h < 5)  return "Gute Nacht";
    if (h < 12) return "Guten Morgen";
    if (h < 18) return "Guten Tag";
    return "Guten Abend";
  }

  // Default per-button config (slot 1 = Suche, 2 = Kalender, 3 = Benachrichtigungen)
  _buttonDefaults(slot) {
    return {
      1: { show: true, icon: "search", action: "quickbar", path: "", badge_entity: "" },
      2: { show: true, icon: "calendar", action: "navigate", path: "", badge_entity: "" },
      3: { show: true, icon: "bell", action: "navigate", path: "", badge_entity: "" },
    }[slot];
  }

  _button(slot) {
    return { ...this._buttonDefaults(slot), ...(this._config?.[`button${slot}`] || {}) };
  }

  // Returns { kind: "count"|"dot"|null, value }
  _badge(entityId) {
    if (!entityId) return { kind: null };
    const st = this._state(entityId)?.state;
    if (st == null) return { kind: null };
    const num = parseInt(st);
    if (!isNaN(num)) return num > 0 ? { kind: "count", value: num } : { kind: null };
    if (st === "on") return { kind: "dot" };
    return { kind: null };
  }

  _renderButton(slot) {
    const b = this._button(slot);
    if (!b.show) return "";
    const badge = this._badge(b.badge_entity);
    const active = badge.kind !== null;
    // Accent: configured, else rose for counts / violet for dot
    const acc = NEO_ACCENTS[b.accent] || (badge.kind === "count" ? NEO_ACCENTS.rose : NEO_ACCENTS.violet);
    // Tint the button itself when a badge is active (unless disabled)
    const highlight = active && b.highlight !== false;

    let badgeHtml = "";
    if (badge.kind === "count") {
      badgeHtml = `<span style="
        position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;padding:0 4px;
        border-radius:9px;background:${acc.c};color:#fff;font-size:10px;font-weight:700;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 0 2px var(--ha-card-background,#111827);
      ">${badge.value}</span>`;
    } else if (badge.kind === "dot") {
      badgeHtml = `<span style="
        position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:5px;
        background:${acc.c};box-shadow:0 0 0 2px var(--ha-card-background,#111827),0 0 6px ${acc.c};
      "></span>`;
    }

    const bg = highlight
      ? `linear-gradient(160deg, ${acc.glow} 0%, var(--neo-fill2,rgba(255,255,255,0.055)) 100%)`
      : "var(--neo-fill2,rgba(255,255,255,0.055))";
    const border = highlight ? `${acc.c}66` : "var(--neo-line2,rgba(255,255,255,0.08))";
    const iconColor = highlight ? acc.c : "var(--neo-text1)";

    return `
      <button class="neo-hero-btn" data-slot="${slot}" style="
        width:40px;height:40px;border-radius:20px;
        border:1px solid ${border};
        background:${bg};
        ${highlight ? `box-shadow:0 4px 14px ${acc.glow};` : ""}
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;flex-shrink:0;
        font-size:16px;position:relative;
      ">${neoIcon(b.icon, { size: 18, color: iconColor })}${badgeHtml}</button>`;
  }

  // Müll-Badge: zeigt nur, wenn der Sensor einen "echten" Wert hat
  // (Sensor-State = Tonnen-Name(n) für morgen, sonst off/none/leer)
  _waste() {
    const ent = this._config?.waste?.entity;
    if (!ent) return null;
    const st = this._state(ent);
    const v = st?.state;
    if (v == null) return null;
    const low = String(v).trim().toLowerCase();
    if (["", "off", "none", "unknown", "unavailable", "keine", "0", "false", "no"].includes(low)) return null;
    return { text: st.attributes?.waste_text || v, when: st.attributes?.when || null };
  }

  // Presence → { label, color } for the big status line
  _presence() {
    const personId = this._config?.person_entity;
    if (!personId) return null;
    const st = this._state(personId)?.state;
    if (st == null) return null;
    if (st === "home") return { label: "Zuhause", color: "#5EDCB8" };
    if (st === "not_home") return { label: "Unterwegs", color: "#FFB26B" };
    // Named zone (e.g. "Arbeit") → show capitalized
    return { label: st.charAt(0).toUpperCase() + st.slice(1), color: "#7C9CFF" };
  }

  _rgb(v) { return Array.isArray(v) && v.length === 3 ? `rgb(${v[0]},${v[1]},${v[2]})` : null; }

  render() {
    const userName = this._hass?.user?.name;
    const name = this._config?.name || userName || "Home";
    const greeting = this._config?.greeting_text || this._greeting();

    // Optional name color / gradient
    const c1 = this._rgb(this._config?.name_color);
    const c2 = this._rgb(this._config?.name_color2);
    let nameStyle = "font-weight:600;";
    if (c1 && c2) nameStyle += `background:linear-gradient(90deg,${c1},${c2});-webkit-background-clip:text;background-clip:text;color:transparent;`;
    else if (c1) nameStyle += `color:${c1};`;
    const nameHtml = `<span style="${nameStyle}">${name}</span>`;
    const greetLine = name && name !== "Home" ? `${greeting}, ${nameHtml}` : greeting;

    const waste = this._waste();
    const wcfg = this._config?.waste || {};
    let wasteHtml = "";
    if (waste) {
      const isToday = waste.when === "today" || waste.when === "heute";
      const wc = (NEO_ACCENTS[isToday ? (wcfg.color_today || "rose") : (wcfg.color || "mint")] || NEO_ACCENTS.mint).c;
      const wicon = wcfg.icon || "trash";
      const prefix = isToday
        ? (wcfg.label_today != null ? wcfg.label_today : "Heute")
        : (wcfg.label != null ? wcfg.label : "Morgen");
      const mobile = this._isMobile();
      const bins = String(waste.text).split(/,\s*/).filter(Boolean);
      const wtext = mobile
        ? (bins.length > 1 ? `${bins[0]} +${bins.length - 1}` : waste.text)
        : `${prefix ? prefix + ": " : ""}${waste.text}`;
      const full = `${prefix ? prefix + ": " : ""}${waste.text}`;
      wasteHtml = `<div class="neo-hero-waste" title="${full}" style="margin-top:8px;max-width:100%;display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;background:${wc}1f;border:1px solid ${wc}55;font-size:12px;font-weight:600;color:${wc};white-space:nowrap;overflow:hidden;cursor:pointer;-webkit-tap-highlight-color:transparent;">${neoIcon(wicon, { size: 14, color: wc })}<span style="overflow:hidden;text-overflow:ellipsis;">${wtext}</span></div>`;
    }

    const presence = this._presence();
    const bigLine = presence ? presence.label : name;
    const showDot = presence && this._config?.show_status_dot !== false;
    const dot = showDot
      ? `<span style="flex-shrink:0;width:9px;height:9px;border-radius:5px;background:${presence.color};box-shadow:0 0 8px ${presence.color};"></span>`
      : "";

    return `
      <div style="font-family:var(--neo-font,system-ui);color:var(--neo-text1,#F4F6FB);padding:8px 6px 12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <div style="min-width:0;">
            <div style="font-size:13px;color:var(--neo-text2);font-weight:500;letter-spacing:0.2px;line-height:1.2;">${greetLine}</div>
            <div style="display:flex;align-items:center;gap:8px;font-size:28px;font-weight:600;letter-spacing:-0.6px;line-height:1.1;margin-top:1px;">${dot}<span>${bigLine}</span></div>
            ${wasteHtml}
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0;">
            ${this._renderButton(1)}
            ${this._renderButton(2)}
            ${this._renderButton(3)}
          </div>
        </div>
      </div>`;
  }

  _navigate(path) {
    if (!path) return;
    history.pushState(null, "", path);
    window.dispatchEvent(new CustomEvent("location-changed"));
  }

  // Opens HA's built-in Quick Bar (entity search / command palette).
  // HA's keydown listener lives on the <home-assistant> element, so the
  // synthetic event must be dispatched there (events bubble up, not down).
  _openQuickBar(commands) {
    const key = commands ? "c" : "e";
    const code = commands ? "KeyC" : "KeyE";
    const keyCode = commands ? 67 : 69;
    const ev = new KeyboardEvent("keydown", {
      key, code, keyCode, which: keyCode,
      bubbles: true, cancelable: true, composed: true,
    });
    const target = document.querySelector("home-assistant") || document.body;
    target.dispatchEvent(ev);
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: true, composed: true, detail: { entityId },
    }));
  }

  _runAction(b) {
    const action = b.action || (b.path ? "navigate" : "none");
    switch (action) {
      case "quickbar": this._openQuickBar(false); break;
      case "quickbar_commands": this._openQuickBar(true); break;
      case "more_info": this._moreInfo(b.badge_entity); break;
      case "navigate": this._navigate(b.path); break;
      default: if (b.path) this._navigate(b.path);
    }
  }

  _bindEvents() {
    this.shadowRoot.querySelectorAll(".neo-hero-btn").forEach((el) => {
      el.addEventListener("click", () => {
        const slot = el.getAttribute("data-slot");
        this._runAction(this._button(slot));
      });
    });
    const w = this.shadowRoot.querySelector(".neo-hero-waste");
    if (w) w.addEventListener("click", () => this._moreInfo(this._config?.waste?.entity));
  }

  static getConfigElement() {
    return document.createElement("neo-hero-card-editor");
  }

  static getStubConfig() {
    return {
      button1: { show: true, icon: "search", path: "" },
      button2: { show: true, icon: "scenes", path: "" },
      button3: { show: true, icon: "bell", path: "" },
    };
  }
}

// Hero Card Visual Editor — expandable section per button
const _heroButtonSchema = (slot, title) => ({
  type: "expandable",
  name: `button${slot}`,
  title,
  schema: [
    { name: "show", label: "Anzeigen", selector: { boolean: {} } },
    { name: "icon", label: "Icon", selector: { icon: {} } },
    { name: "action", label: "Aktion beim Klick", selector: { select: { mode: "dropdown", options: [
      { value: "navigate", label: "Navigation (Pfad)" },
      { value: "quickbar", label: "Schnellsuche (Entitäten)" },
      { value: "quickbar_commands", label: "Befehle (Command Palette)" },
      { value: "more_info", label: "Info-Dialog (Badge-Entity)" },
      { value: "none", label: "Keine" },
    ] } } },
    { name: "path", label: "Navigations-Pfad (z.B. /lovelace/kalender)", selector: { text: {} } },
    { name: "badge_entity", label: "Badge-Entity (Zahl = Zähler, on = Punkt)", selector: { entity: {} } },
    { name: "accent", label: "Akzentfarbe bei Meldung", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
    { name: "highlight", label: "Button bei Meldung einfärben", selector: { boolean: {} } },
  ],
});

customElements.define("neo-hero-card-editor", makeNeoEditor([
  { name: "name", label: "Name (leer = angemeldeter Benutzer)", selector: { text: {} } },
  { name: "greeting_text", label: "Begrüßungstext (leer = automatisch nach Uhrzeit)", selector: { text: {} } },
  { name: "person_entity", label: "Person für Status (Zuhause/Unterwegs)", selector: { entity: { domain: "person" } } },
  { name: "show_status_dot", label: "Status-Punkt anzeigen", selector: { boolean: {} } },
  { name: "name_color", label: "Namensfarbe (optional)", selector: { color_rgb: {} } },
  { name: "name_color2", label: "Verlauf-Endfarbe (optional, für Gradient)", selector: { color_rgb: {} } },
  _heroButtonSchema(1, "Button 1 – Suche"),
  _heroButtonSchema(2, "Button 2 – Kalender"),
  _heroButtonSchema(3, "Button 3 – Benachrichtigungen"),
  {
    type: "expandable",
    name: "waste",
    title: "Müll-Badge (zeigt nur wenn morgen Abholung)",
    schema: [
      { name: "entity", label: "Müll-Sensor (State = Tonne, Attribut when = today/tomorrow)", selector: { entity: { domain: "sensor" } } },
      { name: "icon", label: "Icon", selector: { icon: {} } },
      { name: "label", label: "Präfix morgen (Standard: Morgen)", selector: { text: {} } },
      { name: "color", label: "Farbe morgen", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
      { name: "label_today", label: "Präfix heute (Standard: Heute)", selector: { text: {} } },
      { name: "color_today", label: "Farbe heute", selector: { select: { mode: "dropdown", options: NEO_ACCENT_OPTIONS } } },
    ],
  },
  NEO_LAYOUT_FIELD,
], { name: "Neo Hero / Begrüßung", description: "Begrüßung mit Name und Action-Buttons", icon: "👋" }));

// Vorübergehend versteckt, bis auf das neue Sektions-Muster umgebaut.
// hidden → nicht im Picker, rendert aber bestehende Dashboards weiter.
NeoDashboardRegistry.registerCard("neo-hero-card", NeoHeroCard, {
  name: "Neo Hero / Begrüßung",
  description: "Begrüßung mit Name und Action-Buttons",
  hidden: true,
});
