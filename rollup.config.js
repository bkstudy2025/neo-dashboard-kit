import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/neo-dashboard.js",
  output: {
    file: "dist/neo-dashboard.js",
    format: "es",
    sourcemap: false,
  },
  plugins: [
    resolve(),
    terser({ format: { comments: false } }),
  ],
};
