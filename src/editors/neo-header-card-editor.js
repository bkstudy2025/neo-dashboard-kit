import { html, css, LitElement } from "lit";

const SCHEMA = [
  {
    type: "grid",
    name: "",
    column_min_width: "260px",
    schema: [
      { name: "person_entity", label: "Person", selector: { entity: { domain: "person" } } },
      { name: "notification_entity", label: "Benachrichtigungs-Entity", selector: { entity: {} } },
    ],
  },
  {
    type: "expandable",
    title: "Texte",
    icon: "mdi:text-box-outline",
    schema: [
      { name: "title", label: "Titel (überschreibt Begrüßung)", selector: { text: {} } },
      { name: "subtitle", label: "Untertitel (überschreibt Status)", selector: { text: {} } },
      { name: "home_status_text", label: "Status zuhause", selector: { text: {} } },
      { name: "away_status_text", label: "Status abwesend", selector: { text: {} } },
    ],
  },
  {
    type: "expandable",
    title: "Anzeige",
    icon: "mdi:eye-outline",
    schema: [
      {
        type: "grid",
        name: "",
        column_min_width: "200px",
        schema: [
          { name: "show_avatar", label: "Avatar anzeigen", selector: { boolean: {} } },
          { name: "show_time", label: "Uhrzeit anzeigen", selector: { boolean: {} } },
          { name: "show_bell", label: "Glocke anzeigen", selector: { boolean: {} } },
          { name: "use_first_name_only", label: "Nur Vorname verwenden", selector: { boolean: {} } },
        ],
      },
    ],
  },
  {
    type: "expandable",
    title: "Icons",
    icon: "mdi:emoticon-outline",
    schema: [
      { name: "avatar_icon", label: "Avatar-Fallback-Icon", selector: { icon: {} } },
      { name: "bell_icon", label: "Glocken-Icon (Standard)", selector: { icon: {} } },
      { name: "bell_icon_active", label: "Glocken-Icon (aktiv)", selector: { icon: {} } },
    ],
  },
  {
    type: "expandable",
    title: "Aktion der Glocke",
    icon: "mdi:gesture-tap",
    schema: [
      { name: "bell_action", label: "Tap-Aktion der Glocke", selector: { ui_action: {} } },
    ],
  },
];

const DEFAULTS = {
  show_avatar: true,
  show_time: true,
  show_bell: true,
  use_first_name_only: true,
  home_status_text: "Zuhause",
  away_status_text: "Unterwegs",
  avatar_icon: "mdi:account",
  bell_icon: "mdi:bell",
  bell_icon_active: "mdi:bell-ring",
};

class NeoHeaderCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }
    .hint {
      padding: 12px 14px;
      margin-bottom: 12px;
      border-radius: 14px;
      background: rgba(127, 127, 127, 0.08);
      border: 1px solid rgba(127, 127, 127, 0.18);
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 1.4;
    }
    .hint strong {
      color: var(--primary-text-color);
    }
    .hint code {
      padding: 1px 6px;
      border-radius: 6px;
      background: rgba(127, 127, 127, 0.18);
      font-size: 12px;
    }
  `;

  setConfig(config) {
    this._config = { ...DEFAULTS, ...(config || {}) };
    this.requestUpdate();
  }

  _valueChanged(event) {
    event.stopPropagation();
    const newConfig = event.detail.value;
    this._config = newConfig;

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: true,
        composed: true,
        detail: { config: newConfig },
      })
    );
  }

  _computeLabel(schema) {
    return schema.label || schema.name;
  }

  render() {
    if (!this._config) return html``;

    return html`
      <div class="hint">
        <strong>Neo Header</strong> &mdash;
        Wenn du mehrere Personen hast, kannst du in YAML zusätzlich
        <code>users:</code> mit individuellen <code>person_entity</code> pro
        Benutzer definieren.
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

if (!customElements.get("neo-header-card-editor")) {
  customElements.define("neo-header-card-editor", NeoHeaderCardEditor);
}