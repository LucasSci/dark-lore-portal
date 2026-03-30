/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_LIVE_MODEL?: string;
  readonly VITE_GEMINI_LIVE_VOICE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
