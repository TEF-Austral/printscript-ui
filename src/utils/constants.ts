export const FRONTEND_URL =
    (import.meta.env && import.meta.env.VITE_FRONTEND_URL) ??
    (typeof Cypress !== 'undefined' ? Cypress.env('VITE_FRONTEND_URL') : null) ??
    "http://localhost";

export const SNIPPET_URL =
    (import.meta.env && import.meta.env.VITE_BACKEND_URL) ??
    (typeof Cypress !== 'undefined' ? Cypress.env('VITE_BACKEND_URL') : null) ??
    "/api/snippet";

export const AUTH_URL =
    (import.meta.env && import.meta.env.VITE_AUTH0_URL) ??
    (typeof Cypress !== 'undefined' ? Cypress.env('VITE_AUTH0_URL') : null) ??
    "/api/authorization";

export const AUTH0_USERNAME =
    (import.meta.env && import.meta.env.VITE_AUTH0_USERNAME) ??
    (typeof Cypress !== 'undefined' ? Cypress.env('auth0_username') : null) ??
    "";

export const AUTH0_PASSWORD =
    (import.meta.env && import.meta.env.VITE_AUTH0_PASSWORD) ??
    (typeof Cypress !== 'undefined' ? Cypress.env('auth0_password') : null) ??
    "";

export const PRINTSCRIPT_URL =
    (import.meta.env && import.meta.env.VITE_PRINTSCRIPT_URL) ??
    (typeof Cypress !== 'undefined' ? Cypress.env('VITE_PRINTSCRIPT_URL') : null) ??
    "/api/printscript";

export const VITE_DOMAIN =
    (import.meta.env && import.meta.env.VITE_DOMAIN) ??
    (typeof Cypress !== 'undefined' ? Cypress.env('VITE_DOMAIN') : null) ??
    "localhost";