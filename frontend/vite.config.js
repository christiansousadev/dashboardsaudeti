import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// CONFIGURA A PORTA E O PROXY PARA EVITAR ERROS DE CORS
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
