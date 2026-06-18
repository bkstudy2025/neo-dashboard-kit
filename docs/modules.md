# Module — karten-gebundene Erweiterungen

Module erweitern eine **bestehende Karte** um zusätzliche Funktionen oder Optik,
ohne den Kern aufzublähen. Jedes Modul ist an eine Ziel-Karte gebunden (`target`)
und erscheint im Editor nur dort.

> **Idee:** Der Kern bleibt schlank. „Große" Funktionen kommen als Module —
> mitgeliefert, aus dem **Store**, oder von **Patreon** (Code einfügen).

## Module benutzen

Im Karten-Editor → Sektion **Module**:

- **Aktivieren/Deaktivieren** per Schalter. Aktive Module zeigen ihre
  Einstellungen direkt darunter; mit **▲ / ▼** änderst du ihre Reihenfolge (Layer).
- **➕ Modul hinzufügen:**
  - **Store** — kuratierter Katalog (über CDN), **nach aktueller Karte gefiltert**.
    „Installieren" lädt + speichert das Modul serverseitig (Neo Dashboard Tools).
  - **Code einfügen** — fertigen Modul-Code einfügen (z. B. Patreon-Module).

Aktive Module werden in `config.modules` gespeichert (`[{ id, settings }]`) und von
der Karte live angewandt.

> Für Store-Installation & dauerhaftes Speichern wird die Integration
> **Neo Dashboard Tools** benötigt. „Code einfügen" funktioniert auch ohne (dann
> nur für die Sitzung).

## Ein Modul schreiben

Ein Modul ist ein deklaratives Manifest mit optionalen, typisierten Hooks. Es
registriert sich über die öffentliche API:

```js
window.NeoDashboard.registerModule({
  id: "neo-mein-modul",          // eindeutig (Pflicht)
  name: "Mein Modul",
  description: "Was es macht.",
  icon: "✨",
  target: "neo-button-card",     // Ziel-Karte · Liste · "*" für alle
  version: "1.0.0",
  author: "Community",           // Badge: Community / Premium / …
  config: [                       // optionales ha-form-Schema (Einstellungen)
    { name: "entity", label: "Entität", selector: { entity: {} } },
  ],
  // Hooks (alle optional) — ctx siehe unten:
  style(ctx)    { return "/* CSS in den Shadow-Root der Karte */"; },
  decorate(root, ctx) { /* DOM nach dem Render ergänzen */ },
  tapAction(ctx)      { /* übernimmt den Tap (überschreibt Standard-Aktion) */ },
});
```

### Hooks

| Hook | Wann | Zweck |
|---|---|---|
| `style(ctx)` | bei jedem Render | gibt einen CSS-String zurück (in den Shadow-Root) |
| `decorate(root, ctx)` | nach dem Render | ergänzt/verändert DOM (`root` = ShadowRoot) |
| `tapAction(ctx)` | beim Tap auf die Karte | **erstes** aktives Modul mit `tapAction` übernimmt und überschreibt die Standard-Aktion |

### `ctx`
```
{ hass, config, settings, card,
  callService(domain, service, data),
  navigate(path),
  moreInfo(entityId) }
```
`settings` = die im Editor gesetzten Werte dieses Moduls (aus `config`-Schema).

### Targeting (`target`)
- `"neo-button-card"` — nur diese Karte
- `["neo-button-card", "neo-sensor-card"]` — mehrere
- `"*"` — alle Karten

## In den Store stellen

Der Katalog liegt im Repo unter [`store/`](../store/) und wird über jsDelivr
ausgeliefert. Pro Modul: eine eigenständige Datei `store/modules/<id>.js` plus ein
Eintrag in `store/index.json`. Vollständige Anleitung: **[store/README.md](../store/README.md)**.

> Premium-Module (Patreon) gehören **nicht** in den öffentlichen Katalog — sie
> werden über „Code einfügen" weitergegeben.
