import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import { resolve } from "path"

// @refine/* packages are source-only TS and electron-store is ESM-only, so
// they must be bundled into the (CJS) main build rather than externalized.
const bundled = [
  "@refine/sdk",
  "@refine/schemas",
  "@refine/models",
  "ofetch",
  "electron-store",
]

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: bundled })],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": resolve(__dirname, "src/renderer/src") },
    },
  },
})
