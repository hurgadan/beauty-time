import * as request from 'supertest';

import { createAuthToken } from '../../../../test/e2e/support/auth-token';
import { getE2eApp, getE2eDataSource } from '../../../../test/e2e/support/e2e-app-context';
import { registerE2eHooks } from '../../../../test/e2e/support/register-e2e-hooks';
import { createAppointment } from '../../../../test/e2e/utils/factories/appointment.factory';
import { createClient } from '../../../../test/e2e/utils/factories/client.factory';
import { createService } from '../../../../test/e2e/utils/factories/service.factory';
import { createStaff } from '../../../../test/e2e/utils/factories/staff.factory';
import { createTenant } from '../../../../test/e2e/utils/factories/tenant.factory';

registerE2eHooks();

describe('Clients (e2e)', () => {
  it('GET /api/crm/clients/list supports search and tenant isolation', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenantA = await createTenant(dataSource, { slug: 'e2e-clients-a' });
    const tenantB = await createTenant(dataSource, { slug: 'e2e-clients-b' });

    await createClient(dataSource, {
      tenantId: tenantA.id,
      firstName: 'Sofia',
      lastName: 'Ludwig',
      email: 'sofia@tenant-a.de',
    });

    await createClient(dataSource, {
      tenantId: tenantB.id,
      firstName: 'Sofia',
      lastName: 'OtherTenant',
      email: 'sofia@tenant-b.de',
    });

    const tokenA = createAuthToken(tenantA.id);

    const response = await request(app.getHttpServer())
      .get('/api/crm/clients/list?search=sofia')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].email).toBe('sofia@tenant-a.de');
    expect(response.body[0].tenantId).toBe(tenantA.id);
  });

  it('GET /api/crm/clients/:id/history returns client appointments', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenant = await createTenant(dataSource, {
      slug: 'e2e-client-history',
    });
    const staff = await createStaff(dataSource, { tenantId: tenant.id });
    const service = await createService(dataSource, { tenantId: tenant.id });
    const client = await createClient(dataSource, {
      tenantId: tenant.id,
      email: 'history@example.com',
    });

    await createAppointment(dataSource, {
      tenantId: tenant.id,
      staffId: staff.id,
      serviceId: service.id,
      clientId: client.id,
      startsAtIso: '2026-03-12T09:00:00+01:00',
      endsAtIso: '2026-03-12T10:00:00+01:00',
    });

    const token = createAuthToken(tenant.id);

    const response = await request(app.getHttpServer())
      .get(`/api/crm/clients/${client.id}/history`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].staffId).toBe(staff.id);
    expect(response.body[0].serviceId).toBe(service.id);
  });

  it('supports GDPR export and anonymization endpoints', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenant = await createTenant(dataSource, { slug: 'e2e-clients-gdpr' });
    const staff = await createStaff(dataSource, { tenantId: tenant.id });
    const service = await createService(dataSource, { tenantId: tenant.id });
    const client = await createClient(dataSource, {
      tenantId: tenant.id,
      firstName: 'Anna',
      lastName: 'Meyer',
      email: 'anna@example.com',
    });

    await createAppointment(dataSource, {
      tenantId: tenant.id,
      staffId: staff.id,
      serviceId: service.id,
      clientId: client.id,
      startsAtIso: '2026-03-20T09:00:00+01:00',
      endsAtIso: '2026-03-20T10:00:00+01:00',
    });

    const token = createAuthToken(tenant.id);

    const exportResponse = await request(app.getHttpServer())
      .get(`/api/crm/clients/${client.id}/export`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(exportResponse.body.client.id).toBe(client.id);
    expect(exportResponse.body.client.email).toBe('anna@example.com');
    expect(exportResponse.body.history).toHaveLength(1);

    const anonymizeResponse = await request(app.getHttpServer())
      .delete(`/api/crm/clients/${client.id}/personal-data`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(anonymizeResponse.body).toEqual({
      id: client.id,
      anonymized: true,
    });

    const afterAnonymize = await request(app.getHttpServer())
      .get(`/api/crm/clients/${client.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(afterAnonymize.body.firstName).toBe('Anonymized');
    expect(afterAnonymize.body.lastName).toBe('Client');
    expect(afterAnonymize.body.phone).toBeNull();
    expect(afterAnonymize.body.email).toBe(`anonymized+${client.id}@deleted.local`);
  });

  it('supports public self-service GDPR endpoints for client token', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenant = await createTenant(dataSource, { slug: 'e2e-public-gdpr' });
    const staff = await createStaff(dataSource, { tenantId: tenant.id });
    const service = await createService(dataSource, { tenantId: tenant.id });
    const client = await createClient(dataSource, {
      tenantId: tenant.id,
      firstName: 'Lena',
      lastName: 'Koch',
      email: 'lena@example.com',
    });

    await createAppointment(dataSource, {
      tenantId: tenant.id,
      staffId: staff.id,
      serviceId: service.id,
      clientId: client.id,
      startsAtIso: '2026-03-21T10:00:00+01:00',
      endsAtIso: '2026-03-21T11:00:00+01:00',
    });

    const clientToken = createAuthToken(tenant.id, 'client', client.id);

    const exportResponse = await request(app.getHttpServer())
      .get('/api/public/me/personal-data-export')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    expect(exportResponse.body.client.id).toBe(client.id);
    expect(exportResponse.body.history).toHaveLength(1);

    await request(app.getHttpServer())
      .delete('/api/public/me/personal-data')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    const clientRow = await dataSource.query(
      `SELECT email, first_name AS "firstName", last_name AS "lastName" FROM clients WHERE id = $1::uuid`,
      [client.id],
    );
    expect(clientRow[0].firstName).toBe('Anonymized');
    expect(clientRow[0].lastName).toBe('Client');
    expect(clientRow[0].email).toBe(`anonymized+${client.id}@deleted.local`);
  });
});
