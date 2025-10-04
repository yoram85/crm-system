/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_GOOGLE_API_KEY?: string
  // Add more env variables here with VITE_ prefix
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Google APIs type definitions
declare global {
  interface Window {
    gapi: any
    google: any
  }
}

export {}
