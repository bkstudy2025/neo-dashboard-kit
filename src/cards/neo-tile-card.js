import { html, css } from "lit";
import { NeoElement } from "../core/neo-element.js";
import {
  entityState,
  stateText,
  friendlyName,
  stateIcon,
  resolveSecondaryInfo,
  domainOf,
  isEntityOn,
  handleAction,
  safe,
} from "../core/helpers/index.js";

// ============================================================================
// Konstanten und Defaults
// ============================================================================

export const VALID_LAYOUTS = ["compact", "large"];
export const VALID_SECONDARY_INFO = ["none", "last_changed", "entity_id"];
export const MUTED_STATES = ["unavailable", "unknown", ""];

/**
 * Domains, die typischerweise interaktiv sind und einen sinnvollen
 * Toggle/Trigger-Default haben. Reine Information für Tests und Doku;
 * die eigentliche Tap-Action-Logik steht in resolveTileTapAction().
 */
export const INTERACTIVE_DOMAINS = [
  "light",
  "switch",
  "input_boolean",
  "fan",
  "scene",
  "script",
];

const DEFAULT_CONFIG = {
  show_state: true,
  layout: "compact",
  secondary_info: "none",
};

const HOLD_DURATION_MS = 500;
const DOUBLE_TAP_WINDOW_MS = 250;

// ============================================================================
// Pure Helper — exportiert für Tests
// ============================================================================

/**
 * Validiert eine Tile-Card-Config. Wirft sprechende Fehler bei
 * ungültigen Eingaben.
 */
