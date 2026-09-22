import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // amazon-cognito-identity-js espera el objeto "global" de Node, que no
  // existe en el navegador; Vite (a diferencia de Webpack/CRA) no lo
  // polyfillea solo.
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
