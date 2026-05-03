import { html, css } from "lit";
import { NeoElement } from "../core/neo-element.js";
import {
  entityState,
  stateText,
  unitOf,
  friendlyName,
  stateIcon,
  lastChanged,
  domainOf,
  handleAction,
  safe,
  parseNumber,
  formatNumber,
} from "../core/helpers/index.js";

// ============================================================================
// Konstanten und Defaults
// ============================================================================

export const VALID_LAYOUTS = ["compact", "large"];
export const VALID_SECONDARY_INFO = ["none", "last_changed", "entity_id"];
export const MUTED_STATES = ["unavailable", "unknown", ""];

const DEFAULT_CONFIG = {
  layout: "compact",
  secondary_info: "none",
};

const DEFAULT_TAP_ACTION = { action: "more-info" };

const HOLD_DURATION_MS = 500;
const DOUBLE_TAP_WINDOW_MS = 250;

// ============================================================================
// Pure Helper — exportiert für Tests
// ============================================================================

export function validateSensorConfig(config, cardName = "NeoSensorCard") {
  if (!config.entity || typeof config.entity !== "string") {
    throw new Error(`${cardName}: 'entity' ist erforderlich`);
  }

  if (config.decimals !== undefined) {
    if (
      typeof config.decimals !== "number" ||
      !Number.isInteger(config.decimals) ||
      config.decimals < 0
    ) {
      throw new Error(
        `${cardName}: 'decimals' muss eine nicht-negative Ganzzahl sein`
      );
    }
  }

  if (config.layout !== undefined && !VALID_LAYOUTS.includes(config.layout)) {
    throw new Error(
      `${cardName}: 'layout' muss "compact" oder "large" sein`
    );
  }

  if (
    config.secondary_info !== undefined &&
    !VALID_SECONDARY_INFO.includes(config.secondary_info)
  ) {
    throw new Error(
      `${cardName}: 'secondary_info' muss "none", "last_changed" oder "entity_id" sein`
    );
  }
}

export function formatSensorValue(rawState, decimals) {
  if (rawState === undefined || rawState === null || rawState === "") return "";

  const num = parseNumber(rawState);

  if (Number.isFinite(num) && decimals !== undefined) {
    return formatNumber(num, decimals);
  }

  return String(rawState);
}

export function resolveSecondaryInfo(hass, config) {
  const mode = config.secondary_info || "none";

  if (mode === "none") return "";
  if (mode === "entity_id") return safe(config.entity, "");
  if (mode === "last_changed") {
    const date = lastChanged(hass, config.entity);
    if (!date) return "";
    return formatRelativeTime(date, new Date());
  }

  return "";
}

export function formatRelativeTime(date, now = new Date()) {
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 30) return "gerade eben";
  if (diffSec < 90) return "vor 1 Min.";

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `vor ${diffMin} Min.`;

  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `vor ${diffHour} Std.`;

  const diffDay = Math.round(diffHour / 24);
  if (diffDay === 1) return "vor 1 Tag";
  return `vor ${diffDay} Tagen`;
}

export function resolveSensorViewModel(hass, config) {
  if (!config) {
    return {
      status: "missing",
      name: "",
      icon: "mdi:help-circle-outline",
      value: "—",
      unit: "",
      secondary: "",
      layout: "compact",
    };
  }

  const entity = entityState(hass, config.entity);
  const rawState = entity?.state;
  const layout = VALID_LAYOUTS.includes(config.layout)
    ? config.layout
    : "compact";

  const name = safe(
    config.name,
    safe(friendlyName(hass, config.entity, ""), config.entity || "")
  );

  const icon = config.icon || stateIcon(hass, config.entity);

  const unit = safe(config.unit, unitOf(hass, config.entity));

  const secondary = resolveSecondaryInfo(hass, config);

  if (!entity) {
    return {
      status: "missing",
      name,
      icon,
      value: "—",
      unit: "",
      secondary,
      layout,
    };
  }

  if (MUTED_STATES.includes(rawState)) {
    return {
      status: "muted",
      name,
      icon,
      value: rawState || "—",
      unit: "",
      secondary,
      layout,
    };
  }

  return {
    status: "ok",
    name,
    icon,
    value: formatSensorValue(rawState, config.decimals),
    unit,
    secondary,
    layout,
  };
}

