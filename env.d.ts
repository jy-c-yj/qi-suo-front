/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 接口基础路径，默认 /api；dev 走 Vite 代理，prod 走 Nginx 反代 */
  readonly VITE_API_BASE_URL?: string
}
