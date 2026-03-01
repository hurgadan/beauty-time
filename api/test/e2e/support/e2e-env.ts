export const E2E_DEFAULT_DATABASE_URL = 'postgres://beauty_time:beauty_time@127.0.0.1:55432/beauty_time_e2e';
export const E2E_DEFAULT_JWT_SECRET = 'e2e-jwt-secret';

export function ensureE2eEnv(): void {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? E2E_DEFAULT_DATABASE_URL;
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? E2E_DEFAULT_JWT_SECRET;
}
