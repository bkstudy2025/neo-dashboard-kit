import { html, css } from "lit";
import { NeoElement } from "../core/neo-element.js";
import {
  entityState,
  friendlyName,
  greeting,
  formatDate,
  formatTime,
  safe,
  findUserMapping,
} from "../core/helpers/index.js";

const DEFAULT_CONFIG = {
  show_avatar: true,
  show_time: true,
  home_status_text: "Zuhause",
  away_status_text: "Unterwegs",
  avatar_icon: "mdi:account",
};

class NeoHeaderCard extends NeoElement {
  static properties = {
    ...NeoElement.properties,
    _now: { state: true },
  };

  static styles = [
    NeoElement.styles,
    css`
      ha-card {
        padding: var(--neo-space-lg);
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: var(--neo-space-md);
        min-height: 80px;
      }

      .avatar {
        width: 48px;
        height: 48px;
        border-radius: 999px;
        background: var(--neo-color-surface-alt);
        display: grid;
        place-items: center;
        overflow: hidden;
        flex: 0 0 auto;
      }

      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar ha-icon {
        --mdc-icon-size: 24px;
        color: var(--neo-color-accent);
      }

      .text {
        min-width: 0;
      }

      .title {
        font-size: var(--neo-font-lg);
        font-weight: 700;
        color: var(--neo-color-text);
        line-height: 1.15;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .subtitle {
        margin-top: 2px;
        font-size: var(--neo-font-sm);
        color: var(--neo-color-text-muted);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .time {
        font-size: var(--neo-font-sm);
        font-weight: 700;
        color: var(--neo-color-text);
        white-space: nowrap;
      }
    `,
  ];

  constructor() {
    super();
    this._now = new Date();
    this._clockTimer = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    // Uhr nur dann tickt, wenn die Karte tatsächlich im DOM ist.
    // 30 Sekunden reicht völlig — Anzeige ist HH:MM, nicht HH:MM:SS.
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
    return 2;
  }

  getLayoutOptions() {
    return {
      grid_columns: 4,
      grid_rows: 1,
      grid_min_columns: 2,
    };
  }

  _resolveUser() {
    const cfg = this._config || {};
    const hass = this.hass;
    const mapped = findUserMapping(hass, cfg);

    return {
      personEntity: mapped?.person_entity || cfg.person_entity,
      userName: safe(mapped?.greeting_name, safe(mapped?.user, hass?.user?.name || "")),
      avatarIcon: mapped?.avatar_icon || cfg.avatar_icon || "mdi:account",
    };
  }

  render() {
    if (!this._config) return html``;

    const cfg = this._config;
    const hass = this.hass;
    const now = this._now;

    const resolved = this._resolveUser();
    const person = entityState(hass, resolved.personEntity);
    const personName = resolved.userName || friendlyName(hass, resolved.personEntity, "");
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

    return html`
      <ha-card>
        ${cfg.show_avatar ? html`
          <div class="avatar">
            ${entityPicture
              ? html`<img src=${entityPicture} alt="" />`
              : html`<ha-icon icon=${resolved.avatarIcon}></ha-icon>`
            }
          </div>
        ` : ""}

        <div class="text">
          <div class="title">${title}</div>
          <div class="subtitle">${subtitle}</div>
        </div>

        ${cfg.show_time ? html`
          <div class="time">${formatTime(now)}</div>
        ` : ""}
      </ha-card>
    `;
  }
}

if (!customElements.get("neo-header-card")) {
  customElements.define("neo-header-card", NeoHeaderCard);
}