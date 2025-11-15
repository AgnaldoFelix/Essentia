import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': {},
    'global': 'globalThis'
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@heroui/react"],
          icons: ["lucide-react"],
          utils: ["framer-motion"]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    port: 3000,
    host: true
  }
});