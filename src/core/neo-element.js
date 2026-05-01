import { LitElement } from "lit";
import { neoSharedStyles } from "./neo-shared.css.js";

/**
 * Gemeinsame Basisklasse für alle Neo-Cards.
 * - Stellt geteilte Styles bereit
 * - Vereinheitlicht setConfig / hass / getCardSize
 * - Erlaubt Cards, sich auf relevante Entity-Updates zu beschränken
 */
export class NeoElement extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  static styles = [neoSharedStyles];

  setConfig(config) {
    if (!config) {
      throw new Error("Konfiguration fehlt");
    }
    this._config = config;
  }

  getCardSize() {
    return 3;
  }

  /**
   * Standard-Reaktion auf Tap-Actions. Cards können das überschreiben.
   */
  fireAction(actionConfig) {
    if (!actionConfig || actionConfig.action === "none") return;
    this.dispatchEvent(
      new CustomEvent("hass-action", {
        bubbles: true,
        composed: true,
        detail: {
          config: this._config,
          action: actionConfig.action || "more-info",
        },
      })
    );
  }
}