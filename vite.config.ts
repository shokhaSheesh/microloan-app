import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // The staging backend, same-origin so it needs no CORS change
  server: {
    proxy: {
      '/api': { target: 'https://api.birzumnasiya.uz', changeOrigin: true, secure: true },
    },
  },
})
