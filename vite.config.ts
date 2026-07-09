import devtoolsJson from "vite-plugin-devtools-json";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      registerType: "autoUpdate",
      manifest: {
        id: "pemd360",
        name: "PEMD360",
        short_name: "PEMD360",
        description: "La Web-Application PEMD360 par Dépollution Conseil",
        display: "minimal-ui",
        orientation: "landscape",
        start_url: "/app",
        background_color: "#ffffff",
        theme_color: "#009966",
        dir: "ltr",
        lang: "fr",
        categories: ["utilities", "business"],
        icons: [{ src: "favicon.png", sizes: "429x429", type: "image/png" }],
      },
      devOptions: { enabled: true },
    }),
    devtoolsJson(),
  ],
});
