// ============================================================================
// Neo Dashboard Kit — Mobile Screens · Build
// ----------------------------------------------------------------------------
// Generates three standalone, self-contained mobile screens (Server, Kalender,
// Raum) plus an index gallery. All three share ONE design system (neo-mobile.css)
// and ONE bottom navigation, inlined here so each file opens with no server and
// no external requests (CSP-safe).
//
//   node build.mjs
//
// Sources of truth:
//   neo-mobile.css  — the shared Neo look (tokens mirror src/core/tokens.js)
//   icons.json      — the project icon paths (extracted from src/core/icons.js)
// ============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(join(__dir, "neo-mobile.css"), "utf8");
const ICONS = JSON.parse(readFileSync(join(__dir, "icons.json"), "utf8"));

// Icons drawn with a solid fill (rest are stroked) — mirrors NEO_ICON_FILLED.
const FILLED = new Set(["play", "pause", "next", "prev", "more", "starF", "dot"]);

// ---- Icon sprite (one <symbol> per glyph, paint baked in) -----------------
function sprite() {
  const syms = Object.entries(ICONS).map(([name, path]) => {
    const paint = FILLED.has(name)
      ? `fill="currentColor"`
      : `fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`;
    return `<symbol id="i-${name}" viewBox="0 0 24 24" ${paint}>${path}</symbol>`;
  }).join("");
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${syms}</svg>`;
}

// Icon reference. Size handled by CSS on the parent component; pass a modifier
// class ("sm" / "lg") for icons that sit in text or feature boxes.
const ic = (name, cls = "") => `<svg class="i${cls ? " " + cls : ""}"><use href="#i-${name}"/></svg>`;

// ---- Bottom navigation — IDENTICAL on all screens -------------------------
// active: one of 'overview' | 'server' | 'home' | 'energy' | 'settings'
function nav(active) {
  const tab = (id, icon, label) =>
    `<button class="tab${active === id ? " active" : ""}">${ic(icon)}<span>${label}</span></button>`;
  return `<nav class="nav">
    ${tab("overview", "grid", "Übersicht")}
    ${tab("server", "server", "Server")}
    <button class="home tap" aria-label="Home">${ic("home")}</button>
    ${tab("energy", "energy", "Energie")}
    ${tab("settings", "settings", "Einstellungen")}
  </nav>`;
}

// ---- SVG progress ring -----------------------------------------------------
function ring(pct, accent, label) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return `<div class="ring">
    <svg width="62" height="62" viewBox="0 0 62 62">
      <circle cx="31" cy="31" r="${r}" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="6"/>
      <circle cx="31" cy="31" r="${r}" fill="none" stroke="var(${accent})" stroke-width="6"
        stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"
        style="filter:drop-shadow(0 0 5px var(${accent}))"/>
    </svg>
    <div class="rv">${label}</div>
  </div>`;
}

// ---- Sparkline -------------------------------------------------------------
function spark(points, accent) {
  const w = 84, h = 30, max = Math.max(...points), min = Math.min(...points);
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block">
    <polyline points="${pts}" fill="none" stroke="var(${accent})" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 4px var(${accent}))"/>
  </svg>`;
}

// ---- Avatar ---------------------------------------------------------------
const avatar = (initials, g) =>
  `<span class="avatar" style="background:${g}">${initials}</span>`;

