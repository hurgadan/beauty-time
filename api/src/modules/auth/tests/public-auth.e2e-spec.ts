import { createHash } from 'node:crypto';

import * as request from 'supertest';

import { getE2eApp, getE2eDataSource } from '../../../../test/e2e/support/e2e-app-context';
import { registerE2eHooks } from '../../../../test/e2e/support/register-e2e-hooks';
import { createClient } from '../../../../test/e2e/utils/factories/client.factory';
import { createTenant } from '../../../../test/e2e/utils/factories/tenant.factory';

registerE2eHooks();

describe('Public auth flow (e2e)', () => {
  it('sends otp session and verifies existing client', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenant = await createTenant(dataSource, { slug: 'auth-flow-tenant' });
    const client = await createClient(dataSource, {
      tenantId: tenant.id,
      email: 'existing.client@example.com',
    });

    const sendResponse = await request(app.getHttpServer())
      .post('/api/auth/client/send-magic-link')
      .send({
        tenantSlug: 'auth-flow-tenant',
        email: 'existing.client@example.com',
      })
      .expect(201);

    expect(sendResponse.body).toEqual({
      sent: true,
      email: 'existing.client@example.com',
    });

    await dataSource.query(
      `
        UPDATE otp_sessions
        SET otp_code_hash = $1
        WHERE tenant_id = $2::uuid AND email = $3
      `,
      [hashOtp('123456'), tenant.id, 'existing.client@example.com'],
    );

    const verifyResponse = await request(app.getHttpServer())
      .post('/api/auth/client/verify-otp')
      .send({
        tenantSlug: 'auth-flow-tenant',
        email: 'existing.client@example.com',
        otp: '123456',
      })
      .expect(201);

    expect(verifyResponse.body.verified).toBe(true);
    expect(typeof verifyResponse.body.token).toBe('string');
    expect(verifyResponse.body.token.length).toBeGreaterThan(10);

    const rows = await dataSource.query(
      `SELECT client_id AS "clientId", consumed_at AS "consumedAt" FROM otp_sessions WHERE tenant_id = $1::uuid`,
      [tenant.id],
    );
    expect(rows[0].clientId).toBe(client.id);
    expect(rows[0].consumedAt).not.toBeNull();
  });

  it('creates client during verify when client does not exist and blocks otp resend flood', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenant = await createTenant(dataSource, { slug: 'auth-new-client-tenant' });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await request(app.getHttpServer())
        .post('/api/auth/client/send-magic-link')
        .send({
          tenantSlug: 'auth-new-client-tenant',
          email: 'new.client@example.com',
        })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post('/api/auth/client/send-magic-link')
      .send({
        tenantSlug: 'auth-new-client-tenant',
        email: 'new.client@example.com',
      })
      .expect(429);

    await dataSource.query(
      `
        UPDATE otp_sessions
        SET otp_code_hash = $1
        WHERE tenant_id = $2::uuid AND email = $3
      `,
      [hashOtp('654321'), tenant.id, 'new.client@example.com'],
    );

    const verifyResponse = await request(app.getHttpServer())
      .post('/api/auth/client/verify-otp')
      .send({
        tenantSlug: 'auth-new-client-tenant',
        email: 'new.client@example.com',
        otp: '654321',
      })
      .expect(201);

    expect(verifyResponse.body.verified).toBe(true);

    const clients = await dataSource.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName" FROM clients WHERE tenant_id = $1::uuid`,
      [tenant.id],
    );
    expect(clients).toHaveLength(1);
    expect(clients[0].firstName).toBe('New');
    expect(clients[0].lastName).toBe('Client');
  });

  it('applies auth endpoint rate limiting by IP window', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    await createTenant(dataSource, { slug: 'auth-rate-limit-tenant' });

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await request(app.getHttpServer())
        .post('/api/auth/client/send-magic-link')
        .send({
          tenantSlug: 'auth-rate-limit-tenant',
          email: `rate-limit-${attempt}@example.com`,
        })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post('/api/auth/client/send-magic-link')
      .send({
        tenantSlug: 'auth-rate-limit-tenant',
        email: 'rate-limit-6@example.com',
      })
      .expect(429);
  });
});

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}
