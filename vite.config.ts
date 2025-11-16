import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: {
    port: 3000,
    host: true, 
  },
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // FORÇAR UMA ÚNICA CÓPIA DO REACT
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      '@heroui/react': path.resolve(__dirname, './node_modules/@heroui/react'),
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
      'lucide-react',
      'framer-motion'
    ],
    force: true,
    esbuildOptions: {
      // Garantir que use a mesma versão
      keepNames: true,
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      // Forçar CommonJS para React
      requireReturnsDefault: "auto"
    },
    rollupOptions: {
      external: [], // Garantir que nada seja externalizado
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@heroui/react"],
          icons: ["lucide-react"],
          motion: ["framer-motion"]
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