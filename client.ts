// SECURITY LAYER: shared/api
// Single, central place all network calls flow through. This is where
// auth headers get attached, CSRF protection is enforced, and 401/403
// responses are handled globally instead of ad hoc in every feature.
import axios, { AxiosError } from 'axios';
import { env } from '@shared/config/env';
import { tokenStorage } from '@shared/lib/tokenStorage';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10_000,
  withCredentials: true // sends the httpOnly refresh-token cookie
});

// Attach bearer token + CSRF header on every request.
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Double-submit CSRF pattern: server sets a readable csrf cookie on
  // login; we mirror it back as a header so the server can verify the
  // request came from our own JS, not a cross-site form/img tag.
  const csrfToken = readCookie('csrf_token');
  if (csrfToken && config.method !== 'get') {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
});

let isRefreshing = false;
let onRefreshed: Array<() => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (status === 401 && originalRequest && !isRefreshing) {
      isRefreshing = true;
      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${env.apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        tokenStorage.set(data.accessToken);
        onRefreshed.forEach((cb) => cb());
        onRefreshed = [];
        return apiClient(originalRequest);
      } catch {
        tokenStorage.clear();
        window.location.assign('/login');
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403) {
      window.location.assign('/403');
    }

    return Promise.reject(error);
  }
);

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
