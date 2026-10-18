import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      // 开发环境把 /api 转发给本地网关，前端代码里始终用相对路径
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
        // 不需要 rewrite：网关路由本来就是 /api/**
      }
    }
  }
})
