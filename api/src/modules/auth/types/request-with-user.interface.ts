import type { Request } from 'express';
import type { AuthUser } from './auth-user.interface';

export interface RequestWithUser extends Request {
  user?: AuthUser;
}