export function validateTileConfig(config, cardName = "NeoTileCard") {
  if (!config.entity || typeof config.entity !== "string") {
    throw new Error(`${cardName}: 'entity' ist erforderlich`);
  }

  if (config.show_state !== undefined && typeof config.show_state !== "boolean") {
    throw new Error(`${cardName}: 'show_state' muss boolean sein`);
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

/**
 * Bestimmt die Tap-Action für die Tile-Card.
 * Wenn config.tap_action explizit gesetzt ist, wird diese genutzt.
 * Sonst wird ein Domain-abhängiger Default ermittelt.
 */
export function resolveTileTapAction(config) {
  if (config?.tap_action) return config.tap_action;

  const entity = config?.entity;
  const domain = domainOf(entity);

  switch (domain) {
    case "light":
    case "switch":
    case "input_boolean":
    case "fan":
      return { action: "toggle" };

    case "scene":
      return {
        action: "call-service",
        service: "scene.turn_on",
        target: { entity_id: entity },
      };

    case "script":
      return {
        action: "call-service",
        service: "script.turn_on",
        target: { entity_id: entity },
      };

    default:
      return { action: "more-info" };
  }
}

/**
 * Berechnet das vollständige View-Model für die Tile-Card.
 * Reine Funktion — keine DOM-Abhängigkeiten.
 *
 * Status:
 *   "missing" — Entity nicht in hass.states
 *   "muted"   — Entity vorhanden, State unavailable/unknown
 *   "ok"      — alles normal
 *
 * isActive: nur im "ok"-Status relevant. Bestimmt die visuelle Aktivität.
 */
export function resolveTileViewModel(hass, config) {
  if (!config) {
    return {
      status: "missing",
      name: "",
      icon: "mdi:help-circle-outline",
      stateText: "—",
      secondary: "",
      layout: "compact",
      showState: true,
      isActive: false,
    };
  }

  const entity = entityState(hass, config.entity);
  const rawState = entity?.state;
  const layout = VALID_LAYOUTS.includes(config.layout)
    ? config.layout
    : "compact";
  const showState = config.show_state !== false;

  const name = safe(
    config.name,
    safe(friendlyName(hass, config.entity, ""), config.entity || "")
  );

  const icon = config.icon || stateIcon(hass, config.entity);
  const secondary = resolveSecondaryInfo(hass, config);

  if (!entity) {
    return {
      status: "missing",
      name,
      icon,
      stateText: "—",
      secondary,
      layout,
      showState,
      isActive: false,
    };
  }

  if (MUTED_STATES.includes(rawState)) {
    return {
      status: "muted",
      name,
      icon,
      stateText: rawState || "—",
      secondary,
      layout,
      showState,
      isActive: false,
    };
  }

  return {
    status: "ok",
    name,
    icon,
    stateText: stateText(hass, config.entity, "—"),
    secondary,
    layout,
    showState,
    isActive: isEntityOn(hass, config.entity),
  };
}

// ============================================================================
// Card-Klasse
// ============================================================================

class NeoTileCard extends NeoElement {
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
        min-height: 72px;
      }

      .body.large {
        grid-template-columns: auto minmax(0, 1fr);
        padding: var(--neo-space-lg);
        min-height: 110px;
      }

      /* Icon-Container */
      .icon {
        position: relative;
        width: 52px;
        height: 52px;
        border-radius: 999px;
        background: var(--neo-color-surface-alt);
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        transition: background 200ms ease, box-shadow 200ms ease;
      }

      .body.large .icon {
        width: 64px;
        height: 64px;
      }

      /* Aktivitäts-Tönung über Pseudo-Element (kein color-mix nötig) */
      .icon::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: var(--neo-color-accent);
        opacity: 0;
        transition: opacity 200ms ease;
        pointer-events: none;
      }

      .icon ha-icon {
        position: relative;
        z-index: 1;
        --mdc-icon-size: 26px;
        color: var(--neo-color-text-muted);
        transition: color 200ms ease;
      }

      .body.large .icon ha-icon {
        --mdc-icon-size: 32px;
      }

      /* Aktiv-Zustand: Akzent + dezenter Glow */
      .body.is-active .icon::before {
        opacity: 0.18;
      }

      .body.is-active .icon {
        box-shadow: 0 0 12px rgba(3, 169, 244, 0.25);
        box-shadow: 0 0 12px var(--neo-color-accent);
        /* Fallback: erste Zeile mit Hardcoded-Alpha;
           zweite Zeile überschreibt mit Token, sofern unterstützt.
           Browser, die var() in box-shadow können, nehmen das Token. */
      }

      .body.is-active .icon ha-icon {
        color: var(--neo-color-accent);
      }

      /* Text */
      .text {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
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

      .body.large .name {
        font-size: var(--neo-font-lg);
      }

      .state {
        font-size: var(--neo-font-sm);
        color: var(--neo-color-text-muted);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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

      /* Muted-Zustand */
      .body.is-muted .name,
      .body.is-muted .state {
        color: var(--neo-color-text-muted);
      }

      .body.is-muted .icon ha-icon {
        opacity: 0.7;
      }

      /* Missing-Zustand */
      .body.is-missing .icon ha-icon {
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
    validateTileConfig(config, this.constructor.name);
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
      const ids = Object.keys(hass.states).filter((id) =>
        INTERACTIVE_DOMAINS.includes(domainOf(id))
      );
      if (ids.length > 0) {
        return { entity: ids[0] };
      }
    }
    return { entity: "" };
  }

  // -------------------------------------------------------------------------
  // Editor-Anbindung (Schema-basiert über NeoCardEditor)
  // -------------------------------------------------------------------------

  static getConfigSchema() {
    return [
      {
        name: "entity",
        required: true,
        selector: {
          entity: {
            domain: ["light", "switch", "input_boolean", "fan", "scene", "script"],
          },
        },
      },
      { name: "name", selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
      { name: "show_state", selector: { boolean: {} } },
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

  static getConfigElement() {
    const editor = document.createElement("neo-card-editor");
    editor.schema = this.getConfigSchema();
    return editor;
  }

  // -------------------------------------------------------------------------
  // Action-Handling
  // -------------------------------------------------------------------------

  /**
   * Augmentiert die Config mit der Default-Tap-Action, falls keine
   * explizit gesetzt ist. Damit nutzt handleAction() automatisch
   * den Domain-abhängigen Default.
   */
  _augmentedConfig() {
    return {
      ...this._config,
      tap_action: resolveTileTapAction(this._config),
    };
  }

  _onPointerDown() {
    this._holdFired = false;
    // Hold-Timer nur starten, wenn hold_action explizit konfiguriert ist.
    if (!this._config?.hold_action) return;

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
    if (
      this._config?.double_tap_action &&
      now - this._lastTapAt < DOUBLE_TAP_WINDOW_MS
    ) {
      this._lastTapAt = 0;
      handleAction(this.hass, this, this._config, "double_tap");
      return;
    }

    this._lastTapAt = now;

    // Wenn keine double_tap_action konfiguriert ist: Tap sofort auslösen.
    if (!this._config?.double_tap_action) {
      this._lastTapAt = 0;
      handleAction(this.hass, this, this._augmentedConfig(), "tap");
      return;
    }

    // Double-Tap-Fenster abwarten, bevor Tap ausgelöst wird.
    window.setTimeout(() => {
      if (
        this._lastTapAt !== 0 &&
        Date.now() - this._lastTapAt >= DOUBLE_TAP_WINDOW_MS
      ) {
        this._lastTapAt = 0;
        handleAction(this.hass, this, this._augmentedConfig(), "tap");
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

    const vm = resolveTileViewModel(this.hass, this._config);

    const bodyClasses = [
      "body",
      vm.layout,
      vm.status === "muted" ? "is-muted" : "",
      vm.status === "missing" ? "is-missing" : "",
      vm.status === "ok" && vm.isActive ? "is-active" : "",
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
            ${vm.showState
              ? html`<div class="state">${vm.stateText}</div>`
              : ""}
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
export { NeoTileCard };

if (!customElements.get("neo-tile-card")) {
  customElements.define("neo-tile-card", NeoTileCard);
}