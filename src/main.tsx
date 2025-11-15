import { createRoot } from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import App from "./App.tsx";
import "./index.css";
import { registerDesignColors } from "./lib/registerColors";
import { registerServiceWorker } from '@/utils/serviceWorkerRegistration';
import { OnlineUsersProvider } from '@/contexts/OnlineUsersContext';

// Polyfill para garantir compatibilidade
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Registrar service worker
registerServiceWorker().then(success => {
  if (success) {
    console.log('🎉 Service Worker registrado');
  } else {
    console.log('⚠️ Service Worker não disponível');
  }
});

// Polyfill para NextUI
if (typeof navigator !== 'undefined' && !navigator.userAgent) {
  Object.defineProperty(navigator, 'userAgent', {
    get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    configurable: true
  });
}

// Registrar cores
registerDesignColors();

// Renderizar aplicação
const container = document.getElementById("root");
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
  <NextUIProvider locale="pt-BR">
    <OnlineUsersProvider>
      <App />
    </OnlineUsersProvider>
  </NextUIProvider>
);