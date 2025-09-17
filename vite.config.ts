import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'deggen.ngrok.app', 'pay-quickr.vercel.app'],
    // Handle client-side routing - serve index.html for all routes
    middlewareMode: false,
    fs: {
      strict: false
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
