// Neo Card Editor — type dropdown + selected card's own editor.
// Also hosts the module manager (My Modules + Module Store) and the
// "Info & Support" panel.
import { NeoDashboardRegistry } from "../core/registry.js";
import { neoLoadModule } from "../store/module-loader.js";
import { NeoStore } from "../store/module-store.js";
import { neoIcon } from "../core/icons.js";
import { NEO_LINKS } from "../core/links.js";
import { neoLogo } from "../core/branding.js";

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
    NeoStore.setHass(h);
    if (this._typeForm) this._typeForm.hass = h;
    if (this._sub) this._sub.hass = h;
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

    // ── Geführter Hinweis (nur ohne Auswahl sichtbar) ──
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

    // ── Module manager (collapsed). Uses a plain textarea (reliable, unlike the
    // settings-dialog one) and stores to the server via Neo Dashboard Tools. ──
    this._modPanel = document.createElement("div");
    this._root.appendChild(this._modPanel);
    this._renderModPanel();
    if (NeoStore.available()) NeoStore.list().then((m) => { this._mods = m; this._renderModPanel(); });

    // ── Info & Support panel (collapsed) ──
    const info = document.createElement("div");
    info.innerHTML = this._infoPanelHtml();
    this._root.appendChild(info);
    info.querySelector("#ni-toggle")?.addEventListener("click", () => {
      const body = info.querySelector("#ni-body");
      const open = body.style.display !== "none";
      body.style.display = open ? "none" : "block";
      info.querySelector(".ni").classList.toggle("open", !open);
    });

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

  // Zeigt/versteckt Hinweis + Einstellungs-Sektion je nach Auswahl (geführter Flow).
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

  _infoPanelHtml() {
    const v = (window.NeoDashboard && window.NeoDashboard.version) || "";
    const chip = (href, label, cls = "") =>
      `<a href="${href}" target="_blank" rel="noopener" class="ni-chip ${cls}">${label}</a>`;
    return `
      <style>
        .ni { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; overflow:hidden; }
        .ni-h { display:flex; align-items:center; gap:8px; padding:11px 12px; cursor:pointer;
          font-size:14px; font-weight:600; color:var(--primary-text-color); }
        .ni-h .chev { transition:transform .2s; display:flex; color:var(--secondary-text-color); }
        .ni.open .chev { transform:rotate(90deg); }
        .ni-c { padding:4px 12px 14px; }
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
      <div class="ni ${this._infoOpen ? "open" : ""}">
        <div class="ni-h" id="ni-toggle">
          <span class="chev">${neoIcon("chevR", { size: 16, color: "currentColor" })}</span>
          <span>ℹ️ Info &amp; Support${v ? ` · v${v}` : ""}</span>
        </div>
        <div class="ni-c" id="ni-body" style="display:${this._infoOpen ? "block" : "none"}">
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

  _modStyles() {
    return `
      <style>
        .nm2 { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; overflow:hidden; }
        .nm2-h { display:flex; align-items:center; gap:8px; padding:11px 12px; cursor:pointer;
          font-size:14px; font-weight:600; color:var(--primary-text-color); }
        .nm2-h .chev { transition:transform .2s; display:flex; color:var(--secondary-text-color); }
        .nm2.open .chev { transform:rotate(90deg); }
        .nm2-c { padding:0 12px 12px; }
        .nm2-tabs { display:flex; gap:6px; margin:6px 0 10px; }
        .nm2-tab { flex:1; text-align:center; padding:8px; border-radius:9px; cursor:pointer; font-size:13px; font-weight:600;
          color:var(--secondary-text-color); background:transparent; border:1px solid var(--divider-color,rgba(255,255,255,.1)); }
        .nm2-tab.active { color:#fff; background:var(--primary-color,#7C9CFF); border-color:transparent; }
        .nm2 textarea { width:100%; box-sizing:border-box; min-height:110px; resize:vertical; margin-top:8px;
          border-radius:10px; border:1px solid var(--divider-color,rgba(255,255,255,.15));
          background:var(--secondary-background-color,#0d1020); color:var(--primary-text-color);
          font-family:ui-monospace,monospace; font-size:12px; padding:10px; }
        .nm2-input { width:100%; box-sizing:border-box; padding:9px 12px; border-radius:10px;
          border:1px solid var(--divider-color,rgba(255,255,255,.15)); background:var(--secondary-background-color,#0d1020);
          color:var(--primary-text-color); font-size:13px; }
        .nm2-btn { margin-top:8px; padding:9px 14px; border-radius:10px; cursor:pointer; border:none;
          background:var(--primary-color,#7C9CFF); color:#fff; font-size:14px; font-weight:600; }
        .nm2-btn.sm { margin:0; padding:7px 12px; font-size:12.5px; }
        .nm2-btn.ghost { background:transparent; border:1px solid var(--divider-color,rgba(255,255,255,.15)); color:var(--primary-text-color); }
        .nm2-item { display:flex; align-items:center; gap:10px; padding:9px 10px; margin-top:8px; font-size:13px;
          border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:10px; }
        .nm2-item .t { flex:1; min-width:0; }
        .nm2-item .nm { font-weight:600; color:var(--primary-text-color); }
        .nm2-item .meta { font-size:11.5px; color:var(--secondary-text-color); margin-top:1px; }
        .nm2-iconbtn { width:30px;height:30px;border:none;background:transparent;cursor:pointer; border-radius:8px;
          display:flex;align-items:center;justify-content:center;flex-shrink:0; color:var(--secondary-text-color); }
        .nm2-iconbtn.del { color:var(--error-color,#F87171); }
        .nm2-msg { font-size:12px; margin-top:8px; min-height:14px; }
        .nm2-note { font-size:11.5px; color:var(--secondary-text-color); margin:6px 0; line-height:1.4; }
        .nm2-store { border:1px solid var(--divider-color,rgba(255,255,255,.1)); border-radius:12px; padding:10px; margin-top:8px; }
        .nm2-store .img { width:100%; border-radius:8px; margin-top:8px; display:block; }
        .nm2-store .desc { font-size:12.5px; color:var(--secondary-text-color); margin-top:6px; line-height:1.45; }
        .nm2-store .row { display:flex; gap:8px; margin-top:10px; }
        .nm2-badge { display:inline-block; padding:1px 7px; border-radius:999px; font-size:10.5px; font-weight:700;
          background:rgba(94,220,184,.16); color:#5EDCB8; border:1px solid rgba(94,220,184,.4); margin-left:6px; }
      </style>`;
  }

  async _renderModPanel() {
    const backend = NeoStore.available();
    const mods = this._mods || [];
    const open = this._modOpen;
    const tab = this._modTab || "mine";

    const body = tab === "store" ? this._storeHtml() : this._mineHtml(backend, mods);

    this._modPanel.innerHTML = `
      ${this._modStyles()}
      <div class="nm2 ${open ? "open" : ""}">
        <div class="nm2-h" id="nm2-toggle">
          <span class="chev">${neoIcon("chevR", { size: 16, color: "currentColor" })}</span>
          <span>🧩 Module${mods.length ? ` (${mods.length})` : ""}</span>
        </div>
        <div class="nm2-c" id="nm2-body" style="display:${open ? "block" : "none"}">
          <div class="nm2-tabs">
            <div class="nm2-tab ${tab === "mine" ? "active" : ""}" data-tab="mine">Meine Module</div>
            <div class="nm2-tab ${tab === "store" ? "active" : ""}" data-tab="store">Modul-Store</div>
          </div>
          ${body}
          <div class="nm2-msg" id="nm2-msg"></div>
        </div>
      </div>`;

    const q = (s) => this._modPanel.querySelector(s);
    q("#nm2-toggle").addEventListener("click", () => {
      this._modOpen = !this._modOpen;
      q("#nm2-body").style.display = this._modOpen ? "block" : "none";
      this._modPanel.querySelector(".nm2").classList.toggle("open", this._modOpen);
    });
    this._modPanel.querySelectorAll(".nm2-tab").forEach((t) => {
      t.addEventListener("click", () => {
        this._modTab = t.getAttribute("data-tab");
        this._modOpen = true;
        this._renderModPanel();
        if (this._modTab === "store" && !this._storeItems) this._loadStore();
      });
    });

    if (tab === "mine") this._wireMine(backend);
    else this._wireStore(backend);
  }

  // ── My Modules tab ─────────────────────────────────────────
  _mineHtml(backend, mods) {
    if (!backend) {
      return `<div class="nm2-note">⚠️ Integration <b>Neo Dashboard Tools</b> nicht gefunden — zum zentralen Speichern/Bearbeiten bitte installieren.</div>`;
    }
    const item = (m, i, meta) => {
      if (this._editIdx === i) {
        return `<div class="nm2-item" style="flex-direction:column;align-items:stretch;">
          <div style="font-weight:600;color:var(--primary-text-color)">${meta.name} bearbeiten</div>
          <textarea data-edit="${i}">${(m.code || "").replace(/</g, "&lt;")}</textarea>
          <div class="nm2-store-row" style="display:flex;gap:8px;margin-top:8px;">
            <button class="nm2-btn sm" data-save="${i}">Speichern</button>
            <button class="nm2-btn sm ghost" data-cancel="1">Abbrechen</button>
          </div>
        </div>`;
      }
      return `<div class="nm2-item">
        <span style="font-size:18px;">${meta.icon || "📦"}</span>
        <div class="t"><div class="nm">${meta.name}</div>
          <div class="meta">${meta.version ? "v" + meta.version : ""}</div></div>
        <button class="nm2-iconbtn" data-editbtn="${i}" title="Bearbeiten">${neoIcon("settings", { size: 16, color: "currentColor" })}</button>
        <button class="nm2-iconbtn del" data-del="${i}" title="Entfernen">${neoIcon("trash", { size: 15, color: "currentColor" })}</button>
      </div>`;
    };
    // Nach Kategorie gruppieren (Original-Index für Edit/Delete erhalten).
    const cat = (a) => a === "Community" ? "Community" : a === "Premium" ? "Premium" : "Sonstige";
    const groups = { Premium: [], Community: [], Sonstige: [] };
    mods.forEach((m, i) => { const meta = this._parseMod(m.code); groups[cat(meta.author)].push({ m, i, meta }); });
    const badge = { Premium: "🟡", Community: "🟢", Sonstige: "📦" };
    const hdr = (g, n) => `<div style="font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--secondary-text-color);margin:12px 0 2px;">${badge[g]} ${g} (${n})</div>`;
    const list = ["Premium", "Community", "Sonstige"]
      .filter((g) => groups[g].length)
      .map((g) => hdr(g, groups[g].length) + groups[g].map(({ m, i, meta }) => item(m, i, meta)).join(""))
      .join("");
    return `
      ${mods.length ? list : `<div class="nm2-note">Noch keine Module installiert. Über den <b>Modul-Store</b> oder per Code-Einfügen unten hinzufügen.</div>`}
      <div style="margin-top:12px;font-size:12.5px;font-weight:700;color:var(--primary-text-color)">Code einfügen (z.B. Patreon)</div>
      <textarea id="nm2-code" placeholder="Karten-Code hier einfügen …"></textarea>
      <button class="nm2-btn" id="nm2-add">Hinzufügen / Aktualisieren</button>`;
  }

  _wireMine(backend) {
    const q = (s) => this._modPanel.querySelector(s);
    const msg = (txt, err) => {
      const m = this._modPanel.querySelector("#nm2-msg");
      if (m) { m.style.color = err ? "var(--error-color,#F87171)" : "var(--success-color,#5EDCB8)"; m.textContent = txt; }
    };
    q("#nm2-add")?.addEventListener("click", async () => {
      const code = (q("#nm2-code").value || "").trim();
      if (!code) return msg("Bitte Code einfügen.", true);
      await this._saveModule(code, msg);
    });
    this._modPanel.querySelectorAll("[data-editbtn]").forEach((b) =>
      b.addEventListener("click", () => { this._editIdx = +b.getAttribute("data-editbtn"); this._renderModPanel(); }));
    this._modPanel.querySelectorAll("[data-cancel]").forEach((b) =>
      b.addEventListener("click", () => { this._editIdx = null; this._renderModPanel(); }));
    this._modPanel.querySelectorAll("[data-save]").forEach((b) =>
      b.addEventListener("click", async () => {
        const i = +b.getAttribute("data-save");
        const ta = this._modPanel.querySelector(`textarea[data-edit="${i}"]`);
        const code = (ta?.value || "").trim();
        if (!code) return msg("Code ist leer.", true);
        this._editIdx = null;
        await this._saveModule(code, msg);
      }));
    this._modPanel.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", async () => {
        const i = +b.getAttribute("data-del");
        const mod = (this._mods || [])[i];
        if (backend && mod) { try { await NeoStore.delete(mod.name); } catch (e) {} this._mods = await NeoStore.list(); }
        this._refreshTypeOptions();
        this._renderModPanel();
      }));
  }

  async _saveModule(code, msg) {
    neoLoadModule(code);
    const meta = this._parseMod(code);
    const name = meta.type || `modul-${Date.now()}`;
    if (NeoStore.available()) {
      try { await NeoStore.save(name, code); } catch (e) { return msg("Speichern fehlgeschlagen.", true); }
      this._mods = await NeoStore.list();
    }
    this._refreshTypeOptions();
    this._renderModPanel();
    msg(`✓ Gespeichert — ${meta.name}. Oben im Kartentyp wählen.`);
  }

  // ── Module Store tab (reads GitHub Discussions) ────────────
  _extractJs(body) {
    const m = body.match(/```(?:js|javascript)?\s*\n([\s\S]*?)```/i);
    return m ? m[1].trim() : "";
  }
  _extractImage(body) {
    const m = body.match(/!\[[^\]]*\]\(([^)]+)\)/) || body.match(/<img[^>]+src=["']([^"']+)["']/i);
    return m ? m[1] : "";
  }
  _extractDesc(body) {
    const text = body
      .replace(/```[\s\S]*?```/g, "")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      .replace(/<img[^>]*>/gi, "")
      .replace(/[#>*_`]/g, "")
      .trim();
    const line = text.split("\n").map((l) => l.trim()).filter(Boolean)[0] || "";
    return line.length > 180 ? line.slice(0, 177) + "…" : line;
  }
  _parseCodeMeta(code) {
    const m = code.match(/registerCard\(\s*["'`]([\w-]+)["'`]\s*,\s*[A-Za-z_$][\w$]*\s*,\s*\{([^{}]*)\}/);
    const field = (body, key) => {
      const f = body.match(new RegExp(key + "\\s*:\\s*[\"'`]([^\"'`]+)[\"'`]"));
      return f ? f[1] : null;
    };
    if (m) return { type: m[1], name: field(m[2], "name") || m[1], version: field(m[2], "version"), author: field(m[2], "author"), icon: field(m[2], "icon") };
    const t = (code.match(/registerCard\(\s*["'`]([\w-]+)["'`]/) || [])[1];
    return { type: t, name: t, version: null, author: null, icon: null };
  }

  async _loadStore() {
    try {
      const txt = await NeoStore.fetch(NEO_LINKS.discussions);
      const discussions = JSON.parse(txt);
      const items = [];
      for (const d of discussions) {
        const code = this._extractJs(d.body || "");
        if (!code || !/registerCard\(/.test(code)) continue; // only module posts
        const meta = this._parseCodeMeta(code);
        items.push({
          name: meta.name || d.title,
          type: meta.type,
          author: meta.author || d.user?.login || "?",
          version: meta.version,
          icon: meta.icon,
          description: this._extractDesc(d.body || ""),
          image: this._extractImage(d.body || ""),
          repo: d.html_url,
          code,
        });
      }
      this._storeItems = items;
      this._storeError = null;
    } catch (e) {
      this._storeItems = [];
      this._storeError = "Store konnte nicht geladen werden (GitHub-Limit?).";
    }
    this._renderModPanel();
  }

  _storeHtml() {
    if (!NeoStore.available()) {
      return `<div class="nm2-note">⚠️ Für den Store wird die Integration <b>Neo Dashboard Tools</b> benötigt.</div>`;
    }
    if (!this._storeItems) return `<div class="nm2-note">Lade Store …</div>`;
    if (this._storeError) return `<div class="nm2-note">${this._storeError} <button class="nm2-btn sm ghost" id="nm2-reload">Erneut</button></div>`;
    const installed = new Set((this._mods || []).map((m) => this._parseMod(m.code).type));
    const ql = (this._storeQuery || "").toLowerCase();
    const items = this._storeItems.filter((it) =>
      !ql || (it.name + " " + (it.author || "") + " " + (it.description || "")).toLowerCase().includes(ql));
    const cards = items.map((it, i) => {
      const has = installed.has(it.type);
      return `<div class="nm2-store">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:18px;">🧩</span>
          <div style="flex:1;min-width:0;">
            <div class="nm">${it.name}${has ? `<span class="nm2-badge">installiert</span>` : ""}</div>
            <div class="meta" style="font-size:11.5px;color:var(--secondary-text-color)">von ${it.author || "?"}${it.version ? " · v" + it.version : ""}</div>
          </div>
        </div>
        ${it.image ? `<img class="img" src="${it.image}" loading="lazy" />` : ""}
        ${it.description ? `<div class="desc">${it.description}</div>` : ""}
        <div class="row">
          <button class="nm2-btn sm" data-install="${i}">${has ? "Aktualisieren" : "Installieren"}</button>
          ${it.repo ? `<a class="nm2-btn sm ghost" href="${it.repo}" target="_blank" rel="noopener" style="text-decoration:none;">Mehr Infos</a>` : ""}
        </div>
      </div>`;
    }).join("");
    return `
      <div class="nm2-note" style="border-left:3px solid var(--warning-color,#F0B429);">
        ⚠️ Store-Module sind <b>ungeprüfter Community-Code</b> mit vollem Frontend-Zugriff.
        Nur aus vertrauenswürdigen Quellen installieren.</div>
      <input class="nm2-input" id="nm2-search" placeholder="🔍 Module suchen …" value="${this._storeQuery || ""}" />
      ${items.length ? cards : `<div class="nm2-note">Noch keine Module veröffentlicht.</div>`}
      <div class="nm2-note" style="margin-top:10px;">Eigenes Modul teilen? Einfach eine
        <a href="${NEO_LINKS.newDiscussion}" target="_blank" rel="noopener">GitHub-Diskussion</a>
        mit deinem Code in einem <code>\`\`\`js</code>-Block erstellen.</div>`;
  }

  _wireStore() {
    const q = (s) => this._modPanel.querySelector(s);
    q("#nm2-reload")?.addEventListener("click", () => { this._storeItems = null; this._storeError = null; this._loadStore(); });
    const search = q("#nm2-search");
    if (search) {
      search.addEventListener("input", () => {
        this._storeQuery = search.value;
        const pos = search.selectionStart;
        this._renderModPanel();
        const s2 = this._modPanel.querySelector("#nm2-search");
        if (s2) { s2.focus(); s2.setSelectionRange(pos, pos); }
      });
    }
    this._modPanel.querySelectorAll("[data-install]").forEach((b) =>
      b.addEventListener("click", async () => {
        const it = this._storeItems[+b.getAttribute("data-install")];
        const msg = (t, e) => { const m = q("#nm2-msg"); if (m) { m.style.color = e ? "var(--error-color,#F87171)" : "var(--success-color,#5EDCB8)"; m.textContent = t; } };
        const src = it.url || it.discussion || "GitHub Discussions";
        const ok = window.confirm(
          `⚠ Sicherheitshinweis – „${it.name}" installieren?\n\n` +
          `Dies ist ungeprüfter Community-Code und läuft mit vollem Zugriff ` +
          `auf dein Home Assistant Frontend (Tokens, alle Entitäten).\n` +
          `Installiere nur Module aus Quellen, denen du vertraust.\n\n` +
          `Autor: ${it.author || "unbekannt"}\n` +
          `Quelle: ${src}\n\n` +
          `Fortfahren?`
        );
        if (!ok) return;
        b.textContent = "Lädt …"; b.disabled = true;
        try {
          const code = it.code; // already loaded from the discussion
          neoLoadModule(code);
          await NeoStore.save(it.type || `modul-${Date.now()}`, code);
          this._mods = await NeoStore.list();
          this._refreshTypeOptions();
          this._renderModPanel();
          msg(`✓ ${it.name} installiert. Oben im Kartentyp wählen.`);
        } catch (e) {
          msg(`Installation fehlgeschlagen: ${e?.message || e}`, true);
        }
      }));
  }

  _parseMod(code) {
    const t = (code.match(/registerCard\(\s*["'`]([\w-]+)["'`]/) || [])[1];
    const meta = t ? NeoDashboardRegistry.getMeta(t) : {};
    return {
      type: t,
      name: meta.name || t || "Modul",
      version: meta.version,
      author: meta.author,
      icon: meta.icon,
    };
  }

  _syncTypeForm() {
    if (this._typeBox) this._renderTypePicker();
    this._updateGuidedState();
  }

  _refreshTypeOptions() {
    if (this._typeBox) this._renderTypePicker();
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
    const mods = this._config.modules;
    this._config = { type: this._config.type, card_type: newType, ...(mods ? { modules: mods } : {}), ...stub };
    this._renderTypePicker();
    this._mountSub();
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
        .nt-h { font-size:12px; color:var(--secondary-text-color); margin:0 0 4px 4px; }
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
      // Stop the sub-editor's event from bubbling to HA directly —
      // otherwise HA would receive a config without type/card_type.
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
