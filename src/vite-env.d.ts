/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TANZ_BACKEND: string;
  readonly VITE_BASEURL: string;
  readonly VITE_GA_ID: string;
  readonly VITE_FESTIVAL_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
