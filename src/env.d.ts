/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  readonly GOOGLE_PRIVATE_KEY: string;
  readonly GOOGLE_SPREADSHEET_ID: string;
  readonly WEBHOOK_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
