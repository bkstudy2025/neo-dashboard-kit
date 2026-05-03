import { LitElement, html, css } from "lit";

/**
 * Generischer schema-basierter Editor für Neo-Cards.
 *
 * Cards definieren ein Schema und delegieren das Rendering an diesen
 * Editor. Er nutzt intern <ha-form> aus Home Assistant und übersetzt
 * dessen value-changed-Events in das von HA erwartete config-changed-Format.
 *
 * Cards binden den Editor so an:
 *
 *   static getConfigElement() {
 *     const editor = document.createElement("neo-card-editor");
 *     editor.schema = this.getConfigSchema();
 *     return editor;
 *   }
 */

// ============================================================================
// Pure Helper — exportiert für Tests
// ============================================================================

/**
 * Stellt sicher, dass das Schema ein Array ist. undefined / null /
 * Nicht-Arrays werden zu []. Das macht Render-Aufrufe defensiv,
 * ohne den Editor zu brechen.
 */
export function normalizeSchema(schema) {
  return Array.isArray(schema) ? schema : [];
}

/**
 * Bereitet das Detail-Objekt für ein config-changed-Event vor.
 * HA erwartet { config: <neue Config> } im Detail.
 */
export function prepareConfigChangedDetail(value) {
  const config = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return { config };
}

// ============================================================================
// Editor-Klasse
// ============================================================================

class NeoCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    schema: { attribute: false },
  };

  static styles = css`
    :host {
      display: block;
    }
  `;

  constructor() {
    super();
    this._config = {};
    this.schema = [];
  }

  setConfig(config) {
    // Editor toleriert leere oder fehlende Config.
    this._config = config && typeof config === "object" ? config : {};
  }

  /**
   * Wird vom <ha-form>-Element bei jeder Eingabeänderung gefeuert.
   * Wir übersetzen das in das HA-Standard-Format config-changed.
   */
  _onValueChanged(event) {
    event.stopPropagation();
    const value = event.detail?.value;
    const detail = prepareConfigChangedDetail(value);

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: true,
        composed: true,
        detail,
      })
    );
  }

  render() {
    const schema = normalizeSchema(this.schema);
    const data = this._config || {};

    if (schema.length === 0) {
      return html`<div></div>`;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${schema}
        @value-changed=${this._onValueChanged}
      ></ha-form>
    `;
  }
}

if (!customElements.get("neo-card-editor")) {
  customElements.define("neo-card-editor", NeoCardEditor);
}

export { NeoCardEditor };