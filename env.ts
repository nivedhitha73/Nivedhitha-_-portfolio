// SECURITY LAYER: shared/config
// Never hardcode secrets. Only expose what the client legitimately needs,
// and only via import.meta.env (Vite requires the VITE_ prefix so you can't
// accidentally leak server-only secrets into the client bundle).

function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const env = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL'),
  isProd: import.meta.env.PROD
};
