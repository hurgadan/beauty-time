import * as request from 'supertest';

import { getE2eApp } from '../../../../test/e2e/support/e2e-app-context';
import { registerE2eHooks } from '../../../../test/e2e/support/register-e2e-hooks';

registerE2eHooks();

describe('Notifications API (e2e)', () => {
  it('returns successful responses for schedule and send endpoints', async () => {
    const app = getE2eApp();

    const scheduleResponse = await request(app.getHttpServer())
      .post('/api/internal/notifications/schedule')
      .expect(201);

    expect(scheduleResponse.body).toEqual({
      queued: true,
      jobs: 0,
    });

    const sendResponse = await request(app.getHttpServer())
      .post('/api/internal/notifications/send')
      .expect(201);

    expect(sendResponse.body).toEqual({
      sent: true,
      processed: 0,
      failed: 0,
    });
  });
});
