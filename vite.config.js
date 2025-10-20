import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    
  ],
  // build: {
  //   outDir: 'build',
  // },
  publicDir: 'public', // ensures everything inside /public is copied
  server: {
    host: true
  }
})


