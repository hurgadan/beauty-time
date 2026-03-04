import { RateLimitGuard } from '../../../src/_common/guards/rate-limit.guard';
import { closeE2eApp, getE2eDataSource, initE2eApp } from './e2e-app-context';
import { clearDatabase } from '../utils/db-cleaner';

export function registerE2eHooks(): void {
  beforeAll(async () => {
    await initE2eApp();
  });

  beforeEach(async () => {
    RateLimitGuard.reset();
    await clearDatabase(getE2eDataSource());
  });

  afterAll(async () => {
    await closeE2eApp();
  });
}
