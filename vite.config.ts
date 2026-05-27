import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    dts({ entryRoot: "src" }),
    {
      name: "copy-styles-css",
      closeBundle() {
        const srcPath = resolve(__dirname, "src/styles.css");
        const distDir = resolve(__dirname, "dist");
        const distPath = resolve(distDir, "styles.css");
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }
        copyFileSync(srcPath, distPath);
      }
    }
  ],
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
