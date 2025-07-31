// Global type definitions for the application

// Fix for SockJS client global definition issue
declare global {
  var global: typeof globalThis;
}

// Extend Window interface for any browser-specific APIs
interface Window {
  // Add any window-specific properties if needed
}

// Module declarations for imports without types
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.mp3" {
  const src: string;
  export default src;
}

export {};
