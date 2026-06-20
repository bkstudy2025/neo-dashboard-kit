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
| **frei** für alle teilen | **Store (Pull Request)** | im Editor-Store, bei allen | Community / Open Source |
| **Premium** anbieten (Patreon) | **Code weitergeben** | nur wer den Code bekommt | zahlende Unterstützer |
| eigenes großes Projekt | **HACS** (eigenes Repo) | über HACS installierbar | Fortgeschrittene |

Die ersten beiden sind die wichtigen — beide unten Schritt für Schritt.

---

## Weg 1 — In den öffentlichen Store (Pull Request)

So landet deine Karte/dein Modul im **Store** (Editor → *Erweiterungen* →
*Karte oder Modul installieren* → **Store**), sichtbar für **alle** Nutzer und
mit **Update-Anzeige**.

### Schritt für Schritt

1. **Repo forken:** Gehe auf
   `https://github.com/bkstudy2025/neo-dashboard-kit` → **Fork**.
2. **Datei anlegen:** Lege deine Erweiterung als eigenständige Datei ab:
   ```
   store/modules/<deine-id>.js
   ```
   Beispiel: `store/modules/neo-wetter-card.js`. Muster & API:
   [Entwicklung](entwicklung.md). Wichtig: **eigenständig** (keine Imports aus
   dem Bundle), abgesichert mit `neo-dashboard-ready`.
3. **Katalog-Eintrag** in `store/index.json` ergänzen:
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
     "homepage": "https://github.com/<dein-name>/neo-dashboard-kit/tree/main/store"
   }
   ```
4. **Pull Request** öffnen → wird geprüft und gemerged.
5. Nach dem Merge erscheint die Karte/das Modul **automatisch im Store** aller
   Nutzer (jsDelivr cacht `@main` ein paar Stunden — etwas Geduld).

### Die `index.json`-Felder

| Feld | Pflicht | Zweck |
|---|---|---|
| `id` | ✅ | eindeutig, **muss** der `id`/`type` im Code entsprechen |
| `kind` | – | `"card"` oder `"module"` (steuert das Badge im Store) |
| `name`, `description`, `icon` | ✅/– | Anzeige im Store |
| `target` | ✅ | für welche Karte(n): Typ · Liste · `"*"` (alle). Bei **Karten** = die eigene `id` |
| `author` | – | Badge: `Community` / `Premium` / … |
| `version` | ✅ | wird mit der installierten verglichen → **„⬆ Update"** wenn neuer |
| `url` | ✅ | jsDelivr-Link zur Datei (Muster oben) |
| `homepage` | – | Link für den **Info**-Button (Doku/Repo) |

> **Updates ausliefern:** Erhöhe `version` **im Code** (`registerCard`/
> `registerModule`-Meta) **und** in `store/index.json` → der Store zeigt bei
> allen „⬆ Update" an, *Aktualisieren* lädt die Datei neu.

Mehr Details: [`store/README.md`](../../store/README.md).

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
- [ ] Store-Weg: `store/modules/<id>.js` + `index.json`-Eintrag + Pull Request.

Siehe auch: [Entwicklung](entwicklung.md) · [Module & Store](module.md) ·
[`CONTRIBUTING.md`](../../CONTRIBUTING.md)
