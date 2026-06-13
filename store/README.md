# Neo Dashboard — Modul-Store

Dieser Ordner enthält den **Store-Index** (`index.json`), den das Neo Dashboard Kit
im Editor unter **Modul-Store** anzeigt. Nutzer können Module von hier mit einem Klick
installieren.

## Eigenes Modul eintragen (Community)

1. Veröffentliche deine Karten-`.js` in deinem **eigenen öffentlichen GitHub-Repo**
   (eine eigenständige Datei, die `window.NeoDashboard.registerCard(...)` aufruft —
   siehe [Plugin-Anleitung](../docs/premium-modules.md)).
2. Stelle einen **Pull Request** auf dieses Repo, der einen Eintrag zu `store/index.json`
   hinzufügt:

```json
{
  "name": "Mein cooles Modul",
  "type": "neo-mein-modul-card",
  "author": "DeinName",
  "version": "1.0.0",
  "description": "Kurze Beschreibung der Karte.",
  "image": "https://raw.githubusercontent.com/DU/REPO/main/preview.png",
  "url": "https://raw.githubusercontent.com/DU/REPO/main/neo-mein-modul-card.js",
  "repo": "https://github.com/DU/REPO"
}
```

### Felder

| Feld | Pflicht | Beschreibung |
|---|---|---|
| `name` | ✅ | Anzeigename |
| `type` | ✅ | Kartentyp (`registerCard`-Name), z.B. `neo-...-card` |
| `author` | ✅ | Dein Name / „Community" |
| `version` | ✅ | SemVer |
| `description` | ✅ | Kurzbeschreibung |
| `image` | – | Vorschaubild (raw URL) |
| `url` | ✅ | **raw**-URL der `.js`-Datei |
| `repo` | ✅ | Link zum Repo (für „Mehr Infos") |

> Premium-Karten (Patreon) gehören **nicht** in den öffentlichen Store —
> die werden direkt über den Code (Karten-Editor → Module verwalten) eingespielt.

Nach dem Merge erscheint dein Modul im Store aller Nutzer.
