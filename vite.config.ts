// SPDX-License-Identifier: AGPL-3.0-only
// Vite builds the demo app only; the library is built by tsup.
import { defineConfig } from "vite";

export default defineConfig({
  root: "demo",
  build: {
    outDir: "../dist-demo",
    emptyOutDir: true,
  },
});
