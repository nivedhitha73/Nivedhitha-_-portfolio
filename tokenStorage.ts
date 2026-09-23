// SECURITY LAYER: shared/lib
//
// Access tokens are kept ONLY in memory (this module-level variable).
// They are never written to localStorage/sessionStorage, which are
// readable by any script on the page and are the #1 target for XSS-based
// token theft.
//
// The refresh token lives in an httpOnly, Secure, SameSite=Strict cookie
// set by the backend on login — JavaScript can never read it, which is
// the point. This module only holds the short-lived access token.

let accessToken: string | null = null;

export const tokenStorage = {
  get(): string | null {
    return accessToken;
  },
  set(token: string): void {
    accessToken = token;
  },
  clear(): void {
    accessToken = null;
  }
};
