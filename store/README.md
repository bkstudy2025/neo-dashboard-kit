# Neo Dashboard — Modul-Store

Der **Modul-Store** im Karten-Editor (Sektion „Module" → **➕ Modul hinzufügen**)
liest seinen Katalog aus der `index.json` in diesem Ordner, ausgeliefert über das
**jsDelivr-CDN**. Module werden **nach Karte gefiltert** angezeigt (`target`) und
über die Integration **Neo Dashboard Tools** serverseitig installiert/gespeichert.

```
store/
  index.json            ← Katalog (Liste aller Store-Module)
  modules/<id>.js        ← die eigenständigen Modul-Dateien
```

> Hinweis: Der Katalog kann später ohne Code-Änderung in ein eigenes
> `neo-modules`-Repo ausgelagert werden — es ist nur die Konstante
> `modulesIndex` in `src/core/links.js`.

## Aufbau eines Moduls

Ein Store-Modul ist eine **eigenständige** `.js`-Datei (keine Imports aus dem
Bundle). Es registriert sich über die öffentliche API:

```js
window.NeoDashboard.registerModule({
  id: "neo-mein-modul",          // eindeutig
  name: "Mein Modul",
  description: "Was es macht.",
  icon: "✨",
  target: "neo-control-card",    // Ziel-Karte · Liste · "*" für alle
  version: "1.0.0",
  author: "Community",           // Badge: Community / Premium / …
  config: [                       // optionales ha-form-Schema (Einstellungen)
    { name: "entity", label: "Entität", selector: { entity: {} } },
  ],
  // Hooks (alle optional) — ctx = { hass, config, settings, card }
  style(ctx)    { return "/* CSS in den Shadow-Root der Karte */"; },
  decorate(root, ctx) { /* DOM nach dem Render ergänzen */ },
});
```

Siehe [`modules/neo-state-glow.js`](./modules/neo-state-glow.js) als vollständiges
Beispiel.

## Eigenes Modul einreichen

1. Lege `store/modules/<deine-id>.js` an (Muster wie oben, eigenständig).
2. Ergänze einen Eintrag in `store/index.json`:

   ```json
   {
     "id": "neo-mein-modul",
     "name": "Mein Modul",
     "description": "Kurzbeschreibung.",
     "target": "neo-control-card",
     "author": "Community",
     "version": "1.0.0",
     "icon": "✨",
     "url": "https://cdn.jsdelivr.net/gh/bkstudy2025/neo-dashboard-kit@main/store/modules/neo-mein-modul.js"
   }
   ```
3. Pull Request öffnen.

| index.json-Feld | Zweck |
|---|---|
| `id` | eindeutige ID (muss der `id` im Modul entsprechen) |
| `target` | für welche Karte(n) das Modul angeboten wird |
| `url` | jsDelivr-URL zur eigenständigen Modul-Datei |
| `version` | Versionsnummer — der Store vergleicht sie mit der installierten und zeigt **„⬆ Update"** an, wenn neuer |
| `homepage` | (optional) Link für den **Info**-Button (Doku/Repo) |
| `icon`, `image`, `description`, `author` | Anzeige im Store |

> jsDelivr cacht `@main` einige Stunden — neue/aktualisierte Module erscheinen
> daher mit etwas Verzögerung. Premium-Module (Patreon) gehören **nicht** in den
> öffentlichen Katalog; sie werden über „Module → Code einfügen" eingespielt.
