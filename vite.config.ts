import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "vite-plugin-component-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          community: ['./src/contexts/OnlineUsersContext', './src/components/ChatRoom'],
          vendor: ["react", "react-dom"],
          ui: ["@heroui/react", "lucide-react"],
          utils: ["date-fns", "uuid"]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    port: 3000,
    host: true
  }
}));