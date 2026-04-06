import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Avoid dev 504 "Outdated Optimize Dep" after adding/changing heavy deps (e.g. Mercado Pago).
  optimizeDeps: {
    include: ["@mercadopago/sdk-react", "@paypal/react-paypal-js"],
  },
}));
