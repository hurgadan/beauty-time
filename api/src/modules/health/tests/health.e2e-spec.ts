import * as request from 'supertest';

import { getE2eApp } from '../../../../test/e2e/support/e2e-app-context';
import { registerE2eHooks } from '../../../../test/e2e/support/register-e2e-hooks';

registerE2eHooks();

describe('Health (e2e)', () => {
  it('GET /api/health returns service status', async () => {
    const app = getE2eApp();

    await request(app.getHttpServer()).get('/api/health').expect(200).expect({
      status: 'ok',
      service: 'api',
    });
  });
});
