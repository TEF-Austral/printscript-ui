export const FRONTEND_URL =
    (import.meta.env && import.meta.env.VITE_FRONTEND_URL) ?? "http://localhost:5173";
export const SNIPPET_URL =
    (import.meta.env && import.meta.env.VITE_BACKEND_URL) ?? "/api/snippet";
export const AUTH_URL =
    (import.meta.env && import.meta.env.VITE_AUTH0_URL) ?? "/api/authorization";
export const AUTH0_USERNAME =
    (import.meta.env && import.meta.env.VITE_AUTH0_USERNAME) ?? "";
export const AUTH0_PASSWORD =
    (import.meta.env && import.meta.env.VITE_AUTH0_PASSWORD) ?? "";
export const PRINTSCRIPT_URL =
    (import.meta.env && import.meta.env.VITE_PRINTSCRIPT_URL) ?? "/api/language";
console.log(import.meta.env && import.meta.env.VITE_DOMAIN);
export const VITE_DOMAIN =
    (import.meta.env && import.meta.env.VITE_DOMAIN) ?? "printscript.duckdns.org";