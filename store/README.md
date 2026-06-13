# Neo Dashboard — Modul-Store (über GitHub Discussions)

Der **Modul-Store** im Editor liest Community-Module direkt aus den
[GitHub Discussions](https://github.com/bkstudy2025/neo-dashboard-kit/discussions)
dieses Repos. **Kein eigenes Repo, kein Pull Request nötig.**

## Eigenes Modul veröffentlichen

1. Erstelle eine **neue Discussion** in diesem Repo.
2. Schreib eine kurze Beschreibung und (optional) füge ein Vorschaubild ein.
3. Füge deinen Karten-Code in einen **`js`-Codeblock** ein:

  <pre>
  ```js
  (function(){
    function init(){
      const NEO = window.NeoDashboard;
      if(!NEO || !NEO.BaseCard){ window.addEventListener("neo-dashboard-ready", init, {once:true}); return; }
      const { BaseCard, icon, accents, registerCard, makeEditor } = NEO;
      class MeineKarte extends BaseCard { /* ... */ }
      registerCard("neo-meine-karte", MeineKarte, {
        name: "Meine Karte", icon: "⭐", version: "1.0.0", author: "DeinName"
      });
    }
    init();
  })();
  ```
  </pre>

Das war's. Der Store erkennt automatisch jede Discussion, deren Codeblock
`registerCard(...)` enthält, und zeigt sie mit Name, Autor, Version, Beschreibung
und Vorschaubild an. Nutzer installieren sie mit einem Klick.

## Felder (aus dem Code/Post)

| Anzeige | Quelle |
|---|---|
| Name | `registerCard`-Meta `name` (sonst Discussion-Titel) |
| Autor | Meta `author` (sonst GitHub-Benutzer) |
| Version | Meta `version` |
| Beschreibung | erste Textzeile der Discussion |
| Bild | erstes Bild im Post |

> Premium-Karten (Patreon) gehören **nicht** öffentlich in die Discussions —
> die werden direkt über „Module → Code einfügen" im Karten-Editor eingespielt.
