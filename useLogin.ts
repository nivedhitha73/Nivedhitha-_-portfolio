import { useState, useRef } from 'react';
import { apiClient } from '@shared/api/client';
import { tokenStorage } from '@shared/lib/tokenStorage';
import { LoginInput, LoginSchema } from './loginSchema';

const MIN_MS_BETWEEN_ATTEMPTS = 1500; // client-side throttle, backend still rate-limits

export function useLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastAttempt = useRef(0);

  async function login(input: LoginInput): Promise<boolean> {
    const now = Date.now();
    if (now - lastAttempt.current < MIN_MS_BETWEEN_ATTEMPTS) {
      setError('Please wait a moment before trying again.');
      return false;
    }
    lastAttempt.current = now;

    const parsed = LoginSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await apiClient.post<{ accessToken: string }>(
        '/auth/login',
        parsed.data
      );
      tokenStorage.set(data.accessToken);
      return true;
    } catch {
      // Deliberately generic — never reveal whether it was the email or
      // password that was wrong (prevents account enumeration).
      setError('Invalid email or password.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { login, error, isSubmitting };
}
