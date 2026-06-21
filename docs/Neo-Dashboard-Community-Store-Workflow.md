# Neo Dashboard – Community-Store-Workflow (Maintainer-Anleitung)

> Diese Anleitung richtet sich an **dich als Maintainer** des Repositories
> `bkstudy2025/neo-dashboard-kit`. Sie erklärt, wie Community-Karten und
> -Module vorgeschlagen, geprüft, übernommen und ausgeliefert werden – und
> wie Premium klar davon getrennt bleibt.

---

## 1. Grundprinzip

Der offizielle Store ist **kuratiert**. Das heißt konkret:

- **GitHub Discussions sind nur für Vorschläge.** Dort schlägt die Community
  Karten und Module vor, zeigt sie her und diskutiert Ideen.
- **Aus Discussions wird nichts automatisch installiert.** Eine Discussion ist
  *kein* Installationsweg – es gibt keinen Automatismus, der Code aus einer
  Discussion in den Store oder zu den Nutzern bringt.
- **Nur geprüfte Karten/Module, die du als Maintainer ins Repo übernimmst,
  erscheinen im offiziellen Store.** Der Store liest seinen Katalog aus
  `store/index.json` in diesem Repo. Was dort nicht steht, gibt es im Store
  nicht.
- **Premium bleibt privat.** Premium-Karten kommen **nicht** in den
  öffentlichen Store und **nicht** in `store/index.json`. Premium-Code wird
  privat verteilt (z. B. Patreon) und von Nutzern über „Code einfügen" in den
  Editor eingespielt.

**Kanonische Regel:** *Community submissions are accepted through Discussions
only. The maintainer reviews, adapts, and adds accepted cards/modules to the
repository and official Store.* Es gibt **keinen** Fork-/PR-Einreichungsweg für
die Community – Fork/PR ist allenfalls dein **internes** Maintainer-Werkzeug
(siehe Abschnitt 5).

**Merksatz:** Vorschlag (Discussion) → Prüfung (du) → Übernahme ins Repo
(`store/`) → erst dann im Store sichtbar.

---

## 2. Community reicht etwas ein

So läuft eine Einreichung aus Sicht der Community ab:

1. Die Community geht auf **GitHub Discussions** des Repos.
2. Sie wählt die Kategorie **`Community Cards & Modules`**.
3. Sie füllt das **Einreichungs-Formular** aus
   (`.github/DISCUSSION_TEMPLATE/community-cards-modules.yml`).

**Pflichtfelder im Formular:**

- **Name** – Anzeigename der Karte/des Moduls
- **Typ** – **Card** (`registerCard`) oder **Module** (`registerModule`)
- **Beschreibung** – was es tut und welchen Anwendungsfall es löst
- **Screenshot** – mindestens ein Bild
- **Code oder Repo/Gist-Link** – der eigenständige `.js`-Code oder ein
  öffentlicher Link, damit du prüfen kannst (lesbar, nicht minified)
- **Home-Assistant-Version** – z. B. `2025.6`
- **Benötigte Entitäten/Domains** – z. B. `sensor`, `light`, `weather`
- **Sicherheits-/Lizenzbestätigung** – eigene Rechte/MIT, lesbarer Code, keine
  Secrets/Tokens/privaten Links, Verständnis, dass nur ein admin-geprüfter
  Merge in den Store führt

> **Wichtig zum Klarstellen:** Eine Discussion ist **kein Installationsweg**.
> Sie ist ausschließlich ein Vorschlags-, Vorzeige- und Support-Kanal.

---

## 3. Maintainer prüft die Einreichung

Prüfe jede Einreichung anhand dieser Checkliste, **bevor** du sie übernimmst:

- [ ] Ist der **Code lesbar**?
- [ ] Ist der Code **nicht minified/obfuscated**?
- [ ] Enthält der Code **keine Tokens, Secrets oder privaten Links**?
- [ ] Gibt es **keine unnötigen externen Requests** (keine fremden CDNs/Tracker)?
- [ ] Werden **HTML/Texte sicher ausgegeben** (`escapeHtml` / `escapeAttr`
      vor `innerHTML`)?
- [ ] Werden **URLs sicher behandelt** (`safeUrl` für externe `href`/`src`)?
- [ ] **Passt der Beitrag zum Neo Dashboard** (Stil, Tokens `--neo-*`,
      `.neo-card`-Hülle, sinnvolle `getCardSize()`)?
- [ ] Ist die **Lizenz klar** (MIT-kompatibel)?
- [ ] Ist der Beitrag **Community oder Premium**? (Premium gehört **nicht** in
      den öffentlichen Store.)

---

## 4. Community-Karte ins Repo übernehmen

Für eine geprüfte Karte oder ein Modul legst du **eine eigenständige Datei** an:

```
store/modules/<id>.js
```

Beispiel:

```
store/modules/neo-community-example-card.js
```

Danach ergänzt du den passenden Eintrag in **`store/index.json`**.

**Beispiel für einen Store-Eintrag:**

