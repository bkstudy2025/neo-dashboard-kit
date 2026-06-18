import resolve from "@rollup/plugin-node-resolve";
import { readFileSync } from "fs";

// Single source of truth for the shown version: package.json. The token
// __NEO_VERSION__ in the source is replaced with it at build time, so the
// editor (landing + Info) always reports the actually installed build.
const NEO_VERSION = JSON.parse(readFileSync("./package.json", "utf8")).version;
const injectVersion = {
  name: "neo-version",
  renderChunk(code) { return code.replace(/__NEO_VERSION__/g, NEO_VERSION); },
};

// Bundles the modular src/ tree into the single file HACS serves.
// hacs.json has content_in_root:true + filename:neo-dashboard.js, so the
// output MUST be the repo-root neo-dashboard.js. Kept unminified on purpose:
// the shipped artifact stays readable and produces reviewable git diffs.
export default {
  input: "src/neo-dashboard.js",
  output: {
    file: "neo-dashboard.js",
    format: "es",
    sourcemap: false,
    banner: "// Neo Dashboard Kit — built from src/ (npm run build). Do not edit directly.",
  },
  plugins: [
    resolve(),
    injectVersion,
  ],
};
