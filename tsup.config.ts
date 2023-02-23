import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    target: "node16",
    sourcemap: true,
    dts: true,
    clean: true,
    skipNodeModulesBundle: true,
    shims: true,
    keepNames: true,
  },
  {
    entry: ["src/example/example.ts"],
    format: ["esm"],
    target: "node16",
    sourcemap: true,
    clean: true,
    skipNodeModulesBundle: true,
    shims: true,
    keepNames: true,
  },
]);
