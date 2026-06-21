# Neo Dashboard — Store (Karten & Module)

Der **Store** im Karten-Editor (Bereich „Erweiterungen" → **➕ Karte oder Modul hinzufügen**)
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

## Einen Beitrag in den Store bringen

Es gibt **zwei** Community-Wege (beide willkommen):

- **Discussion** — Idee/Modul in der Kategorie **„Community Cards & Modules"**
  vorschlagen (ideal für Feedback). Aus Discussions wird **nichts** automatisch
  installiert.
- **Pull Request** — fertiges Modul direkt einreichen (die Schritte unten).

Der **Maintainer** prüft den Code und merged ihn. Beim Pull Request prüft
zusätzlich die **CI** (`scripts/validate-store.mjs`) Katalog **und** Moduldatei —
kaputte Einträge werden nicht gemergt. Details:
[`CONTRIBUTING.md`](../CONTRIBUTING.md) ·
[`docs/de/mitmachen.md`](../docs/de/mitmachen.md). **Premium**-Karten gehören
**nicht** in diesen Katalog.

1. Lege `store/modules/<id>.js` an (Muster wie oben, eigenständig). Die `id` muss
   **lowercase kebab-case** sein und mit der `id`/dem `type` im Code übereinstimmen.
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
3. Auf `main` mergen (Maintainer).

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

## Vertrauensmodell & Supply-Chain (bewusster Tradeoff)

Der Store ist **kuratiert** und absichtlich **releasefrei**:

- Nur **Maintainer-Merges** landen im öffentlichen Store. Community-Beiträge
  werden über Discussions vorgeschlagen, geprüft und vom Maintainer übernommen
  (siehe [`../CONTRIBUTING.md`](../CONTRIBUTING.md)) — aus Discussions wird
  **nichts** automatisch installiert.
- **`store/index.json` wird live geladen** (über `raw.githubusercontent.com`),
  und die Store-Modul-/Karten-Dateien werden derzeit **live von `@main`** über
  jsDelivr geladen.
- Das ist **bewusst so gewählt**, damit der gewünschte Ablauf ohne Release
  funktioniert:

  > Maintainer merged Store-Datei + `store/index.json` auf `main`
  > → Nutzer klickt „Store aktualisieren"
  > → Karte/Modul erscheint **ohne HACS-Release und ohne neues Bundle**.

- **Konsequenz:** Der Store ist genau **so vertrauenswürdig wie das Repo und die
  Maintainer-Merges**. Wer auf `main` schreiben/mergen darf, kann beeinflussen,
  was Nutzer per „Store aktualisieren" laden. Deshalb sind sorgfältiges Review
  jeder Einreichung und ein eng gehaltener Schreibzugriff auf `main`
  entscheidend.

### Spätere Härtungs-Optionen (optional, derzeit NICHT umgesetzt)

Diese Punkte sind bewusst nur **dokumentiert/geplant** — sie würden den
releasefreien Workflow verändern und werden hier *nicht* eingeführt:

- **sha256-Checksumme pro Store-Modul** in `store/index.json`, vom Loader vor
  der Ausführung geprüft.
- **Automatische GitHub Action**, die Store-URLs beim Merge auf einen
  **Commit-SHA** pinnt (statt `@main`), inkl. Checksummen-Update.
- **Signierter Store-Index** (z. B. Signatur über `index.json`).
- **Release-/Channel-Modell** (z. B. `stable` / `beta`) für den Store.

> Hinweis: Solange diese Optionen nicht aktiv sind, bitte `@main`-URLs in
> `store/index.json` **nicht** entfernen — das würde den releasefreien
> Community-Store-Workflow brechen.
