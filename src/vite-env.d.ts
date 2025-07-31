/// <reference types="vite/client" />

// SockJS global declaration fix
declare global {
  var global: typeof globalThis;
}
