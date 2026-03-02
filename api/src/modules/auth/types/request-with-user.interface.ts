import type { AuthUser } from './auth-user.interface';

export interface RequestWithUser {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthUser;
}
