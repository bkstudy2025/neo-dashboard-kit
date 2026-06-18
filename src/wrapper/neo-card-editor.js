// Neo Card Editor — type picker + selected card's editor + card-scoped
// module manager + always-visible "Info & Support" panel.
import { NeoDashboardRegistry } from "../core/registry.js";
import { neoIcon } from "../core/icons.js";
import { NEO_LINKS } from "../core/links.js";
import { neoLogo } from "../core/branding.js";
import { NeoModules } from "../core/modules.js";
import { NeoStore } from "../store/module-store.js";
import { neoLoadModule } from "../store/module-loader.js";

class NeoCardEditor extends HTMLElement {
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
  }

  // Re-render der Modul-Sektion, wenn (Store-)Module geladen/aktualisiert werden.
  connectedCallback() {
    this._onMods = () => { this._renderModulesSection(); };
    window.addEventListener("neo-module-changed", this._onMods);
    window.addEventListener("neo-modules-loaded", this._onMods);
  }
  disconnectedCallback() {
    window.removeEventListener("neo-module-changed", this._onMods);
    window.removeEventListener("neo-modules-loaded", this._onMods);
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
      `<div class="neo-ed-sec-h"><span class="neo-ed-sec-ic">${neoIcon("grid", { size: 15, color: "currentColor" })}</span>Kartentyp</div>`;
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
      `<div class="neo-ed-sec-h"><span class="neo-ed-sec-ic">${neoIcon("settings", { size: 15, color: "currentColor" })}</span>Einstellungen</div>`;
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

  // Zeigt/versteckt Hinweis + Einstellungs- + Modul-Sektion je nach Auswahl.
  _updateGuidedState() {
    const hasType = !!this._config.card_type;
    if (this._settingsSec) this._settingsSec.style.display = hasType ? "" : "none";
    // Module-Sektion erst zeigen, wenn ein Typ gewählt ist (ruhige Startseite).
    if (this._modPanel) this._modPanel.style.display = hasType ? "" : "none";
    if (this._hintBox) {
      const ver = (window.NeoDashboard && window.NeoDashboard.version) || "";
      this._hintBox.innerHTML = hasType ? "" : `
        <div class="neo-ed-landing">
          <div class="neo-ed-landing-logo">${neoLogo({ size: 60, radius: 18 })}</div>
          <div class="neo-ed-landing-title">Neo Dashboard Kit</div>
          ${ver ? `<div class="neo-ed-landing-ver">v${ver}</div>` : ""}
          <div class="neo-ed-landing-desc">
            Glassmorphism-Karten für dein Dashboard. Wähle oben einen
            <b>Kartentyp</b> — danach erscheinen hier die Einstellungen und
            rechts die Live-Vorschau.
          </div>
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

    this._modPanel.innerHTML = `
      ${this._modStyles()}
      <div class="nmod">
        <div class="nmod-h"><span>🧩</span> Module${available.length ? ` (${available.length})` : ""}</div>
        ${available.length ? `<div class="nmod-list"></div>`
          : `<div class="nmod-empty">Für diese Karte sind noch keine Module aktiv.
             Über <b>➕ Modul hinzufügen</b> kommst du zum Store.</div>`}
        <div class="nmod-add" id="nmod-add"></div>
      </div>`;

    const list = this._modPanel.querySelector(".nmod-list");
    if (list) available.forEach((mod) => this._renderModItem(list, mod));
    this._renderAddArea();
  }

  _renderModItem(list, mod) {
    const on = this._isModEnabled(mod.id);
    const item = document.createElement("div");
    item.className = "nmod-item";
    const badge = mod.author ? `<span class="nmod-badge">${mod.author}</span>` : "";
    const rm = this._isInstalled(mod.id)
      ? `<button class="nmod-rm" title="Modul entfernen" data-rm="${mod.id}">${neoIcon("trash", { size: 15, color: "currentColor" })}</button>`
      : "";
    item.innerHTML = `
      <div class="nmod-row">
        <span class="nmod-ic">${mod.icon || "🧩"}</span>
        <div class="nmod-meta">
          <div class="nmod-name">${mod.name || mod.id}${badge}</div>
          ${mod.description ? `<div class="nmod-desc">${mod.description}</div>` : ""}
        </div>
        ${rm}
        <label class="nmod-sw">
          <input type="checkbox" ${on ? "checked" : ""} />
          <span class="nmod-track"></span><span class="nmod-knob"></span>
        </label>
      </div>
      <div class="nmod-cfg"></div>`;
    list.appendChild(item);

    item.querySelector("input[type=checkbox]")
      .addEventListener("change", (e) => this._toggleModule(mod, e.target.checked));
    item.querySelector("[data-rm]")?.addEventListener("click", () => this._removeInstalled(mod.id));

    if (on && Array.isArray(mod.config) && mod.config.length) {
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
    if (on && idx < 0) list.push({ id: mod.id, settings: {} });
    else if (!on && idx >= 0) list.splice(idx, 1);
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

  // ── Modul hinzufügen: Store (CDN-Index, kartengefiltert) + Code einfügen ──
  async _refreshInstalled() {
    if (!NeoStore.available()) { this._installed = new Set(); return; }
    try {
      const mods = await NeoStore.list();
      this._installed = new Set(mods.map((m) => m.name));
    } catch (e) { this._installed = new Set(); }
    this._renderModulesSection();
  }

  _renderAddArea() {
    const host = this._modPanel.querySelector("#nmod-add");
    if (!host) return;
    const open = !!this._addOpen;
    const tab = this._addTab || "store";
    host.innerHTML = `
      <button class="nmod-addbtn" id="nmod-addbtn">${open ? "▾" : "➕"} Modul hinzufügen</button>
      <div class="nmod-addbody" style="display:${open ? "block" : "none"}">
        <div class="nmod-tabs">
          <div class="nmod-tab ${tab === "store" ? "active" : ""}" data-tab="store">Store</div>
          <div class="nmod-tab ${tab === "paste" ? "active" : ""}" data-tab="paste">Code einfügen</div>
        </div>
        <div class="nmod-tabbody">${tab === "store" ? this._storeHtml() : this._pasteHtml()}</div>
        <div class="nmod-msg" id="nmod-msg"></div>
      </div>`;

    host.querySelector("#nmod-addbtn").addEventListener("click", () => {
      this._addOpen = !this._addOpen;
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
  }

  _storeHtml() {
    if (!NeoStore.available()) {
      return `<div class="nmod-note">⚠️ Für den Store wird die Integration <b>Neo Dashboard Tools</b> benötigt (serverseitiges Speichern + Laden).</div>`;
    }
    if (this._storeLoading) return `<div class="nmod-note">Lade Store …</div>`;
    if (this._storeErr) return `<div class="nmod-note">${this._storeErr} <button class="nmod-mini" id="nmod-reload">Erneut</button></div>`;
    const type = this._config.card_type;
    const items = (this._storeItems || []).filter((it) => NeoModules.matches(it.target, type));
    if (!items.length) {
      return `<div class="nmod-note">Für diese Karte sind aktuell keine Store-Module verfügbar.
        Eigenes Modul teilen? Siehe <a href="${NEO_LINKS.modulesRepo}" target="_blank" rel="noopener">neo-modules</a>.</div>`;
    }
    return items.map((it, i) => {
      const has = !!NeoModules.get(it.id);
      return `<div class="nmod-store">
        <div class="nmod-store-h">
          <span class="nmod-ic">${it.icon || "🧩"}</span>
          <div class="nmod-meta">
            <div class="nmod-name">${it.name || it.id}${it.author ? ` <span class="nmod-badge">${it.author}</span>` : ""}</div>
            <div class="nmod-desc">von ${it.author || "?"}${it.version ? " · v" + it.version : ""}</div>
          </div>
        </div>
        ${it.image ? `<img class="nmod-img" src="${it.image}" loading="lazy" />` : ""}
        ${it.description ? `<div class="nmod-desc" style="margin-top:6px;">${it.description}</div>` : ""}
        <button class="nmod-mini" data-install="${i}">${has ? "Aktualisieren" : "Installieren"}</button>
      </div>`;
    }).join("");
  }

  _pasteHtml() {
    const note = NeoStore.available()
      ? ""
      : `<div class="nmod-note">ℹ️ Ohne <b>Neo Dashboard Tools</b> wird das Modul nur für diese Sitzung geladen (nicht dauerhaft gespeichert).</div>`;
    return `${note}
      <textarea id="nmod-code" placeholder="Modul-Code hier einfügen (window.NeoDashboard.registerModule({ … })) …"></textarea>
      <button class="nmod-mini" id="nmod-paste-add">Hinzufügen</button>`;
  }

  _wireAddArea() {
    const q = (s) => this._modPanel.querySelector(s);
    q("#nmod-reload")?.addEventListener("click", () => { this._storeItems = null; this._storeErr = null; this._loadStoreIndex(); });
    q("#nmod-paste-add")?.addEventListener("click", () => {
      const code = (q("#nmod-code").value || "").trim();
      this._pasteModule(code);
    });
    this._modPanel.querySelectorAll("[data-install]").forEach((b) =>
      b.addEventListener("click", () => {
        const type = this._config.card_type;
        const items = (this._storeItems || []).filter((it) => NeoModules.matches(it.target, type));
        this._installFromStore(items[+b.getAttribute("data-install")]);
      }));
  }

  _msg(text, err) {
    const m = this._modPanel.querySelector("#nmod-msg");
    if (m) { m.style.color = err ? "var(--error-color,#F87171)" : "var(--success-color,#5EDCB8)"; m.textContent = text; }
  }

  async _loadStoreIndex() {
    if (!NeoStore.available()) { this._renderAddArea(); return; }
    this._storeLoading = true; this._storeErr = null; this._renderAddArea();
    try {
      const txt = await NeoStore.fetch(NEO_LINKS.modulesIndex);
      const data = JSON.parse(txt);
      this._storeItems = Array.isArray(data) ? data : (data.modules || []);
    } catch (e) {
      this._storeItems = [];
      this._storeErr = "Store-Index konnte nicht geladen werden.";
    }
    this._storeLoading = false;
    this._renderAddArea();
  }

  async _installFromStore(item) {
    if (!item) return;
    this._msg("Installiere …");
    try {
      const code = await NeoStore.fetch(item.url);
      const res = neoLoadModule(code); // registriert das Modul sofort
      if (!res.ok) throw new Error("Code-Fehler");
      if (NeoStore.available()) await NeoStore.save(item.id, code);
      await this._refreshInstalled();
      this._msg(`✓ „${item.name || item.id}" installiert.`);
    } catch (e) {
      this._msg(`Installation fehlgeschlagen: ${e?.message || e}`, true);
    }
  }

  async _pasteModule(code) {
    if (!code) return this._msg("Bitte Code einfügen.", true);
    const before = new Set(NeoModules.list().map((m) => m.id));
    const res = neoLoadModule(code);
    if (!res.ok) return this._msg("Code konnte nicht geladen werden.", true);
    const added = NeoModules.list().filter((m) => !before.has(m.id));
    if (!added.length) return this._msg("Kein Modul erkannt (registerModule fehlt?).", true);
    try {
      if (NeoStore.available()) await NeoStore.save(added[0].id, code);
      await this._refreshInstalled();
      this._msg(`✓ „${added[0].name || added[0].id}" hinzugefügt.`);
    } catch (e) {
      this._msg(`Speichern fehlgeschlagen: ${e?.message || e}`, true);
    }
  }

  async _removeInstalled(id) {
    try {
      if (NeoStore.available()) await NeoStore.delete(id);
    } catch (e) { /* ignore */ }
    // Aus der aktiven Konfiguration nehmen, falls aktiviert.
    if (this._isModEnabled(id)) {
      const list = this._enabledList().filter((m) => m.id !== id);
      this._config = { ...this._config };
      if (list.length) this._config.modules = list; else delete this._config.modules;
      this._fire();
    }
    await this._refreshInstalled();
    this._msg("Modul entfernt. (Bereits geladener Code verschwindet nach einem Reload.)");
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
        .nmod-cfg { margin-top:8px; }
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
        .nmod-store { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; padding:10px; margin-bottom:8px; }
        .nmod-store-h { display:flex; align-items:flex-start; gap:9px; }
        .nmod-img { width:100%; border-radius:8px; margin-top:8px; display:block; }
        .nmod textarea { width:100%; box-sizing:border-box; min-height:100px; resize:vertical; border-radius:10px;
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); background:var(--secondary-background-color,#0d1020);
          color:var(--primary-text-color); font-family:ui-monospace,monospace; font-size:12px; padding:10px; }
        .nmod-mini { margin-top:8px; padding:7px 12px; border-radius:9px; cursor:pointer; border:none;
          background:var(--primary-color,#7C9CFF); color:#fff; font-size:12.5px; font-weight:600; }
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
        <div class="ni-head">ℹ️ Info &amp; Support${v ? ` · v${v}` : ""}</div>
        <div class="ni-c">
          <div class="ni-sec">Ressourcen &amp; Hilfe</div>
          <div class="ni-txt">Fragen oder ein Problem? Die Doku und die Community helfen weiter.</div>
          <div class="ni-chips">
            ${chip(NEO_LINKS.repo, "📖 Dokumentation")}
            ${chip(NEO_LINKS.issues, "🐞 Probleme melden")}
            ${chip(NEO_LINKS.newDiscussion, "💬 Diskussionen")}
          </div>

          <div class="ni-support">
            <div class="ni-sec">❤️ Projekt unterstützen</div>
            <div class="ni-txt">
              Hi! Ich entwickle <b>Neo Dashboard Kit</b> in meiner Freizeit und stecke viel Herzblut hinein.
              Wenn es dir gefällt, ist jede Unterstützung eine riesige Motivation — so kann ich weiter neue
              Karten &amp; Module bauen. Auf Patreon gibt es außerdem exklusive Premium-Karten und Vorlagen.
            </div>
            <div class="ni-chips">
              ${chip(NEO_LINKS.kofi, "☕ Kaffee spendieren", "coffee")}
              ${chip(NEO_LINKS.paypal, "💳 PayPal")}
              ${chip(NEO_LINKS.patreon, "♥ Patreon", "heart")}
            </div>
            <div class="ni-thanks">
              <span class="ni-ava">${neoLogo({ size: 34, radius: 10 })}</span>
              <span>Danke, dass du Teil dieser Community bist! 🎉</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  _syncTypeForm() {
    if (this._typeBox) this._renderTypePicker();
    // Modul-Sektion nur neu aufbauen, wenn sich der Kartentyp geändert hat —
    // sonst verliert das Tippen in Modul-Einstellungen den Fokus, weil HA
    // setConfig nach jeder Änderung zurück-echot.
    if (this._renderedModType !== this._config.card_type) this._renderModulesSection();
    this._updateGuidedState();
  }

  // Karten nach Kategorie gruppiert: Standard · Premium · Community.
  _typeGroups() {
    const cat = (a) => a === "Premium" ? "Premium" : a === "Community" ? "Community" : "Standard";
    const order = ["Standard", "Premium", "Community"];
    const groups = { Standard: [], Premium: [], Community: [] };
    NeoDashboardRegistry.list()
      .filter((c) => c.type !== "neo-card" && !c.hidden)
      .forEach((c) => groups[cat(c.author)].push({ value: c.type, name: c.name, icon: c.icon || "✨" }));
    order.forEach((g) => groups[g].sort((a, b) => a.name.localeCompare(b.name)));
    return order.filter((g) => groups[g].length).map((g) => ({ group: g, items: groups[g] }));
  }

  _selectType(newType) {
    if (!newType || newType === this._config.card_type) return;
    const cls = NeoDashboardRegistry.getCard(newType);
    const stub = cls?.getStubConfig?.() || {};
    // Beim Typwechsel werden karten-gebundene Module zurückgesetzt (sie galten
    // für den vorherigen Typ). Keine Voreinstellungen außer dem Stub.
    this._config = { type: this._config.type, card_type: newType, ...stub };
    this._renderTypePicker();
    this._mountSub();
    this._renderModulesSection();
    this._updateGuidedState();
    this._fire();
  }

  // Eigener, gruppierter Kartentyp-Picker (ha-form kann keine Gruppen).
  _renderTypePicker() {
    if (!this._typeBox) return;
    const DOT = { Standard: "#9aa0a6", Premium: "#F0B429", Community: "#5EDCB8" };
    const catOf = (a) => a === "Premium" ? "Premium" : a === "Community" ? "Community" : "Standard";
    const cur = this._config.card_type;
    const m = NeoDashboardRegistry.getMeta(cur) || {};
    const curCat = catOf(m.author);
    const curName = m.name || cur || "Kartentyp wählen …";
    const groups = this._typeGroups();
    this._typeBox.innerHTML = `
      <style>
        .nt { position:relative; }
        .nt-btn { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; box-sizing:border-box;
          padding:11px 12px; border-radius:10px; cursor:pointer; font-size:14px;
          background:var(--secondary-background-color,#0d1020); color:var(--primary-text-color);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); }
        .nt-lbl { display:flex; align-items:center; gap:8px; min-width:0; }
        .nt-nm { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .nt-dot { width:8px; height:8px; border-radius:4px; flex-shrink:0; }
        .nt-cv { opacity:.6; transition:transform .2s; }
        .nt.open .nt-cv { transform:rotate(180deg); }
        .nt-panel { position:absolute; left:0; right:0; top:calc(100% + 4px); z-index:30; max-height:330px; overflow:auto;
          border-radius:10px; background:var(--card-background-color,#1b2030);
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); box-shadow:0 14px 34px rgba(0,0,0,.45); }
        .nt-grp { font-size:11px; font-weight:700; letter-spacing:.6px; text-transform:uppercase;
          color:var(--secondary-text-color); padding:10px 12px 4px; position:sticky; top:0;
          background:var(--card-background-color,#1b2030); }
        .nt-opt { display:flex; align-items:center; gap:9px; padding:9px 12px; cursor:pointer; font-size:14px;
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
      </style>
      <div class="nt">
        <div class="nt-btn" id="nt-btn">
          <span class="nt-lbl"><span class="nt-dot" style="background:${DOT[curCat]};"></span>
            <span class="nt-ic">${m.icon || "✨"}</span><span class="nt-nm">${curName}</span></span>
          <span class="nt-cv">▾</span>
        </div>
        <div class="nt-panel" id="nt-panel" style="display:none;">
          <div class="nt-search"><input id="nt-search" type="text" placeholder="🔍 Karte suchen …" /></div>
          <div id="nt-list">
          ${groups.map((grp) => `
            <div class="nt-section">
              <div class="nt-grp"><span class="nt-dot" style="display:inline-block;background:${DOT[grp.group]};margin-right:6px;"></span>${grp.group}</div>
              ${grp.items.map((it) => `<div class="nt-opt ${it.value === cur ? "sel" : ""}" data-v="${it.value}" data-s="${(it.name + " " + it.value + " " + grp.group).toLowerCase()}">
                <span class="nt-ic">${it.icon}</span><span class="nt-nm">${it.name}</span>
              </div>`).join("")}
            </div>`).join("")}
          <div class="nt-empty" id="nt-empty" style="display:none;">Keine Treffer.</div>
          </div>
        </div>
      </div>`;
    const root = this._typeBox.querySelector(".nt");
    const panel = this._typeBox.querySelector("#nt-panel");
    const close = () => { panel.style.display = "none"; root.classList.remove("open"); document.removeEventListener("click", onDoc, true); };
    const onDoc = (e) => { if (!this._typeBox.contains(e.target)) close(); };
    const search = this._typeBox.querySelector("#nt-search");
    this._typeBox.querySelector("#nt-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (panel.style.display !== "none") { close(); return; }
      panel.style.display = "block"; root.classList.add("open");
      document.addEventListener("click", onDoc, true);
      setTimeout(() => search?.focus(), 30);
    });
    search?.addEventListener("click", (e) => e.stopPropagation());
    search?.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let any = false;
      this._typeBox.querySelectorAll(".nt-section").forEach((sec) => {
        let vis = 0;
        sec.querySelectorAll(".nt-opt").forEach((o) => {
          const hit = !q || o.getAttribute("data-s").includes(q);
          o.style.display = hit ? "" : "none"; if (hit) vis++;
        });
        sec.style.display = vis ? "" : "none"; if (vis) any = true;
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
