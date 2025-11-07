import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.FRONTEND_URL': JSON.stringify(env.FRONTEND_URL),
      'process.env.BACKEND_URL': JSON.stringify(env.BACKEND_URL),
      'process.env.AUTH_URL': JSON.stringify(env.AUTH_URL),
      'process.env.PRINTSCRIPT_URL': JSON.stringify(env.PRINTSCRIPT_URL),
      'process.env.AUTH0_USERNAME': JSON.stringify(env.AUTH0_USERNAME),
      'process.env.AUTH0_PASSWORD': JSON.stringify(env.AUTH0_PASSWORD)
    },
    plugins: [react()],
  }
})