// ============================================================================
// Card-Klasse
// ============================================================================

class NeoSensorCard extends NeoElement {
  static properties = {
    ...NeoElement.properties,
  };

  static styles = [
    NeoElement.styles,
    css`
      ha-card {
        cursor: pointer;
        transition: transform 100ms ease;
        -webkit-tap-highlight-color: transparent;
      }

      ha-card:active {
        transform: scale(0.98);
      }

      .body {
        display: grid;
        align-items: center;
        gap: var(--neo-space-md);
        padding: var(--neo-space-md) var(--neo-space-lg);
      }

      .body.compact {
        grid-template-columns: auto minmax(0, 1fr);
        min-height: 64px;
      }

      .body.large {
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-rows: auto auto;
        align-items: start;
        padding: var(--neo-space-lg);
        min-height: 120px;
      }

      .icon {
        width: 44px;
        height: 44px;
        border-radius: 999px;
        background: var(--neo-color-surface-alt);
        display: grid;
        place-items: center;
        flex: 0 0 auto;
      }

      .icon ha-icon {
        --mdc-icon-size: 24px;
        color: var(--neo-color-accent);
      }

      .body.large .icon {
        grid-column: 2;
        grid-row: 1;
        align-self: start;
      }

      .text {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .body.large .text {
        grid-column: 1;
        grid-row: 1 / span 2;
      }

      .name {
        font-size: var(--neo-font-md);
        font-weight: 600;
        color: var(--neo-color-text);
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .value-row {
        display: flex;
        align-items: baseline;
        gap: 4px;
        min-width: 0;
      }

      .value {
        font-size: var(--neo-font-sm);
        color: var(--neo-color-text-muted);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .body.large .value {
        font-size: var(--neo-font-xl);
        font-weight: 700;
        color: var(--neo-color-text);
        font-variant-numeric: tabular-nums;
      }

      .body.large .name {
        order: 2;
      }

      .body.large .value-row {
        order: 1;
      }

      .unit {
        font-size: var(--neo-font-xs);
        color: var(--neo-color-text-muted);
        font-weight: 500;
        white-space: nowrap;
      }

      .body.large .unit {
        font-size: var(--neo-font-sm);
      }

      .secondary {
        font-size: var(--neo-font-xs);
        color: var(--neo-color-text-muted);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
      }

      .body.is-muted .name,
      .body.is-muted .value {
        color: var(--neo-color-text-muted);
      }

      .body.is-muted .icon ha-icon {
        color: var(--neo-color-text-muted);
        opacity: 0.7;
      }

      .body.is-missing .icon ha-icon {
        color: var(--neo-color-text-muted);
        opacity: 0.6;
      }
    `,
  ];

  constructor() {
    super();
    this._holdTimer = undefined;
    this._holdFired = false;
    this._lastTapAt = 0;
  }

  setConfig(config) {
    super.setConfig({ ...DEFAULT_CONFIG, ...config });
  }

  _validateConfig(config) {
    validateSensorConfig(config, this.constructor.name);
  }

  _watchedEntities() {
    const entity = this._config?.entity;
    return typeof entity === "string" && entity.length > 0 ? [entity] : null;
  }

  getCardSize() {
    return this._config?.layout === "large" ? 2 : 1;
  }

  static getStubConfig(hass) {
    if (hass?.states) {
      const sensorIds = Object.keys(hass.states).filter(
        (id) => domainOf(id) === "sensor"
      );
      if (sensorIds.length > 0) {
        return { entity: sensorIds[0] };
      }
    }
    return { entity: "" };
  }

  // -------------------------------------------------------------------------
  // Editor-Anbindung (Phase 3.B)
  // -------------------------------------------------------------------------

