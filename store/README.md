# Neo Dashboard — Modul-Store

Der **Modul-Store** im Karten-Editor (Sektion „Module" → **➕ Modul hinzufügen**)
liest seinen Katalog **live** aus der `index.json` in diesem Ordner. Der Editor
lädt sie über **`raw.githubusercontent.com`** (mit Cache-Busting), die einzelnen
Modul-/Karten-Dateien (`url`) liegen auf dem **jsDelivr-CDN**. Module werden **nach
Karte gefiltert** angezeigt (`target`) und über die Integration **Neo Dashboard
Tools** serverseitig installiert/gespeichert.

### Neuer Eintrag wird ohne Release sichtbar

Der Katalog ist **nicht** Teil des `neo-dashboard.js`-Bundles. Damit ein neuer
Community-Beitrag erscheint, genügt:

1. Datei unter `store/modules/<id>.js` hinzufügen,
2. Eintrag in `store/index.json` ergänzen,
3. auf `main` mergen,
4. im Editor unter **Erweiterungen → Offizieller Store** auf **„⟳ Store
   aktualisieren"** klicken.

**Kein HACS-Release nötig, kein neues `neo-dashboard.js`, kein App-Build.**
Ohne manuellen Refresh erscheint der Eintrag automatisch, sobald der
`raw`-Cache abläuft (~5 min).

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

Für eine **Karte** (statt Layer-Modul) siehe
[`modules/neo-community-example-card.js`](./modules/neo-community-example-card.js)
als Referenz: eigenständig, `kind: "card"`, `author: "Community"`, mit
Typed-Editor (`makeTypedEditor` / `capabilityType` / `typeDef`) und sicherer
Ausgabe (`escapeHtml` / `escapeAttr` / `safeUrl`) — ohne externe Requests.

## Eigenes Modul einreichen

> **Community-Beiträge** werden zuerst in den GitHub-Discussions vorgeschlagen
> (Kategorie **„Community Cards & Modules"**), von einem Admin geprüft und erst
> nach Übernahme ins Repo veröffentlicht. Discussions sind **keine**
> Installationsquelle. Der Ablauf steht in
> [`CONTRIBUTING.md`](../CONTRIBUTING.md). Die folgenden Schritte sind der
> **Admin-Teil** (Übernahme eines geprüften Beitrags). **Premium**-Karten
> gehören **nicht** in diesen Katalog.

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

> Die **`index.json`** wird über `raw.githubusercontent.com` geladen und ist nach
> einem Merge in ~5 min bzw. sofort per **„⟳ Store aktualisieren"** aktuell. Die
> **Modul-Dateien** liegen auf jsDelivr (`@main`, ~Stunden Cache): *neue* Dateien
> erscheinen sofort (neue URL); *Updates* einer bestehenden Datei `version`
> hochzählen — und ggf. den jsDelivr-Cache der Datei purgen
> (`https://purge.jsdelivr.net/gh/...`). Premium-Module (Patreon) gehören
> **nicht** in den öffentlichen Katalog; sie werden über „Module → Code einfügen"
> eingespielt.
