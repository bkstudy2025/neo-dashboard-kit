# Premium-Module & externe Karten

Das Neo Dashboard Kit ist so gebaut, dass Karten **nicht** alle im Core-Repo liegen
müssen. Karten können als **eigenständige JS-Dateien** ausgeliefert werden, die an
den Core andocken und automatisch im `neo-card`-Dropdown erscheinen.

Das ermöglicht zwei Dinge:
- **Community-Karten** (fremde Repos) ergänzen das Kit.
- **Premium-Karten** (z.B. über Patreon) werden separat verteilt — der Core bleibt
  offen, die Zusatzkarten kommen als einzelne Dateien dazu.

---

## Wie es funktioniert

Der Core stellt eine öffentliche API unter `window.NeoDashboard` bereit:

| API | Zweck |
|---|---|
| `registerCard(type, class, meta)` | Karte registrieren (erscheint im Dropdown) — `meta = { name, description, icon, version, author }` |
| `BaseCard` | Basisklasse (Render-Loop, `_state`, `_callService`, selektives Re-Render) |
| `icon(name, {size,color})` | SVG-Icon-Set |
| `accents`, `accentOptions` | Akzentfarben + Editor-Optionen |
| `iconOptions` | Icon-Liste für Editoren |
| `makeEditor(schema, meta)` | Editor-Factory (HA-native `ha-form`) |
| `version` | Core-Version |

Eine externe Kartendatei wartet auf den Core (Event `neo-dashboard-ready`), nutzt
diese API und registriert ihre Karte. Mehr braucht es nicht.

→ Vollständige Vorlage: **[`premium/neo-card-template.js`](../premium/neo-card-template.js)**

---

## Einfachster Weg: Code direkt im Editor einfügen

Im `neo-card`-Editor gibt es im **Kartentyp**-Dropdown den Eintrag
**„Neo Modul / Code laden"**. Dort den von Patreon kopierten Code in das Textfeld
einfügen und speichern — die Karte(n) werden registriert und erscheinen anschließend
im Kartentyp-Dropdown jeder weiteren `neo-card`.

> Nach dem Einfügen den Editor einmal schließen und wieder öffnen, damit die neue
> Karte im Dropdown auftaucht.

So müssen Supporter **keine Dateien** nach `www/` kopieren oder Ressourcen anlegen.

---

## Alternative: als Ressource (für Karten ohne Editor-Einfügen)

1. Die Karten-Datei (z.B. `neo-meine-karte.js`) herunterladen
   *(bei Premium: aus dem Patreon-Beitrag)*
2. Nach `config/www/neo-cards/neo-meine-karte.js` kopieren
3. In **Einstellungen → Dashboards → Ressourcen** hinzufügen:
   ```
   URL:  /local/neo-cards/neo-meine-karte.js
   Typ:  JavaScript-Modul
   ```
   > **Wichtig:** Die Ressource muss **nach** dem Core (`neo-dashboard.js`) geladen
   > werden — einfach danach eintragen.
4. Browser neu laden → die Karte erscheint im `neo-card`-Dropdown.

---

## Eigene Karte entwickeln

```js
const { BaseCard, icon, accents, registerCard, makeEditor, iconOptions, accentOptions } = window.NeoDashboard;

class MeineKarte extends BaseCard {
  getCardSize() { return 2; }
  render() {
    const acc = accents[this._config?.accent] || accents.blue;
    const s = this._state(this._config?.entity);
    return `<div class="neo-card" style="padding:16px">
      ${icon("star", { size: 20, color: acc.c })}
      <div>${s ? s.state : "—"}</div>
    </div>`;
  }
  static getConfigElement() { return document.createElement("meine-karte-editor"); }
  static getStubConfig() { return { entity: "", accent: "blue" }; }
}

customElements.define("meine-karte-editor", makeEditor([
  { name: "entity", label: "Entity", selector: { entity: {} } },
  { name: "accent", label: "Akzent", selector: { select: { mode: "dropdown", options: accentOptions } } },
], { name: "Meine Karte", description: "…", icon: "⭐" }));

registerCard("neo-meine-karte", MeineKarte, { name: "Meine Karte", description: "…", icon: "⭐" });
```

Wrappe das in den `init()`-Wartemechanismus aus dem Template, damit es auch
funktioniert wenn deine Datei vor dem Core lädt.

### Metadaten (Name · Version · Autor)

`meta` wird in der „Modul einfügen"-Liste angezeigt — so sehen du und die Community
auf einen Blick, welche Karte, welche Version und von wem:

| Feld | Beispiel | Zweck |
|---|---|---|
| `name` | `"Neo Wetter"` | Anzeigename |
| `icon` | `"🌤️"` | Symbol in Liste/Dropdown |
| `version` | `"1.0.0"` | für Weiterentwicklung/Abgleich |
| `author` | `"Premium"` oder `"Community"` | `Premium` → goldenes Badge, sonst grünes Community-Badge |

---

## Monetarisierungs-Modell (Open Core)

- **Core-Kit:** MIT, kostenlos & offen → Reichweite, Vertrauen, Adoption.
- **Premium-Karten:** als separate Dateien über Patreon — z.B. als *Early Access*
  (später frei) oder exklusive Zusatzkarten.
- **Hinweis:** Frontend-JS ist immer einsehbar; es gibt kein echtes DRM. Das Modell
  funktioniert über **Mehrwert & Unterstützung**, nicht über technische Sperren —
  genau wie bei Bubble Card, Mushroom & Co.
