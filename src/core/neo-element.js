import { LitElement } from "lit";
import { neoSharedStyles } from "./neo-shared.css.js";

/**
 * Gemeinsame Basisklasse für alle Neo-Cards.
 * - Stellt geteilte Styles bereit
 * - Vereinheitlicht setConfig / hass / getCardSize
 * - Erlaubt Subklassen, eine eigene Validierung über _validateConfig zu definieren
 * - Erlaubt Subklassen, sich über _watchedEntities auf relevante Entity-Updates
 *   zu beschränken (Performance-Optimierung)
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

  /**
   * Hook für Subklassen. Standardmäßig null (= keine Beschränkung).
   * Subklassen können ein Array von Entity-IDs zurückgeben, auf die
   * die Card reagieren soll. Dann rendert sie bei hass-Updates nur dann
   * neu, wenn sich mindestens eine dieser Entities geändert hat.
   *
   *   _watchedEntities() {
   *     return [this._config.entity, this._config.icon_entity];
   *   }
   *
   * Ungültige Werte (null, undefined, leere Strings, Nicht-Strings)
   * werden ignoriert. Bleibt nach dem Filtern nichts übrig, fällt die
   * Karte auf das Default-Verhalten zurück (immer rendern).
   */
  _watchedEntities() {
    return null;
  }

  /**
   * Performance-Optimierung. Cards rendern bei hass-Updates nur dann neu,
   * wenn sich mindestens eine in _watchedEntities() deklarierte Entity
   * tatsächlich geändert hat. Andere Property-Änderungen (z. B. _config)
   * triggern wie üblich einen Render.
   */
  shouldUpdate(changedProps) {
    // Wurde mehr geändert als nur hass? → normal rendern.
    if (changedProps.size > 1 || !changedProps.has("hass")) {
      return true;
    }

    const oldHass = changedProps.get("hass");
    const newHass = this.hass;

    // Beim ersten hass oder bei plötzlich verschwundenem hass: normal rendern.
    if (!oldHass || !newHass) {
      return true;
    }

    // Watched-Liste prüfen. Ungültige Werte filtern.
    const watched = this._watchedEntities();
    if (!Array.isArray(watched)) {
      return true;
    }

    const validEntities = watched.filter(
      (id) => typeof id === "string" && id.length > 0
    );
    if (validEntities.length === 0) {
      return true;
    }

    // Nur dann rendern, wenn sich mindestens eine watched Entity geändert hat.
    return validEntities.some(
      (id) => oldHass.states?.[id] !== newHass.states?.[id]
    );
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