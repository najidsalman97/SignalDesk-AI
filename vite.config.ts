import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts: true,
  },

  preview: {
    port: 3000,
    host: "0.0.0.0",
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react")) {
            return "react";
          }

          if (id.includes("react-dom")) {
            return "react";
          }

          if (id.includes("react-router")) {
            return "router";
          }

          if (id.includes("zustand")) {
            return "zustand";
          }

          if (id.includes("papaparse")) {
            return "papaparse";
          }

          if (id.includes("xlsx")) {
            return "xlsx";
          }

          if (id.includes("mammoth")) {
            return "mammoth";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }

          if (id.includes("recharts")) {
            return "charts";
          }

          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});