// ---- Page skeleton (one standalone screen) --------------------------------
function page({ title, extraCSS = "", body, active }) {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1">
<meta name="theme-color" content="#06080f">
<title>${title}</title>
<style>
${CSS}
${extraCSS}
</style>
</head>
<body>
${sprite()}
<div class="phone">
  <div class="scroll">
${body}
  </div>
  ${nav(active)}
</div>
</body>
</html>`;
}

/* ==========================================================================
   SCREEN 1 · SERVER  — calm, factual, numbers-heavy
   ========================================================================== */
function screenServer() {
  const extraCSS = `
  .hero-photo.server {
    background:
      radial-gradient(80% 60% at 18% 8%, rgba(124,156,255,.34), transparent 60%),
      radial-gradient(70% 55% at 88% 2%, rgba(192,132,252,.22), transparent 62%),
      repeating-linear-gradient(115deg, rgba(124,156,255,.05) 0 2px, transparent 2px 22px),
      linear-gradient(160deg, #0f1830 0%, #0a0f1e 60%);
  }
  .kpi { padding:15px; display:flex; flex-direction:column; gap:12px; }
  .kpi .head { display:flex; align-items:center; justify-content:space-between; }
  .kpi .cap { font-size:13px; color:var(--text2); font-weight:600; display:flex; align-items:center; gap:7px; }
  .kpi .cap svg { width:15px; height:15px; color:var(--text3); }
  .kpi .num { font-size:30px; font-weight:800; letter-spacing:-.03em; line-height:1; }
  .kpi .sub { font-size:12px; color:var(--text3); }
  .listrow { display:flex; align-items:center; gap:12px; padding:12px 15px; }
  .listrow + .listrow { border-top:1px solid var(--line1); }
  .listrow .nm { font-size:14px; font-weight:600; }
  .listrow .st { margin-left:auto; font-size:12.5px; font-weight:600; color:var(--text3); display:flex; align-items:center; gap:7px; }
  .listrow .ig { width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--fill2);border:1px solid var(--line3);color:var(--text2); }
  .listrow .ig svg{width:18px;height:18px}
  .listrow.err .ig { background:color-mix(in srgb,var(--rose) 20%,transparent); border-color:color-mix(in srgb,var(--rose) 40%,transparent); color:var(--rose); }
  .listrow.err .st { color:var(--rose); }
  .updrow { display:flex; align-items:center; gap:12px; padding:12px 15px; }
  .updrow + .updrow { border-top:1px solid var(--line1); }
  .updrow .nm { font-size:14px; font-weight:600; }
  .updrow .ver { font-size:12px; color:var(--text3); }
  .netcol { flex:1; display:flex; flex-direction:column; gap:3px; align-items:flex-start; }
  .warn { display:flex; gap:12px; padding:13px 15px; align-items:flex-start; }
  .warn + .warn { border-top:1px solid var(--line1); }
  .warn .wi { width:30px;height:30px;flex:0 0 30px;border-radius:9px;display:grid;place-items:center;
    background:color-mix(in srgb,var(--rose) 18%,transparent); color:var(--rose); border:1px solid color-mix(in srgb,var(--rose) 34%,transparent); }
  .warn .wi svg{width:17px;height:17px}
  .warn .wt { font-size:13.5px; font-weight:600; line-height:1.3; }
  .warn .wm { font-size:12px; color:var(--text3); margin-top:2px; }
  `;

  const body = `
    <div class="hero-photo server"></div>

    <div class="topbar">
      <h1>Server</h1>
      <span class="dot g pulse" style="margin-top:4px"></span>
      <div class="spacer"></div>
      <button class="iconbtn" aria-label="Aktualisieren">${ic("refresh")}</button>
    </div>

    <div class="content">

      <!-- Health hero -->
      <section class="glass pad glow a-mint" style="--a-line:color-mix(in srgb,var(--mint) 22%,transparent)">
        <div class="row" style="gap:14px">
          <div style="width:52px;height:52px;border-radius:16px;display:grid;place-items:center;
              background:color-mix(in srgb,var(--mint) 20%,transparent);border:1px solid color-mix(in srgb,var(--mint) 40%,transparent);color:var(--mint)">
            ${ic("shieldOk","lg")}
          </div>
          <div>
            <div style="font-size:22px;font-weight:800;letter-spacing:-.03em;color:var(--mint)">Alles läuft</div>
            <div class="muted" style="font-size:13px;margin-top:2px">Home Assistant · Beitcore Core</div>
          </div>
        </div>
        <div class="hscroll" style="margin-top:14px">
          <span class="pill">${ic("clock")}<span><span class="v">14 T</span> <span class="l">Uptime</span></span></span>
          <span class="pill">${ic("info")}<span><span class="v">2026.7.1</span> <span class="l">HA</span></span></span>
          <span class="pill">${ic("cloud")}<span><span class="v">03:12</span> <span class="l">Backup</span></span></span>
        </div>
      </section>

      <!-- 2×2 KPI grid -->
      <div class="grid2">
        <div class="glass kpi">
          <div class="head">
            <div class="cap">${ic("gauge")} CPU-Last</div>
            ${ring(34, "--mint", '<span style="font-size:0">.</span>')}
          </div>
          <div><span class="num">34</span><span class="unit"> %</span></div>
          <div class="sub">4 Kerne · Ø 1.1 GHz</div>
        </div>

        <div class="glass kpi">
          <div class="head">
            <div class="cap">${ic("server")} RAM</div>
            ${ring(58, "--blue", '<span style="font-size:0">.</span>')}
          </div>
          <div><span class="num">58</span><span class="unit"> %</span></div>
          <div class="sub">4,6 / 8,0 GB</div>
        </div>

        <div class="glass kpi">
          <div class="head">
            <div class="cap">${ic("devices")} Speicher</div>
            ${spark([40, 42, 41, 44, 46, 45, 47], "--blue")}
          </div>
          <div><span class="num">182</span><span class="unit"> GB frei</span></div>
          <div class="sub">von 256 GB · 71 % belegt</div>
        </div>

        <div class="glass kpi">
          <div class="head">
            <div class="cap">${ic("thermo")} CPU-Temp</div>
            ${ring(62, "--amber", '<span style="font-size:0">.</span>')}
          </div>
          <div><span class="num" style="color:var(--amber)">62</span><span class="unit"> °C</span></div>
          <div class="sub">Grenzwert 90 °C</div>
        </div>
      </div>

      <!-- Integrations & Add-ons -->
      <div class="sechead"><h2>Integrationen &amp; Add-ons</h2><span class="all">Alle anzeigen ${ic("chevR")}</span></div>
      <section class="glass">
        <div class="listrow err">
          <div class="ig">${ic("warning")}</div>
          <div><div class="nm">Zigbee2MQTT</div></div>
          <div class="st"><span class="dot r"></span>Fehler</div>
        </div>
        <div class="listrow err">
          <div class="ig">${ic("camera")}</div>
          <div><div class="nm">Frigate NVR</div></div>
          <div class="st"><span class="dot r"></span>Neustart</div>
        </div>
        <div class="listrow">
          <div class="ig">${ic("home")}</div>
          <div><div class="nm">Mosquitto Broker</div></div>
          <div class="st"><span class="dot g"></span>läuft</div>
        </div>
        <div class="listrow">
          <div class="ig">${ic("router_wifi")}</div>
          <div><div class="nm">UniFi Network</div></div>
          <div class="st"><span class="dot g"></span>läuft</div>
        </div>
        <div class="listrow">
          <div class="ig">${ic("music")}</div>
          <div><div class="nm">Music Assistant</div></div>
          <div class="st"><span class="dot g"></span>läuft</div>
        </div>
      </section>

      <!-- Network -->
      <div class="sechead"><h2>Netzwerk</h2></div>
      <section class="glass pad">
        <div class="row" style="gap:14px">
          <div style="width:46px;height:46px;border-radius:14px;display:grid;place-items:center;
              background:color-mix(in srgb,var(--blue) 18%,transparent);border:1px solid color-mix(in srgb,var(--blue) 36%,transparent);color:var(--blue)">
            ${ic("wifi","lg")}
          </div>
          <div class="netcol">
            <div style="font-size:14px;font-weight:700">Beitcore-WLAN</div>
            <div class="muted" style="font-size:12px">32 Clients verbunden</div>
          </div>
          <div style="text-align:right">
            <div class="row" style="justify-content:flex-end;gap:5px;color:var(--mint)">${ic("arrDown")}<span style="font-weight:700;font-size:15px">86,4</span></div>
            <div class="row" style="justify-content:flex-end;gap:5px;color:var(--blue);margin-top:3px">${ic("arrUp")}<span style="font-weight:700;font-size:15px">12,1</span></div>
            <div class="muted" style="font-size:10px;text-align:right;margin-top:1px">Mbit/s</div>
          </div>
        </div>
      </section>

      <!-- Updates -->
      <div class="sechead"><h2>Updates</h2><span class="badge" style="margin-left:auto">3</span></div>
      <section class="glass">
        <div class="updrow">
          <div><div class="nm">Home Assistant Core</div><div class="ver">2026.7.1 → 2026.7.3</div></div>
          <button class="btn amber" style="margin-left:auto">${ic("arrUp")}Aktualisieren</button>
        </div>
        <div class="updrow">
          <div><div class="nm">Operating System</div><div class="ver">13.1 → 13.2</div></div>
          <button class="btn amber" style="margin-left:auto">${ic("arrUp")}Aktualisieren</button>
        </div>
        <div class="updrow">
          <div><div class="nm">3 Add-ons</div><div class="ver">File editor, Samba, Node-RED</div></div>
          <button class="btn amber" style="margin-left:auto">${ic("arrUp")}Alle</button>
        </div>
      </section>

      <!-- Backup -->
      <section class="glass pad">
        <div class="between">
          <div class="row" style="gap:13px">
            <div style="width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:var(--fill2);border:1px solid var(--line3);color:var(--text2)">${ic("cloud","lg")}</div>
            <div>
              <div style="font-size:14px;font-weight:700">Backup</div>
              <div class="muted" style="font-size:12px">Zuletzt heute 03:12 · 1,2 GB</div>
            </div>
          </div>
          <button class="btn mint">${ic("shieldOk")}Jetzt sichern</button>
        </div>
      </section>

      <!-- Warnings / errors -->
      <div class="sechead"><h2 style="color:var(--rose)">Letzte Warnungen</h2></div>
      <section class="glass" style="border-color:color-mix(in srgb,var(--rose) 26%,transparent)">
        <div class="warn">
          <div class="wi">${ic("warning")}</div>
          <div><div class="wt">Zigbee-Koordinator antwortet nicht</div><div class="wm">Zigbee2MQTT · vor 6 Min</div></div>
        </div>
        <div class="warn">
          <div class="wi">${ic("warning")}</div>
          <div><div class="wt">Kamera „Einfahrt" offline</div><div class="wm">Frigate NVR · vor 22 Min</div></div>
        </div>
        <div class="warn">
          <div class="wi" style="background:color-mix(in srgb,var(--amber) 16%,transparent);color:var(--amber);border-color:color-mix(in srgb,var(--amber) 30%,transparent)">${ic("info")}</div>
          <div><div class="wt">Datenbank &gt; 2 GB — Aufräumen empfohlen</div><div class="wm">Recorder · vor 1 Std</div></div>
        </div>
      </section>

    </div>`;

  return { title: "Neo · Server", label: "Server", extraCSS, body, active: "server" };
}

/* ==========================================================================
   SCREEN 2 · KALENDER — agenda-first
   ========================================================================== */
function screenCalendar() {
  const extraCSS = `
  .hero-photo.cal {
    background:
      radial-gradient(72% 60% at 22% 6%, rgba(192,132,252,.34), transparent 60%),
      radial-gradient(66% 52% at 90% 0%, rgba(124,156,255,.24), transparent 62%),
      linear-gradient(160deg, #171126 0%, #0b0f1f 60%);
  }
  .seg { display:flex; gap:2px; padding:3px; border-radius:999px; background:var(--fill1); border:1px solid var(--line3); }
  .seg button { border:0; background:none; color:var(--text3); font-size:12.5px; font-weight:600;
    padding:6px 12px; border-radius:999px; cursor:pointer; font-family:var(--font); }
  .seg button.on { background:var(--fill2); color:var(--text1); box-shadow:0 2px 8px -3px var(--shadow1); }
  .week { display:flex; gap:8px; }
  .day { flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; padding:10px 0 8px;
    border-radius:16px; background:var(--fill1); border:1px solid var(--line2); cursor:pointer; }
  .day .dn { font-size:11px; color:var(--text3); font-weight:600; }
  .day .dd { font-size:16px; font-weight:700; }
  .day .ev { width:5px; height:5px; border-radius:999px; }
  .day.on { background:linear-gradient(180deg, color-mix(in srgb,var(--violet) 26%,transparent), color-mix(in srgb,var(--violet) 10%,transparent));
    border-color:color-mix(in srgb,var(--violet) 46%,transparent); box-shadow:0 10px 24px -12px var(--violet-glow); }
  .day.on .dn, .day.on .dd { color:var(--text1); }
  .agenda { display:grid; grid-template-columns:52px 1fr; gap:12px; }
  .agenda .time { text-align:right; padding-top:14px; }
  .agenda .time .t { font-size:14px; font-weight:700; }
  .agenda .time .m { font-size:11px; color:var(--text3); }
  .evcard { position:relative; padding:13px 15px 13px 18px; }
  .evcard::before { content:""; position:absolute; left:0; top:10px; bottom:10px; width:4px; border-radius:999px; background:var(--cc, var(--blue)); }
  .evcard .et { font-size:14.5px; font-weight:700; }
  .evcard .em { font-size:12px; color:var(--text3); margin-top:3px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .locchip { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:999px; background:var(--fill2); border:1px solid var(--line3); font-size:11px; color:var(--text2); }
  .locchip svg { width:12px; height:12px; }
  .allday { display:flex; align-items:center; gap:10px; padding:11px 15px; border-radius:999px;
    background:linear-gradient(90deg, color-mix(in srgb,var(--mint) 16%,transparent), var(--fill1));
    border:1px solid color-mix(in srgb,var(--mint) 26%,transparent); }
  .allday .nm { font-size:13.5px; font-weight:600; }
  .groupdate { font-size:12px; font-weight:700; color:var(--text2); letter-spacing:.02em; text-transform:uppercase; padding:6px 2px 0; }
  .fchip { display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:999px;
    background:var(--fill1); border:1px solid var(--line3); font-size:13px; font-weight:600; color:var(--text1); cursor:pointer; }
  .fchip.off { color:var(--text3); background:var(--fill0); }
  .fchip.off .dot { opacity:.4; }
  `;

  const A = (i, g) => avatar(i, g);
  const gViolet = "linear-gradient(135deg,#c084fc,#8b5cf6)";
  const gBlue   = "linear-gradient(135deg,#7C9CFF,#5570e6)";
  const gMint   = "linear-gradient(135deg,#5EDCB8,#2fb894)";
  const gAmber  = "linear-gradient(135deg,#FFB26B,#f2914a)";

  const body = `
    <div class="hero-photo cal"></div>

    <div class="topbar">
      <h1>Kalender</h1>
      <div class="spacer"></div>
      <span class="pill a-violet" style="padding:7px 13px;background:color-mix(in srgb,var(--violet) 16%,transparent);border-color:color-mix(in srgb,var(--violet) 32%,transparent)">
        ${ic("calendar")}<span class="v" style="color:var(--violet)">Heute</span>
      </span>
    </div>

    <div class="content">

      <!-- toggle -->
      <div class="seg" style="align-self:flex-start;width:max-content">
        <button class="on">Tag</button><button>Woche</button><button>Monat</button>
      </div>

      <!-- Next event hero -->
      <section class="glass pad glow a-violet" style="--a-line:color-mix(in srgb,var(--violet) 24%,transparent);
          background:linear-gradient(180deg, color-mix(in srgb,var(--violet) 15%,transparent), var(--fill0))">
        <div class="between">
          <div class="row" style="gap:8px"><span class="dot v"></span><span class="muted" style="font-size:12px;font-weight:600">Nächster Termin · Arbeit</span></div>
          <span class="pill" style="padding:5px 11px;background:color-mix(in srgb,var(--violet) 18%,transparent);border-color:color-mix(in srgb,var(--violet) 34%,transparent)">
            <span class="v" style="color:var(--violet);font-size:13px">in 40 Min</span></span>
        </div>
        <div style="font-size:22px;font-weight:800;letter-spacing:-.03em;margin-top:12px">Sprint-Planning</div>
        <div class="row" style="gap:12px;margin-top:8px">
          <span class="row" style="gap:6px;color:var(--text2);font-size:14px;font-weight:600">${ic("clock","sm")}09:30 – 10:30</span>
          <span class="locchip">${ic("home")}Büro · Raum 2.14</span>
        </div>
        <div class="between" style="margin-top:14px">
          <div class="avstack">
            ${A("AB", gViolet)}${A("MK", gBlue)}${A("TS", gMint)}
            <span class="avatar" style="background:var(--fill2);color:var(--text2);border-color:rgba(10,14,24,.9)">+2</span>
          </div>
          <button class="btn ghost">${ic("chevR")}Details</button>
        </div>
      </section>

      <!-- Week strip -->
      <div class="week">
        <div class="day"><span class="dn">Mo</span><span class="dd">6</span><span class="ev" style="background:var(--blue)"></span></div>
        <div class="day"><span class="dn">Di</span><span class="dd">7</span><span class="ev" style="background:var(--mint)"></span></div>
        <div class="day on"><span class="dn">Mi</span><span class="dd">8</span><span class="ev" style="background:var(--violet)"></span></div>
        <div class="day"><span class="dn">Do</span><span class="dd">9</span><span class="ev" style="background:transparent"></span></div>
        <div class="day"><span class="dn">Fr</span><span class="dd">10</span><span class="ev" style="background:var(--amber)"></span></div>
        <div class="day"><span class="dn">Sa</span><span class="dd">11</span><span class="ev" style="background:var(--rose)"></span></div>
        <div class="day"><span class="dn">So</span><span class="dd">12</span><span class="ev" style="background:transparent"></span></div>
      </div>

      <!-- Agenda: Heute -->
      <div class="groupdate">Heute · Mittwoch, 8. Juli</div>

      <div class="allday">
        <span class="dot g"></span><span class="nm">Urlaub — Team Design</span>
        <span class="muted" style="margin-left:auto;font-size:11px">ganztägig</span>
      </div>

      <div class="agenda">
        <div class="time"><div class="t">09:30</div><div class="m">1 Std</div></div>
        <div class="glass evcard" style="--cc:var(--violet)">
          <div class="et">Sprint-Planning</div>
          <div class="em"><span class="locchip">${ic("home")}Büro 2.14</span>
            <span class="avstack" style="margin-left:2px">${A("AB", gViolet)}${A("MK", gBlue)}${A("TS", gMint)}</span></div>
        </div>

        <div class="time"><div class="t">12:15</div><div class="m">45 Min</div></div>
        <div class="glass evcard" style="--cc:var(--blue)">
          <div class="et">Mittagessen mit Lena</div>
          <div class="em"><span class="locchip">${ic("coffee")}Café Nord</span></div>
        </div>

        <div class="time"><div class="t">16:00</div><div class="m">30 Min</div></div>
        <div class="glass evcard" style="--cc:var(--amber)">
          <div class="et">Zahnarzt Dr. Weber</div>
          <div class="em"><span class="locchip">${ic("home")}Hauptstr. 12</span></div>
        </div>
      </div>

      <!-- Agenda: Morgen -->
      <div class="groupdate">Morgen · Donnerstag, 9. Juli</div>
      <div class="agenda">
        <div class="time"><div class="t">08:00</div><div class="m">ganztg.</div></div>
        <div class="glass evcard" style="--cc:var(--rose)">
          <div class="et">Müllabfuhr — Restmüll</div>
          <div class="em"><span class="locchip">${ic("trash")}Tonne rausstellen</span></div>
        </div>

        <div class="time"><div class="t">19:30</div><div class="m">2 Std</div></div>
        <div class="glass evcard" style="--cc:var(--mint)">
          <div class="et">Geburtstag Opa Karl</div>
          <div class="em"><span class="locchip">${ic("home")}Bei den Großeltern</span>
            <span class="avstack" style="margin-left:2px">${A("KK", gAmber)}${A("OM", gMint)}</span></div>
        </div>
      </div>

      <!-- Calendar filters -->
      <div class="sechead"><h2>Kalender</h2></div>
      <div class="hscroll">
        <span class="fchip">${ic("people")}<span class="dot" style="background:var(--mint)"></span>Familie</span>
        <span class="fchip">${ic("grid")}<span class="dot" style="background:var(--violet)"></span>Arbeit</span>
        <span class="fchip off">${ic("trash")}<span class="dot" style="background:var(--rose)"></span>Müllabfuhr</span>
        <span class="fchip">${ic("heart")}<span class="dot" style="background:var(--amber)"></span>Geburtstage</span>
      </div>

    </div>`;

  return { title: "Neo · Kalender", label: "Kalender", extraCSS, body, active: "overview" };
}

/* ==========================================================================
   SCREEN 3 · RAUM — "Wohnzimmer" (the most important screen)
   ========================================================================== */
function screenRoom() {
  const extraCSS = `
  .roomhero { position:relative; height:300px; z-index:0; overflow:hidden; }
  .roomhero .photo {
    position:absolute; inset:0;
    background:
      radial-gradient(60% 50% at 78% 24%, rgba(255,178,107,.55), transparent 60%),
      radial-gradient(48% 44% at 22% 30%, rgba(255,150,80,.30), transparent 60%),
      radial-gradient(90% 70% at 50% 0%, rgba(124,110,90,.35), transparent 70%),
      linear-gradient(165deg, #2a1d14 0%, #1a130f 42%, #0c0a0d 78%, #06080f 100%);
  }
  .roomhero .photo::after {
    content:""; position:absolute; inset:0;
    background:
      repeating-linear-gradient(180deg, rgba(0,0,0,.06) 0 3px, transparent 3px 8px),
      linear-gradient(180deg, rgba(6,8,15,0) 40%, rgba(6,8,15,.55) 74%, #06080f 100%);
  }
  .roomhero .toppills { position:absolute; left:16px; right:16px; top:calc(var(--sa-top) + 14px);
    display:flex; justify-content:space-between; z-index:2; }
  .gpill { display:inline-flex; align-items:center; gap:7px; padding:8px 13px; border-radius:999px;
    background:rgba(12,14,22,.5); border:1px solid var(--line4); backdrop-filter:var(--blur); -webkit-backdrop-filter:var(--blur);
    font-size:13px; font-weight:600; color:var(--text1); cursor:pointer; }
  .gpill svg { width:15px; height:15px; color:var(--text2); }
  .roomhero .caption { position:absolute; left:16px; right:16px; bottom:16px; z-index:2; }
  .roomhero .caption h1 { font-size:34px; font-weight:800; letter-spacing:-.035em; }
  .roomhero .caption .sub { font-size:14px; color:var(--text2); font-weight:600; margin-top:2px;
    display:inline-flex; align-items:center; gap:7px; }

  .statpill { flex:1; display:flex; align-items:center; gap:11px; padding:13px 15px; }
  .statpill .si { width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--fill2);border:1px solid var(--line3);color:var(--text2); }
  .statpill .si svg { width:20px; height:20px; }
  .statpill .sv { font-size:20px; font-weight:800; letter-spacing:-.02em; }
  .statpill .sl { font-size:11.5px; color:var(--text3); }

  .scene { position:relative; width:132px; height:96px; border-radius:20px; overflow:hidden;
    border:1px solid var(--line3); cursor:pointer; }
  .scene .sph { position:absolute; inset:0; }
  .scene .sph::after { content:""; position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.55)); }
  .scene .lbl { position:absolute; left:12px; bottom:11px; z-index:2; display:flex; align-items:center; gap:7px;
    font-size:13.5px; font-weight:700; }
  .scene .lbl svg { width:15px; height:15px; }
  .scene .play { position:absolute; right:10px; bottom:10px; z-index:2; width:30px; height:30px; border-radius:999px;
    display:grid; place-items:center; background:rgba(12,14,22,.55); border:1px solid var(--line5); backdrop-filter:blur(8px); color:#fff; }
  .scene .play svg { width:14px; height:14px; }
  .scene.on-rose  { border-color:color-mix(in srgb,var(--rose) 60%,transparent); box-shadow:0 0 0 1px var(--rose) inset, 0 10px 26px -12px var(--rose-glow); }
  .scene.on-amber { border-color:color-mix(in srgb,var(--amber) 60%,transparent); box-shadow:0 0 0 1px var(--amber) inset, 0 10px 26px -12px var(--amber-glow); }
  .scene.on-blue  { border-color:color-mix(in srgb,var(--blue) 60%,transparent); box-shadow:0 0 0 1px var(--blue) inset, 0 10px 26px -12px var(--blue-glow); }

  .devgrid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .dev { padding:14px; display:flex; flex-direction:column; gap:11px; min-height:112px; }
  .dev .top { display:flex; align-items:flex-start; justify-content:space-between; }
  .dev .di { width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--fill2);border:1px solid var(--line3);color:var(--text2); }
  .dev .di svg { width:20px; height:20px; }
  .dev .nm { font-size:14px; font-weight:700; letter-spacing:-.01em; }
  .dev .stt { font-size:12px; color:var(--text3); margin-top:2px; }
  .dev .foot { margin-top:auto; }
  .sw { width:38px; height:23px; border-radius:999px; background:var(--fill2); border:1px solid var(--line4); position:relative; }
  .sw::after { content:""; position:absolute; top:2px; left:2px; width:17px; height:17px; border-radius:999px; background:var(--text3); transition:.2s; }
  .dev.on .di { background:color-mix(in srgb,var(--a) 24%,transparent); border-color:color-mix(in srgb,var(--a) 44%,transparent); color:var(--a); }
  .dev.on { background:linear-gradient(180deg, color-mix(in srgb,var(--a) 12%,transparent), var(--fill0)); border-color:color-mix(in srgb,var(--a) 30%,transparent); }
  .dev.on .sw { background:color-mix(in srgb,var(--a) 55%,transparent); border-color:color-mix(in srgb,var(--a) 60%,transparent); }
  .dev.on .sw::after { left:18px; background:#fff; }
  .dev.on .stt { color:var(--a); font-weight:600; }
  .dev.problem { border-color:color-mix(in srgb,var(--rose) 46%,transparent); box-shadow:0 0 0 1px color-mix(in srgb,var(--rose) 30%,transparent) inset; }
  .dev.problem .di { background:color-mix(in srgb,var(--rose) 20%,transparent); border-color:color-mix(in srgb,var(--rose) 40%,transparent); color:var(--rose); }
  .dev.problem .stt { color:var(--rose); font-weight:600; }
  .grouplabel { font-size:12px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:.03em; padding:8px 2px 0; }
  .mediabar { display:flex; align-items:center; gap:6px; }
  .mbtn { width:30px;height:30px;border-radius:999px;display:grid;place-items:center;background:color-mix(in srgb,var(--blue) 22%,transparent);border:1px solid color-mix(in srgb,var(--blue) 40%,transparent);color:var(--blue); }
  .mbtn svg { width:14px; height:14px; }
  .vol { flex:1; height:5px; border-radius:999px; background:var(--fill2); position:relative; overflow:hidden; }
  .vol i { position:absolute; left:0; top:0; bottom:0; width:46%; background:var(--blue); }
  `;

  // sub-icon helper for stat: use a drop shape via 'water'
  const body = `
    <!-- Full-bleed room photo -->
    <div class="roomhero">
      <div class="photo"></div>
      <div class="toppills">
        <span class="gpill">${ic("chevL")}17 Geräte</span>
        <span class="gpill" style="border-color:color-mix(in srgb,var(--rose) 42%,transparent)">
          <span class="dot r pulse"></span>9 Probleme</span>
      </div>
      <div class="caption">
        <h1>Wohnzimmer</h1>
        <div class="sub">${ic("sun","sm")}Szene: Hell</div>
      </div>
    </div>

    <div class="content" style="margin-top:14px">

      <!-- Stat pills -->
      <div class="row" style="gap:12px">
        <div class="glass statpill">
          <div class="si">${ic("thermo")}</div>
          <div><div class="sv">23 °C</div><div class="sl">Temperatur</div></div>
        </div>
        <div class="glass statpill">
          <div class="si">${ic("water")}</div>
          <div><div class="sv">61 %</div><div class="sl">Luftfeuchtigkeit</div></div>
        </div>
      </div>

      <!-- Quick controls -->
      <div class="hscroll">
        <button class="chip on a-amber">
          <div class="top"><div class="ico">${ic("lightbulb")}</div><span class="dot a"></span></div>
          <div><div class="state">Aus</div><div class="name">Licht an</div></div>
        </button>
        <button class="chip on a-amber">
          <div class="top"><div class="ico">${ic("blinds")}</div><span class="dot a"></span></div>
          <div><div class="state">Offen</div><div class="name">Rolladen</div></div>
        </button>
        <button class="chip on a-blue">
          <div class="top"><div class="ico">${ic("robot")}</div><span class="dot b"></span></div>
          <div><div class="state">An</div><div class="name">Robby A…</div></div>
        </button>
        <button class="chip on a-blue">
          <div class="top"><div class="ico">${ic("robot")}</div><span class="dot b"></span></div>
          <div><div class="state">An</div><div class="name">Robby C…</div></div>
        </button>
      </div>

      <!-- Scenes -->
      <div class="sechead"><h2>Szenen</h2><span class="all">Alle anzeigen ${ic("chevR")}</span></div>
      <div class="hscroll">
        <div class="scene on-rose">
          <div class="sph" style="background:linear-gradient(160deg,#2a0f12,#0c0a0d)"></div>
          <div class="lbl" style="color:var(--rose)">${ic("power")}Alles Aus</div>
          <div class="play">${ic("play")}</div>
        </div>
        <div class="scene on-amber">
          <div class="sph" style="background:radial-gradient(70% 70% at 60% 30%,rgba(255,178,107,.7),transparent 65%),linear-gradient(160deg,#3a2413,#140f0c)"></div>
          <div class="lbl" style="color:var(--amber)">${ic("settings")}Hell</div>
          <div class="play">${ic("play")}</div>
        </div>
        <div class="scene on-blue">
          <div class="sph" style="background:radial-gradient(70% 70% at 40% 30%,rgba(124,156,255,.55),transparent 65%),linear-gradient(160deg,#111a33,#0a0d18)"></div>
          <div class="lbl" style="color:var(--blue)">${ic("tv")}Filmabend</div>
          <div class="play">${ic("play")}</div>
        </div>
        <div class="scene">
          <div class="sph" style="background:radial-gradient(70% 70% at 50% 30%,rgba(94,220,184,.4),transparent 65%),linear-gradient(160deg,#0f2620,#0a0d14)"></div>
          <div class="lbl">${ic("leaf")}Gute Nacht</div>
          <div class="play">${ic("play")}</div>
        </div>
      </div>

      <!-- Devices by group -->
      <div class="sechead"><h2>Geräte</h2><span class="muted" style="margin-left:auto;font-size:12px">17 · Wohnzimmer</span></div>

      <div class="grouplabel">Licht &amp; Beschattung</div>
      <div class="devgrid stack-reset">
        <div class="dev glass on a-amber">
          <div class="top"><div class="di">${ic("lightbulb")}</div><div class="sw"></div></div>
          <div class="foot"><div class="nm">Deckenlicht</div><div class="stt">An · 80 % · Warmweiß</div></div>
        </div>
        <div class="dev glass on a-amber">
          <div class="top"><div class="di">${ic("lightbulb")}</div><div class="sw"></div></div>
          <div class="foot"><div class="nm">Stehlampe</div><div class="stt">An · 45 %</div></div>
        </div>
        <div class="dev glass on a-amber">
          <div class="top"><div class="di">${ic("blinds")}</div><div class="sw"></div></div>
          <div class="foot"><div class="nm">Rollladen</div><div class="stt">Offen · Position 100 %</div></div>
        </div>
        <div class="dev glass">
          <div class="top"><div class="di">${ic("window")}</div><div class="sw"></div></div>
          <div class="foot"><div class="nm">Gardine</div><div class="stt">Geschlossen</div></div>
        </div>
      </div>

      <div class="grouplabel">Klima &amp; Luft</div>
      <div class="devgrid">
        <div class="dev glass on a-amber">
          <div class="top"><div class="di">${ic("flame")}</div><div class="sw"></div></div>
          <div class="foot"><div class="nm">Heizung</div><div class="stt">23,0 → 22,0 °C · Heizen</div></div>
        </div>
        <div class="dev glass on a-blue">
          <div class="top"><div class="di">${ic("fan")}</div><div class="sw"></div></div>
          <div class="foot"><div class="nm">Ventilator</div><div class="stt">An · Stufe 2</div></div>
        </div>
      </div>

      <div class="grouplabel">Medien &amp; Roboter</div>
      <div class="devgrid">
        <div class="dev glass on a-blue" style="grid-column:1 / -1">
          <div class="top"><div class="di">${ic("music")}</div>
            <span class="muted" style="font-size:11px">Sonos · Wohnzimmer</span></div>
          <div class="foot" style="display:flex;flex-direction:column;gap:9px">
            <div><div class="nm">Tame Impala — Let It Happen</div><div class="stt" style="color:var(--text3)">läuft · 2:14 / 7:31</div></div>
            <div class="mediabar">
              <span class="mbtn">${ic("prev")}</span>
              <span class="mbtn" style="background:var(--blue);color:#0a1330">${ic("pause")}</span>
              <span class="mbtn">${ic("next")}</span>
              ${ic("volume")}
              <span class="vol"><i></i></span>
            </div>
          </div>
        </div>
        <div class="dev glass on a-blue">
          <div class="top"><div class="di">${ic("robot")}</div><div class="sw"></div></div>
          <div class="foot"><div class="nm">Robby A…</div><div class="stt">Reinigt · 62 %</div></div>
        </div>
        <div class="dev glass on a-blue">
          <div class="top"><div class="di">${ic("robot")}</div><span class="btn ghost" style="height:26px;padding:0 10px;font-size:11px">Dock</span></div>
          <div class="foot"><div class="nm">Robby C…</div><div class="stt">Reinigt · 34 %</div></div>
        </div>
      </div>

      <div class="grouplabel">Sicherheit &amp; Sensoren</div>
      <div class="devgrid">
        <div class="dev glass">
          <div class="top"><div class="di">${ic("lock")}</div><div class="sw"></div></div>
          <div class="foot"><div class="nm">Terrassentür</div><div class="stt">Verriegelt</div></div>
        </div>
        <div class="dev glass on a-mint">
          <div class="top"><div class="di">${ic("motion")}</div><span class="dot g"></span></div>
          <div class="foot"><div class="nm">Bewegung</div><div class="stt">Erkannt · vor 1 Min</div></div>
        </div>
        <div class="dev glass problem">
          <div class="top"><div class="di">${ic("warning")}</div><span class="dot r"></span></div>
          <div class="foot"><div class="nm">Fenster-Sensor</div><div class="stt">Batterie 8 %</div></div>
        </div>
        <div class="dev glass problem">
          <div class="top"><div class="di">${ic("warning")}</div><span class="dot r"></span></div>
          <div class="foot"><div class="nm">TV-Steckdose</div><div class="stt">Nicht erreichbar</div></div>
        </div>
      </div>

    </div>`;

  return { title: "Neo · Wohnzimmer", label: "Wohnzimmer", extraCSS, body, active: "home" };
}

/* ==========================================================================
   INDEX — gallery of the three screens side by side
   ========================================================================== */
function indexPage() {
  const frame = (file, name) =>
    `<figure class="frame">
      <iframe src="${file}" title="${name}" loading="lazy"></iframe>
      <figcaption>${name}</figcaption>
    </figure>`;
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Neo · Mobile Screens</title>
<style>
  :root{ --violet:#C084FC; --blue:#7C9CFF; }
  *{box-sizing:border-box;margin:0;padding:0}
  body{ font-family:-apple-system,"SF Pro Display","Inter",system-ui,sans-serif; color:#F4F6FB;
    background:radial-gradient(120% 80% at 50% -10%,#0d1424,#05070d); min-height:100vh; padding:48px 20px 80px; }
  header{ max-width:1160px; margin:0 auto 34px; }
  h1{ font-size:30px; font-weight:800; letter-spacing:-.03em; }
  p{ color:rgba(244,246,251,.6); margin-top:8px; font-size:15px; max-width:640px; line-height:1.5; }
  .gallery{ max-width:1160px; margin:0 auto; display:flex; gap:28px; flex-wrap:wrap; justify-content:center; }
  .frame{ display:flex; flex-direction:column; align-items:center; gap:14px; }
  .frame iframe{ width:390px; height:800px; border:0; border-radius:44px;
    box-shadow:0 40px 90px -30px rgba(0,0,0,.8), 0 0 0 10px #0a0d16, 0 0 0 11px rgba(255,255,255,.08);
    background:#06080f; }
  figcaption{ font-size:14px; font-weight:600; color:rgba(244,246,251,.72); letter-spacing:.01em; }
  @media (max-width:520px){ .frame iframe{ width:min(88vw,390px); height:min(180vw,800px);} }
</style>
</head>
<body>
  <header>
    <h1>Neo Dashboard — Mobile Screens</h1>
    <p>Drei zusammengehörige Screens im „Neo"-Look mit identischer Design-Sprache
       und gemeinsamer Bottom-Navigation: Server, Kalender und Wohnzimmer.
       iPhone-Hochformat, ein-spaltig, Glaskarten mit Blur.</p>
  </header>
  <div class="gallery">
    ${frame("server.html", "Server")}
    ${frame("calendar.html", "Kalender")}
    ${frame("room.html", "Wohnzimmer")}
  </div>
</body>
</html>`;
}

/* ==========================================================================
   ARTIFACT — all three phones in ONE self-contained page (no iframes).
   Shared CSS + sprite appear once; each screen becomes a scrollable .phone.
   ========================================================================== */
function artifactPage(screens) {
  const allExtra = screens.map((s) => s.extraCSS).join("\n");
  const phones = screens.map((s) => `
    <figure class="dev-frame">
      <div class="phone">
        <div class="scroll">
${s.body}
        </div>
        ${nav(s.active)}
      </div>
      <figcaption>${s.label}</figcaption>
    </figure>`).join("");

  const galleryCSS = `
  body { display:block; padding:40px 16px 64px; overflow-x:hidden; }
  .a-head { max-width:1200px; margin:0 auto 30px; }
  .a-head h1 { font-size:clamp(24px,5vw,32px); font-weight:800; letter-spacing:-.03em; }
  .a-head p { color:var(--text3); margin-top:8px; font-size:15px; line-height:1.55; max-width:680px; }
  .gallery { display:flex; gap:34px; justify-content:center; align-items:flex-start; flex-wrap:wrap; max-width:1300px; margin:0 auto; }
  .dev-frame { display:flex; flex-direction:column; align-items:center; gap:16px; }
  .dev-frame .phone {
    width:390px; height:800px; min-height:0; border-radius:46px;
    box-shadow:0 44px 100px -34px rgba(0,0,0,.85), 0 0 0 11px #0a0d16, 0 0 0 12px rgba(255,255,255,.08);
  }
  .dev-frame .scroll { height:800px; }
  .dev-frame figcaption { font-size:14px; font-weight:600; color:var(--text2); }
  @media (max-width:460px){
    .dev-frame .phone{ width:min(90vw,390px); height:min(185vw,800px); }
    .dev-frame .scroll{ height:min(185vw,800px); }
  }`;

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Neo · Mobile Screens</title>
<style>
${CSS}
${allExtra}
${galleryCSS}
</style>
</head>
<body>
${sprite()}
<div class="a-head">
  <h1>Neo Dashboard — Mobile Screens</h1>
  <p>Drei zusammengehörige Screens im „Neo"-Look: Server, Kalender und Wohnzimmer.
     Identische Design-Sprache (Glaskarten, Blur, semantische Akzente) und dieselbe
     Bottom-Navigation. iPhone-Hochformat, ein-spaltig — jeder Screen ist scrollbar.</p>
</div>
<div class="gallery">${phones}</div>
</body>
</html>`;
}

// ---- Emit ------------------------------------------------------------------
const out = (name, html) => { writeFileSync(join(__dir, name), html); console.log("✓", name, `(${(html.length/1024).toFixed(1)} KB)`); };

const screens = [screenServer(), screenCalendar(), screenRoom()];
out("server.html",   page(screens[0]));
out("calendar.html", page(screens[1]));
out("room.html",     page(screens[2]));
out("index.html",    indexPage());
out("artifact.html", artifactPage(screens));
console.log("Done.");
