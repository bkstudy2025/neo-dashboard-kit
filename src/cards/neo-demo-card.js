import { html, css } from "lit";
import { NeoElement } from "../core/neo-element.js";

class NeoDemoCard extends NeoElement {
  static styles = [
    NeoElement.styles,
    css`
      .body {
        padding: var(--neo-space-lg);
      }
      h2 {
        margin: 0 0 var(--neo-space-sm) 0;
        font-size: var(--neo-font-lg);
        color: var(--neo-color-text);
      }
      p {
        margin: 0;
        color: var(--neo-color-text-muted);
        font-size: var(--neo-font-sm);
      }
      .accent {
        color: var(--neo-color-accent);
        font-weight: 600;
      }
    `,
  ];

  render() {
    return html`
      <ha-card>
        <div class="body">
          <h2>Neo Dashboard Kit funktioniert</h2>
          <p>
            Dies ist eine <span class="accent">Demo-Karte</span>,
            die das Fundament testet. Wenn du das siehst, läuft Build, Bundling
            und Theme-System korrekt.
          </p>
        </div>
      </ha-card>
    `;
  }

  static getStubConfig() {
    return {};
  }
}

if (!customElements.get("neo-demo-card")) {
  customElements.define("neo-demo-card", NeoDemoCard);
}