(function () {
  function init() {
    const NEO = window.NeoDashboard;

    if (!NEO || !NEO.BaseCard || !NEO.registerCard || !NEO.makeEditor) {
      window.addEventListener("neo-dashboard-ready", init, { once: true });
      return;
    }

    const { BaseCard, icon, accents, registerCard, makeEditor } = NEO;

    const CARD_TYPE = "neo-homelab-card";
    const CARD_VERSION = "0.6.1";
    const EDITOR_TAG = "neo-homelab-card-editor-v060";

    const DEFAULT_SECTIONS = ["header", "main", "resources", "tiles", "status", "footer"];
    const DEFAULT_RESOURCES = ["ram", "ssd", "temperature"];
    const DEFAULT_TILES = ["uptime", "vms", "docker", "nas"];
    const DEFAULT_STATUS = ["proxmox", "docker", "nas", "backup", "internet"];
    const DEFAULT_CAROUSEL = ["cpu", "ram", "ssd", "temperature", "network"];

    const ACTIVE_STATES = ["on", "online", "home", "open", "running", "ok", "connected", "true"];
    const BAD_STATES = ["off", "offline", "not_home", "closed", "stopped", "failed", "error", "unavailable", "unknown"];

    function esc(v) {
      return String(v ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function clamp(v, min = 0, max = 100) {
      const n = Number(v);
      if (!Number.isFinite(n)) return min;
      return Math.max(min, Math.min(max, n));
    }

    function list(v, fallback) {
      if (Array.isArray(v)) return v.filter(Boolean);
      if (typeof v === "string" && v.trim()) {
        return v.split(",").map((x) => x.trim()).filter(Boolean);
      }
      return fallback;
    }

    function show(config, key, fallback = true) {
      if (config[key] === undefined || config[key] === null) return fallback;
      return config[key] !== false && config[key] !== "false" && config[key] !== "off";
    }

    function rawState(obj, fallback = "—") {
      if (!obj) return fallback;
      const s = obj.state;
      if (s == null || s === "" || s === "unknown" || s === "unavailable") return fallback;
      return s;
    }

    function numeric(obj, fallback = 0) {
      const s = rawState(obj, fallback);
      const n = parseFloat(String(s).replace(",", ".").replace(/[^\d.-]/g, ""));
      return Number.isFinite(n) ? n : fallback;
    }

    function percent(obj) {
      return clamp(numeric(obj, 0));
    }

    function unit(obj) {
      return obj?.attributes?.unit_of_measurement || "";
    }

    function displayValue(obj, fallback = "—") {
      const s = rawState(obj, fallback);
      if (s === fallback) return fallback;
      const u = unit(obj);
      return u ? `${s} ${u}` : String(s);
    }

    function stateKind(obj) {
      if (!obj) return "neutral";
      const s = String(obj.state || "").toLowerCase();

      if (!s || s === "unknown" || s === "unavailable") return "neutral";
      if (ACTIVE_STATES.includes(s)) return "ok";
      if (BAD_STATES.includes(s)) return "bad";

      return "warn";
    }

    function stateText(obj, ok = "Online") {
      if (!obj) return "—";

      const s = String(obj.state || "").toLowerCase();

      if (ACTIVE_STATES.includes(s)) return ok;
      if (s === "off" || s === "offline" || s === "not_home") return "Offline";
      if (s === "unavailable" || s === "unknown") return "Unbekannt";

      return obj.state;
    }

    function chartPath(seed, width = 360, height = 82) {
      const text = String(seed || "neo");
      let hash = 0;

      for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
      }

      const points = [];

      for (let i = 0; i < 48; i++) {
        const x = (i / 47) * width;
        const y =
          height * 0.48 +
          Math.sin((i + hash % 11) * 0.75) * 8 +
          Math.sin(i * 0.25) * 7 +
          (((hash + i * 31) % 17) - 8) * 0.9;

        points.push([x, clamp(y, 8, height - 8)]);
      }

      return points
        .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
        .join(" ");
    }

    const NH_STYLES =
      `
          .nh-card {
            box-sizing: border-box;
            overflow: hidden;
            position: relative;
            padding: 0;
            color: var(--neo-text1);
            border: 1px solid var(--neo-line2);
            background:
              radial-gradient(circle at 18% 0%, rgba(70, 140, 255, .18), transparent 32%),
              linear-gradient(160deg, var(--neo-fill2), var(--neo-fill0));
            box-shadow: var(--neo-shadow2);
          }

          button {
            font: inherit;
            -webkit-tap-highlight-color: transparent;
          }

          button:focus {
            outline: none;
          }

          button:focus-visible {
            outline: 1px solid var(--nh-accent);
            outline-offset: 2px;
          }

          .nh-img-icon {
            object-fit: contain;
            display: inline-block;
            filter: drop-shadow(0 0 10px rgba(255,255,255,.12));
          }

          .nh-header {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto auto;
            gap: 14px;
            align-items: center;
            padding: 22px 24px;
            border-bottom: 1px solid var(--neo-line1);
          }

          .nh-brand {
            display: flex;
            align-items: center;
            gap: 18px;
            min-width: 0;
          }

          .nh-logo {
            width: 54px;
            height: 54px;
            display: grid;
            place-items: center;
            flex: 0 0 auto;
            border-radius: 16px;
            background: color-mix(in srgb, var(--nh-accent) 12%, transparent);
            box-shadow: 0 0 28px var(--nh-glow);
          }

          .nh-title {
            min-width: 0;
          }

          .nh-title h2 {
            margin: 0;
            font-size: 30px;
            line-height: 1.05;
            letter-spacing: -.04em;
            color: var(--neo-text1);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .nh-title p {
            margin: 7px 0 0;
            color: var(--neo-text2);
            font-size: 18px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .nh-online,
          .nh-more,
          .nh-refresh,
          .nh-gauge,
          .nh-resource-row,
          .nh-tile,
          .nh-status-item,
          .nh-pager button,
          .nh-carousel-hit {
            border: 0;
            background: transparent;
            color: inherit;
            cursor: pointer;
          }

          .nh-online {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            color: #FFB26B;
            white-space: nowrap;
          }

          .nh-online.ok {
            color: #39D353;
          }

          .nh-online.bad,
          .nh-online.neutral {
            color: var(--neo-text3);
          }

          .nh-more {
            padding: 0 2px;
            color: var(--neo-text2);
            font-size: 30px;
            line-height: 1;
          }

          .nh-dot {
            width: 12px;
            height: 12px;
            border-radius: 999px;
            display: inline-block;
            background: var(--neo-text3);
            box-shadow: 0 0 0 5px rgba(255,255,255,.04);
          }

          .ok .nh-dot,
          .nh-online.ok .nh-dot {
            background: #39D353;
            box-shadow: 0 0 14px rgba(57,211,83,.65);
          }

          .warn .nh-dot,
          .nh-online.warn .nh-dot {
            background: #FFB26B;
            box-shadow: 0 0 14px rgba(255,178,107,.65);
          }

          .bad .nh-dot,
          .neutral .nh-dot,
          .nh-online.bad .nh-dot,
          .nh-online.neutral .nh-dot {
            background: var(--neo-text3);
            box-shadow: 0 0 0 5px rgba(255,255,255,.04);
          }

          .nh-main {
            margin: 14px 18px 0;
          }

          .nh-main-wide {
            display: grid;
            grid-template-columns: minmax(240px, 330px) minmax(0, 1fr);
            gap: 22px;
            padding: 18px;
            border: 1px solid var(--neo-line1);
            border-radius: 20px;
            background: rgba(255,255,255,.025);
          }

          .nh-main-gauge {
            display: grid;
            place-items: center;
            min-width: 0;
          }

          .nh-main-details {
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 14px;
          }

          .nh-main-carousel {
            margin: 14px 12px 0;
          }

          .nh-carousel {
            position: relative;
            border: 1px solid var(--neo-line1);
            border-radius: 20px;
            background:
              radial-gradient(circle at 50% 4%, color-mix(in srgb, var(--carousel-color) 13%, transparent), transparent 42%),
              rgba(255,255,255,.025);
            overflow: hidden;
            touch-action: pan-y;
            contain: layout paint;
            user-select: none;
          }

          .nh-carousel-viewport {
            position: relative;
            height: 246px;
            overflow: hidden;
            perspective: 900px;
          }

          .nh-carousel-layer {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 210px;
            height: 210px;
            display: grid;
            place-items: center;
            transform-style: preserve-3d;
            transition:
              transform .26s cubic-bezier(.2,.8,.2,1),
              opacity .26s ease,
              filter .26s ease;
            will-change: transform, opacity;
          }

          .nh-carousel-layer-current {
            z-index: 4;
            opacity: 1;
            transform: translate(-50%, -50%) translateX(0) scale(1);
          }

          .nh-carousel-layer-prev {
            z-index: 2;
            opacity: .34;
            filter: saturate(.72) brightness(.82);
            transform: translate(-50%, -50%) translateX(-142px) scale(.74) rotateY(16deg);
          }

          .nh-carousel-layer-next {
            z-index: 2;
            opacity: .34;
            filter: saturate(.72) brightness(.82);
            transform: translate(-50%, -50%) translateX(142px) scale(.74) rotateY(-16deg);
          }

          .nh-carousel-layer-prev::after,
          .nh-carousel-layer-next::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 999px;
            background: rgba(0,0,0,.24);
            pointer-events: none;
          }

          .nh-carousel-hit {
            position: absolute;
            top: 0;
            bottom: 0;
            z-index: 8;
            width: 32%;
            padding: 0;
          }

          .nh-carousel-hit-prev {
            left: 0;
          }

          .nh-carousel-hit-next {
            right: 0;
          }

          .nh-carousel-hit::before {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 48px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            color: var(--neo-text2);
            background: rgba(255,255,255,.045);
            border: 1px solid var(--neo-line1);
            backdrop-filter: blur(var(--neo-blur));
            font-size: 25px;
            line-height: 1;
            opacity: .58;
            transition: opacity .18s ease, background .18s ease;
          }

          .nh-carousel-hit-prev::before {
            content: "‹";
            left: 7px;
          }

          .nh-carousel-hit-next::before {
            content: "›";
            right: 7px;
          }

          .nh-carousel-hit:hover::before {
            opacity: .95;
            background: color-mix(in srgb, var(--carousel-color) 12%, rgba(255,255,255,.055));
          }

          .nh-carousel-hit:active::before {
            transform: translateY(-50%);
          }

          .nh-carousel-caption {
            height: 38px;
            margin-top: -7px;
            text-align: center;
            position: relative;
            z-index: 7;
            pointer-events: none;
          }

          .nh-carousel-caption strong {
            display: block;
            color: var(--neo-text1);
            font-size: 15px;
            line-height: 18px;
            font-weight: 800;
          }

          .nh-carousel-caption span {
            display: block;
            margin-top: 1px;
            color: var(--neo-text2);
            font-size: 12px;
            line-height: 15px;
            min-height: 15px;
          }

          .nh-gauge {
            position: relative;
            width: 210px;
            height: 210px;
            display: grid;
            place-items: center;
            padding: 0;
          }

          .nh-main-wide .nh-gauge {
            width: min(100%, 310px);
            height: auto;
            aspect-ratio: 1;
          }

          .nh-gauge-preview {
            pointer-events: none;
          }

          .nh-ring {
            width: 100%;
            height: 100%;
            transform: rotate(-88deg);
            filter: drop-shadow(0 0 16px color-mix(in srgb, var(--gauge-color) 36%, transparent));
          }

          .nh-ring-bg {
            fill: none;
            stroke: rgba(125, 160, 200, .18);
            stroke-width: 13;
          }

          .nh-ring-fg {
            fill: none;
            stroke: var(--gauge-color);
            stroke-width: 13;
            stroke-linecap: round;
            stroke-dasharray: var(--gauge-dash) var(--gauge-circ);
            transition: stroke-dasharray .35s ease;
          }

          .nh-gauge-content {
            position: absolute;
            inset: 15%;
            display: grid;
            grid-template-rows: 30px 24px 54px 20px;
            align-items: center;
            justify-items: center;
            text-align: center;
            border-radius: 999px;
            background: radial-gradient(circle at 50% 28%, rgba(255,255,255,.07), rgba(0,0,0,.10));
          }

          .nh-gauge-label {
            color: var(--neo-text2);
            font-weight: 800;
            font-size: 20px;
            line-height: 24px;
            max-width: 116px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .nh-gauge-content strong {
            display: flex;
            align-items: baseline;
            justify-content: center;
            min-width: 96px;
            color: var(--neo-text1);
            font-size: 48px;
            font-weight: 900;
            letter-spacing: -.06em;
            line-height: 1;
            font-variant-numeric: tabular-nums;
          }

          .nh-gauge-content strong em {
            font-style: normal;
            font-size: .45em;
            margin-left: 3px;
            letter-spacing: -.04em;
          }

          .nh-gauge-content small {
            color: var(--gauge-color);
            font-size: 14px;
            line-height: 18px;
            font-weight: 700;
            max-width: 118px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .nh-main-wide .nh-gauge-content {
            grid-template-rows: 36px 29px 66px 24px;
          }

          .nh-main-wide .nh-gauge-label {
            font-size: 22px;
            line-height: 28px;
          }

          .nh-main-wide .nh-gauge-content strong {
            font-size: 58px;
            min-width: 120px;
          }

          .nh-main-wide .nh-gauge-content small {
            font-size: 18px;
            line-height: 22px;
            max-width: 160px;
          }

          .nh-chart {
            position: relative;
            min-height: 108px;
          }

          .nh-chart-head {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            color: var(--neo-text2);
            font-size: 16px;
          }

          .nh-chart-head strong {
            font-weight: 600;
          }

          .nh-chart svg {
            width: 100%;
            height: 82px;
            margin-top: 6px;
            border-radius: 10px;
            background: linear-gradient(180deg, color-mix(in srgb, var(--nh-accent) 14%, transparent), rgba(255,255,255,.02));
          }

          .nh-chart-line {
            fill: none;
            stroke: var(--nh-accent);
            stroke-width: 3;
          }

          .nh-chart-fill {
            fill: color-mix(in srgb, var(--nh-accent) 20%, transparent);
          }

          .nh-chart small {
            position: absolute;
            right: 0;
            bottom: 5px;
            color: var(--neo-text2);
            font-size: 15px;
          }

          .nh-resources {
            display: flex;
            flex-direction: column;
            gap: 13px;
            margin: 14px 18px 0;
          }

          .nh-resources-embedded {
            margin: 0;
          }

          .nh-resource-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            min-width: 0;
            padding: 0;
            text-align: left;
          }

          .nh-resource-icon {
            display: none;
          }

          .nh-resource-head {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto auto;
            gap: 18px;
            align-items: center;
            color: var(--neo-text1);
            font-size: 16px;
          }

          .nh-resource-head strong {
            color: var(--row-color);
            font-size: 18px;
            font-variant-numeric: tabular-nums;
          }

          .nh-resource-head em {
            color: var(--neo-text2);
            font-style: normal;
            white-space: nowrap;
          }

          .nh-bar {
            height: 9px;
            border-radius: 999px;
            overflow: hidden;
            background: rgba(125,160,200,.13);
          }

          .nh-bar i {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: var(--row-color);
            box-shadow: 0 0 16px color-mix(in srgb, var(--row-color) 48%, transparent);
          }

          .nh-tiles {
            display: grid;
            grid-template-columns: repeat(var(--tile-count), minmax(0, 1fr));
            gap: 10px;
            margin: 14px 18px 0;
          }

          .nh-tile {
            min-height: 118px;
            border: 1px solid var(--neo-line1);
            border-radius: 17px;
            background: rgba(255,255,255,.035);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 7px;
            color: var(--neo-text2);
            min-width: 0;
          }

          .nh-tile span {
            font-size: 17px;
          }

          .nh-tile strong {
            color: var(--neo-text1);
            font-size: 29px;
            line-height: 1;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            font-variant-numeric: tabular-nums;
          }

          .nh-tile em {
            color: var(--tile-color);
            font-style: normal;
            font-size: 15px;
          }

          .nh-status {
            display: grid;
            grid-template-columns: repeat(var(--status-count), minmax(0, 1fr));
            margin: 14px 18px 0;
            border: 1px solid var(--neo-line1);
            border-radius: 17px;
            background: rgba(255,255,255,.025);
            overflow: hidden;
          }

          .nh-status-item {
            min-height: 62px;
            padding: 10px;
            display: grid;
            grid-template-columns: auto minmax(0, 1fr);
            grid-template-rows: auto auto;
            align-items: center;
            column-gap: 9px;
            text-align: left;
            border-right: 1px solid var(--neo-line1);
            min-width: 0;
          }

          .nh-status-item:last-child {
            border-right: 0;
          }

          .nh-status-item .nh-dot {
            grid-row: 1 / span 2;
            width: 10px;
            height: 10px;
          }

          .nh-status-item strong {
            font-size: 16px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .nh-status-item em {
            color: var(--neo-text2);
            font-style: normal;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .nh-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 16px 12px 19px;
            color: var(--neo-text2);
            font-size: 15px;
          }

          .nh-refresh {
            color: var(--neo-text2);
            font-size: 26px;
            line-height: 1;
          }

          .nh-pager {
            display: flex;
            justify-content: center;
            gap: 7px;
            margin: 2px 0 12px;
            position: relative;
            z-index: 7;
          }

          .nh-pager button {
            width: 8px;
            height: 8px;
            padding: 0;
            border-radius: 999px;
            background: var(--neo-text3);
            opacity: .55;
          }

          .nh-pager button.active {
            background: var(--carousel-color);
            opacity: 1;
            box-shadow: 0 0 12px color-mix(in srgb, var(--carousel-color) 70%, transparent);
          }

          .nh-compact .nh-header {
            padding: 20px;
          }

          .nh-compact .nh-title h2 {
            font-size: 27px;
          }

          .nh-compact .nh-title p {
            font-size: 16px;
          }

          .nh-compact .nh-carousel-viewport {
            height: 270px;
          }

          .nh-compact .nh-carousel-layer {
            width: 230px;
            height: 230px;
          }

          .nh-compact .nh-gauge {
            width: 230px;
            height: 230px;
          }

          .nh-compact .nh-tiles {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .nh-compact .nh-status {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .nh-compact .nh-status-item {
            border-right: 0;
            border-bottom: 1px solid var(--neo-line1);
          }

          .nh-mobile {
            border-radius: 28px;
          }

          .nh-mobile .nh-header {
            grid-template-columns: minmax(0, 1fr) auto;
            padding: 16px 18px 14px;
            gap: 8px 10px;
          }

          .nh-mobile .nh-brand {
            gap: 13px;
          }

          .nh-mobile .nh-logo {
            width: 44px;
            height: 44px;
            border-radius: 13px;
          }

          .nh-mobile .nh-title h2 {
            font-size: 24px;
          }

          .nh-mobile .nh-title p {
            font-size: 13px;
            margin-top: 4px;
          }

          .nh-mobile .nh-online {
            display: inline-flex;
            position: static;
            grid-column: 1;
            margin-left: 57px;
            margin-top: -12px;
            font-size: 12px;
            width: max-content;
          }

          .nh-mobile .nh-online .nh-dot {
            width: 8px;
            height: 8px;
          }

          .nh-mobile .nh-more {
            grid-column: 2;
            grid-row: 1;
            font-size: 28px;
          }

          .nh-mobile .nh-main-carousel {
            margin: 14px 12px 0;
          }

          .nh-mobile .nh-carousel {
            border-radius: 18px;
          }

          .nh-mobile .nh-carousel-viewport {
            height: 238px;
          }

          .nh-mobile .nh-carousel-layer {
            width: 202px;
            height: 202px;
          }

          .nh-mobile .nh-carousel-layer-prev {
            transform: translate(-50%, -50%) translateX(-133px) scale(.72) rotateY(16deg);
          }

          .nh-mobile .nh-carousel-layer-next {
            transform: translate(-50%, -50%) translateX(133px) scale(.72) rotateY(-16deg);
          }

          .nh-mobile .nh-carousel-hit {
            width: 29%;
          }

          .nh-mobile .nh-gauge {
            width: 202px;
            height: 202px;
          }

          .nh-mobile .nh-gauge-content {
            grid-template-rows: 28px 23px 50px 19px;
          }

          .nh-mobile .nh-gauge-content strong {
            font-size: 45px;
            min-width: 88px;
          }

          .nh-mobile .nh-gauge-label {
            font-size: 19px;
            line-height: 23px;
          }

          .nh-mobile .nh-gauge-content small {
            font-size: 14px;
            line-height: 18px;
          }

          .nh-mobile .nh-carousel-caption {
            margin-top: -6px;
            height: 34px;
          }

          .nh-mobile .nh-resources {
            margin: 12px;
            padding: 13px;
            border: 1px solid var(--neo-line1);
            border-radius: 16px;
            background: rgba(255,255,255,.035);
          }

          .nh-mobile .nh-resource-row {
            grid-template-columns: 34px minmax(0, 1fr);
            align-items: center;
          }

          .nh-mobile .nh-resource-icon {
            display: grid;
            place-items: center;
          }

          .nh-mobile .nh-resource-head {
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 8px;
            font-size: 15px;
          }

          .nh-mobile .nh-resource-head em {
            grid-column: 2;
            color: var(--neo-text2);
            font-size: 13px;
          }

          .nh-mobile .nh-tiles {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin: 10px 12px 0;
            gap: 8px;
          }

          .nh-mobile .nh-tile {
            min-height: 96px;
            padding: 8px 4px;
          }

          .nh-mobile .nh-tile span {
            font-size: 16px;
          }

          .nh-mobile .nh-tile strong {
            font-size: 26px;
          }

          .nh-mobile .nh-tile em {
            font-size: 13px;
          }

          .nh-mobile .nh-status {
            grid-template-columns: repeat(var(--status-count), minmax(42px, 1fr));
            gap: 8px;
            border: 0;
            background: transparent;
            margin: 10px 12px 0;
            overflow: visible;
          }

          .nh-mobile .nh-status-item {
            min-height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 0;
            border: 1px solid var(--neo-line1);
            border-radius: 13px;
            background: rgba(255,255,255,.035);
            color: var(--neo-text2);
          }

          .nh-mobile .nh-status-item.ok {
            color: #39D353;
          }

          .nh-mobile .nh-status-item.warn {
            color: #FFB26B;
          }

          .nh-mobile .nh-status-item.neutral,
          .nh-mobile .nh-status-item.bad {
            color: var(--neo-text3);
          }

          .nh-mobile .nh-status-item .nh-dot {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 8px;
            height: 8px;
          }

          .nh-mobile .nh-status-item em {
            display: none;
          }

          .nh-mobile .nh-footer {
            padding: 15px 12px 17px;
            font-size: 14px;
          }
        `;

    class NeoHomelabCard extends BaseCard {
      constructor() {
        super();
        this._cardWidth = 0;
        this._carouselSlide = 0;
        this._resizeObserver = null;
        this._carouselTimer = null;
        this._touchStartX = 0;
        this._touchStartY = 0;
        this._wheelLocked = false;
        this._pointerDown = false;
      }

      connectedCallback() {
        super.connectedCallback?.();
        this._setupResizeObserver();
      }

      disconnectedCallback() {
        super.disconnectedCallback?.();
        this._resizeObserver?.disconnect();
        this._resizeObserver = null;
        this._stopCarousel();
      }

      getCardSize() {
        return 4;
      }

      _setupResizeObserver() {
        if (this._resizeObserver || !window.ResizeObserver) return;

        this._resizeObserver = new ResizeObserver((entries) => {
          const width = Math.round(entries?.[0]?.contentRect?.width || 0);
          if (!width || Math.abs(width - this._cardWidth) < 12) return;

          this._cardWidth = width;
          this._rerender();
        });

        this._resizeObserver.observe(this);
      }

      _rerender() {
        if (typeof this._render === "function") this._render();
        else if (typeof this.requestUpdate === "function") this.requestUpdate();
      }

      _viewMode() {
        const mode = this._config?.layout_mode || "auto";
        if (mode !== "auto") return mode;

        const w = this._cardWidth || this.offsetWidth || 0;

        if (w && w < 460) return "mobile";
        if (w && w < 760) return "compact";
        return "desktop";
      }

      _trackedEntities() {
        // Cached — base invalidiert _trackedCache bei setConfig.
        if (this._trackedCache) return this._trackedCache;
        const c = this._config || {};

        this._trackedCache = [
          c.status_entity,
          c.cpu_entity,
          c.ram_entity,
          c.ssd_entity,
          c.temperature_entity,
          c.network_entity,
          c.uptime_entity,
          c.vm_entity,
          c.docker_entity,
          c.nas_entity,
          c.backup_entity,
          c.internet_entity,
          c.security_entity,
          c.cloud_entity
        ].filter(Boolean);
        return this._trackedCache;
      }

      _entityFor(key) {
        const c = this._config || {};

        const map = {
          proxmox: c.status_entity || c.cpu_entity,
          cpu: c.cpu_entity,
          ram: c.ram_entity,
          ssd: c.ssd_entity,
          temperature: c.temperature_entity,
          network: c.network_entity,
          uptime: c.uptime_entity,
          vms: c.vm_entity,
          docker: c.docker_entity,
          nas: c.nas_entity,
          backup: c.backup_entity,
          internet: c.internet_entity,
          security: c.security_entity,
          cloud: c.cloud_entity
        };

        return this._state(map[key]);
      }

      _entityIdFor(key) {
        const c = this._config || {};

        const map = {
          proxmox: c.status_entity || c.cpu_entity,
          cpu: c.cpu_entity,
          ram: c.ram_entity,
          ssd: c.ssd_entity,
          temperature: c.temperature_entity,
          network: c.network_entity,
          uptime: c.uptime_entity,
          vms: c.vm_entity,
          docker: c.docker_entity,
          nas: c.nas_entity,
          backup: c.backup_entity,
          internet: c.internet_entity,
          security: c.security_entity,
          cloud: c.cloud_entity
        };

        return map[key] || "";
      }

      _visual(key, fallbackIcon, color, size = 30) {
        const c = this._config || {};
        const url = c[`${key}_icon_url`] || c[`${key}_image_url`];
        const iconName = c[`${key}_icon`] || fallbackIcon;

        if (url) {
          return `<img class="nh-img-icon" src="${esc(url)}" alt="" style="width:${size}px;height:${size}px;">`;
        }

        return icon(iconName, { size, color });
      }

      _resourceMeta(key) {
        const c = this._config || {};

        const data = {
          ram: {
            label: c.ram_label || "RAM",
            icon: c.ram_icon || "devices",
            color: "#A855F7",
            value: percent(this._entityFor("ram")),
            detail: c.ram_detail || "",
            suffix: "%"
          },
          ssd: {
            label: c.ssd_label || "SSD",
            icon: c.ssd_icon || "server",
            color: "#FFB26B",
            value: percent(this._entityFor("ssd")),
            detail: c.ssd_detail || "",
            suffix: "%"
          },
          temperature: {
            label: c.temperature_label || "Temperatur",
            icon: c.temperature_icon || "thermo",
            color: "#39D353",
            value: clamp(numeric(this._entityFor("temperature"), 0)),
            detail: c.temperature_detail || "",
            suffix: "°C"
          },
          network: {
            label: c.network_label || "Netzwerk",
            icon: c.network_icon || "wifi",
            color: "#2DD4BF",
            value: clamp(numeric(this._entityFor("network"), 0)),
            detail: c.network_detail || unit(this._entityFor("network")) || "Mbit/s",
            suffix: ""
          }
        };

        return data[key];
      }

      _tileMeta(key) {
        const c = this._config || {};

        const data = {
          uptime: {
            label: c.uptime_label || "Uptime",
            icon: c.uptime_icon || "clock",
            color: "var(--nh-accent)",
            value: displayValue(this._entityFor("uptime")),
            sub: c.uptime_subtitle || ""
          },
          vms: {
            label: c.vm_label || "VMs",
            icon: c.vm_icon || "server",
            color: "#A855F7",
            value: displayValue(this._entityFor("vms")),
            sub: c.vm_subtitle || "Läuft"
          },
          docker: {
            label: c.docker_label || "Docker",
            icon: c.docker_icon || "devices",
            color: "var(--nh-accent)",
            value: displayValue(this._entityFor("docker")),
            sub: c.docker_subtitle || "Container"
          },
          nas: {
            label: c.nas_label || "NAS",
            icon: c.nas_icon || "server",
            color: "#39D353",
            value: stateText(this._entityFor("nas"), "Online"),
            sub: c.nas_subtitle || ""
          },
          backup: {
            label: c.backup_label || "Backup",
            icon: c.backup_icon || "cloud",
            color: "#FFB26B",
            value: stateText(this._entityFor("backup"), "OK"),
            sub: c.backup_subtitle || ""
          },
          internet: {
            label: c.internet_label || "Internet",
            icon: c.internet_icon || "wifi",
            color: "#39D353",
            value: stateText(this._entityFor("internet"), "Online"),
            sub: c.internet_subtitle || ""
          }
        };

        return data[key];
      }

      _carouselSlideData(key, acc) {
        const c = this._config || {};

        const cpu = this._entityFor("cpu");
        const ram = this._entityFor("ram");
        const ssd = this._entityFor("ssd");
        const temp = this._entityFor("temperature");
        const network = this._entityFor("network");

        const data = {
          cpu: {
            key: "cpu",
            label: c.cpu_label || "CPU",
            value: Math.round(percent(cpu)),
            suffix: "%",
            sub: `${rawState(cpu, "—")} / ${c.cpu_cores || "8"} Cores`,
            icon: c.cpu_icon || "server",
            color: acc.c,
            progress: percent(cpu)
          },
          ram: {
            key: "ram",
            label: c.ram_label || "RAM",
            value: Math.round(percent(ram)),
            suffix: "%",
            sub: c.ram_detail || "",
            icon: c.ram_icon || "devices",
            color: "#A855F7",
            progress: percent(ram)
          },
          ssd: {
            key: "ssd",
            label: c.ssd_label || "SSD",
            value: Math.round(percent(ssd)),
            suffix: "%",
            sub: c.ssd_detail || "",
            icon: c.ssd_icon || "server",
            color: "#FFB26B",
            progress: percent(ssd)
          },
          temperature: {
            key: "temperature",
            label: c.temperature_label || "Temperatur",
            value: Math.round(numeric(temp, 0)),
            suffix: "°C",
            sub: c.temperature_detail || "Normal",
            icon: c.temperature_icon || "thermo",
            color: "#39D353",
            progress: clamp(numeric(temp, 0))
          },
          network: {
            key: "network",
            label: c.network_label || "Netzwerk",
            value: Math.round(numeric(network, 0)),
            suffix: "",
            sub: c.network_detail || unit(network) || "Mbit/s",
            icon: c.network_icon || "wifi",
            color: "#2DD4BF",
            progress: clamp(numeric(network, 0))
          }
        };

        return data[key];
      }

      render() {
        const c = this._config || {};
        const view = this._viewMode();
        const acc = accents[c.accent || "blue"] || accents.blue;

        const sectionOrder = list(c.sections_order, DEFAULT_SECTIONS);
        const resources = list(c.resources, DEFAULT_RESOURCES);
        const tiles = list(c.tiles, DEFAULT_TILES);
        const statusItems = list(c.status_items, DEFAULT_STATUS);

        const sectionHtml = {
          header: show(c, "show_header") ? this._renderHeader(acc) : "",
          main: show(c, "show_main") ? this._renderMain(acc, view) : "",
          resources: show(c, "show_resources") ? this._renderResources(resources, view === "mobile") : "",
          tiles: show(c, "show_tiles") ? this._renderTiles(tiles) : "",
          status: show(c, "show_status") ? this._renderStatus(statusItems, view === "mobile") : "",
          footer: show(c, "show_footer") ? this._renderFooter() : ""
        };

        return `
          <style>${NH_STYLES}</style>
          <div
            class="neo-card nh-card nh-${esc(view)}"
            id="card"
            data-view="${esc(view)}"
            style="--nh-accent:${esc(acc.c)};--nh-glow:${esc(acc.glow)};"
          >
            ${sectionOrder.map((name) => sectionHtml[name] || "").join("")}
          </div>
        `;
      }

      _renderHeader(acc) {
        const c = this._config || {};
        const status = this._entityFor("proxmox") || this._entityFor("internet");
        const statusEntity = this._entityIdFor("proxmox") || this._entityIdFor("internet");

        return `
          <header class="nh-header">
            <div class="nh-brand">
              <div class="nh-logo">
                ${c.main_icon_url
                  ? `<img class="nh-img-icon" src="${esc(c.main_icon_url)}" alt="" style="width:38px;height:38px;">`
                  : icon(c.main_icon || "server", { size: 38, color: acc.c })}
              </div>
              <div class="nh-title">
                <h2>${esc(c.title || "Homelab")}</h2>
                <p>${esc(c.subtitle || "Proxmox Cluster")}</p>
              </div>
            </div>

            <button class="nh-online ${stateKind(status)}" data-entity="${esc(statusEntity)}" type="button">
              <span class="nh-dot"></span>
              <span>${esc(stateText(status, "Online"))}</span>
            </button>

            <button class="nh-more" type="button" aria-label="Mehr">⋮</button>
          </header>
        `;
      }

      _renderGauge(slide, mode = "active") {
        const pct = clamp(slide.progress);
        const radius = 92;
        const circ = 2 * Math.PI * radius;
        const dash = (pct / 100) * circ;
        const tag = mode === "active" ? "button" : "div";
        const entityAttr = mode === "active" ? `data-entity="${esc(this._entityIdFor(slide.key))}" type="button"` : "";

        return `
          <${tag}
            class="nh-gauge nh-gauge-${esc(mode)}"
            ${entityAttr}
            style="--gauge-color:${esc(slide.color)};--gauge-dash:${dash};--gauge-circ:${circ};"
          >
            <svg class="nh-ring" viewBox="0 0 220 220" aria-hidden="true">
              <circle class="nh-ring-bg" cx="110" cy="110" r="${radius}"></circle>
              <circle class="nh-ring-fg" cx="110" cy="110" r="${radius}"></circle>
            </svg>

            <div class="nh-gauge-content">
              ${this._visual(slide.key, slide.icon, "var(--neo-text3)", mode === "active" ? 30 : 26)}
              <span class="nh-gauge-label">${esc(slide.label)}</span>
              <strong>${esc(slide.value)}<em>${esc(slide.suffix)}</em></strong>
              <small>${esc(slide.sub || "")}</small>
            </div>
          </${tag}>
        `;
      }

      _renderCarousel(acc, view) {
        const c = this._config || {};
        const items = list(c.carousel_items, DEFAULT_CAROUSEL)
          .map((key) => this._carouselSlideData(key, acc))
          .filter(Boolean);

        if (!items.length) return "";

        const count = items.length;
        const index = clamp(this._carouselSlide, 0, count - 1);
        const prevIndex = (index - 1 + count) % count;
        const nextIndex = (index + 1) % count;

        const current = items[index];
        const prev = items[prevIndex];
        const next = items[nextIndex];

        return `
          <section
            class="nh-carousel nh-carousel-${esc(view)}"
            data-carousel-count="${count}"
            style="--carousel-color:${esc(current.color)};"
          >
            <div class="nh-carousel-viewport">
              <button class="nh-carousel-hit nh-carousel-hit-prev" data-carousel-prev type="button" aria-label="Vorherige Anzeige"></button>
              <button class="nh-carousel-hit nh-carousel-hit-next" data-carousel-next type="button" aria-label="Nächste Anzeige"></button>

              <div class="nh-carousel-layer nh-carousel-layer-prev" aria-hidden="true">
                ${this._renderGauge(prev, "preview")}
              </div>

              <div class="nh-carousel-layer nh-carousel-layer-current">
                ${this._renderGauge(current, "active")}
              </div>

              <div class="nh-carousel-layer nh-carousel-layer-next" aria-hidden="true">
                ${this._renderGauge(next, "preview")}
              </div>
            </div>

            <div class="nh-carousel-caption">
              <strong>${esc(current.label)}</strong>
              <span>${esc(current.sub || "")}</span>
            </div>

            <div class="nh-pager">
              ${items.map((item, i) => `
                <button
                  class="${i === index ? "active" : ""}"
                  data-slide="${i}"
                  type="button"
                  aria-label="${esc(item.label)}"
                  title="${esc(item.label)}"
                ></button>
              `).join("")}
            </div>
          </section>
        `;
      }

      _renderMain(acc, view) {
        const c = this._config || {};
        const useCarousel = show(c, "show_carousel", true);
        const cpuPath = chartPath(c.cpu_entity || "cpu");

        if (view === "mobile" || (view === "compact" && useCarousel)) {
          return `
            <section class="nh-main nh-main-carousel">
              ${this._renderCarousel(acc, view)}
            </section>
          `;
        }

        const cpuSlide = this._carouselSlideData("cpu", acc);

        return `
          <section class="nh-main nh-main-wide">
            <div class="nh-main-gauge">
              ${this._renderGauge(cpuSlide, "active")}
            </div>

            <div class="nh-main-details">
              ${show(c, "show_cpu_history") ? `
                <div class="nh-chart">
                  <div class="nh-chart-head">
                    <span>CPU Last 60 Min</span>
                    <strong>100%</strong>
                  </div>

                  <svg viewBox="0 0 360 82" preserveAspectRatio="none" aria-hidden="true">
                    <path class="nh-chart-fill" d="${cpuPath} L360,82 L0,82 Z"></path>
                    <path class="nh-chart-line" d="${cpuPath}"></path>
                  </svg>

                  <small>0%</small>
                </div>
              ` : ""}

              ${this._renderResources(list(c.resources, DEFAULT_RESOURCES), false, true)}
            </div>
          </section>
        `;
      }

      _renderResourceRow(key, mobile = false) {
        const meta = this._resourceMeta(key);
        if (!meta) return "";

        const entity = this._entityIdFor(key);

        const value = key === "temperature"
          ? `${Math.round(meta.value)}${meta.suffix || "°C"}`
          : meta.suffix === ""
            ? `${Math.round(meta.value)}`
            : `${Math.round(meta.value)}${meta.suffix || "%"}`;

        return `
          <button
            class="nh-resource-row ${mobile ? "is-mobile" : ""}"
            data-entity="${esc(entity)}"
            style="--row-color:${esc(meta.color)};"
            type="button"
          >
            <div class="nh-resource-icon">
              ${this._visual(key, meta.icon, meta.color, 24)}
            </div>

            <div class="nh-resource-body">
              <div class="nh-resource-head">
                <span>${esc(meta.label)}</span>
                <strong>${esc(value)}</strong>
                <em>${esc(meta.detail || "")}</em>
              </div>

              <div class="nh-bar">
                <i style="width:${clamp(meta.value)}%;"></i>
              </div>
            </div>
          </button>
        `;
      }

      _renderResources(resources, mobile = false, embedded = false) {
        if (!resources.length) return "";

        return `
          <section class="nh-resources ${mobile ? "nh-resources-mobile" : ""} ${embedded ? "nh-resources-embedded" : ""}">
            ${resources.map((key) => this._renderResourceRow(key, mobile)).join("")}
          </section>
        `;
      }

      _renderTile(key) {
        const meta = this._tileMeta(key);
        if (!meta) return "";

        return `
          <button
            class="nh-tile"
            data-entity="${esc(this._entityIdFor(key))}"
            style="--tile-color:${esc(meta.color)};"
            type="button"
          >
            ${this._visual(key, meta.icon, meta.color, 32)}
            <span>${esc(meta.label)}</span>
            <strong>${esc(meta.value)}</strong>
            <em>${esc(meta.sub || "")}</em>
          </button>
        `;
      }

      _renderTiles(tiles) {
        if (!tiles.length) return "";

        return `
          <section class="nh-tiles" style="--tile-count:${tiles.length};">
            ${tiles.map((key) => this._renderTile(key)).join("")}
          </section>
        `;
      }

      _renderStatus(statusItems, mobile = false) {
        if (!statusItems.length) return "";

        const labels = {
          proxmox: "Proxmox",
          docker: "Docker",
          nas: "NAS",
          backup: "Backup",
          internet: "Internet",
          security: "Security",
          cloud: "Cloud"
        };

        const icons = {
          proxmox: "server",
          docker: "devices",
          nas: "server",
          backup: "cloud",
          internet: "wifi",
          security: "shieldOk",
          cloud: "cloud"
        };

        return `
          <section class="nh-status ${mobile ? "nh-status-mobile" : ""}" style="--status-count:${statusItems.length};">
            ${statusItems.map((key) => {
              const obj = this._entityFor(key);
              const entity = this._entityIdFor(key);
              const kind = entity ? stateKind(obj) : "neutral";
              const label = labels[key] || key;

              return `
                <button class="nh-status-item ${kind}" data-entity="${esc(entity)}" type="button">
                  <span class="nh-dot"></span>
                  ${mobile ? this._visual(key, icons[key] || "info", "currentColor", 23) : `<strong>${esc(label)}</strong>`}
                  <em>${esc(stateText(obj, key === "backup" ? "OK" : "Online"))}</em>
                </button>
              `;
            }).join("")}
          </section>
        `;
      }

      _renderFooter() {
        const c = this._config || {};

        return `
          <footer class="nh-footer">
            <span>${esc(c.footer_label || "Letztes Update")}: ${esc(c.last_update || "gerade eben")}</span>
            <button class="nh-refresh" type="button" aria-label="Aktualisieren">⟳</button>
          </footer>
        `;
      }

      _carouselItemsCount() {
        return list(this._config?.carousel_items, DEFAULT_CAROUSEL).length || DEFAULT_CAROUSEL.length;
      }

      _setCarouselSlide(index) {
        const count = this._carouselItemsCount();
        if (!count) return;

        if (index < 0) index = count - 1;
        if (index >= count) index = 0;

        if (this._carouselSlide === index) return;

        this._carouselSlide = index;
        this._rerender();
      }

      _stopCarousel() {
        if (this._carouselTimer) {
          window.clearInterval(this._carouselTimer);
          this._carouselTimer = null;
        }
      }

      _startCarousel() {
        this._stopCarousel();

        const c = this._config || {};
        const view = this._viewMode();

        if (!show(c, "carousel_autoplay", false)) return;
        if (!show(c, "show_carousel", true)) return;
        if (view === "desktop") return;

        const interval = clamp(Number(c.carousel_interval || 7000), 2500, 60000);

        this._carouselTimer = window.setInterval(() => {
          this._setCarouselSlide(this._carouselSlide + 1);
        }, interval);
      }

      _bindEvents() {
        const root = this.shadowRoot;

        this._setupResizeObserver();
        this._startCarousel();

        root.querySelectorAll("[data-entity]").forEach((el) => {
          const entity = el.getAttribute("data-entity");
          if (!entity) return;

          el.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            this._modCtx().moreInfo(entity);
          });
        });

        root.querySelectorAll("[data-slide]").forEach((btn) => {
          btn.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            this._setCarouselSlide(Number(btn.getAttribute("data-slide") || 0));
          });
        });

        root.querySelectorAll("[data-carousel-prev]").forEach((btn) => {
          btn.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            this._setCarouselSlide(this._carouselSlide - 1);
          });
        });

        root.querySelectorAll("[data-carousel-next]").forEach((btn) => {
          btn.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            this._setCarouselSlide(this._carouselSlide + 1);
          });
        });

        const carousel = root.querySelector(".nh-carousel");
        if (carousel) {
          carousel.addEventListener("pointerdown", (ev) => {
            this._pointerDown = true;
            this._touchStartX = ev.clientX || 0;
            this._touchStartY = ev.clientY || 0;

            try {
              carousel.setPointerCapture?.(ev.pointerId);
            } catch (_) {}
          });

          carousel.addEventListener("pointerup", (ev) => {
            if (!this._pointerDown) return;
            this._pointerDown = false;

            const dx = (ev.clientX || 0) - this._touchStartX;
            const dy = (ev.clientY || 0) - this._touchStartY;

            if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy) * 1.1) return;

            ev.preventDefault();
            ev.stopPropagation();

            if (dx < 0) this._setCarouselSlide(this._carouselSlide + 1);
            else this._setCarouselSlide(this._carouselSlide - 1);
          });

          carousel.addEventListener("pointercancel", () => {
            this._pointerDown = false;
          });

          carousel.addEventListener("wheel", (ev) => {
            const strongest = Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY;
            if (Math.abs(strongest) < 12) return;

            ev.preventDefault();
            ev.stopPropagation();

            if (this._wheelLocked) return;
            this._wheelLocked = true;

            if (strongest > 0) this._setCarouselSlide(this._carouselSlide + 1);
            else this._setCarouselSlide(this._carouselSlide - 1);

            window.setTimeout(() => {
              this._wheelLocked = false;
            }, 420);
          }, { passive: false });
        }

        root.querySelector(".nh-refresh")?.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          this._rerender();
        });

        root.getElementById("card")?.addEventListener("click", (ev) => {
          if (this._moduleTap(ev)) return;

          const primary = this._config?.status_entity || this._config?.cpu_entity;
          if (primary) this._modCtx().moreInfo(primary);
        });
      }


      static getConfigElement() {
        return document.createElement(EDITOR_TAG);
      }

      static getStubConfig() {
        return {
          title: "Homelab",
          subtitle: "Proxmox Cluster",
          main_icon: "server",
          accent: "blue",
          layout_mode: "auto",

          show_header: true,
          show_main: true,
          show_carousel: true,
          carousel_autoplay: false,
          carousel_interval: 7000,
          show_cpu_history: true,
          show_resources: true,
          show_tiles: true,
          show_status: true,
          show_footer: true,

          sections_order: "header,main,resources,tiles,status,footer",
          carousel_items: "cpu,ram,ssd,temperature,network",
          resources: "ram,ssd,temperature",
          tiles: "uptime,vms,docker,nas",
          status_items: "proxmox,docker,nas,backup,internet",

          cpu_cores: "8",
          last_update: "gerade eben"
        };
      }
    }

    if (!customElements.get(EDITOR_TAG)) {
      customElements.define(EDITOR_TAG, makeEditor([
        { name: "title", label: "Titel", selector: { text: {} } },
        { name: "subtitle", label: "Untertitel", selector: { text: {} } },
        { name: "main_icon", label: "Haupt-Icon", selector: { icon: {} } },
        { name: "main_icon_url", label: "Haupt-Icon Bild-URL optional", selector: { text: {} } },
        {
          name: "accent",
          label: "Akzentfarbe",
          selector: {
            select: {
              mode: "dropdown",
              options: window.NeoDashboard.accentOptions
            }
          }
        },
        {
          name: "layout_mode",
          label: "Layout",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "auto", label: "Automatisch" },
                { value: "desktop", label: "Desktop" },
                { value: "compact", label: "Kompakt" },
                { value: "mobile", label: "Mobile" }
              ]
            }
          }
        },

        {
          type: "expandable",
          title: "Sichtbarkeit",
          icon: "mdi:eye",
          schema: [
            { name: "show_header", label: "Header anzeigen", selector: { boolean: {} } },
            { name: "show_main", label: "Hauptbereich anzeigen", selector: { boolean: {} } },
            { name: "show_carousel", label: "Karussell anzeigen", selector: { boolean: {} } },
            { name: "show_cpu_history", label: "CPU-Verlauf anzeigen", selector: { boolean: {} } },
            { name: "show_resources", label: "Ressourcen anzeigen", selector: { boolean: {} } },
            { name: "show_tiles", label: "Kacheln anzeigen", selector: { boolean: {} } },
            { name: "show_status", label: "Statusleiste anzeigen", selector: { boolean: {} } },
            { name: "show_footer", label: "Footer anzeigen", selector: { boolean: {} } }
          ]
        },

        {
          type: "expandable",
          title: "Karussell",
          icon: "mdi:view-carousel",
          schema: [
            { name: "carousel_items", label: "Slides", selector: { text: {} } },
            { name: "carousel_autoplay", label: "Automatisch wechseln", selector: { boolean: {} } },
            { name: "carousel_interval", label: "Wechsel-Intervall ms", selector: { number: { min: 2500, max: 60000, mode: "box" } } }
          ]
        },

        {
          type: "expandable",
          title: "Reihenfolge & Elemente",
          icon: "mdi:sort",
          schema: [
            { name: "sections_order", label: "Sektionen Reihenfolge", selector: { text: {} } },
            { name: "resources", label: "Ressourcen", selector: { text: {} } },
            { name: "tiles", label: "Kacheln", selector: { text: {} } },
            { name: "status_items", label: "Status-Elemente", selector: { text: {} } }
          ]
        },

        {
          type: "expandable",
          title: "Entitäten",
          icon: "mdi:gauge",
          schema: [
            { name: "status_entity", label: "Proxmox / Online", selector: { entity: {} } },
            { name: "cpu_entity", label: "CPU %", selector: { entity: {} } },
            { name: "ram_entity", label: "RAM %", selector: { entity: {} } },
            { name: "ssd_entity", label: "SSD %", selector: { entity: {} } },
            { name: "temperature_entity", label: "Temperatur", selector: { entity: {} } },
            { name: "network_entity", label: "Netzwerk", selector: { entity: {} } },
            { name: "uptime_entity", label: "Uptime", selector: { entity: {} } },
            { name: "vm_entity", label: "VMs", selector: { entity: {} } },
            { name: "docker_entity", label: "Docker", selector: { entity: {} } },
            { name: "nas_entity", label: "NAS", selector: { entity: {} } },
            { name: "backup_entity", label: "Backup", selector: { entity: {} } },
            { name: "internet_entity", label: "Internet", selector: { entity: {} } },
            { name: "security_entity", label: "Security optional", selector: { entity: {} } },
            { name: "cloud_entity", label: "Cloud optional", selector: { entity: {} } }
          ]
        },

        {
          type: "expandable",
          title: "Icons",
          icon: "mdi:image",
          schema: [
            { name: "cpu_icon", label: "CPU Icon", selector: { text: {} } },
            { name: "cpu_icon_url", label: "CPU Bild-URL optional", selector: { text: {} } },
            { name: "ram_icon", label: "RAM Icon", selector: { text: {} } },
            { name: "ram_icon_url", label: "RAM Bild-URL optional", selector: { text: {} } },
            { name: "ssd_icon", label: "SSD Icon", selector: { text: {} } },
            { name: "ssd_icon_url", label: "SSD Bild-URL optional", selector: { text: {} } },
            { name: "temperature_icon", label: "Temperatur Icon", selector: { text: {} } },
            { name: "temperature_icon_url", label: "Temperatur Bild-URL optional", selector: { text: {} } },
            { name: "network_icon", label: "Netzwerk Icon", selector: { text: {} } },
            { name: "network_icon_url", label: "Netzwerk Bild-URL optional", selector: { text: {} } },
            { name: "docker_icon", label: "Docker Icon", selector: { text: {} } },
            { name: "docker_icon_url", label: "Docker Bild-URL optional", selector: { text: {} } },
            { name: "nas_icon", label: "NAS Icon", selector: { text: {} } },
            { name: "nas_icon_url", label: "NAS Bild-URL optional", selector: { text: {} } },
            { name: "backup_icon", label: "Backup Icon", selector: { text: {} } },
            { name: "backup_icon_url", label: "Backup Bild-URL optional", selector: { text: {} } },
            { name: "internet_icon", label: "Internet Icon", selector: { text: {} } },
            { name: "internet_icon_url", label: "Internet Bild-URL optional", selector: { text: {} } }
          ]
        },

        {
          type: "expandable",
          title: "Texte & Details",
          icon: "mdi:text",
          schema: [
            { name: "cpu_label", label: "CPU Label", selector: { text: {} } },
            { name: "cpu_cores", label: "CPU Cores Text", selector: { text: {} } },
            { name: "ram_label", label: "RAM Label", selector: { text: {} } },
            { name: "ram_detail", label: "RAM Detail", selector: { text: {} } },
            { name: "ssd_label", label: "SSD Label", selector: { text: {} } },
            { name: "ssd_detail", label: "SSD Detail", selector: { text: {} } },
            { name: "temperature_label", label: "Temperatur Label", selector: { text: {} } },
            { name: "temperature_detail", label: "Temperatur Detail", selector: { text: {} } },
            { name: "network_label", label: "Netzwerk Label", selector: { text: {} } },
            { name: "network_detail", label: "Netzwerk Detail", selector: { text: {} } },
            { name: "uptime_label", label: "Uptime Label", selector: { text: {} } },
            { name: "uptime_subtitle", label: "Uptime Untertext", selector: { text: {} } },
            { name: "vm_label", label: "VM Label", selector: { text: {} } },
            { name: "vm_subtitle", label: "VM Untertext", selector: { text: {} } },
            { name: "docker_label", label: "Docker Label", selector: { text: {} } },
            { name: "docker_subtitle", label: "Docker Untertext", selector: { text: {} } },
            { name: "nas_label", label: "NAS Label", selector: { text: {} } },
            { name: "nas_subtitle", label: "NAS Untertext", selector: { text: {} } },
            { name: "footer_label", label: "Footer Label", selector: { text: {} } },
            { name: "last_update", label: "Update Text", selector: { text: {} } }
          ]
        }
      ], {
        name: "Homelab Card",
        description: "Finale Homelab Übersicht mit stabilem Gauge-Karussell.",
        icon: "🖥️"
      }));
    }

    registerCard(CARD_TYPE, NeoHomelabCard, {
      name: "Homelab Card",
      description: "Finale Homelab Übersicht mit stabilem Gauge-Karussell.",
      icon: "🖥️",
      version: CARD_VERSION,
      author: "Community"
    });
  }

  init();
})();
