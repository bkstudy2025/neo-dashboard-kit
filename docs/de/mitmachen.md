# Mitmachen — Karten & Module teilen / einreichen

🇩🇪 Deutsch · [🇬🇧 English](../en/community.md) · [← Übersicht](README.md)

Du hast eine Karte oder ein Modul gebaut (siehe **[Entwicklung](entwicklung.md)**)
und willst sie **deiner Community geben**? Hier ist der komplette Weg — vom
fertigen Code bis zum Klick beim Nutzer.

> Eine Erweiterung ist **eine einzige `.js`-Datei**, die sich selbst registriert.
> Es gibt **keinen** Build-Schritt für den Nutzer und **keine** Kern-Änderung.

---

## Welcher Weg ist der richtige?

| Du willst… | Weg | Sichtbarkeit | Für wen |
|---|---|---|---|
| **frei** für alle teilen | **Discussion oder Pull Request** | im Editor-Store, bei allen | Community / Open Source |
| **Premium** anbieten (Patreon) | **Code weitergeben** | nur wer den Code bekommt | zahlende Unterstützer |
| eigenes großes Projekt | **HACS** (eigenes Repo) | über HACS installierbar | Fortgeschrittene |

Die ersten beiden sind die wichtigen — beide unten Schritt für Schritt.

---

## Weg 1 — In den öffentlichen Store (Community)

Es gibt **zwei** Wege, deine Karte/dein Modul in den offiziellen **Store** zu
bringen (Editor → *Erweiterungen* → *Karte oder Modul installieren* →
**Store**) — such dir den aus, der zu dir passt. Beides ist willkommen. 🙌

### Weg 1a — Discussion (Idee/Modul vorschlagen)

Ideal, wenn du Feedback möchtest oder (noch) keinen Pull Request öffnen willst.

