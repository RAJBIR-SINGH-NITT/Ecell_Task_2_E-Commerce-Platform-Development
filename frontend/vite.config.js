import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The proxy is the key piece here: in dev, our React app runs on
// port 5173 and Flask runs on port 5000. Browsers block cross-origin
// requests by default (CORS), so instead of calling
// http://localhost:5000/api/... directly from React, we call
// /api/... on our OWN origin, and Vite silently forwards it to Flask.
// (Flask-CORS is also enabled server-side as a backup for direct calls.)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
