# Neo Dashboard Kit — Dokumentation (Deutsch)

🇩🇪 Deutsch · [🇬🇧 English](../en/README.md)

Schöne Glassmorphism-Karten für dein Home-Assistant-Dashboard — **eine** Karte,
die sich an dein Gerät anpasst. Erweiterbar über **Module** und **Premium**.

## Inhalt
- [Erste Schritte](#erste-schritte) — Installation & erste Karte
- [Karten](karten.md) — die drei Karten erklärt
- [Module & Store](module.md) — Karten erweitern
- [Entwicklung](entwicklung.md) — eigene Karten/Module bauen
- [Mitmachen](mitmachen.md) — Karten/Module teilen & einreichen

---

## Erste Schritte

### Voraussetzungen
| Plugin | HACS-Kategorie | Pflicht? |
|---|---|---|
| _keine Frontend-Abhängigkeit_ | — | Die Karten brauchen **kein** Card Mod o. Ä. — Mobil-Header & Glas-Dialoge bringt Neo selbst mit. |
| [Neo Dashboard Tools](https://github.com/bkstudy2025/neo-dashboard-tools) | Integration | ⭐ Empfohlen — Modul-Store & dauerhaftes Speichern |

### 1. Installieren (HACS)
1. HACS → **Frontend** → ⋮ → *Benutzerdefiniertes Repository* →
   `https://github.com/bkstudy2025/neo-dashboard-kit` (Typ: *Dashboard/Lovelace*).
2. **Neo Dashboard Kit** installieren, danach Home Assistant neu starten.
3. **Neo Dashboard Tools** (Integration) installieren — empfohlen.

> HACS trägt die Ressource automatisch ein. Danach Browser einmal neu laden.

### 2. Theme aktivieren (optional, empfohlen)
1. `themes/neo-dashboard.yaml` aus diesem Repo nach `config/themes/` kopieren.
2. In `configuration.yaml`: `frontend:` → `themes: !include_dir_merge_named themes`.
3. Neu starten → Profil → **Theme** → **Neo Dashboard** wählen
   (wechselt automatisch Hell/Dunkel).

### 2. Eine Karte hinzufügen
1. Dashboard bearbeiten → **Karte hinzufügen** → nach **„Neo Card"** suchen.
2. Oben unter **Kartentyp** eine der drei Karten wählen:
   - **Neo Steuerung** — für alles Schaltbare (Licht, Schalter, Rollladen, Klima, Media …)
   - **Neo Anzeige** — für Sensorwerte & Kameras
   - **Neo Header** — Überschrift/Trenner zum Strukturieren
3. **Entität** auswählen — die Karte zeigt automatisch die passende Bedienung.
4. Fertig. 🎉

> **Faustregel:** Die wichtigste Steuerung liegt direkt auf der Karte. Den
> **vollen** Funktionsumfang (alle Details) erreichst du mit einem **Tipp auf die
> Karte** (öffnet den Geräte-Dialog von Home Assistant).

### 3. Karten erweitern (Module)
Im Karten-Editor gibt es den Bereich **Erweiterungen** → **➕ Karte oder Modul
installieren**:
- **Store** — geprüfte Module per Klick installieren.
- **Code einfügen** — Module/Premium-Karten (z. B. von Patreon) einfügen.

Mehr dazu: **[Module & Store](module.md)**.

---

## Hilfe & Unterstützung
- 📖 [Dokumentation](https://github.com/bkstudy2025/neo-dashboard-kit)
- 🐞 [Probleme melden](https://github.com/bkstudy2025/neo-dashboard-kit/issues)
- 💬 [Diskussionen](https://github.com/bkstudy2025/neo-dashboard-kit/discussions)
- ❤️ Gefällt es dir? Unterstützung hält das Projekt am Leben — siehe Links im Editor („Info & Support").
