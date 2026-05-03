import { html, css, nothing } from "lit";
import { NeoElement } from "../core/neo-element.js";
import {
  entityState,
  friendlyName,
  greeting,
  formatDate,
  formatTime,
  isEntityOn,
  parseNumber,
  safe,
  findUserMapping,
} from "../core/helpers/index.js";

const DEFAULT_CONFIG = {
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

class NeoHeaderCard extends NeoElement {
  static properties = {
    ...NeoElement.properties,
    _now: { state: true },
  };

  static styles = [
    NeoElement.styles,
    css`
      :host {
        display: block;
      }

      .header {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        column-gap: 14px;
        padding: 8px 4px;
        box-sizing: border-box;
      }

      /* Avatar mit Status-Glow */
      .avatar-wrap {
        position: relative;
        width: 48px;
        height: 48px;
        flex: 0 0 auto;
      }

      .avatar-glow {
        position: absolute;
        inset: -3px;
        border-radius: 999px;
        background: radial-gradient(
          circle,
          var(--neo-color-accent) 0%,
          transparent 65%
        );
        opacity: 0;
        transition: opacity 200ms ease;
        pointer-events: none;
        z-index: 0;
      }

      .avatar-glow.active {
        opacity: 0.7;
      }

      .avatar {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        border-radius: 999px;
        background: var(--neo-color-surface-alt);
        display: grid;
        place-items: center;
        overflow: hidden;
      }

      .avatar.has-glow {
        outline: 2px solid var(--neo-color-accent);
        outline-offset: -2px;
      }

      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar ha-icon {
        --mdc-icon-size: 26px;
        color: var(--neo-color-accent);
      }

      /* Text */
      .text {
        min-width: 0;
        display: flex;
        flex-direction: column;
      }

      .title {
        font-size: 17px;
        font-weight: 700;
        color: var(--neo-color-text);
        line-height: 1.2;
        letter-spacing: -0.2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .subtitle {
        margin-top: 2px;
        font-size: 12px;
        color: var(--neo-color-text-muted);
        font-weight: 500;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Aktionsbereich rechts */
      .actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 0 0 auto;
      }

      .time {
        font-size: 13px;
        font-weight: 600;
        color: var(--neo-color-text-muted);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }

      /* Bell */
      .bell {
        position: relative;
        width: 38px;
        height: 38px;
        border-radius: 999px;
        background: var(--neo-color-surface-alt);
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: transform 100ms ease, background 200ms ease;
        border: none;
        padding: 0;
        color: var(--neo-color-text-muted);
        flex: 0 0 auto;
      }

      .bell:hover {
        background: color-mix(in srgb, var(--neo-color-surface-alt) 60%, var(--neo-color-accent) 40%);
        color: var(--neo-color-text);
      }

      .bell:active {
        transform: scale(0.94);
      }

      .bell ha-icon {
        --mdc-icon-size: 20px;
      }

      .bell.active {
        color: var(--neo-color-accent);
        background: color-mix(in srgb, var(--neo-color-accent) 18%, transparent);
        box-shadow: 0 0 14px color-mix(in srgb, var(--neo-color-accent) 35%, transparent);
      }

      /* Notification Badge */
      .bell-badge {
        position: absolute;
        top: -3px;
        right: -3px;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 999px;
        background: var(--neo-color-accent);
        color: white;
        font-size: 10px;
        font-weight: 800;
        display: grid;
        place-items: center;
        box-sizing: border-box;
        line-height: 1;
      }

      /* Responsive: ab Tablet etwas mehr Luft */
      @media (min-width: 700px) {
        .header {
          padding: 12px 8px;
          column-gap: 18px;
        }

        .avatar-wrap {
          width: 56px;
          height: 56px;
        }

        .title {
          font-size: 20px;
        }

        .subtitle {
          font-size: 13px;
        }

        .time {
          font-size: 15px;
        }

        .bell {
          width: 42px;
          height: 42px;
        }

        .bell ha-icon {
          --mdc-icon-size: 22px;
        }
      }
    `,
  ];

    static getConfigElement() {
    return document.createElement("neo-header-card-editor");
  }
  
  constructor() {
    super();
    this._now = new Date();
    this._clockTimer = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    this._clockTimer = window.setInterval(() => {
      this._now = new Date();
    }, 30 * 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._clockTimer) {
      window.clearInterval(this._clockTimer);
      this._clockTimer = undefined;
    }
  }

  setConfig(config) {
    super.setConfig({ ...DEFAULT_CONFIG, ...config });
  }

  static getStubConfig() {
    return {
      person_entity: "",
    };
  }

  getCardSize() {
    return 1;
  }

  getLayoutOptions() {
    return {
      grid_columns: "full",
      grid_rows: 1,
      grid_min_columns: 2,
    };
  }

  /**
   * Reduziert einen vollständigen Namen auf den Vornamen,
   * wenn use_first_name_only aktiv ist.
   */
  _shortenName(fullName) {
    if (!fullName) return "";
    if (this._config?.use_first_name_only === false) return fullName;
    const parts = String(fullName).trim().split(/\s+/);
    return parts[0] || fullName;
  }

  _resolveUser() {
    const cfg = this._config || {};
    const hass = this.hass;
    const mapped = findUserMapping(hass, cfg);

    const rawName = safe(
      mapped?.greeting_name,
      safe(mapped?.user, hass?.user?.name || "")
    );

    return {
      personEntity: mapped?.person_entity || cfg.person_entity,
      userName: this._shortenName(rawName),
      avatarIcon: mapped?.avatar_icon || cfg.avatar_icon || "mdi:account",
    };
  }

  _resolveNotifications() {
    const cfg = this._config;
    const entityId = cfg.notification_entity;
    if (!entityId) return { isActive: false, count: undefined };

    const isActive = isEntityOn(this.hass, entityId);
    const numericState = parseNumber(entityState(this.hass, entityId)?.state);
    const count = Number.isFinite(numericState) && numericState > 0 ? numericState : undefined;

    return { isActive: isActive || count > 0, count };
  }

  _onBellClick(event) {
    event.stopPropagation();
    const action = this._config?.bell_action;
    if (!action) return;

    this.dispatchEvent(
      new CustomEvent("hass-action", {
        bubbles: true,
        composed: true,
        detail: {
          config: { tap_action: action },
          action: "tap",
        },
      })
    );
  }

  render() {
    if (!this._config) return html``;

    const cfg = this._config;
    const hass = this.hass;
    const now = this._now;

    const resolved = this._resolveUser();
    const person = entityState(hass, resolved.personEntity);
    const personName = resolved.userName || this._shortenName(friendlyName(hass, resolved.personEntity, ""));
    const entityPicture = person?.attributes?.entity_picture;

    const isHome = person?.state === "home";
    const hasPresence = !!person;

    const title = safe(
      cfg.title,
      personName ? `${greeting(now)}, ${personName}` : greeting(now)
    );

    const subtitle = safe(
      cfg.subtitle,
      hasPresence
        ? (isHome ? cfg.home_status_text : cfg.away_status_text)
        : formatDate(now)
    );

    const notif = this._resolveNotifications();
    const bellIcon = notif.isActive ? cfg.bell_icon_active : cfg.bell_icon;
    const bellHasAction = !!cfg.bell_action;
    // Bell nur anzeigen, wenn sie sinnvoll ist: entweder Action konfiguriert oder Notifications-Sensor aktiv
    const showBell = cfg.show_bell !== false && (bellHasAction || cfg.notification_entity);

    const avatarHasGlow = hasPresence && isHome;

    return html`
      <div class="header">
        ${cfg.show_avatar !== false ? html`
          <div class="avatar-wrap">
            <div class="avatar-glow ${avatarHasGlow ? "active" : ""}"></div>
            <div class="avatar ${avatarHasGlow ? "has-glow" : ""}">
              ${entityPicture
                ? html`<img src=${entityPicture} alt="" />`
                : html`<ha-icon icon=${resolved.avatarIcon}></ha-icon>`
              }
            </div>
          </div>
        ` : nothing}

        <div class="text">
          <div class="title">${title}</div>
          <div class="subtitle">${subtitle}</div>
        </div>

        <div class="actions">
          ${cfg.show_time !== false ? html`
            <div class="time">${formatTime(now)}</div>
          ` : nothing}

          ${showBell ? html`
            <button
              class="bell ${notif.isActive ? "active" : ""}"
              @click=${bellHasAction ? this._onBellClick : null}
              ?disabled=${!bellHasAction}
              title="Benachrichtigungen"
            >
              <ha-icon icon=${bellIcon}></ha-icon>
              ${notif.count !== undefined ? html`
                <span class="bell-badge">${notif.count > 99 ? "99+" : notif.count}</span>
              ` : nothing}
            </button>
          ` : nothing}
        </div>
      </div>
    `;
  }
}

if (!customElements.get("neo-header-card")) {
  customElements.define("neo-header-card", NeoHeaderCard);
}