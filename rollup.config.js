import resolve from "@rollup/plugin-node-resolve";

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
  ],
};
