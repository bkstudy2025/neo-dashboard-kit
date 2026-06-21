// Neo Dashboard Kit — i18n
// Die UI ist in Deutsch verfasst (Quelle). neoT(hass, de) liefert die englische
// Übersetzung, wenn die HA-Sprache NICHT Deutsch ist — sonst den deutschen Text.
// So folgt die Oberfläche automatisch der Home-Assistant-Sprache (Englisch als
// Standard/international, Deutsch für deutsche Nutzer) ohne eigenen Schalter.
//
// Platzhalter: Strings können {name}/{author}/… enthalten und werden am
// Aufrufort per .replace() gefüllt.

// Deutsch → Englisch. Fehlt ein Eintrag, wird der deutsche Text zurückgegeben.
const EN = {
  // Sektionen
  "Kartentyp": "Card type",
  "Einstellungen": "Settings",
  // Startseite
  "Glassmorphism-Karten für dein Dashboard. Wähle oben einen <b>Kartentyp</b> — danach erscheinen hier die Einstellungen und rechts die Live-Vorschau.":
    "Glassmorphism cards for your dashboard. Pick a <b>card type</b> above — the settings appear here and the live preview on the right.",
  // Erweiterungen / Module
  "Module": "Modules",
  "Erweiterungen": "Extensions",
  "Für diese Karte sind noch keine Module aktiv. Über <b>➕ Modul hinzufügen</b> kommst du zum Store.":
    "No modules are active for this card yet. Use <b>➕ Add module</b> to open the store.",
  "<b>Karten</b> &amp; <b>Module</b> installieren (Store oder Code einfügen) — oder oben einen <b>Kartentyp</b> wählen, um Module für eine Karte zu aktivieren.":
    "Install <b>cards</b> &amp; <b>modules</b> (store or paste code) — or pick a <b>card type</b> above to enable modules for a card.",
  "Modul hinzufügen": "Add module",
  "Karte oder Modul installieren": "Install card or module",
  "Store": "Store",
  "Code einfügen": "Paste code",
  "Installiert": "Installed",
  // Store
  "⚠️ Für den Store wird die Integration <b>Neo Dashboard Tools</b> benötigt (serverseitiges Speichern + Laden).":
    "⚠️ The store needs the <b>Neo Dashboard Tools</b> integration (server-side save + load).",
  "Lade Store …": "Loading store …",
  "Store-Index konnte nicht geladen werden.": "Could not load the store index.",
  "Store-Index konnte nicht geladen werden. Prüfe die Internetverbindung und versuche es erneut.":
    "Could not load the store index. Check your internet connection and try again.",
  "Erneut": "Retry",
  "Offizieller Store": "Official store",
  "Store aktualisieren": "Refresh store",
  "Store wird aktualisiert …": "Refreshing store …",
  "Erweiterungen führen JavaScript in Home Assistant aus. Installiere nur vertrauenswürdige Erweiterungen.":
    "Extensions run JavaScript in Home Assistant. Only install extensions you trust.",
  "Community-Beitrag vorschlagen": "Suggest a community contribution",
  "Installiert (per Code eingefügt)": "Installed (pasted code)",
  "Aktuell keine Store-Module verfügbar. Premium-Karten (z. B. Wetter) fügst du über <b>Code einfügen</b> hinzu.":
    "No store modules available right now. Add premium cards (e.g. weather) via <b>Paste code</b>.",
  "✓ Installiert": "✓ Installed",
  "Installieren": "Install",
  "Aktualisieren": "Update",
  "Entfernen": "Remove",
  "von": "by",
  "Karte": "Card",
  "Modul": "Module",
  // Code einfügen
  "ℹ️ Ohne <b>Neo Dashboard Tools</b> wird das Modul nur für diese Sitzung geladen (nicht dauerhaft gespeichert).":
    "ℹ️ Without <b>Neo Dashboard Tools</b> the module loads for this session only (not saved permanently).",
  "Modul- oder Karten-Code einfügen (registerModule / registerCard, z. B. Premium-Karten) …":
    "Paste module or card code (registerModule / registerCard, e.g. premium cards) …",
  "Für Premium-Code (z. B. Patreon) oder privat geprüften Test-Code. Wird nicht über den öffentlichen Store verteilt.":
    "For premium code (e.g. Patreon) or privately reviewed test code. Not distributed via the public store.",
  "Premium- oder Test-Code einfügen": "Paste premium or test code",
  "Hinzufügen": "Add",
  // Meldungen
  "Bitte Code einfügen.": "Please paste some code.",
  "Code konnte nicht geladen werden.": "Could not load the code.",
  "Kein Modul/Karte erkannt (registerModule/registerCard fehlt?).":
    "No module/card detected (missing registerModule/registerCard?).",
  "✓ Karte „{name}” hinzugefügt — oben im Kartentyp wählbar.":
    "✓ Card “{name}” added — selectable in the card type above.",
  "✓ Karte „{name}” aktualisiert.": "✓ Card “{name}” updated.",
  "✓ Modul „{name}” hinzugefügt.": "✓ Module “{name}” added.",
  "✓ Modul „{name}” aktualisiert.": "✓ Module “{name}” updated.",
  "Speichern fehlgeschlagen: {err}": "Saving failed: {err}",
  "Installiere …": "Installing …",
  "✓ „{name}” installiert.": "✓ “{name}” installed.",
  "Installation fehlgeschlagen: {err}": "Installation failed: {err}",
  "Modul entfernt. (Bereits geladener Code verschwindet nach einem Reload.)":
    "Module removed. (Already-loaded code disappears after a reload.)",
  // Reorder / Aktionen
  "Layer nach oben": "Move layer up",
  "Layer nach unten": "Move layer down",
  "Modul entfernen": "Remove module",
  // Kartentyp-Picker
  "Kartentyp wählen …": "Choose a card type …",
  "🔍 Karte suchen …": "🔍 Search cards …",
  "Keine Treffer.": "No matches.",
  "Standard": "Standard",
  "Premium": "Premium",
  "Community": "Community",
  // Progressive Kartenauswahl (Bereich → Karte)
  "Bereich wählen": "Choose a category",
  "Karte wählen": "Choose a card",
  "Karte wählen …": "Choose a card …",
  "Wähle zuerst einen Bereich, um die passenden Karten zu sehen.":
    "Pick a category first to see the matching cards.",
  "In diesem Bereich gibt es noch keine Karten.":
    "There are no cards in this category yet.",
  "Premium- und Community-Karten fügst du unten über <b>Erweiterungen</b> hinzu.":
    "Add premium and community cards via <b>Extensions</b> below.",
  // Info & Support
  "Info &amp; Support": "Info &amp; Support",
  "Ressourcen &amp; Hilfe": "Resources &amp; help",
  "Fragen oder ein Problem? Die Doku und die Community helfen weiter.":
    "Questions or a problem? The docs and the community can help.",
  "📖 Dokumentation": "📖 Documentation",
  "🐞 Probleme melden": "🐞 Report issues",
  "💬 Diskussionen": "💬 Discussions",
  "❤️ Projekt unterstützen": "❤️ Support the project",
  "Hi! Ich entwickle <b>Neo Dashboard Kit</b> in meiner Freizeit und stecke viel Herzblut hinein. Wenn es dir gefällt, ist jede Unterstützung eine riesige Motivation — so kann ich weiter neue Karten &amp; Module bauen. Auf Patreon gibt es außerdem exklusive Premium-Karten und Vorlagen.":
    "Hi! I build <b>Neo Dashboard Kit</b> in my spare time and put a lot of heart into it. If you enjoy it, any support is huge motivation — it lets me keep building new cards &amp; modules. Patreon also has exclusive premium cards and templates.",
  "☕ Kaffee spendieren": "☕ Buy me a coffee",
  "💳 PayPal": "💳 PayPal",
  "♥ Patreon": "♥ Patreon",
  "Danke, dass du Teil dieser Community bist! 🎉": "Thanks for being part of this community! 🎉",

  // ── Karten: Render-Texte ──
  "An": "On", "Aus": "Off", "Bereit": "Idle", "Auto": "Auto",
  "Schalter": "Switch", "Helligkeit": "Brightness", "Stufe": "Speed",
  "Verriegelt": "Locked", "Entriegelt": "Unlocked", "Schloss": "Lock",
  "Ventilator": "Fan", "Rollladen": "Cover", "Klima": "Climate", "Media": "Media",
  "Öffnen": "Open", "Stopp": "Stop", "Schließen": "Close",
  "Offen": "Open", "Geschlossen": "Closed", "Öffnet": "Opening", "Schließt": "Closing",
  "% offen": "% open",
  "Heizt": "Heating", "Kühlt": "Cooling", "Entfeuchtet": "Drying", "Lüftet": "Fan",
  "Heizen": "Heat", "Kühlen": "Cool", "Aktuell": "Current",
  "Spielt": "Playing", "Pausiert": "Paused", "Standby": "Standby", "Puffert": "Buffering",
  // capability-aware Controls & Aktionen
  "Nicht verfügbar": "Unavailable",
  "Position": "Position", "Neigung": "Tilt",
  "Lautstärke": "Volume", "Stumm": "Mute", "Quelle": "Source",
  "Modus": "Mode", "Voreinstellung": "Preset", "Lüftung": "Fan mode",
  "Schwenken": "Swing", "Luftfeuchte": "Humidity",
  "Oszillation": "Oscillate", "Richtung": "Direction",
  "Entfeuchten": "Dry", "Lüften": "Fan only",
  "Jalousie": "Blind", "Vorhang": "Curtain", "Garage": "Garage", "Tür": "Door",
  "Tor": "Gate", "Fenster": "Window", "Markise": "Awning", "Rollo": "Shade",
  "Aktion wirklich ausführen?": "Really run this action?",
  // Editor: Aktionen-Abschnitt (übrige Action-Felder übersetzt HA selbst)
  "Aktionen": "Actions", "Tippen": "Tap", "Halten": "Hold", "Doppeltippen": "Double tap",
  // Editor: Sichtbarkeits-Schalter
  "Schalter anzeigen": "Show toggle", "Helligkeit anzeigen": "Show brightness",
  "Stufe anzeigen": "Show speed", "Voreinstellungen anzeigen": "Show presets",
  "Oszillation anzeigen": "Show oscillate", "Richtung anzeigen": "Show direction",
  "Auf/Stopp/Zu anzeigen": "Show open/stop/close", "Position anzeigen": "Show position",
  "Neigung anzeigen": "Show tilt", "Temperatur-Steuerung anzeigen": "Show temperature controls",
  "Modi anzeigen": "Show modes", "Lüftungsstufen anzeigen": "Show fan modes",
  "Schwenken anzeigen": "Show swing", "Luftfeuchte anzeigen": "Show humidity",
  "Transport anzeigen": "Show transport", "Lautstärke anzeigen": "Show volume",
  "Stumm anzeigen": "Show mute", "Quelle anzeigen": "Show source", "Power anzeigen": "Show power",
  "Bedienelemente anzeigen": "Show controls",
  "Unscharf": "Disarmed", "Zuhause": "Home", "Abwesend": "Away", "Alarm": "Alarm",
  "Scharf · Zuhause": "Armed · Home", "Scharf · Abwesend": "Armed · Away",
  "Scharf · Nacht": "Armed · Night", "Scharf · Urlaub": "Armed · Vacation",
  "Aktiviert …": "Arming …", "Eingang …": "Entry …", "ALARM": "ALARM",
  "Szene": "Scene", "Taster": "Button", "Skript": "Script", "Aktion": "Action",
  "an": "on",
  "Wert": "Value", "Kamera": "Camera", "Sensor": "Sensor", "Licht-Gruppe": "Light group",
  "Wähle einen Gerätetyp, um die Vorschau zu starten": "Pick a device type to start the preview",
  "Wähle einen Anzeige-Typ, um die Vorschau zu starten": "Pick a display type to start the preview",
  "Sensor / Wert": "Sensor / Value", "Batterie": "Battery", "Status": "Status",
  "Person / Anwesenheit": "Person / Presence", "Wetter": "Weather",
  "Kalender / Termin": "Calendar / Event", "Kalender": "Calendar", "Keine Termine": "No events",
  "Kennzahl": "Metric", "Titel (optional)": "Title (optional)",
  "Text / Markdown eingeben …": "Enter text / markdown …",
  // Wetter-Zustände (Display: Wetter-Typ)
  "Sonnig": "Sunny", "Klar": "Clear", "Bewölkt": "Cloudy", "Teils bewölkt": "Partly cloudy",
  "Regen": "Rain", "Starkregen": "Heavy rain", "Schnee": "Snow", "Schneeregen": "Sleet",
  "Windig": "Windy", "Nebel": "Fog", "Hagel": "Hail", "Gewitter": "Thunderstorm", "Extrem": "Severe",

  // ── Editor: Feld-Labels & Abschnitte (zentral in makeEditor übersetzt) ──
  "Allgemein": "General", "Darstellung": "Appearance",
  "Entität": "Entity", "Entität (Gerät)": "Entity (device)",
  "Name (optional)": "Name (optional)", "Untertitel (optional)": "Subtitle (optional)",
  "Icon": "Icon", "Icon (optional)": "Icon (optional)",
  "Akzentfarbe": "Accent color", "Akzentfarbe (optional)": "Accent color (optional)",
  "Einheit (optional)": "Unit (optional)", "Lichter": "Lights",
  "Temperaturschritt (optional)": "Temperature step (optional)",
  "Code (optional, falls erforderlich)": "Code (optional, if required)",
  "Typ": "Type", "Titel (bei Trenner optional)": "Title (optional for divider)",
  "Inhalt": "Content", "Titel": "Title",
  "Trenner-Label (optional)": "Divider label (optional)",
  "Layout / Gerät": "Layout / device",
  // Optionen
  "Blau": "Blue", "Amber": "Amber", "Mint": "Mint", "Violett": "Violet", "Rosé": "Rosé",
  "Automatisch (Bildschirmbreite)": "Automatic (screen width)",
  "Mobil (kompakt)": "Mobile (compact)", "Tablet": "Tablet", "Desktop (groß)": "Desktop (large)",
  "Überschrift": "Heading", "Trenner": "Divider",
  "Licht": "Light", "Szene / Skript / Taster": "Scene / Script / Button",
  // Karten-Namen & -Beschreibungen (Picker + Editor-Kopf)
  "Neo Steuerung": "Neo Control", "Neo Anzeige": "Neo Display",
  "Neo Ventilator": "Neo Fan", "Neo Kamera": "Neo Camera", "Neo Klima": "Neo Climate",
  "Neo Cover": "Neo Cover", "Neo Media": "Neo Media", "Neo Licht-Gruppe": "Neo Light Group",
  "Eine Karte für alle Geräte — passt sich automatisch an die Entität an":
    "One card for all devices — adapts automatically to the entity",
  "Eine Karte für alle Geräte — passt sich an": "One card for all devices — it adapts",
  "Sensorwert, Kamera oder Status — passt sich an die Entität an":
    "Sensor value, camera or status — adapts to the entity",
  "Sensor · Kamera · Status": "Sensor · Camera · Status",
  "Überschrift / Trenner zum Strukturieren": "Heading / divider for structure",
  "Überschrift / Trenner": "Heading / Divider",
  "Neo Karte": "Neo Card",
  // Store: Update/Entfernen/Info
  "Update": "Update", "Info": "Info",
  "Per Code eingefügt — Update durch erneutes Einfügen.": "Pasted code — update by pasting again.",
  "Entfernen fehlgeschlagen: {err}": "Removal failed: {err}",
  "Modul entfernt.": "Module removed.",
  "Karte entfernt — zum vollständigen Entladen einmal neu laden.":
    "Card removed — reload once to fully unload it.",
};

export function neoLang(hass) {
  return (hass && hass.language ? String(hass.language) : "en").slice(0, 2).toLowerCase();
}

// Übersetzt den deutschen Quelltext je nach HA-Sprache.
export function neoT(hass, de) {
  if (neoLang(hass) === "de") return de;
  return EN[de] || de;
}
