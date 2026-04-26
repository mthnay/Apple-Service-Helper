import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/upload-attachment': 'http://localhost:5000',
      '/check-attachment': 'http://localhost:5000',
      '/delete-attachment': 'http://localhost:5000',
      '/test-connection': 'http://localhost:5000',
      '/send-email': 'http://localhost:5000'
    }
  }
})