  /**
   * Schema für den generischen NeoCardEditor.
   * Wird von getConfigElement() an den Editor übergeben.
   */
  static getConfigSchema() {
    return [
      {
        name: "entity",
        required: true,
        selector: { entity: { domain: ["sensor", "binary_sensor"] } },
      },
      { name: "name", selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
      { name: "unit", selector: { text: {} } },
      {
        name: "decimals",
        selector: { number: { min: 0, max: 10, mode: "box" } },
      },
      {
        name: "secondary_info",
        selector: {
          select: {
            options: [
              { value: "none", label: "Keine" },
              { value: "last_changed", label: "Letzte Änderung" },
              { value: "entity_id", label: "Entity-ID" },
            ],
          },
        },
      },
      {
        name: "layout",
        selector: {
          select: {
            options: [
              { value: "compact", label: "Kompakt" },
              { value: "large", label: "Groß" },
            ],
          },
        },
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }

  /**
   * Erzeugt den Editor für diese Card und übergibt ihm das Schema.
   * Wird von Home Assistant beim Öffnen des Card-Editors aufgerufen.
   */
  static getConfigElement() {
    const editor = document.createElement("neo-card-editor");
    editor.schema = this.getConfigSchema();
    return editor;
  }

  // -------------------------------------------------------------------------
  // Action-Handling
  // -------------------------------------------------------------------------

  _onPointerDown() {
    this._holdFired = false;
    this._holdTimer = window.setTimeout(() => {
      this._holdFired = true;
      handleAction(this.hass, this, this._config, "hold");
    }, HOLD_DURATION_MS);
  }

  _onPointerUp() {
    if (this._holdTimer) {
      window.clearTimeout(this._holdTimer);
      this._holdTimer = undefined;
    }

    if (this._holdFired) {
      return;
    }

    const now = Date.now();
    if (now - this._lastTapAt < DOUBLE_TAP_WINDOW_MS) {
      this._lastTapAt = 0;
      handleAction(this.hass, this, this._config, "double_tap");
      return;
    }

    this._lastTapAt = now;

    if (!this._config?.double_tap_action) {
      this._lastTapAt = 0;
      handleAction(
        this.hass,
        this,
        { ...this._config, tap_action: this._config?.tap_action || DEFAULT_TAP_ACTION },
        "tap"
      );
      return;
    }

    window.setTimeout(() => {
      if (this._lastTapAt !== 0 && Date.now() - this._lastTapAt >= DOUBLE_TAP_WINDOW_MS) {
        this._lastTapAt = 0;
        handleAction(
          this.hass,
          this,
          { ...this._config, tap_action: this._config?.tap_action || DEFAULT_TAP_ACTION },
          "tap"
        );
      }
    }, DOUBLE_TAP_WINDOW_MS);
  }

  _onPointerCancel() {
    if (this._holdTimer) {
      window.clearTimeout(this._holdTimer);
      this._holdTimer = undefined;
    }
    this._holdFired = false;
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  render() {
    if (!this._config) return html``;

    const vm = resolveSensorViewModel(this.hass, this._config);

    const bodyClasses = [
      "body",
      vm.layout,
      vm.status === "muted" ? "is-muted" : "",
      vm.status === "missing" ? "is-missing" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <ha-card
        @pointerdown=${this._onPointerDown}
        @pointerup=${this._onPointerUp}
        @pointercancel=${this._onPointerCancel}
        @pointerleave=${this._onPointerCancel}
      >
        <div class=${bodyClasses}>
          <div class="icon">
            <ha-icon icon=${vm.icon}></ha-icon>
          </div>
          <div class="text">
            <div class="name">${vm.name}</div>
            <div class="value-row">
              <span class="value">${vm.value}</span>
              ${vm.unit
                ? html`<span class="unit">${vm.unit}</span>`
                : ""}
            </div>
            ${vm.secondary
              ? html`<div class="secondary">${vm.secondary}</div>`
              : ""}
          </div>
        </div>
      </ha-card>
    `;
  }
}

// Klasse exportieren, damit Tests auf statische Methoden zugreifen können.
export { NeoSensorCard };

if (!customElements.get("neo-sensor-card")) {
  customElements.define("neo-sensor-card", NeoSensorCard);
}