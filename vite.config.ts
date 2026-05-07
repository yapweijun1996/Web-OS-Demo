import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Set BASE_PATH=/Web-OS-Demo/ when building for GitHub Pages so asset URLs
// and the PWA manifest's start_url/scope get the repo prefix. Default "/"
// works for local dev and any custom-domain deploy (Cloudflare Pages, etc).
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Web OS Demo",
        short_name: "WebOS",
        description:
          "A browser-based desktop environment with windows, files, and apps.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        start_url: base,
        scope: base,
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        navigateFallback: `${base}index.html`,
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  server: { port: 5173, host: "127.0.0.1" },
});
