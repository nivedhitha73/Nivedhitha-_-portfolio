// SECURITY LAYER: features
// Client-side validation is UX, not a security boundary — the backend
// MUST re-validate everything. But catching bad input here reduces noise,
// avoids leaking server error details, and stops trivially malformed
// payloads from ever reaching the network.
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export type LoginInput = z.infer<typeof LoginSchema>;
