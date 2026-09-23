# FSD Secure App

A minimal but functional Feature-Sliced Design (React + TypeScript) scaffold
demonstrating security controls at every layer.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your real API URL
npm run dev
```

This scaffold expects a backend exposing `/auth/login`, `/auth/refresh`,
and `/me`, with the refresh token set as an httpOnly cookie. Swap the
mock endpoints in `shared/api/client.ts` / `entities/user/userApi.ts`
for your real backend.

## Security layer map

| Layer | File(s) | What it does |
|---|---|---|
| `shared` | `shared/api/client.ts` | Central axios instance: attaches bearer token, CSRF header, handles 401 (silent refresh) and 403 (redirect) globally |
| `shared` | `shared/lib/tokenStorage.ts` | Access token kept in memory only — never localStorage — to blunt XSS token theft |
| `shared` | `shared/lib/sanitize.ts` | DOMPurify wrapper for any HTML you must render from untrusted sources |
| `shared` | `shared/config/env.ts` | Fails fast on missing env vars; no hardcoded secrets |
| `entities` | `entities/user/userSchema.ts`, `userApi.ts` | Every API response is parsed through a zod schema before entering app state — don't trust the backend blindly |
| `features` | `features/auth/login/*` | Client-side input validation, submit throttling, and generic error messages (no account enumeration) |
| `widgets` | `widgets/route-guard/ProtectedRoute.tsx` | Auth + role gate on routes (UX layer only — backend must enforce the same) |
| `processes` | `processes/auth/sessionManager.ts` | Idle-timeout auto-logout |
| `app` | `app/providers/AuthProvider.tsx` | Central session state, silent hydration, wires up idle watcher |
| `app` | `app/providers/ErrorBoundary.tsx` | Catches render errors, shows a generic message instead of a stack trace |
| `app` | `index.html` (CSP meta), `vite.config.ts` (dev headers) | Content-Security-Policy, X-Frame-Options, etc. In production, set these as real HTTP headers at your server/CDN, not just meta tags |
| all | `.eslintrc.cjs` | `eslint-plugin-security` flags risky patterns (eval, non-literal regex, etc.) in CI |
| all | `.gitignore`, `.env.example` | Secrets never committed to source control |

## Important caveats

- **Every client-side check here is UX, not enforcement.** Route guards,
  input validation, and role checks must all be duplicated and enforced
  server-side — a browser can always be tampered with.
- CSP is set via `<meta>` here for portability; in production, send it as
  an HTTP response header instead so it can't be stripped by an injected
  script before the page parses.
- Run `npm run audit` (or Snyk/Dependabot) in CI to catch vulnerable
  dependencies before they ship.
