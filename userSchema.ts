// SECURITY LAYER: entities
// Never trust the backend blindly, even your own. Parsing every response
// through a schema catches malformed/unexpected data (backend bugs, a
// compromised upstream, a misconfigured proxy) before it reaches state
// or render, and gives you a typed, guaranteed-shape object everywhere else.
import { z } from 'zod';

export const RoleSchema = z.enum(['admin', 'editor', 'viewer']);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1).max(120),
  role: RoleSchema
});
export type User = z.infer<typeof UserSchema>;

export function parseUser(raw: unknown): User {
  return UserSchema.parse(raw); // throws on shape mismatch — caller handles it
}
