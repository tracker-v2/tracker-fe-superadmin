import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    // Proper type for Vite's server configuration
    // historyApiFallback is not directly available in Vite
  },
  preview: {
    // Untuk preview server
  },
});