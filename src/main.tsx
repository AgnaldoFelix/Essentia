import { createRoot } from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import App from "./App.tsx";
import "./index.css";
import { OnlineUsersProvider } from '@/contexts/OnlineUsersContext';

// Configuração mínima
if (typeof window !== 'undefined') {
  if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
  }
}

const container = document.getElementById("root");
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

root.render(
  <NextUIProvider>
    <OnlineUsersProvider>
      <App />
    </OnlineUsersProvider>
  </NextUIProvider>
);