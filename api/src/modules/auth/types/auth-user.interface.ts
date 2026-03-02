export interface AuthUser {
  sub: string;
  tenantId: string;
  role: 'owner' | 'staff';
}
