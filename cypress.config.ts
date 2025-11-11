import * as dotenv from 'dotenv';
import { defineConfig } from "cypress";
dotenv.config({ path: '.env.local' });

export default defineConfig({
  e2e: {
    experimentalStudio: true,
    baseUrl: process.env.VITE_FRONTEND_URL || 'http://localhost',
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    chromeWebSecurity: false,

    setupNodeEvents(_, config) {
      config.env = {
        ...config.env,
        auth0_domain: process.env.VITE_AUTH0_DOMAIN,
        auth0_username: process.env.VITE_AUTH0_USERNAME,
        auth0_password: process.env.VITE_AUTH0_PASSWORD,
        VITE_AUTH0_CLIENT_ID: process.env.VITE_AUTH0_CLIENT_ID,
        VITE_AUDIENCE: process.env.VITE_AUDIENCE,
        VITE_BACKEND_URL: process.env.VITE_BACKEND_URL || 'http://localhost/api/snippet',
      }
      return config
    },
  },
});