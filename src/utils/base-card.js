// Neo Dashboard Kit — Base Card
// All Neo cards (core + community) extend this class.

import { CSS_VARS, BASE_CARD_STYLES } from "../tokens.js";

export class NeoBaseCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
  }

  // Called by Home Assistant to pass config from YAML
  setConfig(config) {
    this._config = config;
    this._render();
  }

  // Called by Home Assistant whenever entity states update
  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  get hass() {
    return this._hass;
  }

  // Override in subclasses to return card height (in HA grid rows)
  getCardSize() {
    return 2;
  }

  // Override in subclasses — return an HTML string
  render() {
    return `<div class="neo-card" style="padding:16px;color:var(--neo-text1)">Override render() in your card.</div>`;
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${CSS_VARS}
        ${BASE_CARD_STYLES}
      </style>
      ${this.render()}
    `;
    this._bindEvents();
  }

  // Override in subclasses to attach event listeners after render
  _bindEvents() {}

  // Helper: get entity state or undefined
  _state(entityId) {
    return this._hass?.states?.[entityId];
  }

  // Helper: get entity attribute
  _attr(entityId, attr) {
    return this._state(entityId)?.attributes?.[attr];
  }

  // Helper: call HA service
  _callService(domain, service, data = {}) {
    this._hass?.callService(domain, service, data);
  }

  // Helper: get accent token by name
  _accent(name) {
    const { accent } = require("../tokens.js");
    return accent[name] || accent.blue;
  }
}
