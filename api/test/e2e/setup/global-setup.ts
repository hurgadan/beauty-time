import { execSync } from 'node:child_process';
import { ensureE2eEnv } from '../support/e2e-env';

export default async function globalSetup(): Promise<void> {
  ensureE2eEnv();

  execSync('npm run typeorm:migration:run', {
    stdio: 'inherit',
    env: process.env,
  });
}
