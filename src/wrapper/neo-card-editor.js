// Neo Card Editor — type picker + selected card's editor + card-scoped
// module manager + always-visible "Info & Support" panel.
import { NeoDashboardRegistry } from "../core/registry.js";
import { neoIcon } from "../core/icons.js";
import { NEO_LINKS } from "../core/links.js";
import { neoLogo } from "../core/branding.js";
import { NeoModules } from "../core/modules.js";
import { NeoStore } from "../store/module-store.js";
import { neoLoadModule } from "../store/module-loader.js";
import { neoT, neoLang } from "../core/i18n.js";
import { escapeAttr, escapeHtml, safeUrl } from "../core/html.js";

class NeoCardEditor extends HTMLElement {
  // Übersetzungs-Helfer: folgt der HA-Sprache (EN Standard, DE wenn HA Deutsch).
  _t(s) { return neoT(this._hass, s); }

  setConfig(config) {
    const incoming = { ...config };
    // Defensive: if a partial config arrives without card_type, keep ours.
    if (!incoming.card_type && this._config?.card_type) {
      incoming.card_type = this._config.card_type;
    }
    this._config = incoming;
    if (!this._built) this._build();
    else this._syncTypeForm();
  }
  set hass(h) {
    this._hass = h;
    NeoStore.setHass(h); // serverseitige Modul-Persistenz initialisieren
    if (this._typeForm) this._typeForm.hass = h;
    if (this._sub) this._sub.hass = h;
    (this._modForms || []).forEach((f) => { f.hass = h; });
    if (!this._installedLoaded) { this._installedLoaded = true; this._refreshInstalled(); }
    // Sprache der UI folgt HA. Ändert sie sich (oder erstes hass), neu aufbauen.
    const lang = neoLang(h);
    if (this._builtLang !== lang) { this._builtLang = lang; if (this._built) this._build(); }
  }

  // Re-render der Editor-Sektionen, wenn Karten/Module registriert, aktualisiert
  // oder entfernt werden (Store-Install, Code einfügen, Entfernen, Live-Update).
  connectedCallback() {
    this._onMods = () => this._scheduleReactiveRefresh();
    window.addEventListener("neo-module-changed", this._onMods);
    window.addEventListener("neo-modules-loaded", this._onMods);
  }
  disconnectedCallback() {
    window.removeEventListener("neo-module-changed", this._onMods);
    window.removeEventListener("neo-modules-loaded", this._onMods);
  }

  // Aktualisiert Kartentyp-Picker + Modul-Sektion sofort, aber sicher & sparsam:
  // mehrere Events im selben Frame werden zu EINEM Rebuild zusammengefasst (rAF),
  // und der Picker wird nie neu gebaut, während sein Dropdown offen ist (es würde
  // sonst zuklappen).
  _scheduleReactiveRefresh() {
    if (this._refreshScheduled) return;
    this._refreshScheduled = true;
    requestAnimationFrame(() => {
      this._refreshScheduled = false;
      if (!this._built) return;
      if (this._typeBox && !this._typeMenuOpen) this._renderTypePicker();
      this._renderModulesSection();
    });
  }

  _build() {
    this._built = true;
    this.innerHTML = "";

    // Neo-Editor-Shell: geführte Sektionen im Glas-Design (USP — der Editor
    // trägt dieselbe Designsprache wie die Karten, nicht das generische HA-Grau).
    this._root = document.createElement("div");
    this._root.className = "neo-ed";
    this._root.innerHTML = this._shellStyles();
    this.appendChild(this._root);

    // ── Sektion 1: Kartentyp (eigener, gruppierter & suchbarer Picker) ──
    const typeSec = document.createElement("div");
    typeSec.className = "neo-ed-sec";
    typeSec.innerHTML =
      `<div class="neo-ed-sec-h"><span class="neo-ed-sec-ic">${neoIcon("grid", { size: 15, color: "currentColor" })}</span>${this._t("Kartentyp")}</div>`;
    this._typeBox = document.createElement("div");
    typeSec.appendChild(this._typeBox);
    this._root.appendChild(typeSec);
    this._renderTypePicker();

    // ── Geführter Hinweis / branded Landing (nur ohne Auswahl) ──
    this._hintBox = document.createElement("div");
    this._root.appendChild(this._hintBox);

    // ── Sektion 2: Einstellungen der gewählten Karte (nur mit Auswahl) ──
    this._settingsSec = document.createElement("div");
    this._settingsSec.className = "neo-ed-sec";
    this._settingsSec.innerHTML =
      `<div class="neo-ed-sec-h"><span class="neo-ed-sec-ic">${neoIcon("settings", { size: 15, color: "currentColor" })}</span>${this._t("Einstellungen")}</div>`;
    this._subContainer = document.createElement("div");
    this._settingsSec.appendChild(this._subContainer);
    this._root.appendChild(this._settingsSec);

    // ── Sektion 3: Karten-gebundene Module (style/decorate-Hooks) ──
    this._modPanel = document.createElement("div");
    this._root.appendChild(this._modPanel);
    this._renderModulesSection();

    // ── Info & Support panel (immer sichtbar — kein Aufklappen) ──
    const info = document.createElement("div");
    info.innerHTML = this._infoPanelHtml();
    this._root.appendChild(info);

    this._mountSub();
    this._updateGuidedState();
    this._builtLang = neoLang(this._hass); // verhindert unnötigen Rebuild beim 1. hass
  }

  // Einheitliche Glas-Optik für die Editor-Sektionen (Neo-Designsprache).
  _shellStyles() {
    return `<style>
      .neo-ed { display:flex; flex-direction:column; gap:12px; }
      .neo-ed-sec { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:14px;
        padding:12px 14px 14px; background:var(--neo-fill1,rgba(255,255,255,.03)); }
      .neo-ed-sec-h { display:flex; align-items:center; gap:8px; margin:0 0 10px;
        font-size:11.5px; font-weight:700; letter-spacing:.6px; text-transform:uppercase;
        color:var(--secondary-text-color,rgba(244,246,251,.72)); }
      .neo-ed-sec-ic { display:flex; color:var(--primary-color,#7C9CFF); }
      .neo-ed-landing { display:flex; flex-direction:column; align-items:center; text-align:center;
        gap:8px; padding:22px 18px; border-radius:16px;
        background:linear-gradient(160deg, rgba(124,156,255,.14) 0%, var(--neo-fill1,rgba(255,255,255,.03)) 70%);
        border:1px solid rgba(124,156,255,.24); }
      .neo-ed-landing-logo { line-height:0; filter:drop-shadow(0 6px 16px rgba(124,156,255,.35)); }
      .neo-ed-landing-title { font-size:17px; font-weight:700; color:var(--primary-text-color,#F4F6FB);
        letter-spacing:-.2px; }
      .neo-ed-landing-ver { font-size:11.5px; font-weight:700; letter-spacing:.4px; padding:2px 9px;
        border-radius:999px; color:#7C9CFF; background:rgba(124,156,255,.14); border:1px solid rgba(124,156,255,.34); }
      .neo-ed-landing-desc { font-size:13px; line-height:1.5; max-width:300px;
        color:var(--secondary-text-color,rgba(244,246,251,.72)); }
      .neo-ed-landing-desc b { color:var(--primary-text-color,#F4F6FB); }
    </style>`;
  }

  // Zeigt/versteckt Hinweis + Einstellungs-Sektion je nach Auswahl.
  _updateGuidedState() {
    const hasType = !!this._config.card_type;
    if (this._settingsSec) this._settingsSec.style.display = hasType ? "" : "none";
    // Die Modul-/Erweiterungs-Sektion bleibt IMMER sichtbar — so erreicht man
    // den Store / "Code einfügen" auch ohne vorher einen Kartentyp zu wählen.
    if (this._hintBox) {
      const ver = (window.NeoDashboard && window.NeoDashboard.version) || "";
      this._hintBox.innerHTML = hasType ? "" : `
        <div class="neo-ed-landing">
          <div class="neo-ed-landing-logo">${neoLogo({ size: 60, radius: 18 })}</div>
          <div class="neo-ed-landing-title">Neo Dashboard Kit</div>
          ${ver ? `<div class="neo-ed-landing-ver">v${ver}</div>` : ""}
          <div class="neo-ed-landing-desc">${this._t("Glassmorphism-Karten für dein Dashboard. Wähle oben einen <b>Kartentyp</b> — danach erscheinen hier die Einstellungen und rechts die Live-Vorschau.")}</div>
        </div>`;
    }
  }

