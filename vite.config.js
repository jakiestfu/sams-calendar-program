import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/sams-calendar-program/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        data: resolve(import.meta.dirname, 'data.html'),
      },
    },
  },
})
