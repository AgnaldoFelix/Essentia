import { createRoot } from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import App from "./App.tsx";
import "./index.css";
import { registerDesignColors } from "./lib/registerColors";
import { registerServiceWorker } from '@/utils/serviceWorkerRegistration';


// Registrar service worker na inicialização
registerServiceWorker().then(success => {
  if (success) {
    console.log('🎉 Aplicação inicializada com Service Worker');
  } else {
    console.log('⚠️ Aplicação sem Service Worker');
  }
});

// Polyfill for NextUI userAgent issue
if (typeof navigator !== 'undefined' && !navigator.userAgent) {
  Object.defineProperty(navigator, 'userAgent', {
    get: () => 'Mozilla/5.0',
    configurable: true
  });
}

// Registrar variáveis CSS com a paleta do projeto
registerDesignColors();

createRoot(document.getElementById("root")!).render(
  <NextUIProvider locale="pt-BR">
    <App />
  </NextUIProvider>
);
