import { apiClient } from '@shared/api/client';
import { parseUser, User } from './userSchema';

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get('/me');
  return parseUser(data); // validated before it ever reaches app state
}
