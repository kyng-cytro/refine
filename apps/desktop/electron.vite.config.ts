import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import { resolve } from "path"

const bundled = ["@refine/sdk", "@refine/schemas", "@refine/models", "ofetch"]

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
