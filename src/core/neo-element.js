import { LitElement } from "lit";
import { neoSharedStyles } from "./neo-shared.css.js";

/**
 * Gemeinsame Basisklasse für alle Neo-Cards.
 * - Stellt geteilte Styles bereit
 * - Vereinheitlicht setConfig / hass / getCardSize
 * - Erlaubt Subklassen, eine eigene Validierung über _validateConfig zu definieren
 */
export class NeoElement extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  static styles = [neoSharedStyles];

  /**
   * Wird von Home Assistant aufgerufen, sobald die Card eine Konfiguration erhält.
   * Validiert die Grundstruktur und ruft danach den Subklassen-Hook
   * _validateConfig auf, bevor die Konfiguration gespeichert wird.
   *
   * Atomar: Wenn _validateConfig wirft, bleibt die alte Config erhalten.
   */
  setConfig(config) {
    if (config === null || config === undefined) {
      throw new Error(`${this.constructor.name}: Konfiguration fehlt`);
    }
    if (typeof config !== "object" || Array.isArray(config)) {
      throw new Error(
        `${this.constructor.name}: Konfiguration muss ein Objekt sein`
      );
    }

    // Subklassen-Hook. Darf werfen — dann wird _config nicht überschrieben.
    this._validateConfig(config);

    this._config = config;
  }

  /**
   * Hook für Subklassen. Standardmäßig ohne Wirkung.
   * Subklassen sollten hier ihre Pflichtfelder prüfen
   * und bei Problemen einen Error werfen, z. B.:
   *
   *   _validateConfig(config) {
   *     if (!config.entity) {
   *       throw new Error(`${this.constructor.name}: 'entity' ist erforderlich`);
   *     }
   *   }
   */
  // eslint-disable-next-line no-unused-vars
  _validateConfig(config) {
    // no-op
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