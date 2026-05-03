import { css } from "lit";

/**
 * Gemeinsame Styles für alle Neo-Cards.
 *
 * Token-Definitionen sind dreischichtig:
 *   Schicht 1: --neo-* aus dem Neo-Theme
 *   Schicht 2: HA-Standard-Tokens (für andere Themes)
 *   Schicht 3: Hard-coded Fallback (kein Theme aktiv)
 *
 * Die unter ":host" definierten Tokens stehen jeder Card automatisch
 * zur Verfügung, sobald sie von NeoElement erbt.
 *
 * Die Utility-Klassen am Ende sind optional und können von Cards
 * gezielt eingesetzt werden (z. B. .neo-glass für Glassmorphism-Effekt
 * oder .neo-icon-button für touchfreundliche Icon-Buttons).
 */
export const neoSharedStyles = css`
  :host {
    /* ------------------------------------------------------------------
       Farben
       ------------------------------------------------------------------ */
    --neo-color-surface: var(--neo-bg-elevated, var(--ha-card-background, var(--card-background-color, #ffffff)));
    --neo-color-surface-alt: var(--neo-surface-3, rgba(127, 127, 127, 0.08));
    --neo-color-surface-hover: var(--neo-surface-hover, rgba(127, 127, 127, 0.14));
    --neo-color-surface-active: var(--neo-surface-active, rgba(127, 127, 127, 0.22));
    --neo-color-text: var(--neo-text, var(--primary-text-color, #1c1c1e));
    --neo-color-text-muted: var(--neo-muted, var(--secondary-text-color, rgba(28, 28, 30, 0.6)));
    --neo-color-accent: var(--neo-accent, var(--primary-color, #03a9f4));
    --neo-color-success: var(--neo-green, var(--success-color, #4caf50));
    --neo-color-warning: var(--neo-yellow, var(--warning-color, #ff9800));
    --neo-color-error: var(--neo-red, var(--error-color, #f44336));
    --neo-color-border: var(--neo-border, rgba(127, 127, 127, 0.18));

    /* ------------------------------------------------------------------
       Form
       ------------------------------------------------------------------ */
    --neo-radius: var(--neo-radius, var(--ha-card-border-radius, 16px));
    --neo-radius-small: var(--neo-radius-small, 12px);

    /* ------------------------------------------------------------------
       Abstände
       ------------------------------------------------------------------ */
    --neo-space-xs: 4px;
    --neo-space-sm: 8px;
    --neo-space-md: 12px;
    --neo-space-lg: 16px;
    --neo-space-xl: 24px;

    /* ------------------------------------------------------------------
       Schrift
       ------------------------------------------------------------------ */
    --neo-font-family: var(--neo-font-family, var(--paper-font-body1_-_font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif));
    --neo-font-xs: 11px;
    --neo-font-sm: 13px;
    --neo-font-md: 15px;
    --neo-font-lg: 18px;
    --neo-font-xl: 24px;

    /* ------------------------------------------------------------------
       Schatten
       ------------------------------------------------------------------ */
    --neo-shadow-soft: var(--neo-shadow-soft, 0 4px 14px rgba(0, 0, 0, 0.08));
    --neo-shadow-glow: var(--neo-shadow-glow, 0 0 18px rgba(3, 169, 244, 0.35));

    /* ------------------------------------------------------------------
       Glassmorphism
       --neo-blur:    Filter-Wert (für backdrop-filter)
       --neo-blur-bg: Halbtransparente Background-Farbe (zwingend nötig,
                      damit der Blur überhaupt sichtbar wird)
       ------------------------------------------------------------------ */
    --neo-blur: var(--neo-blur, blur(20px) saturate(180%));
    --neo-blur-bg: var(--neo-blur-bg, rgba(28, 28, 30, 0.55));
    --neo-border-glass: var(--neo-border-glass, 1px solid rgba(255, 255, 255, 0.08));

    /* ------------------------------------------------------------------
       Glow (eigenständiger Akzent-Glow, z. B. um Avatare oder Buttons)
       ------------------------------------------------------------------ */
    --neo-glow: var(--neo-glow, 0 0 24px rgba(3, 169, 244, 0.45));

    /* ------------------------------------------------------------------
       Touch & Bewegung
       ------------------------------------------------------------------ */
    --neo-touch-min: var(--neo-touch-min, 44px);
    --neo-transition: var(--neo-transition, 180ms cubic-bezier(0.4, 0, 0.2, 1));

    display: block;
    color: var(--neo-color-text);
    font-family: var(--neo-font-family);
  }

  ha-card {
    background: var(--neo-color-surface);
    border-radius: var(--neo-radius);
    box-shadow: var(--neo-shadow-soft);
    overflow: hidden;
  }

  /* ====================================================================
     Utility-Klassen
     Optional einsetzbar in Card-Templates. Bestandscards sind nicht
     betroffen, solange sie diese Klassen nicht selbst verwenden.
     ==================================================================== */

  /* Glassmorphism-Effekt mit sicherem Fallback.
     Standardmäßig solides, dunkles, semitransparentes Background.
     Wo backdrop-filter unterstützt wird, kommt der Blur-Effekt dazu. */
  .neo-glass {
    background: var(--neo-blur-bg);
    border: var(--neo-border-glass);
    border-radius: var(--neo-radius);
    box-shadow: var(--neo-shadow-soft);
  }

  @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
    .neo-glass {
      backdrop-filter: var(--neo-blur);
      -webkit-backdrop-filter: var(--neo-blur);
    }
  }

  /* Layout-Helfer */
  .neo-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--neo-space-md);
    min-width: 0;
  }

  .neo-column {
    display: flex;
    flex-direction: column;
    gap: var(--neo-space-sm);
    min-width: 0;
  }

  /* Touchfreundlicher Icon-Button.
     Mindestens 44x44px Touch-Ziel (Apple HIG / Material Design).
     Reset für native <button>-Defaults inklusive. */
  .neo-icon-button {
    display: inline-grid;
    place-items: center;
    min-width: var(--neo-touch-min);
    min-height: var(--neo-touch-min);
    padding: 0;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--neo-color-text-muted);
    font: inherit;
    cursor: pointer;
    transition: background var(--neo-transition), color var(--neo-transition), transform var(--neo-transition);
    -webkit-tap-highlight-color: transparent;
  }

  .neo-icon-button:hover {
    background: var(--neo-color-surface-hover);
    color: var(--neo-color-text);
  }

  .neo-icon-button:active {
    background: var(--neo-color-surface-active);
    transform: scale(0.94);
  }

  .neo-icon-button:focus-visible {
    outline: 2px solid var(--neo-color-accent);
    outline-offset: 2px;
  }

  .neo-icon-button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  /* Aktiv-Zustand für Buttons, Chips und ähnliche Elemente */
  .neo-active {
    color: var(--neo-color-accent);
    box-shadow: var(--neo-shadow-glow);
  }

  /* Sekundärer / gedämpfter Text */
  .neo-muted {
    color: var(--neo-color-text-muted);
  }

  /* Einzeilige Text-Kürzung mit Ellipsis */
  .neo-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
`;