
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Importa e executa limpeza Firebase ANTES de qualquer outra coisa
import "./utils/cleanupFirebase";

// Força limpeza adicional para garantir que não há vestígios
if (typeof window !== 'undefined') {
  // Remove qualquer listener ou timer relacionado ao Firebase
  const originalSetInterval = window.setInterval;
  const originalSetTimeout = window.setTimeout;
  
  // @ts-ignore
  window.setInterval = function(callback: any, delay: any, ...args: any[]) {
    if (callback && callback.toString().includes('firebase')) {
      console.warn('Blocked Firebase interval');
      return -1;
    }
    return originalSetInterval(callback, delay, ...args);
  };
  
  // @ts-ignore
  window.setTimeout = function(callback: any, delay: any, ...args: any[]) {
    if (callback && callback.toString().includes('firebase')) {
      console.warn('Blocked Firebase timeout');
      return -1;
    }
    return originalSetTimeout(callback, delay, ...args);
  };

  // Bloqueia fetch para endpoints Firebase
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('firebase') || url.includes('firestore') || url.includes('googleapis.com/firebase')) {
      console.warn('Blocked Firebase fetch to:', url);
      return Promise.reject(new Error('Firebase fetch blocked'));
    }
    return originalFetch(input, init);
  };

  // Bloqueia WebSocket para Firebase
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = class extends OriginalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      const urlStr = url.toString();
      if (urlStr.includes('firebase') || urlStr.includes('firestore')) {
        console.warn('Blocked Firebase WebSocket to:', urlStr);
        throw new Error('Firebase WebSocket blocked');
      }
      super(url, protocols);
    }
  } as any;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
