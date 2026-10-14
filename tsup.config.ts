// SPDX-License-Identifier: AGPL-3.0-only
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/fml/index.ts", primitives: "src/fml/primitives.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  target: "es2022",
  external: ["@noble/ciphers", "@noble/ciphers/*"],
  outDir: "dist",
  clean: true,
});
