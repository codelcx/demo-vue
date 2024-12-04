/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL */
  readonly VITE_APP_API_URL: string
  /** 代理接口 */
  readonly VITE_APP_PROXY_API_PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
