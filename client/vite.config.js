import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api': 'http://localhost:5001',
      '/upload-attachment': 'http://localhost:5001',
      '/check-attachment': 'http://localhost:5001',
      '/delete-attachment': 'http://localhost:5001',
      '/test-connection': 'http://localhost:5001',
      '/send-email': 'http://localhost:5001'
    }
  }
})
