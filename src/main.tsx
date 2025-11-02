import { createRoot } from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import App from "./App.tsx";
import "./index.css";

// Polyfill for NextUI userAgent issue
if (typeof navigator !== 'undefined' && !navigator.userAgent) {
  Object.defineProperty(navigator, 'userAgent', {
    get: () => 'Mozilla/5.0',
    configurable: true
  });
}

createRoot(document.getElementById("root")!).render(
  <NextUIProvider locale="pt-BR">
    <App />
  </NextUIProvider>
);
