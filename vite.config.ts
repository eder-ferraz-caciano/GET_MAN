import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isTauri = !!process.env.TAURI_ENV_PLATFORM

// https://vite.dev/config/
export default defineConfig({
  base: isTauri ? '/' : '/AuraFetch/',
  plugins: [react()],
})