1. Eröffne einen Vorschlag in der Kategorie
   [**Community Cards & Modules**](https://github.com/bkstudy2025/neo-dashboard-kit/discussions/new?category=community-cards-modules)
   mit Name, Typ (Karte/Modul), Beschreibung, Screenshot und Code (oder einem
   öffentlichen Repo-/Gist-Link).
2. Ein Maintainer schaut drüber, gibt Feedback und übernimmt akzeptierte
   Beiträge ins Repo.

### Weg 1b — Pull Request (fertiges Modul einreichen)

Schnellster Weg, wenn dein Modul fertig ist und du dich mit Git auskennst.

1. **Datei anlegen:** `store/modules/<id>.js` (eigenständig, keine Imports aus
   dem Bundle, abgesichert mit `neo-dashboard-ready`). Muster & API:
   [Entwicklung](entwicklung.md).
2. **Katalog-Eintrag** in `store/index.json` ergänzen:
   ```json
   {
     "id": "neo-wetter-card",
     "kind": "card",
     "name": "Wetter Card",
     "description": "Kurze Beschreibung, was sie zeigt.",
     "target": "neo-wetter-card",
     "author": "Community",
     "version": "1.0.0",
     "icon": "⛅",
     "url": "https://cdn.jsdelivr.net/gh/bkstudy2025/neo-dashboard-kit@main/store/modules/neo-wetter-card.js",
     "homepage": "https://github.com/bkstudy2025/neo-dashboard-kit"
   }
   ```
   - **`id`** = lowercase **kebab-case** und identisch zur `id`/zum `type` im Code.
   - **`version`** setzen (SemVer, z. B. `1.0.0`), bei Updates erhöhen.
   - **`target`** setzen (Karte = die eigene `id`; Modul = Ziel-Karte(n) oder `"*"`).
   - Screenshot/Beschreibung in den PR schreiben, wenn möglich.
3. **Pull Request öffnen.** Die **CI prüft** Katalog **und** Moduldatei
   automatisch (siehe unten) — ein grüner Check macht das Review leicht.

> Nach dem Merge auf `main` erscheint dein Beitrag **automatisch im Store** aller
> Nutzer (im Editor **„Store aktualisieren"** klicken; jsDelivr cacht `@main`
> ein paar Stunden) — **ohne** HACS-Release und **ohne** neues Bundle.

### Was der Maintainer prüft (Review-Regeln)

Damit der Store sicher und sauber bleibt, achtet der Maintainer auf:

- **lesbarer Code** (nicht minified/obfuscated);
- **keine externen Requests ohne Grund** (kein fremdes CDN, kein Tracking);
- **kein `eval` / `new Function` / `document.write` / `XMLHttpRequest`**;
- **keine Secrets/Tokens/privaten Links**;
- **keine Premium-/Paywall-Module** im Community-Store (Premium → Weg 2).

---

## Weg 2 — Premium über Patreon (nur Code)

Premium-Karten gehören **nicht** in den öffentlichen Store. Du gibst nur den
**Code** an deine Unterstützer weiter — sie fügen ihn per **Code einfügen** ein.

### Für dich (Anbieter)

1. Baue die Karte wie gewohnt (eine `.js`-Datei, `author: "Premium"`):
   ```js
   registerCard("neo-premium-xyz", PremiumKarte, {
     name: "XYZ (Premium)", icon: "💎",
     version: "1.2.0", author: "Premium",
   });
   ```
2. **Veröffentliche den reinen Datei-Inhalt** für deine Unterstützer, z. B.:
   - als Patreon-Beitrag (Code im Anhang / Codeblock), oder
   - als Datei in einem **privaten** GitHub-Repo / Gist nur für Patreons.
3. **Update:** `version` erhöhen, neuen Code posten — die Unterstützer fügen ihn
   erneut ein (überschreibt die alte Version, kein Reload nötig).

> Eine **gute ID** ist wichtig (`neo-premium-…`), damit ein erneutes Einfügen
> die alte Version *ersetzt* statt zu duplizieren.

### Für deine Unterstützer (so steht es in der Anleitung unten)

1. Editor öffnen → **Erweiterungen** → **Karte oder Modul installieren** →
   Tab **Code einfügen**.
2. Den von dir bereitgestellten Code einfügen → **Hinzufügen**.
3. Fertig — die Premium-Karte erscheint im Kartentyp-Auswahlmenü (Kategorie
   *Premium*). Mit **Neo Dashboard Tools** wird sie serverseitig gespeichert und
   lädt bei jedem Start automatisch.

> Ohne *Neo Dashboard Tools* lädt eingefügter Code **nur für die aktuelle
> Sitzung**. Für dauerhafte Premium-Karten die Integration installieren.

---

## Weg 3 — Eigenes HACS-Repo (fortgeschritten)

Für große, eigenständige Projekte: Veröffentliche deine Karte als eigenes
**HACS-Frontend-Repo** (eigene `hacs.json`, Release-Tags). Nutzer installieren
sie über HACS als zusätzliche Ressource. Sie dockt genauso an
`window.NeoDashboard` an. Das ist nur für Fortgeschrittene nötig — für die
meisten reichen Weg 1 oder 2.

---

## So installieren deine Nutzer (zum Weitergeben)

**Aus dem Store (Weg 1):**
> Editor → *Erweiterungen* → *Karte oder Modul installieren* → **Store** →
> Karte/Modul suchen → **Installieren**. Updates erscheinen dort als „⬆ Update".

**Per Code (Weg 2 / Premium):**
> Editor → *Erweiterungen* → *Karte oder Modul installieren* → **Code einfügen** →
> Code einfügen → **Hinzufügen**.

---

## 📋 Ankündigungs-Vorlage (zum Kopieren für deine Community)

```text
🎉 Neue Neo-Dashboard-Karte: „<Name>"

So installierst du sie:
1. Dashboard bearbeiten → eine Neo Card öffnen (oder neu hinzufügen).
2. Bereich „Erweiterungen" → „Karte oder Modul installieren".

▶ Aus dem Store (kostenlos):
   Tab „Store" → „<Name>" suchen → Installieren. Fertig!

▶ Premium (Patreon):
   Tab „Code einfügen" → den Code aus diesem Beitrag einfügen → Hinzufügen.
   (Empfohlen: Integration „Neo Dashboard Tools", dann bleibt sie dauerhaft.)

Updates: Im Store erscheint automatisch „⬆ Update". Bei Premium poste ich
den neuen Code — einfach erneut einfügen.
```

---

## Checkliste vor dem Teilen

- [ ] Eigenständige Datei, mit `neo-dashboard-ready` abgesichert.
- [ ] Eindeutige `id`/`type` (Präfix `neo-…`), passend in Code **und** `index.json`.
- [ ] `version` gesetzt (im Code **und**, bei Store, in `index.json`).
- [ ] `author` korrekt (`Community` / `Premium`).
- [ ] Farben nur über `--neo-*`-Tokens, Karte in `.neo-card`-Hülle.
- [ ] In Home Assistant getestet (Hinzufügen, Editor, Update/Entfernen).
- [ ] Store-Weg: per **Discussion** vorschlagen **oder** per **Pull Request**
      einreichen (`store/modules/<id>.js` + `index.json`-Eintrag). Bei PR:
      `id` kebab-case, `version`/`target` gesetzt — die CI prüft den Rest.

Siehe auch: [Entwicklung](entwicklung.md) · [Module & Store](module.md) ·
[`CONTRIBUTING.md`](../../CONTRIBUTING.md)
