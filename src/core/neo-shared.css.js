import { css } from "lit";

/**
 * Gemeinsame Styles für alle Neo-Cards.
 * Token-Definitionen sind dreischichtig:
 *   Schicht 1: --neo-* aus dem Neo-Theme
 *   Schicht 2: HA-Standard-Tokens (für andere Themes)
 *   Schicht 3: Hard-coded Fallback (kein Theme aktiv)
 */
export const neoSharedStyles = css`
  :host {
    /* Farben */
    --neo-color-surface: var(--neo-bg-elevated, var(--ha-card-background, var(--card-background-color, #ffffff)));
    --neo-color-surface-alt: var(--neo-surface-3, rgba(127, 127, 127, 0.08));
    --neo-color-text: var(--neo-text, var(--primary-text-color, #1c1c1e));
    --neo-color-text-muted: var(--neo-muted, var(--secondary-text-color, rgba(28, 28, 30, 0.6)));
    --neo-color-accent: var(--neo-accent, var(--primary-color, #03a9f4));
    --neo-color-success: var(--neo-green, var(--success-color, #4caf50));
    --neo-color-warning: var(--neo-yellow, var(--warning-color, #ff9800));
    --neo-color-error: var(--neo-red, var(--error-color, #f44336));
    --neo-color-border: var(--neo-border, rgba(127, 127, 127, 0.18));

    /* Form */
    --neo-radius: var(--neo-radius, var(--ha-card-border-radius, 16px));
    --neo-radius-small: var(--neo-radius-small, 12px);

    /* Abstände */
    --neo-space-xs: 4px;
    --neo-space-sm: 8px;
    --neo-space-md: 12px;
    --neo-space-lg: 16px;
    --neo-space-xl: 24px;

    /* Schrift */
    --neo-font-xs: 11px;
    --neo-font-sm: 13px;
    --neo-font-md: 15px;
    --neo-font-lg: 18px;
    --neo-font-xl: 24px;

    /* Schatten */
    --neo-shadow-soft: var(--neo-shadow-soft, 0 4px 14px rgba(0, 0, 0, 0.08));

    display: block;
    color: var(--neo-color-text);
  }

  ha-card {
    background: var(--neo-color-surface);
    border-radius: var(--neo-radius);
    box-shadow: var(--neo-shadow-soft);
    overflow: hidden;
  }
`;