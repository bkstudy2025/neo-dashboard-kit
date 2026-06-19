# Entwicklung — eigene Karten & Module

🇩🇪 Deutsch · [🇬🇧 English](../en/development.md) · [← Übersicht](README.md)

Neo bietet eine öffentliche API unter `window.NeoDashboard`. Damit baust du
eigenständige Erweiterungen (eigene Repos, Community oder Premium), die sich in
den Editor einklinken — ohne den Kern zu ändern.

## Öffentliche API (`window.NeoDashboard`)

| API | Zweck |
|---|---|
| `registerCard(type, klasse, meta)` | **neue Karte** (erscheint im Kartentyp-Picker) |
| `registerModule(manifest)` | **Layer-Modul** (erweitert bestehende Karten) |
| `BaseCard` | Basis-Klasse für Karten (Rendern, Layout, Re-Render-Logik) |
| `makeEditor(schema, meta)` | baut einen Karten-Editor aus einem `ha-form`-Schema |
| `icon(name, opts)` | eingebautes SVG-Icon |
| `accents`, `accentOptions` | Akzentfarben |
| `layoutOptions` | Layout-Auswahl (auto/mobil/tablet/desktop) |
| `version` | installierte Neo-Version |

Lade-Reihenfolge ist egal: Wenn die API noch nicht bereit ist, warte auf das
Event `neo-dashboard-ready`.

## Eine eigene Karte

```js
(function () {
  function init() {
    const NEO = window.NeoDashboard;
    if (!NEO || !NEO.BaseCard) {
      window.addEventListener("neo-dashboard-ready", init, { once: true });
      return;
    }
    const { BaseCard, icon, accents, registerCard, makeEditor } = NEO;

    class MeineKarte extends BaseCard {
      render() {
        const s = this._state(this._config.entity);
        return `<div class="neo-card" id="card" role="button" style="padding:16px;">
          ${icon("sparkle", { size: 20, color: accents.blue.c })}
          <div>${s?.state ?? "—"}</div>
        </div>`;
      }
      _bindEvents() {
        this.shadowRoot.getElementById("card")
          ?.addEventListener("click", () => this._modCtx().moreInfo(this._config.entity));
      }
      static getConfigElement() { return document.createElement("meine-karte-editor"); }
      static getStubConfig() { return {}; }
    }

    customElements.define("meine-karte-editor", makeEditor([
      { name: "entity", label: "Entität", selector: { entity: {} } },
    ], { name: "Meine Karte", description: "Beispiel", icon: "⭐" }));

    registerCard("neo-meine-karte", MeineKarte, {
      name: "Meine Karte", icon: "⭐", version: "1.0.0", author: "Community",
    });
  }
  init();
})();
```

- `author: "Premium"` oder `"Community"` steuert die **Kategorie** im Picker.
- Nutzer installieren die Datei über **Erweiterungen → Code einfügen** oder den Store.

## Ein Layer-Modul
Wenn du nur eine *bestehende* Karte erweitern willst (Badge, Effekt, eigene
Tap-Aktion), nimm `registerModule` statt einer ganzen Karte — siehe
**[Module & Store](module.md)**.

## Karte vs. Modul — was nehmen?
- **Neue Ansicht / neuer Gerätetyp** → eigene **Karte** (`registerCard`).
- **Kleine Erweiterung einer Karte** → **Modul** (`registerModule`).

## Beitragen
Repo-Aufbau & Konventionen: siehe [`STRUCTURE.md`](../../STRUCTURE.md) und
[`CONTRIBUTING.md`](../../CONTRIBUTING.md). Build: `npm run build` (erzeugt
`neo-dashboard.js` aus `src/`).
