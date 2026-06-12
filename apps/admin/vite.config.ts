import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/admin/",
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  build: {
    outDir: resolve(__dirname, "../api/public/admin"),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/v1": "http://localhost:3000",
    },
  },
})
