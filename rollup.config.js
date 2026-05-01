import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import serve from "rollup-plugin-serve";

const dev = process.env.ROLLUP_WATCH;

export default {
  input: "src/index.js",
  output: {
    file: "dist/neo-dashboard-kit.js",
    format: "es",
    sourcemap: dev ? "inline" : false,
  },
  plugins: [
    resolve(),
    !dev && terser({
      format: { comments: false },
    }),
    dev && serve({
      contentBase: "dist",
      host: "0.0.0.0",
      port: 5000,
      headers: { "Access-Control-Allow-Origin": "*" },
    }),
  ].filter(Boolean),
};