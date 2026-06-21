#!/usr/bin/env node
// Neo Dashboard Kit — store catalog validator (no external deps, Node builtins).
//
// Validates store/index.json and each referenced local module/card file.
// Exit code 1 on errors, 0 on success (warnings still exit 0 but are printed).
//
// Run: node scripts/validate-store.mjs

import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX_PATH = join(ROOT, "store", "index.json");
const MODULES_DIR = join(ROOT, "store", "modules");
const MAX_FILE_BYTES = 1024 * 1024; // 1 MiB

const URL_PREFIX = "https://cdn.jsdelivr.net/gh/bkstudy2025/neo-dashboard-kit@";
const HOMEPAGE_PREFIX = "https://github.com/bkstudy2025/neo-dashboard-kit";
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // lowercase kebab-case
const SEMVER_RE = /^\d+\.\d+\.\d+/; // loose SemVer
// "target" is validated separately: it may be a string ("*" / card type) OR an
// array of card types (the module system supports both — see src/core/modules.js).
const REQUIRED_FIELDS = ["id", "name", "description", "author", "version", "icon", "url"];

// Hard-fail patterns and warn-only patterns (matched as plain substrings).
const FORBIDDEN_PATTERNS = ["eval(", "new Function", "Function(", "document.write", "XMLHttpRequest"];
const WARN_PATTERNS = ["fetch(", "localStorage", "sessionStorage", "import("];

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function validate() {
  if (!existsSync(INDEX_PATH)) {
    err(`store/index.json not found at ${INDEX_PATH}`);
    return { items: 0, modules: 0, cards: 0 };
  }

  let raw;
  try {
    raw = readFileSync(INDEX_PATH, "utf8");
  } catch (e) {
    err(`Could not read store/index.json: ${e.message}`);
    return { items: 0, modules: 0, cards: 0 };
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    err(`store/index.json is not valid JSON: ${e.message}`);
    return { items: 0, modules: 0, cards: 0 };
  }

  if (!Array.isArray(data)) {
    err("store/index.json root must be an array.");
    return { items: 0, modules: 0, cards: 0 };
  }

  if (data.length === 0) {
    warn("store/index.json is an empty array — no store items defined.");
  }

  const seenIds = new Set();
  let moduleCount = 0;
  let cardCount = 0;

  data.forEach((item, i) => {
    const label = `item[${i}]`;
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      err(`${label}: must be an object.`);
      return;
    }

    // Required fields present (non-empty string).
    for (const f of REQUIRED_FIELDS) {
      if (typeof item[f] !== "string" || item[f].trim() === "") {
        err(`${label}: missing/empty required field "${f}".`);
      }
    }

    // target: non-empty string ("*" or a card type) OR a non-empty array of
    // non-empty strings. Mirrors the runtime targeting in src/core/modules.js.
    const tgt = item.target;
    const validTarget =
      (typeof tgt === "string" && tgt.trim() !== "") ||
      (Array.isArray(tgt) && tgt.length > 0 && tgt.every((x) => typeof x === "string" && x.trim() !== ""));
    if (!validTarget) {
      err(`${label}: "target" must be a non-empty string or array of non-empty strings.`);
    }

    const id = item.id;
    const ref = typeof id === "string" && id ? `"${id}"` : label;

    // id format + uniqueness.
    if (typeof id === "string" && id) {
      if (!ID_RE.test(id)) {
        err(`${ref}: id must be lowercase kebab-case (a-z, 0-9, single dashes).`);
      }
      if (seenIds.has(id)) {
        err(`${ref}: duplicate id.`);
      }
      seenIds.add(id);
    }

    // kind: optional; "module" or "card".
    if (item.kind !== undefined && item.kind !== "module" && item.kind !== "card") {
      err(`${ref}: kind must be omitted, "module" or "card" (got ${JSON.stringify(item.kind)}).`);
    }
    if (item.kind === "card") cardCount++;
    else moduleCount++;

    // version: loose SemVer.
    if (typeof item.version === "string" && !SEMVER_RE.test(item.version)) {
      err(`${ref}: version "${item.version}" is not SemVer-like (X.Y.Z).`);
    }

    // url rules.
    if (typeof item.url === "string" && item.url) {
      if (!item.url.startsWith(URL_PREFIX)) {
        err(`${ref}: url must start with ${URL_PREFIX}<ref> (no other host/repo).`);
      } else if (typeof id === "string" && id && !item.url.endsWith(`/store/modules/${id}.js`)) {
        err(`${ref}: url must end with /store/modules/${id}.js`);
      }
    }

    // homepage: optional, must be on the project repo.
    if (item.homepage !== undefined) {
      if (typeof item.homepage !== "string" || !item.homepage.startsWith(HOMEPAGE_PREFIX)) {
        err(`${ref}: homepage must start with ${HOMEPAGE_PREFIX}`);
      }
    }

    // image: optional, https:// or a relative path.
    if (item.image !== undefined) {
      const img = item.image;
      const ok = typeof img === "string" && (img.startsWith("https://") || (img.startsWith("/") && !img.startsWith("//")) || (!img.includes("://") && !img.startsWith("//")));
      if (!ok) {
        err(`${ref}: image must be an https:// URL or a relative path.`);
      }
    }

    // Local module file checks (only meaningful with a valid id).
    if (typeof id === "string" && id && ID_RE.test(id)) {
      validateModuleFile(item, ref);
    }
  });

  return { items: data.length, modules: moduleCount, cards: cardCount };
}

