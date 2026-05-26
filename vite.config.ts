// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts({ entryRoot: "src" })],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "OLSX",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", "ol"],
    },
  },
});
