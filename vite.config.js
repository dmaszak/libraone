import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-libraone.vercel.app',
        changeOrigin: true,
        secure: true,
        // Configure for file uploads
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Don't modify content-type for multipart requests
            if (req.headers['content-type']?.includes('multipart/form-data')) {
              // Let the original content-type pass through
            }
          });
        }
      }
    }
  }
})
