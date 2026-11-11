import { defineConfig } from "vite";

// Builds one self-contained ES module that Home Assistant loads as custom panel.
export default defineConfig({
  build: {
    target: "es2021",
    outDir: "../custom_components/homekit_manager/frontend",
    emptyOutDir: false,
    sourcemap: false,
    minify: "esbuild",
    modulePreload: false,
    copyPublicDir: false,
    rollupOptions: {
      input: "src/panel.ts",
      preserveEntrySignatures: false,
      output: {
        format: "es",
        entryFileNames: "homekit-manager-panel.js",
        inlineDynamicImports: true,
      },
    },
  },
});
