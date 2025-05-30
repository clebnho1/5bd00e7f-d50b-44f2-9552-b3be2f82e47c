
/// <reference types="vite/client" />

declare global {
  interface Window {
    __APP_INITIALIZED__?: boolean;
  }
}

export {};
