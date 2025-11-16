import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    
  ],
  build: {
    outDir: 'public_html', // specify the output directory for built files
  },
  publicDir: 'public', // ensures everything inside /public is copied
  server: {
    host: true
  }
})


