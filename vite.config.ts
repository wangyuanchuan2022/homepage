import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Standard build: multi-file dist/ for static hosting (GitHub Pages etc.)
export default defineConfig({
  plugins: [react()],
})
