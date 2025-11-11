import dotenv from 'dotenv'
import { defineConfig } from "cypress";
dotenv.config()

export default defineConfig({
  e2e: {
    setupNodeEvents(_, config) {
      config.env = process.env
      return config
    },
    experimentalStudio: true,
    baseUrl: process.env.VITE_FRONTEND_URL,
  },
});
