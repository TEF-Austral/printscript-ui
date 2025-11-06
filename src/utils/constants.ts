export const FRONTEND_URL =
  process?.env?.FRONTEND_URL ?? "http://localhost:5173";
export const SNIPPET_URL = process?.env?.BACKEND_URL ?? "/api/snippet";
export const AUTH_URL = process?.env?.AUTH0_URL ?? "/api/authorization";
export const AUTH0_USERNAME = process?.env?.AUTH0_USERNAME ?? "";
export const AUTH0_PASSWORD = process?.env?.AUTH0_PASSWORD ?? "";
export const PRINTSCRIPT_URL =
    process?.env?.PRINTSCRIPT_URL ?? "/api/printscript";
