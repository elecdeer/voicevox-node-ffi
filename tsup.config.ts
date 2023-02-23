import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  target: "node16",
  sourcemap: true,
  dts: true,
  clean: true,
  skipNodeModulesBundle: true,
  shims: true,
  keepNames: true,
});
