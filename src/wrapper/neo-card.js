// ══════════════════════════════════════════════════════════════
// NEO CARD — single wrapper card with a type dropdown.
// This is the ONLY card shown in HA's picker. The dropdown lists
// every registered Neo card (core + community plugins).
// ══════════════════════════════════════════════════════════════
import { NeoDashboardRegistry } from "../core/registry.js";
import { NeoStore } from "../store/module-store.js";
import { neoLogo } from "../core/branding.js";
import "./neo-card-editor.js";

class NeoCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    // Hinweis: config.modules sind jetzt karten-gebundene Layer-Module
    // ([{ id, settings }]) — sie werden von der Karte selbst (Basis-Karte)
    // über die style/decorate-Hooks angewandt, nicht hier geladen.
    const type = this._config.card_type;

    if (!type) {
      this.innerHTML = `
        <ha-card style="
          padding:28px 24px;border-radius:24px;text-align:center;
          display:flex;flex-direction:column;align-items:center;gap:10px;
        ">
          ${neoLogo({ size: 56, radius: 16 })}
          <div style="font-size:16px;font-weight:600;color:var(--primary-text-color);">Neo Card</div>
          <div style="font-size:13px;color:var(--secondary-text-color);max-width:240px;line-height:1.4;">
            Wähle im Editor unter <b>Kartentyp</b> die gewünschte Karte (Licht, Sensor, Szene …).
          </div>
        </ha-card>`;
      this._child = null;
      this._childType = null;
      return;
    }

    if (!NeoDashboardRegistry.getCard(type)) {
      // Module may still be loading from the backend store — retry once ready
      this.innerHTML = `
        <ha-card style="padding:24px;text-align:center;color:var(--secondary-text-color);">
          ${NeoStore._loaded ? `Unbekannter Neo-Kartentyp: ${type}` : "Modul wird geladen …"}
        </ha-card>`;
      if (!NeoStore._loaded && !this._waitingModules) {
        this._waitingModules = true;
        window.addEventListener("neo-modules-loaded", () => {
          this._waitingModules = false;
          this.setConfig(this._config);
        }, { once: true });
      }
      return;
    }

    // (Re)create child when the type OR its concrete tag changes. The tag
    // changes when a module is updated → the new version goes live without
    // a page reload.
    const tag = NeoDashboardRegistry.getTag(type) || type;
    if (!this._child || this._childTag !== tag) {
      this.innerHTML = "";
      this._child = document.createElement(tag);
      this._childType = type;
      this._childTag = tag;
      this.appendChild(this._child);
    }

    const childConfig = { ...this._config };
    delete childConfig.card_type;
    this._child.setConfig(childConfig);
    if (this._hass) this._child.hass = this._hass;
  }

  set hass(h) {
    this._hass = h;
    NeoStore.setHass(h);
    if (this._child) this._child.hass = h;
  }
  get hass() { return this._hass; }

  connectedCallback() {
    // Live-Swap: wenn ein Modul (neu) geladen/aktualisiert wird, Kind mit
    // aktuellem versioniertem Tag neu aufbauen – ohne Browser-Reload.
    this._onModChange = () => { if (this._config) this.setConfig(this._config); };
    window.addEventListener("neo-module-changed", this._onModChange);
  }

  disconnectedCallback() {
    if (this._onModChange) window.removeEventListener("neo-module-changed", this._onModChange);
  }

  getCardSize() {
    return this._child?.getCardSize?.() ?? 2;
  }

  static getConfigElement() {
    return document.createElement("neo-card-editor");
  }

  static getStubConfig() {
    // Empty stub → picker shows the placeholder, not a specific card
    return {};
  }
}
customElements.define("neo-card", NeoCard);

// Expose ONLY neo-card in HA's native picker
window.customCards = window.customCards || [];
if (!window.customCards.find((c) => c.type === "neo-card")) {
  window.customCards.push({
    type: "neo-card",
    name: "Neo Card",
    description: "Glassmorphism-Karten — Typ im Editor wählen",
    preview: true,
    documentationURL: "https://github.com/bkstudy2025/neo-dashboard-kit",
  });
}
