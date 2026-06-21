# Module & Store

🇩🇪 Deutsch · [🇬🇧 English](../en/modules.md) · [← Übersicht](README.md)

**Module** erweitern eine Karte um Zusatzfunktionen oder Optik — ohne den Kern
zu überladen. So bleibt jede Karte schlank, und „große" Extras kommen oben drauf.

> **Hinweis:** Der Core enthält **keine** eingebauten Beispielmodule mehr — der
> Release liefert nur die drei Standardkarten. Module kommen über den **Store**,
> **„Code einfügen"** oder **Premium**. Vorlagen liegen unter
> [`docs/examples/store-modules/`](../examples/store-modules/).

> Es gibt zwei Arten von Erweiterungen:
> - **Modul** — hängt sich an eine *bestehende* Karte (z. B. Status-Badge, Glow).
> - **Karte** — ein *neuer* Kartentyp (z. B. eine Premium-Wetterkarte).
>
> Beides installierst du an derselben Stelle.

## Module benutzen (für alle)

Im Karten-Editor, Bereich **Erweiterungen** (auf der Startseite direkt sichtbar):

1. **➕ Karte oder Modul installieren** öffnen.
2. **Store** — geprüfte Module aus dem Katalog mit einem Klick **Installieren**.
   *(Benötigt die Integration **Neo Dashboard Tools** zum dauerhaften Speichern.)*
3. **Code einfügen** — fertigen Modul- oder Karten-Code (z. B. von Patreon)
   einfügen → **Hinzufügen**.

In der Liste siehst du alles Installierte mit **Version**, Badge **Karte/Modul**
sowie **Aktualisieren** und **Entfernen**.

### Ein Modul auf einer Karte aktivieren
Wähle oben einen **Kartentyp** und scrolle zu **Module**. Dort schaltest du die
passenden Module **ein/aus**, stellst ihre Optionen ein und änderst mit **▲ ▼**
die Reihenfolge.

> Aktivierte Module werden als **Accordion** angezeigt: Es ist immer nur **ein**
> Modul zur Bearbeitung geöffnet. Klicke ein Modul an, um seine Einstellungen zu
> öffnen — die anderen klappen automatisch zu; ein frisch aktiviertes Modul
> öffnet sich direkt.

---

## Ein Modul schreiben (für Entwickler)

Ein Modul ist eine kleine, eigenständige JS-Datei, die sich selbst registriert:

```js
window.NeoDashboard.registerModule({
  id: "neo-mein-modul",          // eindeutig
  name: "Mein Modul",
  description: "Was es macht.",
  icon: "✨",
  target: "neo-control-card",    // Ziel-Karte · Liste · "*" für alle
  version: "1.0.0",
  author: "Community",
  config: [                       // optionale Einstellungen (ha-form-Schema)
    { name: "entity", label: "Entität", selector: { entity: {} } },
  ],
  // Hooks (alle optional):
  style(ctx)    { return "/* CSS in die Karte */"; },
  decorate(root, ctx) { /* DOM nach dem Rendern ergänzen */ },
  tapAction(ctx)      { /* übernimmt den Tipp auf die Karte */ },
});
```

**Hooks**
| Hook | Wann | Zweck |
|---|---|---|
| `style(ctx)` | bei jedem Rendern | gibt CSS zurück (in den Shadow-Root) |
| `decorate(root, ctx)` | nach dem Rendern | DOM ergänzen/ändern |
| `tapAction(ctx)` | beim Tippen | erstes aktives Modul übernimmt (überschreibt Standard) |

**`ctx`** = `{ hass, config, settings, card, callService, navigate, moreInfo }`
(`settings` = die im Editor gesetzten Werte deines Moduls.)

Vollständiges Beispiel: [`docs/examples/store-modules/neo-state-glow.js`](../examples/store-modules/neo-state-glow.js).

## Ein Modul in den Store stellen
Der Katalog liegt im Repo unter [`store/`](../../store/): pro Modul eine Datei
`store/modules/<id>.js` und ein Eintrag in `store/index.json`. Anleitung:
**[store/README.md](../../store/README.md)**.

> Premium-Module (Patreon) gehören **nicht** in den öffentlichen Katalog — die
> gibst du über **Code einfügen** weiter.

Mehr zum Bauen eigener **Karten**: **[Entwicklung](entwicklung.md)**.