  // ── Karten-gebundene Module ──────────────────────────────────
  // Zeigt nur Module, deren target zur aktuellen Karte passt. Aktivierte
  // Module + ihre Einstellungen landen in config.modules ([{ id, settings }])
  // und werden von der Karte über die style/decorate-Hooks live angewandt.
  _enabledList() { return Array.isArray(this._config.modules) ? this._config.modules : []; }
  _isModEnabled(id) { return this._enabledList().some((m) => m.id === id); }
  _modSettings(id) { return this._enabledList().find((m) => m.id === id)?.settings || {}; }

  _isInstalled(id) { return (this._installed || new Set()).has(id); }

  _renderModulesSection() {
    if (!this._modPanel) return;
    this._modForms = [];
    const type = this._config.card_type;
    this._renderedModType = type; // merken, um unnötige Rebuilds zu vermeiden
    const available = type ? NeoModules.forCard(type) : [];

    // Ohne Kartentyp = globale "Erweiterungen" (Karten & Module installieren,
    // direkt von der Startseite). Mit Kartentyp = "Module" für diese Karte.
    const heading = type ? `${this._t("Module")}${available.length ? ` (${available.length})` : ""}` : this._t("Erweiterungen");
    const emptyText = type
      ? this._t("Für diese Karte sind noch keine Module aktiv. Über <b>➕ Modul hinzufügen</b> kommst du zum Store.")
      : this._t("<b>Karten</b> &amp; <b>Module</b> installieren (Store oder Code einfügen) — oder oben einen <b>Kartentyp</b> wählen, um Module für eine Karte zu aktivieren.");

    this._modPanel.innerHTML = `
      ${this._modStyles()}
      <div class="nmod">
        <div class="nmod-h"><span>🧩</span> ${heading}</div>
        ${type && available.length ? `<div class="nmod-list"></div>` : `<div class="nmod-empty">${emptyText}</div>`}
        <div class="nmod-add" id="nmod-add"></div>
      </div>`;

    // Aktive Module zuerst (in Layer-Reihenfolge = config.modules), dann inaktive.
    // Aktive Module mit Einstellungen werden als Accordion gezeigt: nur das
    // geöffnete Modul blendet seine Settings ein (kompakte, kurze Liste).
    const list = this._modPanel.querySelector(".nmod-list");
    if (list) {
      const byId = new Map(available.map((m) => [m.id, m]));
      const active = this._enabledList().map((e) => byId.get(e.id)).filter(Boolean);
      const inactive = available.filter((m) => !this._isModEnabled(m.id));
      const activeWithCfg = active.filter((m) => Array.isArray(m.config) && m.config.length);
      const openId = this._effectiveOpenId(activeWithCfg);
      if (active.length) {
        const hint = document.createElement("div");
        hint.className = "nmod-hint";
        hint.textContent = this._t("Aktive Module — klicke ein Modul an, um die Einstellungen zu bearbeiten.");
        list.appendChild(hint);
      }
      active.forEach((mod, i) => this._renderModItem(list, mod, {
        active: true, reorder: active.length > 1, canUp: i > 0, canDown: i < active.length - 1,
        open: openId === mod.id,
      }));
      inactive.forEach((mod) => this._renderModItem(list, mod, { active: false }));
    }
    this._renderAddArea();
  }

  // Welches aktive Modul ist aufgeklappt? `_openModuleId` ist vom Nutzer
  // gesteuert (id oder null = alles zu). Solange unberührt (undefined) wird bei
  // genau einem konfigurierbaren aktiven Modul dieses automatisch geöffnet.
  _effectiveOpenId(activeWithCfg) {
    if (this._openModuleId !== undefined) return this._openModuleId;
    return activeWithCfg.length === 1 ? activeWithCfg[0].id : null;
  }

  // Accordion umschalten (reine UI — keine Config-Änderung).
  _toggleAccordion(id, isOpen) {
    this._openModuleId = isOpen ? null : id;
    this._renderModulesSection();
  }

