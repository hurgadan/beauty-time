import type { AuthUser } from './auth-user.interface';

export interface RequestWithUser {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  user?: AuthUser;
}
