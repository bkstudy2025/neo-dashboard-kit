// ESLint Flat Config (Pflicht ab ESLint 9) — ersetzt die alte .eslintrc.json.
// Basis: eslint:recommended + Browser-Globals; die projektspezifische Regel
// (ungenutzte Funktions-Argumente erlaubt) bleibt erhalten.
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      // caughtErrors:none = Verhalten von ESLint 8 (leere catch-Bindings ok)
      "no-unused-vars": ["warn", { args: "none", caughtErrors: "none" }],
    },
  },
  // Node-Skripte (Validator) laufen nicht im Browser.
  {
    files: ["scripts/**/*.mjs", "rollup.config.js"],
    languageOptions: { globals: { ...globals.node } },
  },
];