function validateModuleFile(item, ref) {
  const file = join(MODULES_DIR, `${item.id}.js`);
  if (!existsSync(file)) {
    err(`${ref}: module file store/modules/${item.id}.js does not exist.`);
    return;
  }

  let size = 0;
  try {
    size = statSync(file).size;
  } catch (e) {
    err(`${ref}: cannot stat module file: ${e.message}`);
    return;
  }
  if (size === 0) {
    err(`${ref}: module file is empty.`);
    return;
  }
  if (size > MAX_FILE_BYTES) {
    err(`${ref}: module file is ${size} bytes (max ${MAX_FILE_BYTES}).`);
  }

  let code;
  try {
    code = readFileSync(file, "utf8");
  } catch (e) {
    err(`${ref}: cannot read module file: ${e.message}`);
    return;
  }

  const hasModule = code.includes("registerModule");
  const hasCard = code.includes("registerCard");
  if (!hasModule && !hasCard) {
    err(`${ref}: module file must call registerModule or registerCard.`);
  }
  if (item.kind === "module" && !hasModule) {
    err(`${ref}: kind "module" but file does not call registerModule.`);
  }
  if (item.kind === "card" && !hasCard) {
    err(`${ref}: kind "card" but file does not call registerCard.`);
  }

  // The id should appear in the code (registered under the same id/type).
  if (!code.includes(item.id)) {
    err(`${ref}: id "${item.id}" does not appear in the module file.`);
  }

  for (const pat of FORBIDDEN_PATTERNS) {
    if (code.includes(pat)) {
      err(`${ref}: forbidden pattern "${pat}" found in module file.`);
    }
  }
  for (const pat of WARN_PATTERNS) {
    if (code.includes(pat)) {
      warn(`${ref}: review-worthy pattern "${pat}" in module file.`);
    }
  }
}

const stats = validate();

console.log("");
if (warnings.length) {
  console.log(`⚠️  ${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`   - ${w}`);
  console.log("");
}

if (errors.length) {
  console.log(`❌ ${errors.length} error(s):`);
  for (const e of errors) console.log(`   - ${e}`);
  console.log("");
  console.log("Store validation FAILED.");
  process.exit(1);
}

console.log("✓ Store validation passed.");
console.log(`   Store items: ${stats.items}`);
console.log(`   Modules:     ${stats.modules}`);
console.log(`   Cards:       ${stats.cards}`);
console.log(`   Warnings:    ${warnings.length}`);
process.exit(0);