```json
{
  "id": "neo-community-example-card",
  "kind": "card",
  "name": "Community Example Card",
  "description": "A curated example community card for Neo Dashboard.",
  "target": "neo-community-example-card",
  "author": "Community",
  "version": "0.0.1",
  "icon": "🧩",
  "url": "https://cdn.jsdelivr.net/gh/bkstudy2025/neo-dashboard-kit@main/store/modules/neo-community-example-card.js",
  "homepage": "https://github.com/bkstudy2025/neo-dashboard-kit/discussions/categories/community-cards-modules"
}
```

**Worauf es ankommt:**

- **`author: "Community"`** ist wichtig – steuert das Badge und die Einordnung
  als Community-Beitrag (Premium nutzt `author: "Premium"`).
- **`kind: "card"`** oder **`kind: "module"`** ist wichtig – steuert das Badge
  „Karte/Modul" im Store. Bei **Karten** ist `target` = die eigene `id`; bei
  **Modulen** ist `target` die Ziel-Karte(n) bzw. `"*"` für alle.
- **`id` muss mit der `id`/dem `type` im Code übereinstimmen.**
- **`version`** muss bei Updates erhöht werden (im Code **und** im Index – siehe
  Abschnitt 7).
- **Premium kommt nicht in `store/index.json`.**

---

## 5. PR und Merge (Maintainer-intern)

Dieser Schritt ist **dein** Maintainer-Werkzeug zur Übernahme – **kein**
Einreichungsweg für die Community (die reicht ausschließlich über Discussions
ein, siehe Abschnitt 2). So sieht ein sauberer Übernahme-PR aus:

- Der PR enthält die **neue Datei** unter `store/modules/<id>.js`.
- Der PR ergänzt **`store/index.json`** um den passenden Eintrag.
- Optional: eine **kurze Doku-Ergänzung**.

**Wichtig – was *nicht* nötig ist:**

- Für reine Store-Inhalte ist **kein neues `neo-dashboard.js`** (Bundle) nötig.
- **Kein HACS-Release** nötig.
- **Kein Bundle-Build** nötig, solange **keine** Editor-/Core-Dateien
  (`src/...`) geändert werden.

> Der Katalog (`store/index.json`) ist nicht Teil des Bundles. Er wird live
> über `raw.githubusercontent.com` geladen, die Modul-/Karten-Dateien über das
> jsDelivr-CDN.

---

## 6. Test nach Merge

Schritt für Schritt prüfen, dass der neue Eintrag bei den Nutzern ankommt:

1. **PR mergen** (nach `main`).
2. **Home Assistant öffnen.**
3. **Neo Dashboard Editor öffnen** (eine Neo Card bearbeiten/hinzufügen).
4. **Erweiterungen** öffnen.
5. **Store** öffnen (Offizieller Store).
6. **„Store aktualisieren"** klicken (Cache-Busting; sonst ~5 min Wartezeit).
7. **Neue Karte/Modul suchen** in der Liste.
8. **Installieren**.
9. **Karte im Editor auswählen/testen** (Typ wählen, Entität setzen, Vorschau
   prüfen).

> Hinweis: Die `index.json` ist nach dem Merge in ~5 min bzw. sofort per
> „Store aktualisieren" aktuell. Neue Modul-/Karten-Dateien (neue URL)
> erscheinen sofort.

---

## 7. Update einer Community-Karte

Wenn eine bestehende Karte/ein Modul aktualisiert wird:

1. **JS-Datei ändern** (`store/modules/<id>.js`).
2. **Version im registrierten Code erhöhen** (`registerCard`/`registerModule`-Meta).
3. **Version in `store/index.json` erhöhen** – beide müssen übereinstimmen.
4. **PR mergen.**
5. Nutzer klickt **„Store aktualisieren"**.
6. Der Store zeigt **„⬆ Update"** an, und *Aktualisieren* lädt die Datei neu.

> Bei *Updates* einer **bestehenden Datei** kann der jsDelivr-Cache (`@main`,
> einige Stunden) nachhängen – ggf. über `https://purge.jsdelivr.net/gh/...`
> purgen. *Neue* Dateien (neue URL) sind nie stale.

---

## 8. Premium-Abgrenzung

Premium ist strikt vom öffentlichen Store getrennt:

- **Premium-Karten kommen nicht in den öffentlichen Store** und nicht in
  `store/index.json`.
- **Premium-Code wird privat verteilt** (z. B. als Patreon-Beitrag, privates
  Repo/Gist nur für Unterstützer).
- **Nutzer fügen Premium-Code über „Code einfügen" ein** (Editor →
  Erweiterungen → Karte oder Modul installieren → Tab „Code einfügen").
- **Premium nutzt `author: "Premium"`** – das ordnet die Karte der Kategorie
  *Premium* zu.
- **Premium gehört nicht als öffentliche Store-Einreichung in Discussions.**

> Mit der Integration **Neo Dashboard Tools** wird eingefügter Premium-Code
> serverseitig gespeichert und lädt bei jedem Start automatisch. Ohne die
> Integration gilt eingefügter Code nur für die aktuelle Sitzung.

---

*Stand: 2026-06-21 · Repo: `bkstudy2025/neo-dashboard-kit`*
