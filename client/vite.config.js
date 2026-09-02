import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    proxy: {
      // Meneruskan semua request /api ke backend Express lokal kamu
      "/api": {
        target: "http://localhost:5000", // 👈 Pastikan port ini sama dengan port Express kamu
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