  _renderModItem(list, mod, opts) {
    opts = opts || {};
    const on = !!opts.active;
    const expandable = on && Array.isArray(mod.config) && mod.config.length;
    const isOpen = expandable && !!opts.open;
    const item = document.createElement("div");
    item.className = "nmod-item";
    const badge = mod.author ? this._authorChip(mod.author) : "";
    const active = on ? `<span class="nmod-badge">${this._t("Aktiv")}</span>` : "";
    const rm = this._isInstalled(mod.id)
      ? `<button class="nmod-rm" title="${escapeAttr(this._t("Modul entfernen"))}" data-rm="${escapeAttr(mod.id)}">${neoIcon("trash", { size: 15, color: "currentColor" })}</button>`
      : "";
    const move = opts.reorder
      ? `<div class="nmod-move">
           <button data-up title="${this._t("Layer nach oben")}" ${opts.canUp ? "" : "disabled"}>▲</button>
           <button data-down title="${this._t("Layer nach unten")}" ${opts.canDown ? "" : "disabled"}>▼</button>
         </div>`
      : "";
    const chev = expandable
      ? `<span class="nmod-chev ${isOpen ? "open" : ""}">${neoIcon("chevD", { size: 16, color: "currentColor" })}</span>`
      : "";
    item.innerHTML = `
      <div class="nmod-row ${expandable ? "nmod-row--exp" : ""}">
        ${move}
        <span class="nmod-ic">${escapeHtml(mod.icon || "🧩")}</span>
        <div class="nmod-meta">
          <div class="nmod-name">${escapeHtml(mod.name || mod.id)}${badge}${active}</div>
          ${mod.description ? `<div class="nmod-desc">${escapeHtml(mod.description)}</div>` : ""}
        </div>
        ${rm}
        <label class="nmod-sw">
          <input type="checkbox" ${on ? "checked" : ""} />
          <span class="nmod-track"></span><span class="nmod-knob"></span>
        </label>
        ${chev}
      </div>
      ${isOpen ? `<div class="nmod-cfg"></div>` : ""}`;
    list.appendChild(item);

    item.querySelector("input[type=checkbox]")
      .addEventListener("change", (e) => this._toggleModule(mod, e.target.checked));
    item.querySelector("[data-rm]")?.addEventListener("click", (e) => { e.stopPropagation(); this._removeInstalled(mod.id); });
    item.querySelector("[data-up]")?.addEventListener("click", (e) => { e.stopPropagation(); this._moveModule(mod.id, -1); });
    item.querySelector("[data-down]")?.addEventListener("click", (e) => { e.stopPropagation(); this._moveModule(mod.id, 1); });

    // Accordion: Klick auf die Kopfzeile öffnet/schließt das Panel. Klicks auf
    // Schalter, Entfernen oder Reorder lösen den Accordion NICHT aus.
    if (expandable) {
      item.querySelector(".nmod-row").addEventListener("click", (e) => {
        if (e.target.closest(".nmod-sw, .nmod-rm, .nmod-move")) return;
        this._toggleAccordion(mod.id, isOpen);
      });
    }

    if (isOpen) {
      const form = document.createElement("ha-form");
      form.schema = mod.config;
      form.data = this._modSettings(mod.id);
      if (this._hass) form.hass = this._hass;
      form.computeLabel = (s) => s.label || s.name;
      form.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        this._setModuleSettings(mod.id, e.detail.value);
      });
      item.querySelector(".nmod-cfg").appendChild(form);
      this._modForms.push(form);
    }
  }

  _toggleModule(mod, on) {
    const list = this._enabledList().slice();
    const idx = list.findIndex((m) => m.id === mod.id);
    if (on && idx < 0) {
      list.push({ id: mod.id, settings: {} });
      // Frisch aktiviertes Modul mit Einstellungen automatisch aufklappen.
      if (Array.isArray(mod.config) && mod.config.length) this._openModuleId = mod.id;
    } else if (!on && idx >= 0) {
      list.splice(idx, 1);
      if (this._openModuleId === mod.id) this._openModuleId = null;
    }
    this._config = { ...this._config };
    if (list.length) this._config.modules = list;
    else delete this._config.modules;
    this._renderModulesSection();
    this._fire();
  }

  _setModuleSettings(id, settings) {
    const list = this._enabledList().map((m) => (m.id === id ? { ...m, settings } : m));
    this._config = { ...this._config, modules: list };
    this._fire(); // kein Re-Render → Eingabefokus bleibt erhalten
  }

  // Layer-Reihenfolge per ▲▼ ändern (Reihenfolge = Anwendungsreihenfolge).
  _moveModule(id, dir) {
    const list = this._enabledList().slice();
    const i = list.findIndex((m) => m.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    this._config = { ...this._config, modules: list };
    this._renderModulesSection();
    this._fire();
  }

  // ── Modul hinzufügen: Store (CDN-Index, kartengefiltert) + Code einfügen ──
  async _refreshInstalled() {
    if (!NeoStore.available()) { this._installed = new Set(); return; }
    try {
      const mods = await NeoStore.list();
      this._installed = new Set(mods.map((m) => m.name));
    } catch (e) { this._installed = new Set(); }
    this._renderModulesSection();
  }

  // Katalog-Einträge, gefiltert nach aktueller Karte (auf der Startseite: alle).
  _catalog() {
    const type = this._config.card_type;
    // Karten (kind:"card") sind eigenständige neue Kartentypen → immer zeigen.
    // Nur Module werden nach der aktuell gewählten Karte (target) gefiltert.
    return (this._storeItems || []).filter(
      (it) => it.kind === "card" || !type || NeoModules.matches(it.target, type),
    );
  }
  // Meta eines installierten Add-ons aus der Karten- bzw. Modul-Registry.
  _addonMeta(id) {
    const isCard = !!NeoDashboardRegistry.getCard(id);
    const meta = NeoDashboardRegistry.getMeta(id) || {};
    const mod = NeoModules.get(id);
    return {
      isCard,
      name: meta.name || mod?.name || id,
      icon: meta.icon || mod?.icon,
      author: meta.author || mod?.author,
      version: meta.version || mod?.version,
    };
  }
  // Vergleicht Versionsstrings (a > b?), z. B. "1.4.0" > "1.3.9".
  _verGt(a, b) {
    if (!a || !b) return false;
    const pa = String(a).split("."), pb = String(b).split(".");
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const x = parseInt(pa[i], 10) || 0, y = parseInt(pb[i], 10) || 0;
      if (x !== y) return x > y;
    }
    return false;
  }
  // Autor als farbiger Chip (Premium=Gold, Community=Türkis, sonst Standard) —
  // damit Herkunft/Vertrauen auf einen Blick erkennbar ist.
  _authorChip(author) {
    const a = author || "?";
    const cls = a === "Premium" ? "premium" : a === "Community" ? "community" : "standard";
    return `<span class="nmod-auth ${escapeAttr(cls)}">👤 ${escapeHtml(a)}</span>`;
  }
  // Kleine Vorschau: echtes Screenshot-Bild (image-Feld) ODER eine Icon-Kachel
  // als Fallback, damit jeder Eintrag visuell erkennbar ist.
  _previewTile(o) {
    const image = safeUrl(o.image);
    return image
      ? `<div class="nmod-prev"><img src="${escapeAttr(image)}" loading="lazy" alt="" /></div>`
      : `<div class="nmod-prev nmod-prev--icon"><span>${escapeHtml(o.icon || "🧩")}</span></div>`;
  }
  _storeRow(o) {
    const homepage = safeUrl(o.homepage);
    const status = o.installed
      ? (o.update
          ? ` <span class="nmod-badge upd">⬆ ${this._t("Update")} → v${escapeHtml(o.update)}</span>`
          : ` <span class="nmod-badge ok">${this._t("✓ Installiert")}</span>`)
      : "";
    return `<div class="nmod-store">
        ${this._previewTile(o)}
        <div class="nmod-store-h">
          <span class="nmod-ic">${escapeHtml(o.icon || "🧩")}</span>
          <div class="nmod-meta">
            <div class="nmod-name">${escapeHtml(o.name)} <span class="nmod-badge">${this._t(o.kind)}</span>${status}</div>
            <div class="nmod-sub">${this._authorChip(o.author)}${o.version ? `<span class="nmod-ver">v${escapeHtml(o.version)}</span>` : ""}</div>
          </div>
        </div>
        ${o.description ? `<div class="nmod-desc" style="margin-top:8px;">${escapeHtml(o.description)}</div>` : ""}
        <div class="nmod-store-row">
          ${o.installId ? `<button class="nmod-mini" data-install-id="${escapeAttr(o.installId)}">${this._t(o.installLabel)}</button>` : ""}
          ${o.uninstallId ? `<button class="nmod-mini ghost" data-uninstall="${escapeAttr(o.uninstallId)}">${this._t("Entfernen")}</button>` : ""}
          ${homepage ? `<a class="nmod-mini ghost" href="${escapeAttr(homepage)}" target="_blank" rel="noopener" style="text-decoration:none;">${this._t("Info")}</a>` : ""}
        </div>
        ${o.note ? `<div class="nmod-note" style="margin:6px 0 0;">${escapeHtml(o.note)}</div>` : ""}
      </div>`;
  }

  _renderAddArea() {
    const host = this._modPanel.querySelector("#nmod-add");
    if (!host) return;
    // Auf der Startseite (kein Kartentyp) standardmäßig aufgeklappt — der
    // Installations-Weg soll sofort sichtbar sein, nicht versteckt.
    const open = this._addOpen ?? !this._config.card_type;
    const tab = this._addTab || "store";
    const label = this._config.card_type ? this._t("Modul hinzufügen") : this._t("Karte oder Modul installieren");
    host.innerHTML = `
      <button class="nmod-addbtn" id="nmod-addbtn">${open ? "▾" : "➕"} ${label}</button>
      <div class="nmod-addbody" style="display:${open ? "block" : "none"}">
        <div class="nmod-tabs">
          <div class="nmod-tab ${tab === "store" ? "active" : ""}" data-tab="store">${this._t("Store")}</div>
          <div class="nmod-tab ${tab === "paste" ? "active" : ""}" data-tab="paste">${this._t("Code einfügen")}</div>
        </div>
        <div class="nmod-tabbody">${tab === "store" ? this._storeHtml() : this._pasteHtml()}</div>
        <div class="nmod-msg" id="nmod-msg"></div>
      </div>`;

    host.querySelector("#nmod-addbtn").addEventListener("click", () => {
      this._addOpen = !open;
      this._renderAddArea();
      if (this._addOpen && (this._addTab || "store") === "store" && !this._storeItems) this._loadStoreIndex();
    });
    host.querySelectorAll(".nmod-tab").forEach((t) =>
      t.addEventListener("click", () => {
        this._addTab = t.getAttribute("data-tab");
        this._renderAddArea();
        if (this._addTab === "store" && !this._storeItems) this._loadStoreIndex();
      }));
    this._wireAddArea();
    // Auto-Laden, wenn die Add-Area (z. B. auf der Startseite) offen startet.
    if (open && tab === "store" && !this._storeItems && !this._storeLoading) this._loadStoreIndex();
  }

  // Persistenter Kopf des Store-Tabs: Titel + dauerhaft sichtbarer
  // "Store aktualisieren"-Button (lädt den Live-Katalog mit Cache-Bust neu).
  _storeBar() {
    return `<div class="nmod-storebar">
        <span class="nmod-storebar-t">${this._t("Offizieller Store")}</span>
        <button class="nmod-mini ghost" id="nmod-refresh" ${this._storeLoading ? "disabled" : ""}>⟳ ${this._t("Store aktualisieren")}</button>
      </div>`;
  }

  // Kompakter, dezenter Sicherheitshinweis vor der Installation.
  _storeWarn() {
    return `<div class="nmod-warn">🛈 ${this._t("Erweiterungen führen JavaScript in Home Assistant aus. Installiere nur vertrauenswürdige Erweiterungen.")}</div>`;
  }
  // Link zu GitHub Discussions — reiner Vorschlag/Showcase, KEINE Installquelle.
  _storeSuggest() {
    return `<a class="nmod-suggest" href="${escapeAttr(NEO_LINKS.newDiscussion)}" target="_blank" rel="noopener">💬 ${this._t("Community-Beitrag vorschlagen")}</a>`;
  }
  // Ruhiger Lade-Zustand: ein paar Platzhalter-Kacheln statt Progress-Screen.
  _storeSkeleton() {
    const tile = `<div class="nmod-skel">
        <div class="nmod-skel-prev"></div>
        <div class="nmod-skel-line w60"></div>
        <div class="nmod-skel-line w35"></div>
      </div>`;
    return `<div class="nmod-skelwrap">${tile.repeat(3)}</div>
      <div class="nmod-note nmod-note--muted">${this._t("Store wird aktualisiert …")}</div>`;
  }

  _storeHtml() {
    const bar = this._storeBar();
    if (!NeoStore.available()) {
      return bar + `<div class="nmod-note">${this._t("⚠️ Für den Store wird die Integration <b>Neo Dashboard Tools</b> benötigt (serverseitiges Speichern + Laden).")}</div>` + this._storeSuggest();
    }
    if (this._storeLoading) return bar + this._storeSkeleton();
    if (this._storeErr) return bar + `<div class="nmod-note nmod-note--err">${this._t(this._storeErr)}</div>` + this._storeSuggest();

    // Katalog (offizieller Store) + installierte Add-ons, die NICHT im Katalog
    // sind (z. B. eingefügte Premium-Karten) — getrennt dargestellt.
    const catalog = this._catalog();
    const seen = new Set(catalog.map((c) => c.id));
    const extra = Array.from(this._installed || []).filter((id) => !seen.has(id));
    if (!catalog.length && !extra.length) {
      return bar + `<div class="nmod-note">${this._t("Aktuell keine Store-Module verfügbar. Premium-Karten (z. B. Wetter) fügst du über <b>Code einfügen</b> hinzu.")}</div>` + this._storeSuggest();
    }

    const catalogRows = catalog.map((it) => {
      const installed = this._isInstalled(it.id);
      const reg = this._addonMeta(it.id);
      const update = installed && this._verGt(it.version, reg.version) ? it.version : null;
      const showInstall = !installed || !!update; // installiert & aktuell → nur Entfernen/Info
      return this._storeRow({
        icon: it.icon || reg.icon, name: it.name || it.id, author: it.author || reg.author,
        version: (installed && reg.version) || it.version, kind: (reg.isCard || it.kind === "card") ? "Karte" : "Modul",
        installed, update, homepage: it.homepage || it.repo, image: it.image, description: it.description,
        // Per ID referenzieren (nicht Index) — bleibt korrekt, wenn sich die
        // gefilterte Liste zwischen Render und Klick ändert.
        installId: showInstall ? it.id : "", installLabel: installed ? "Aktualisieren" : "Installieren",
        uninstallId: installed ? it.id : null,
      });
    });
    // Installierte ohne Katalog-Eintrag (z. B. per Code eingefügt) — eigene,
    // klar abgegrenzte Sektion; keine Store-Quelle zum Aktualisieren.
    const extraRows = extra.map((id) => {
      const reg = this._addonMeta(id);
      return this._storeRow({
        icon: reg.icon, name: reg.name, author: reg.author, version: reg.version,
        kind: reg.isCard ? "Karte" : "Modul", installed: true, uninstallId: id,
        note: this._t("Per Code eingefügt — Update durch erneutes Einfügen."),
      });
    });

    return bar
      + this._storeWarn()
      + (catalogRows.length ? catalogRows.join("") : "")
      + (extraRows.length ? `<div class="nmod-subh">${this._t("Installiert (per Code eingefügt)")}</div>` + extraRows.join("") : "")
      + this._storeSuggest();
  }

  _pasteHtml() {
    // Klarstellung: dieser Weg ist für Premium-/privat geprüften Code — NICHT
    // der öffentliche Store. Installation aus dem Store bleibt der kuratierte Weg.
    const intro = `<div class="nmod-note nmod-note--muted">${this._t("Für Premium-Code (z. B. Patreon) oder privat geprüften Test-Code. Wird nicht über den öffentlichen Store verteilt.")}</div>`;
    const note = NeoStore.available()
      ? ""
      : `<div class="nmod-note">${this._t("ℹ️ Ohne <b>Neo Dashboard Tools</b> wird das Modul nur für diese Sitzung geladen (nicht dauerhaft gespeichert).")}</div>`;
    return `${intro}${note}
      <textarea id="nmod-code" placeholder="${escapeAttr(this._t("Modul- oder Karten-Code einfügen (registerModule / registerCard, z. B. Premium-Karten) …"))}"></textarea>
      <button class="nmod-mini" id="nmod-paste-add">${this._t("Hinzufügen")}</button>`;
  }

  _wireAddArea() {
    const q = (s) => this._modPanel.querySelector(s);
    // "Store aktualisieren" — Cache leeren und Live-Katalog neu laden (auch Retry).
    q("#nmod-refresh")?.addEventListener("click", () => { this._storeItems = null; this._storeErr = null; this._loadStoreIndex(); });
    q("#nmod-paste-add")?.addEventListener("click", () => {
      const code = (q("#nmod-code").value || "").trim();
      this._pasteModule(code);
    });
    this._modPanel.querySelectorAll("[data-install-id]").forEach((b) =>
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-install-id");
        this._installFromStore((this._storeItems || []).find((it) => it.id === id));
      }));
    this._modPanel.querySelectorAll("[data-uninstall]").forEach((b) =>
      b.addEventListener("click", () => this._removeInstalled(b.getAttribute("data-uninstall"))));
  }

  _msg(text, err) {
    const m = this._modPanel.querySelector("#nmod-msg");
    if (m) { m.style.color = err ? "var(--error-color,#F87171)" : "var(--success-color,#5EDCB8)"; m.textContent = text; }
  }

  async _loadStoreIndex() {
    if (!NeoStore.available()) { this._renderAddArea(); return; }
    // Mindest-Sichtbarkeit des Skeleton-States: Der serverseitige Fetch ist oft
    // <50 ms (Cache) — ohne Mindestzeit würde der Lade-Zustand nur aufblitzen.
    // 400 ms geben ruhiges, klares Feedback, ohne sich künstlich langsam
    // anzufühlen. (Betrifft Timing, nicht Animation — Shimmer respektiert
    // prefers-reduced-motion weiterhin per CSS.)
    const MIN_SKELETON_MS = 400;
    const started = Date.now();
    this._storeLoading = true; this._storeErr = null; this._renderAddArea();
    try {
      // Cache-Busting: erzwingt den frischen Live-Katalog (raw.githubusercontent),
      // damit frisch gemergte Einträge ohne Release/Bundle sofort erscheinen.
      const sep = NEO_LINKS.modulesIndex.includes("?") ? "&" : "?";
      const txt = await NeoStore.fetch(`${NEO_LINKS.modulesIndex}${sep}t=${Date.now()}`);
      let data;
      try {
        data = JSON.parse(txt);
      } catch (_e) {
        throw new Error("invalid JSON");
      }
      const rawItems = Array.isArray(data)
        ? data
        : (Array.isArray(data?.modules) ? data.modules : []);
      this._storeItems = this._normalizeStoreItems(rawItems);
    } catch (e) {
      this._storeItems = [];
      this._storeErr = "Store-Index konnte nicht geladen werden. Prüfe die Internetverbindung und versuche es erneut.";
    }
    // Schnelle Antworten trotzdem kurz als Lade-Zustand zeigen; langsame nicht
    // zusätzlich verzögern.
    const remaining = MIN_SKELETON_MS - (Date.now() - started);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
    this._storeLoading = false;
    this._renderAddArea();
  }

  // Defensive parsing: keep the store usable even if a single catalog entry is
  // broken. Invalid items are skipped (with a console warning) instead of
  // breaking the whole list. Items with a missing required field, a bad id, or
  // a foreign/invalid url are never shown or installable. Mirrors the CI rules
  // in scripts/validate-store.mjs (lightweight client-side copy).
  _normalizeStoreItems(items) {
    if (!Array.isArray(items)) {
      console.warn("[Neo Store] index is not an array — ignoring.");
      return [];
    }
    const PREFIX = "https://cdn.jsdelivr.net/gh/bkstudy2025/neo-dashboard-kit@";
    const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const REQUIRED = ["id", "name", "description", "target", "author", "version", "icon", "url"];
    const out = [];
    const seen = new Set();
    items.forEach((it, i) => {
      if (!it || typeof it !== "object" || Array.isArray(it)) {
        console.warn(`[Neo Store] item[${i}] is not an object — skipped.`);
        return;
      }
      const ref = (typeof it.id === "string" && it.id) ? it.id : `item[${i}]`;
      const missing = REQUIRED.filter((f) => typeof it[f] !== "string" || !it[f].trim());
      if (missing.length) {
        console.warn(`[Neo Store] "${ref}" skipped — missing field(s): ${missing.join(", ")}.`);
        return;
      }
      if (!ID_RE.test(it.id)) {
        console.warn(`[Neo Store] "${ref}" skipped — invalid id (need lowercase kebab-case).`);
        return;
      }
      if (seen.has(it.id)) {
        console.warn(`[Neo Store] "${ref}" skipped — duplicate id.`);
        return;
      }
      if (it.kind !== undefined && it.kind !== "module" && it.kind !== "card") {
        console.warn(`[Neo Store] "${ref}" skipped — invalid kind "${it.kind}".`);
        return;
      }
      if (!it.url.startsWith(PREFIX) || !it.url.endsWith(`/store/modules/${it.id}.js`)) {
        console.warn(`[Neo Store] "${ref}" skipped — url not allowed: ${it.url}`);
        return;
      }
      seen.add(it.id);
      out.push(it);
    });
    return out;
  }

  async _installFromStore(item) {
    if (!item) return;
    this._msg(this._t("Installiere …"));
    try {
      const code = await NeoStore.fetch(item.url);
      const res = neoLoadModule(code); // registriert das Modul sofort
      if (!res.ok) throw new Error("Code-Fehler");
      if (NeoStore.available()) await NeoStore.save(item.id, code);
      await this._refreshInstalled();
      this._msg(this._t("✓ „{name}” installiert.").replace("{name}", item.name || item.id));
    } catch (e) {
      this._msg(this._t("Installation fehlgeschlagen: {err}").replace("{err}", e?.message || e), true);
    }
  }

  async _pasteModule(code) {
    if (!code) return this._msg(this._t("Bitte Code einfügen."), true);
    // Snapshot existing IDs so we can tell a NEW install from an UPDATE.
    const modsBefore = new Set(NeoModules.list().map((m) => m.id));
    const cardsBefore = new Set(NeoDashboardRegistry.list().map((c) => c.type));
    const res = neoLoadModule(code);
    if (!res.ok) return this._msg(this._t("Code konnte nicht geladen werden."), true);
    // registerCard → res.cards, registerModule → res.modules (no cross-mapping),
    // so a module update is never mistaken for a card.
    const card = (res.cards || [])[0];
    const mod = (res.modules || [])[0];
    if (!card && !mod) {
      return this._msg(this._t("Kein Modul/Karte erkannt (registerModule/registerCard fehlt?)."), true);
    }
    const id = card?.type || mod?.id || `neo-${Date.now()}`;
    try {
      if (NeoStore.available()) await NeoStore.save(id, code);
      await this._refreshInstalled();
      this._renderTypePicker(); // neue/aktualisierte Karten sofort im Kartentyp-Dropdown
      let msg;
      if (card) {
        const name = card.name || card.type;
        msg = cardsBefore.has(card.type)
          ? this._t("✓ Karte „{name}” aktualisiert.").replace("{name}", name)
          : this._t("✓ Karte „{name}” hinzugefügt — oben im Kartentyp wählbar.").replace("{name}", name);
      } else {
        const name = mod.name || mod.id;
        msg = modsBefore.has(mod.id)
          ? this._t("✓ Modul „{name}” aktualisiert.").replace("{name}", name)
          : this._t("✓ Modul „{name}” hinzugefügt.").replace("{name}", name);
      }
      this._msg(msg);
    } catch (e) {
      this._msg(this._t("Speichern fehlgeschlagen: {err}").replace("{err}", e?.message || e), true);
    }
  }

  async _removeInstalled(id) {
    const isCard = !!NeoDashboardRegistry.getCard(id);
    // Serverseitig löschen — Fehler sichtbar machen (nicht verschlucken).
    if (NeoStore.available()) {
      try { await NeoStore.delete(id); }
      catch (e) { return this._msg(this._t("Entfernen fehlgeschlagen: {err}").replace("{err}", e?.message || e), true); }
    }
    // Sofort live aus der Registry nehmen — beide feuern "neo-module-changed",
    // wodurch Picker + Modul-Sektion umgehend (und sicher) aktualisiert werden.
    // Karten lassen sich später erneut installieren (versionierte Tags).
    if (isCard) NeoDashboardRegistry.unregisterCard(id);
    else if (NeoModules.get(id)) NeoModules.unregister(id);
    // War die entfernte Karte gerade ausgewählt, Auswahl zurücksetzen.
    if (isCard && this._config.card_type === id) {
      this._config = { type: this._config.type };
      this._mountSub();
      this._updateGuidedState();
      this._fire();
    }
    // Aus der aktiven Konfiguration nehmen, falls als Modul aktiviert.
    if (this._isModEnabled(id)) {
      const list = this._enabledList().filter((m) => m.id !== id);
      this._config = { ...this._config };
      if (list.length) this._config.modules = list; else delete this._config.modules;
      if (this._openModuleId === id) this._openModuleId = null;
      this._fire();
    }
    await this._refreshInstalled();
    this._msg(this._t(isCard ? "Karte entfernt." : "Modul entfernt."));
  }

  _modStyles() {
    return `
      <style>
        .nmod { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:14px; padding:12px 14px 6px;
          background:var(--neo-fill1,rgba(255,255,255,.03)); }
        .nmod-h { display:flex; align-items:center; gap:8px; margin:0 0 4px;
          font-size:11.5px; font-weight:700; letter-spacing:.6px; text-transform:uppercase;
          color:var(--secondary-text-color,rgba(244,246,251,.72)); }
        .nmod-empty { font-size:12.5px; color:var(--secondary-text-color); padding:6px 0 10px; line-height:1.45; }
        .nmod-item { border-top:1px solid var(--divider-color,rgba(255,255,255,.08)); padding:11px 0; }
        .nmod-item:first-of-type { border-top:0; }
        .nmod-row { display:flex; align-items:flex-start; gap:10px; }
        .nmod-ic { font-size:18px; line-height:1.2; flex-shrink:0; }
        .nmod-meta { flex:1; min-width:0; }
        .nmod-name { font-size:13.5px; font-weight:600; color:var(--primary-text-color); display:flex; align-items:center; gap:6px; }
        .nmod-desc { font-size:12px; color:var(--secondary-text-color); margin-top:2px; line-height:1.4; }
        .nmod-badge { font-size:10px; font-weight:700; padding:1px 6px; border-radius:999px;
          color:#7C9CFF; background:rgba(124,156,255,.14); border:1px solid rgba(124,156,255,.3); }
        .nmod-sw { position:relative; width:38px; height:22px; flex-shrink:0; cursor:pointer; }
        .nmod-sw input { position:absolute; opacity:0; width:100%; height:100%; margin:0; cursor:pointer; }
        .nmod-track { position:absolute; inset:0; border-radius:11px; background:var(--neo-line5,rgba(255,255,255,.14)); transition:background .2s; }
        .nmod-knob { position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:9px; background:#fff;
          transition:transform .2s cubic-bezier(.2,.8,.2,1); box-shadow:0 1px 2px rgba(0,0,0,.3); }
        .nmod-sw input:checked ~ .nmod-track { background:var(--primary-color,#7C9CFF); }
        .nmod-sw input:checked ~ .nmod-knob { transform:translateX(16px); }
        .nmod-rm { width:28px; height:28px; flex-shrink:0; border:none; cursor:pointer; border-radius:8px;
          display:flex; align-items:center; justify-content:center; background:transparent; color:var(--error-color,#F87171); }
        .nmod-move { display:flex; flex-direction:column; gap:2px; flex-shrink:0; }
        .nmod-move button { width:22px; height:15px; line-height:1; padding:0; border:none; cursor:pointer; border-radius:5px;
          font-size:9px; color:var(--secondary-text-color); background:var(--neo-fill2,rgba(255,255,255,.06)); }
        .nmod-move button:disabled { opacity:.3; cursor:default; }
        .nmod-cfg { margin-top:8px; }
        .nmod-hint { font-size:12px; color:var(--secondary-text-color); margin:2px 0 8px; line-height:1.4; }
        .nmod-row--exp { cursor:pointer; }
        .nmod-chev { flex-shrink:0; display:flex; align-items:center; margin-left:2px;
          color:var(--secondary-text-color); transition:transform .2s; }
        .nmod-chev.open { transform:rotate(180deg); }
        .nmod-add { border-top:1px solid var(--divider-color,rgba(255,255,255,.08)); margin-top:6px; padding-top:8px; }
        .nmod-addbtn { width:100%; padding:9px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600;
          color:var(--primary-text-color); background:var(--neo-fill2,rgba(255,255,255,.06));
          border:1px dashed var(--divider-color,rgba(255,255,255,.18)); }
        .nmod-addbody { margin-top:10px; }
        .nmod-tabs { display:flex; gap:6px; margin-bottom:10px; }
        .nmod-tab { flex:1; text-align:center; padding:7px; border-radius:9px; cursor:pointer; font-size:12.5px; font-weight:600;
          color:var(--secondary-text-color); background:transparent; border:1px solid var(--divider-color,rgba(255,255,255,.12)); }
        .nmod-tab.active { color:#fff; background:var(--primary-color,#7C9CFF); border-color:transparent; }
        .nmod-note { font-size:12px; color:var(--secondary-text-color); line-height:1.45; margin:4px 0 8px; }
        .nmod-note--err { color:var(--error-color,#F87171); }
        .nmod-storebar { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:0 0 10px; }
        .nmod-storebar-t { font-size:11.5px; font-weight:700; letter-spacing:.5px; text-transform:uppercase;
          color:var(--secondary-text-color,rgba(244,246,251,.72)); }
        .nmod-storebar .nmod-mini { margin-top:0; padding:6px 10px; }
        .nmod-storebar .nmod-mini[disabled] { opacity:.5; cursor:default; }
        .nmod-note--muted { opacity:.7; }
        .nmod-warn { display:flex; gap:7px; align-items:flex-start; font-size:11.5px; line-height:1.45;
          color:var(--secondary-text-color,rgba(244,246,251,.72)); margin:0 0 10px; padding:8px 10px; border-radius:9px;
          background:var(--neo-fill1,rgba(255,255,255,.03)); border:1px solid var(--divider-color,rgba(255,255,255,.1)); }
        .nmod-subh { font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase;
          color:var(--secondary-text-color,rgba(244,246,251,.72)); margin:14px 0 8px; }
        .nmod-suggest { display:inline-flex; align-items:center; gap:6px; margin-top:10px; padding:7px 12px; border-radius:999px;
          font-size:12.5px; font-weight:600; text-decoration:none; cursor:pointer;
          color:var(--primary-text-color); background:var(--neo-fill2,rgba(255,255,255,.06));
          border:1px solid var(--neo-line2,rgba(255,255,255,.1)); }
        .nmod-suggest:hover { border-color:var(--primary-color,#7C9CFF); }
        .nmod-skelwrap { display:flex; flex-direction:column; gap:8px; }
        .nmod-skel { border:1px solid var(--divider-color,rgba(255,255,255,.08)); border-radius:12px; padding:10px; }
        .nmod-skel-prev { height:48px; border-radius:8px; margin-bottom:9px; }
        .nmod-skel-line { height:11px; border-radius:6px; margin-top:7px; }
        .nmod-skel-line.w60 { width:60%; } .nmod-skel-line.w35 { width:35%; }
        .nmod-skel-prev, .nmod-skel-line { background:linear-gradient(100deg,
          var(--neo-fill1,rgba(255,255,255,.04)) 30%, var(--neo-fill2,rgba(255,255,255,.09)) 50%,
          var(--neo-fill1,rgba(255,255,255,.04)) 70%); background-size:220% 100%; animation:nmod-shimmer 1.4s ease-in-out infinite; }
        @keyframes nmod-shimmer { 0% { background-position:180% 0; } 100% { background-position:-40% 0; } }
        @media (prefers-reduced-motion: reduce) { .nmod-skel-prev, .nmod-skel-line { animation:none; } }
        .nmod-store { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; padding:10px; margin-bottom:8px; }
        .nmod-store-h { display:flex; align-items:flex-start; gap:9px; }
        .nmod-sub { display:flex; align-items:center; gap:8px; margin-top:4px; flex-wrap:wrap; }
        .nmod-ver { font-size:11.5px; color:var(--secondary-text-color); }
        .nmod-auth { font-size:10px; font-weight:700; padding:1px 7px; border-radius:999px;
          display:inline-flex; align-items:center; gap:3px; white-space:nowrap; }
        .nmod-auth.standard { color:#c3c7cf; background:rgba(154,160,166,.16); border:1px solid rgba(154,160,166,.4); }
        .nmod-auth.premium { color:#F0B429; background:rgba(240,180,41,.14); border:1px solid rgba(240,180,41,.45); }
        .nmod-auth.community { color:#5EDCB8; background:rgba(94,220,184,.14); border:1px solid rgba(94,220,184,.42); }
        .nmod-prev { border-radius:10px; overflow:hidden; margin-bottom:9px;
          border:1px solid var(--divider-color,rgba(255,255,255,.08)); }
        .nmod-prev img { width:100%; display:block; }
        .nmod-prev--icon { height:64px; display:flex; align-items:center; justify-content:center;
          background:linear-gradient(135deg, rgba(124,156,255,.20), rgba(94,220,184,.12)); }
        .nmod-prev--icon span { font-size:34px; line-height:1; filter:drop-shadow(0 3px 8px rgba(0,0,0,.3)); }
        .nmod textarea { width:100%; box-sizing:border-box; min-height:100px; resize:vertical; border-radius:10px;
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); background:var(--secondary-background-color,#0d1020);
          color:var(--primary-text-color); font-family:ui-monospace,monospace; font-size:12px; padding:10px; }
        .nmod-badge.ok { color:#5EDCB8; background:rgba(94,220,184,.16); border-color:rgba(94,220,184,.4); }
        .nmod-badge.upd { color:#FFB26B; background:rgba(255,178,107,.16); border-color:rgba(255,178,107,.45); }
        .nmod-store-row { display:flex; gap:8px; }
        .nmod-mini { margin-top:8px; padding:7px 12px; border-radius:9px; cursor:pointer; border:none;
          background:var(--primary-color,#7C9CFF); color:#fff; font-size:12.5px; font-weight:600; }
        .nmod-mini.ghost { background:transparent; border:1px solid var(--neo-line2,rgba(255,255,255,.12)); color:var(--primary-text-color); }
        .nmod-msg { font-size:12px; margin-top:8px; min-height:14px; }
      </style>`;
  }

  _infoPanelHtml() {
    const v = (window.NeoDashboard && window.NeoDashboard.version) || "";
    const chip = (href, label, cls = "") =>
      `<a href="${href}" target="_blank" rel="noopener" class="ni-chip ${cls}">${label}</a>`;
    return `
      <style>
        .ni { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; overflow:hidden; }
        .ni-head { padding:12px 12px 0; font-size:14px; font-weight:700; color:var(--primary-text-color); }
        .ni-c { padding:8px 12px 14px; }
        .ni-sec { font-size:13px; font-weight:700; color:var(--primary-text-color); margin:14px 0 8px; }
        .ni-txt { font-size:12.5px; color:var(--secondary-text-color); line-height:1.55; }
        .ni-chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
        .ni-chip { display:inline-flex; align-items:center; gap:6px; padding:7px 12px; border-radius:999px;
          font-size:12.5px; font-weight:600; text-decoration:none; cursor:pointer;
          color:var(--primary-text-color); background:var(--neo-fill2,rgba(255,255,255,.06));
          border:1px solid var(--neo-line2,rgba(255,255,255,.1)); }
        .ni-chip.heart { color:#FFB26B; border-color:rgba(255,178,107,.4); background:rgba(255,178,107,.12); }
        .ni-chip.coffee { color:#F6C177; border-color:rgba(246,193,119,.4); background:rgba(246,193,119,.12); }
        .ni-support { margin-top:16px; padding:14px; border-radius:14px;
          background:linear-gradient(160deg, rgba(124,156,255,.12) 0%, var(--neo-fill1,rgba(255,255,255,.03)) 70%);
          border:1px solid rgba(124,156,255,.22); }
        .ni-support .ni-sec { margin-top:0; }
        .ni-thanks { display:flex; align-items:center; gap:11px; margin-top:14px; padding-top:12px;
          border-top:1px solid var(--divider-color,rgba(255,255,255,.1));
          font-size:12.5px; color:var(--secondary-text-color); line-height:1.4; }
        .ni-ava { line-height:0; flex-shrink:0; filter:drop-shadow(0 3px 8px rgba(124,156,255,.35)); }
      </style>
      <div class="ni">
        <div class="ni-head">ℹ️ ${this._t("Info &amp; Support")}${v ? ` · v${v}` : ""}</div>
        <div class="ni-c">
          <div class="ni-sec">${this._t("Ressourcen &amp; Hilfe")}</div>
          <div class="ni-txt">${this._t("Fragen oder ein Problem? Die Doku und die Community helfen weiter.")}</div>
          <div class="ni-chips">
            ${chip(NEO_LINKS.repo, this._t("📖 Dokumentation"))}
            ${chip(NEO_LINKS.issues, this._t("🐞 Probleme melden"))}
            ${chip(NEO_LINKS.newDiscussion, this._t("💬 Diskussionen"))}
          </div>

          <div class="ni-support">
            <div class="ni-sec">${this._t("❤️ Projekt unterstützen")}</div>
            <div class="ni-txt">${this._t("Hi! Ich entwickle <b>Neo Dashboard Kit</b> in meiner Freizeit und stecke viel Herzblut hinein. Wenn es dir gefällt, ist jede Unterstützung eine riesige Motivation — so kann ich weiter neue Karten &amp; Module bauen. Auf Patreon gibt es außerdem exklusive Premium-Karten und Vorlagen.")}</div>
            <div class="ni-chips">
              ${chip(NEO_LINKS.kofi, this._t("☕ Kaffee spendieren"), "coffee")}
              ${chip(NEO_LINKS.paypal, this._t("💳 PayPal"))}
              ${chip(NEO_LINKS.patreon, this._t("♥ Patreon"), "heart")}
            </div>
            <div class="ni-thanks">
              <span class="ni-ava">${neoLogo({ size: 34, radius: 10 })}</span>
              <span>${this._t("Danke, dass du Teil dieser Community bist! 🎉")}</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  _syncTypeForm() {
    // Picker NICHT neu aufbauen, während das Dropdown offen ist — sonst klappt
    // es beim nächsten setConfig-Echo (z. B. Live-Vorschau) sofort wieder zu.
    if (this._typeBox && !this._typeMenuOpen) this._renderTypePicker();
    // Modul-Sektion nur neu aufbauen, wenn sich der Kartentyp geändert hat —
    // sonst verliert das Tippen in Modul-Einstellungen den Fokus, weil HA
    // setConfig nach jeder Änderung zurück-echot.
    if (this._renderedModType !== this._config.card_type) this._renderModulesSection();
    this._updateGuidedState();
  }

  // Herkunft/Kategorie einer Karte aus dem Registry-Feld `author` ableiten:
  // Premium · Community · sonst Standard. (Einzige Quelle der Wahrheit.)
  _catOf(author) {
    return author === "Premium" ? "Premium" : author === "Community" ? "Community" : "Standard";
  }

  // Aktive Kategorie für die progressive Auswahl: Ist bereits eine Karte
  // gewählt, ist deren Kategorie maßgeblich (Auto-Erkennung für bestehende
  // Configs). Sonst die vom Nutzer gewählte Kategorie (this._selectedCat).
  _activeCat() {
    const cur = this._config.card_type;
    if (cur) return this._catOf((NeoDashboardRegistry.getMeta(cur) || {}).author);
    return this._selectedCat || null;
  }

  // Karten einer Kategorie (alphabetisch) — die Liste für den 2. Schritt.
  _cardsInCat(cat) {
    return NeoDashboardRegistry.list()
      .filter((c) => c.type !== "neo-card" && !c.hidden && this._catOf(c.author) === cat)
      .map((c) => ({ value: c.type, name: c.name, icon: c.icon || "✨" }))
      .sort((a, b) => this._t(a.name).localeCompare(this._t(b.name)));
  }

  // Anzahl Karten je Kategorie — für die Zähler in der Bereich-Auswahl.
  _catCounts() {
    const counts = { Standard: 0, Premium: 0, Community: 0 };
    NeoDashboardRegistry.list()
      .filter((c) => c.type !== "neo-card" && !c.hidden)
      .forEach((c) => { counts[this._catOf(c.author)]++; });
    return counts;
  }

  // Bereich (Kategorie) wählen — 1. Schritt der progressiven Auswahl.
  // Wechselt der Nutzer in eine ANDERE Kategorie als die der aktuell aktiven
  // Karte, wird card_type zurückgesetzt, damit keine Karte aus der falschen
  // Kategorie aktiv bleibt.
  _selectCategory(cat) {
    const cur = this._config.card_type;
    const curCat = cur ? this._catOf((NeoDashboardRegistry.getMeta(cur) || {}).author) : null;
    this._selectedCat = cat;
    if (cur && curCat !== cat) {
      this._config = { type: this._config.type }; // card_type + Stub verwerfen
      this._renderTypePicker();
      this._mountSub();
      this._renderModulesSection();
      this._updateGuidedState();
      this._fire();
      return;
    }
    this._renderTypePicker();
  }

  _selectType(newType) {
    if (!newType || newType === this._config.card_type) return;
    const cls = NeoDashboardRegistry.getCard(newType);
    const stub = cls?.getStubConfig?.() || {};
    // Bereich der neuen Karte merken, damit die Bereich-Auswahl konsistent bleibt.
    this._selectedCat = this._catOf((NeoDashboardRegistry.getMeta(newType) || {}).author);
    // Beim Typwechsel werden karten-gebundene Module zurückgesetzt (sie galten
    // für den vorherigen Typ). Keine Voreinstellungen außer dem Stub.
    this._config = { type: this._config.type, card_type: newType, ...stub };
    this._renderTypePicker();
    this._mountSub();
    this._renderModulesSection();
    this._updateGuidedState();
    this._fire();
  }

  // Progressiver Kartentyp-Picker: 1) Bereich (Standard/Premium/Community)
  // wählen, 2) Karte innerhalb des Bereichs wählen. Erst danach übernimmt die
  // gewählte Karte ihren eigenen Editor (ha-form kann keine Gruppen/Schritte).
  _renderTypePicker() {
    if (!this._typeBox) return;
    const DOT = { Standard: "#9aa0a6", Premium: "#F0B429", Community: "#5EDCB8" };
    const cur = this._config.card_type;
    const m = NeoDashboardRegistry.getMeta(cur) || {};
    const activeCat = this._activeCat();
    const counts = this._catCounts();
    const cards = activeCat ? this._cardsInCat(activeCat) : [];
    const curName = m.name ? this._t(m.name) : this._t("Karte wählen …");
    const cats = ["Standard", "Premium", "Community"];

    this._typeBox.innerHTML = `
      <style>
        .nt { position:relative; }
        .nt-step { font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase;
          color:var(--secondary-text-color,rgba(244,246,251,.72)); margin:2px 0 7px; }
        .nt-cats { display:flex; gap:6px; margin-bottom:12px; }
        .nt-cat { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; box-sizing:border-box;
          padding:9px 6px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600;
          color:var(--secondary-text-color); background:var(--secondary-background-color,#0d1020);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); transition:border-color .15s,color .15s; }
        .nt-cat:hover { color:var(--primary-text-color); }
        .nt-cat.active { color:var(--primary-text-color); border-color:var(--primary-color,#7C9CFF);
          box-shadow:0 0 0 1px var(--primary-color,#7C9CFF) inset; }
        .nt-cat-top { display:flex; align-items:center; gap:6px; }
        .nt-cat-count { font-size:10.5px; font-weight:600; opacity:.6; }
        .nt-dot { width:8px; height:8px; border-radius:4px; flex-shrink:0; }
        .nt-btn { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; box-sizing:border-box;
          padding:11px 12px; border-radius:10px; cursor:pointer; font-size:14px;
          background:var(--secondary-background-color,#0d1020); color:var(--primary-text-color);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); }
        .nt-lbl { display:flex; align-items:center; gap:8px; min-width:0; }
        .nt-nm { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .nt-cv { opacity:.6; transition:transform .2s; }
        .nt.open .nt-cv { transform:rotate(180deg); }
        .nt-panel { position:absolute; left:0; right:0; top:calc(100% + 4px); z-index:30; max-height:330px; overflow:auto;
          border-radius:10px; background:var(--card-background-color,#1b2030);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); box-shadow:0 14px 34px rgba(0,0,0,.45); }
        .nt-opt { display:flex; align-items:center; gap:9px; padding:10px 12px; cursor:pointer; font-size:14px;
          color:var(--primary-text-color); }
        .nt-opt:hover { background:var(--neo-fill2,rgba(255,255,255,.06)); }
        .nt-opt.sel { color:var(--primary-color,#7C9CFF); font-weight:600; }
        .nt-ic { width:20px; text-align:center; flex-shrink:0; }
        .nt-search { position:sticky; top:0; z-index:1; padding:8px; background:var(--card-background-color,#1b2030);
          border-bottom:1px solid var(--divider-color,rgba(255,255,255,.1)); }
        .nt-search input { width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px; font-size:13px;
          background:var(--secondary-background-color,#0d1020); color:var(--primary-text-color);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); }
        .nt-empty { padding:14px 12px; font-size:13px; color:var(--secondary-text-color); }
        .nt-hint { font-size:12.5px; color:var(--secondary-text-color); padding:2px 2px 2px; line-height:1.5; }
        .nt-emptycat { font-size:12.5px; color:var(--secondary-text-color); line-height:1.5;
          padding:11px 12px; border-radius:10px; border:1px dashed var(--divider-color,rgba(255,255,255,.18));
          background:var(--neo-fill1,rgba(255,255,255,.03)); }
      </style>
      <div class="nt">
        <div class="nt-step">${this._t("Bereich wählen")}</div>
        <div class="nt-cats">
          ${cats.map((c) => `
            <div class="nt-cat ${c === activeCat ? "active" : ""}" data-cat="${escapeAttr(c)}">
              <span class="nt-cat-top"><span class="nt-dot" style="background:${escapeAttr(DOT[c])};"></span>${escapeHtml(this._t(c))}</span>
              <span class="nt-cat-count">${counts[c]}</span>
            </div>`).join("")}
        </div>
        ${activeCat ? `
          <div class="nt-step">${this._t("Karte wählen")}</div>
          ${cards.length ? `
            <div class="nt-btn" id="nt-btn">
              <span class="nt-lbl"><span class="nt-ic">${escapeHtml(m.icon || "✨")}</span><span class="nt-nm">${escapeHtml(curName)}</span></span>
              <span class="nt-cv">▾</span>
            </div>
            <div class="nt-panel" id="nt-panel" style="display:none;">
              <div class="nt-search"><input id="nt-search" type="text" placeholder="${escapeAttr(this._t("🔍 Karte suchen …"))}" /></div>
              <div id="nt-list">
                ${cards.map((it) => `<div class="nt-opt ${it.value === cur ? "sel" : ""}" data-v="${escapeAttr(it.value)}" data-s="${escapeAttr((this._t(it.name) + " " + it.name + " " + it.value).toLowerCase())}">
                  <span class="nt-ic">${escapeHtml(it.icon)}</span><span class="nt-nm">${escapeHtml(this._t(it.name))}</span>
                </div>`).join("")}
                <div class="nt-empty" id="nt-empty" style="display:none;">${this._t("Keine Treffer.")}</div>
              </div>
            </div>`
          : `<div class="nt-emptycat">${this._t("In diesem Bereich gibt es noch keine Karten.")}${activeCat !== "Standard" ? `<br>${this._t("Premium- und Community-Karten fügst du unten über <b>Erweiterungen</b> hinzu.")}` : ""}</div>`}
        ` : `<div class="nt-hint">${this._t("Wähle zuerst einen Bereich, um die passenden Karten zu sehen.")}</div>`}
      </div>`;

    // ── Schritt 1: Bereich wählen ──
    this._typeBox.querySelectorAll(".nt-cat").forEach((b) =>
      b.addEventListener("click", () => this._selectCategory(b.getAttribute("data-cat"))));

    // ── Schritt 2: Karte wählen (nur wenn der Bereich Karten enthält) ──
    const btn = this._typeBox.querySelector("#nt-btn");
    if (!btn) return;
    const root = this._typeBox.querySelector(".nt");
    const panel = this._typeBox.querySelector("#nt-panel");
    const close = () => { panel.style.display = "none"; root.classList.remove("open"); this._typeMenuOpen = false; document.removeEventListener("click", onDoc, true); };
    // composedPath() statt contains(e.target): robust über Shadow-Grenzen (HA-Dialog).
    const onDoc = (e) => { const path = e.composedPath ? e.composedPath() : []; if (!path.includes(this._typeBox)) close(); };
    const search = this._typeBox.querySelector("#nt-search");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (panel.style.display !== "none") { close(); return; }
      panel.style.display = "block"; root.classList.add("open"); this._typeMenuOpen = true;
      document.addEventListener("click", onDoc, true);
      setTimeout(() => search?.focus(), 30);
    });
    // Suche — nur innerhalb des gewählten Bereichs (der Panel enthält nur dessen Karten).
    search?.addEventListener("click", (e) => e.stopPropagation());
    search?.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let any = false;
      this._typeBox.querySelectorAll(".nt-opt").forEach((o) => {
        const hit = !q || o.getAttribute("data-s").includes(q);
        o.style.display = hit ? "" : "none"; if (hit) any = true;
      });
      const empty = this._typeBox.querySelector("#nt-empty");
      if (empty) empty.style.display = any ? "none" : "block";
    });
    this._typeBox.querySelectorAll(".nt-opt").forEach((o) =>
      o.addEventListener("click", () => { close(); this._selectType(o.getAttribute("data-v")); }));
  }

  _mountSub() {
    this._subContainer.innerHTML = "";
    this._sub = null;
    const type = this._config.card_type;
    if (!type) return;
    const cls = NeoDashboardRegistry.getCard(type);
    if (!cls?.getConfigElement) return;

    this._sub = cls.getConfigElement();
    const subConfig = { ...this._config };
    delete subConfig.card_type;
    delete subConfig.modules;
    if (this._hass) this._sub.hass = this._hass;
    this._sub.setConfig(subConfig);
    this._sub.addEventListener("config-changed", (e) => {
      // Stop the sub-editor's event from bubbling to HA directly — otherwise HA
      // would receive a config without type/card_type. Keep our modules.
      e.stopPropagation();
      const mods = this._config.modules;
      this._config = { type: this._config.type, card_type: type, ...(mods ? { modules: mods } : {}), ...e.detail.config };
      this._fire();
    });
    this._subContainer.appendChild(this._sub);
  }

  _fire() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true, composed: true,
    }));
  }
}

customElements.define("neo-card-editor", NeoCardEditor);
