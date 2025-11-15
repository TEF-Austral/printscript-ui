export const FRONTEND_URL =
    (import.meta.env && import.meta.env.VITE_FRONTEND_URL) ?? "https://printscript.duckdns.org";

export const SNIPPET_URL =
    (import.meta.env && import.meta.env.VITE_BACKEND_URL) ?? "/api/snippet";

export const AUTH_URL =
    (import.meta.env && import.meta.env.VITE_AUTH0_URL) ?? "/api/authorization";

export const AUTH0_USERNAME =
    (import.meta.env && import.meta.env.VITE_AUTH0_USERNAME) ?? "tomasgemini54@gmail.com";

export const AUTH0_PASSWORD =
    (import.meta.env && import.meta.env.VITE_AUTH0_PASSWORD) ?? "Password123!";

export const PRINTSCRIPT_URL =
    (import.meta.env && import.meta.env.VITE_PRINTSCRIPT_URL) ?? "/api/language/";

export const AUTH0_DOMAIN =
    (import.meta.env && import.meta.env.VITE_AUTH0_DOMAIN) ?? "tf-austral.us.auth0.com";

export const VITE_DOMAIN =
    (import.meta.env && import.meta.env.VITE_DOMAIN) ?? "printscript.duckdns.org";

export const BACKEND_URL =
    (import.meta.env && import.meta.env.VITE_BACKEND_URL) ?? "https://printscript-backend.duckdns.org";