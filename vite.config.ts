import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 3000,
    headers: {
      // CSP para desenvolvimento
      "Content-Security-Policy": "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3000 https://nzpcdqsrncldrtmqgegi.supabase.co https://*.supabase.co wss://nzpcdqsrncldrtmqgegi.supabase.co; connect-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3000 https://nzpcdqsrncldrtmqgegi.supabase.co https://*.supabase.co wss://nzpcdqsrncldrtmqgegi.supabase.co;"
    }
  },
  plugins: [
    react({
      // Configuração básica e estável
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
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@heroui/react',
      'lucide-react'
    ],
    exclude: ['@vite/client', '@vite/env']
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