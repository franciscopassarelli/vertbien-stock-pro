import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  server: {
    preset: 'vercel', // Esto le dice a TanStack Start que prepare el build para Vercel
  },
})