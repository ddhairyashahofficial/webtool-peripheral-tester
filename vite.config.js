import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "/webtool-peripheral-tester/",

  server: {
    host: true,
    port: 5173
  },

  build: {
    outDir: "dist",
    sourcemap: false
  }
});