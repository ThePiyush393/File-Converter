import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base must match the exact GitHub repo name (case-sensitive)
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/File--Converter/' : '/',
})
