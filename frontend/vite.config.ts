import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Same-origin API access through the Vite dev proxy. The browser talks only to
// the frontend origin, so the httpOnly session cookie flows with SameSite=Lax
// and no CORS credentials handling is required.
const proxyTarget = process.env.VITE_PROXY_TARGET ?? "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
});