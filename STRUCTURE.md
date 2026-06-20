# Projekt-Struktur — Neo Dashboard Kit

Diese Datei beschreibt das verbindliche Ordner-Layout und die Konventionen
dieses Repos. **Bitte beim Hinzufügen neuer Dateien einhalten**, damit die
Struktur übersichtlich bleibt.

## Das Ökosystem (3 Repos)

| Repo | Rolle | Installation in HA |
|------|-------|--------------------|
| **neo-dashboard-kit** (dieses Repo) | Frontend: Karten + Modul-System | HACS → Lovelace-Resource (`neo-dashboard.js`) |
| **neo-dashboard-tools** | Integration: serverseitige Modul-Persistenz + CORS-Proxy | HACS → `custom_components/` |
| **neo-modules** | Store-Index + Community-Module | kein Install — über jsDelivr-CDN geladen |

## Wurzelverzeichnis

```
neo-dashboard.js      ← GEBAUTES Bundle (von Rollup erzeugt, in HACS ausgeliefert)
package.json          ← Version (Single Source of Truth) + Build-Skripte
rollup.config.js      ← Build-Konfiguration
hacs.json             ← HACS-Metadaten (content_in_root → Bundle liegt im Root)
info.md / README.md   ← HACS-Beschreibung / GitHub-Readme
icon.png / logo.png   ← HACS-Branding
src/                  ← QUELLCODE (siehe unten)
docs/de/ · docs/en/   ← zweisprachige Doku (README, Karten, Module, Entwicklung)
themes/               ← Optionales HA-Theme zum Kopieren nach <config>/themes/
premium/              ← Nur die Vorlage (neo-card-template.js); Premium-Karten
                        werden via Patreon verteilt, NIE hier committen (.gitignore)
store/                ← Hinweise zum Modul-Store
img/                  ← Bilder für Doku/Readme
```

> ⚠️ `neo-dashboard.js` im Root ist ein **Build-Artefakt**, wird aber bewusst
> committet, weil HACS es direkt ausliefert (`zip_release: false`). Nach
> Quelländerungen immer `npm run build` ausführen und mitcommitten.

## `src/` — Quellcode

```
src/neo-dashboard.js   ← Einstiegspunkt: importiert alles in fester Reihenfolge
src/core/              ← Kern-Infrastruktur (keine konkreten Karten)
  registry.js            Karten-Registry + window.NeoDashboard
  modules.js             Modul-Registry (NeoModules) + Targeting
  public-api.js          Öffentliche API für externe/Premium-Module
  base-card.js           Basis-Klasse aller Karten (wendet Module an)
  editor-factory.js      Helfer zum Bauen der Karten-Editoren (ha-form)
  tokens.js              Design-Tokens + globales CSS (NEO_CSS)
  layout.js              Responsive-Layout-Helfer
  reorder.js             Drag-&-Drop-Reorder-Helfer
  icons.js               Inline-SVG-Icons
  branding.js            Logo-Markup
  links.js               Zentrale URLs (Repo, Spenden, Store-Index)
  theme-fallback.js      Fallback-Variablen, falls kein HA-Theme greift
src/cards/             ← Die drei Kern-Karten (control/display/header), je registerCard
src/modules/           ← Mitgelieferte Beispiel-Module (registerModule)
src/store/             ← Modul-Persistenz & -Laden
  module-store.js        NeoStore: WS-Calls an neo-dashboard-tools (list/save/…)
  module-loader.js       neoLoadModule: Code zur Laufzeit injizieren
src/wrapper/           ← Die EINE sichtbare Karte + ihr Editor
  neo-card.js            Wrapper-Karte (wählt anhand card_type die echte Karte)
  neo-card-editor.js     Editor: Typ-Picker + Karten-Editor + Modul-Sektion
```

## Konventionen für neue Dateien

- **Neue Karte** → `src/cards/neo-<name>-card.js`, dann in `src/neo-dashboard.js`
  importieren. Erbt von der Basis-Karte, registriert sich via `registerCard`.
- **Neues eingebautes Modul** → `src/modules/neo-<name>.js`, registriert via
  `NeoModules.register({ id, target, … })`, in `neo-dashboard.js` importieren.
- **Kern-Helfer** (von mehreren Karten genutzt) → `src/core/`.
- Karten-spezifischer Code gehört **nicht** in `src/core/`.

## Build & Release

```
npm run build     # src/ → neo-dashboard.js (Rollup)
npm run lint      # ESLint über src/
```

Version steht nur in `package.json` + Banner in `src/neo-dashboard.js`.
Ein Git-Tag `vX.Y.Z` löst den Release-Workflow (`.github/workflows/release.yml`)
aus.
