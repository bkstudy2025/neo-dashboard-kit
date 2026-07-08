// ══════════════════════════════════════════════════════════════
// NEO CARD — single wrapper card with a type dropdown.
// This is the ONLY card shown in HA's picker. The dropdown lists
// every registered Neo card (core + community plugins).
// ══════════════════════════════════════════════════════════════
import { NeoDashboardRegistry } from "../core/registry.js";
import { NeoStore } from "../store/module-store.js";
import { neoLogo } from "../core/branding.js";
import { escapeHtml } from "../core/html.js";
import { neoT, neoLang } from "../core/i18n.js";
import "./neo-card-editor.js";

class NeoCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    // Hinweis: config.modules sind jetzt karten-gebundene Layer-Module
    // ([{ id, settings }]) — sie werden von der Karte selbst (Basis-Karte)
    // über die style/decorate-Hooks angewandt, nicht hier geladen.
    const type = this._config.card_type;

    if (!type) {
      this._placeholderLang = neoLang(this._hass);
      this.innerHTML = `
        <ha-card style="
          padding:28px 24px;border-radius:24px;text-align:center;
          display:flex;flex-direction:column;align-items:center;gap:10px;
        ">
          ${neoLogo({ size: 56, radius: 16 })}
          <div style="font-size:16px;font-weight:600;color:var(--primary-text-color);">Neo Card</div>
          <div style="font-size:13px;color:var(--secondary-text-color);max-width:240px;line-height:1.4;">
            ${neoT(this._hass, "Wähle zuerst eine Karte: Header, Steuerung oder Anzeige. Danach wählst du den passenden Typ.")}
          </div>
        </ha-card>`;
      this._child = null;
      this._childType = null;
      return;
    }

    if (!NeoDashboardRegistry.getCard(type)) {
      // Module may still be loading from the backend store — retry once ready
      this._placeholderLang = neoLang(this._hass);
      const loaded = NeoStore._loaded;
      // Ruhiger Platzhalter mit reservierter Höhe (kein Layout-Sprung beim
      // Austausch). Die „Modul wird geladen …"-Zeile wird bewusst NICHT sofort
      // gezeigt: Bei schnellem Laden (Cache/lokaler Store) würde sie nur kurz
      // aufblitzen und wie ein Fehler wirken. Nur bei genuin unbekanntem Typ
      // (Store bereits geladen) sofort Klartext.
      this.innerHTML = `
        <ha-card style="padding:24px;min-height:88px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--secondary-text-color);">
          <span class="neo-ph-msg">${loaded
            ? `${neoT(this._hass, "Unbekannter Neo-Kartentyp:")} ${escapeHtml(type)}`
            : ""}</span>
        </ha-card>`;
      this._child = null;
      this._childType = null;
      if (!loaded && !this._waitingModules) {
        this._waitingModules = true;
        // Erst nach kurzer Schwelle den Ladetext einblenden (Anti-Flackern,
        // analog zur MIN_SKELETON_MS-Logik im Store-Editor).
        this._phTimer = setTimeout(() => {
          const el = this.querySelector(".neo-ph-msg");
          if (el && !NeoStore._loaded) el.textContent = neoT(this._hass, "Modul wird geladen …");
        }, 300);
        this._onModsLoaded = () => {
          this._waitingModules = false;
          clearTimeout(this._phTimer);
          this.setConfig(this._config);
        };
        window.addEventListener("neo-modules-loaded", this._onModsLoaded, { once: true });
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
    if (this._child) { this._child.hass = h; return; }
    // Placeholder/Meldung sichtbar: Texte folgen der HA-Sprache. Neu rendern,
    // sobald die Sprache erstmals bekannt ist oder wechselt (nicht bei jedem
    // hass-Update — das käme bei jedem State-Change im System).
    if (this._config && neoLang(h) !== this._placeholderLang) this.setConfig(this._config);
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
    // Warte-Zustand aufräumen: sonst feuert der {once}-Listener noch für eine
    // längst entfernte Karte und der Ladetext-Timer läuft ins Leere.
    if (this._onModsLoaded) window.removeEventListener("neo-modules-loaded", this._onModsLoaded);
    clearTimeout(this._phTimer);
    this._waitingModules = false;
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
  // Statische Registrierung — hier gibt es noch kein hass, daher entscheidet
  // die Browser-Sprache über DE/EN im nativen HA-Karten-Picker.
  const _de = (navigator.language || "").toLowerCase().startsWith("de");
  window.customCards.push({
    type: "neo-card",
    name: "Neo Card",
    description: _de
      ? "Glassmorphism-Karten — Typ im Editor wählen"
      : "Glassmorphism cards — pick the type in the editor",
    preview: true,
    documentationURL: "https://github.com/bkstudy2025/neo-dashboard-kit",
  });
}
