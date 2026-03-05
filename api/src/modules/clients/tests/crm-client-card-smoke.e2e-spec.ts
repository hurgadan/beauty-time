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

describe('CRM client card smoke (e2e)', () => {
  it('covers profile, history, export and anonymize actions used by CRM client page', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenant = await createTenant(dataSource, {
      slug: 'crm-client-card-smoke',
    });

    const staff = await createStaff(dataSource, {
      tenantId: tenant.id,
      fullName: 'Anna Meyer',
    });

    const service = await createService(dataSource, {
      tenantId: tenant.id,
      name: 'Haircut',
    });

    const client = await createClient(dataSource, {
      tenantId: tenant.id,
      firstName: 'Sofia',
      lastName: 'Klein',
      email: 'sofia.klein@example.com',
    });

    await createAppointment(dataSource, {
      tenantId: tenant.id,
      staffId: staff.id,
      serviceId: service.id,
      clientId: client.id,
      startsAtIso: '2026-03-24T09:00:00+01:00',
      endsAtIso: '2026-03-24T10:00:00+01:00',
    });

    const token = createAuthToken(tenant.id);

    const clientProfileResponse = await request(app.getHttpServer())
      .get(`/api/crm/clients/${client.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(clientProfileResponse.body.id).toBe(client.id);
    expect(clientProfileResponse.body.email).toBe('sofia.klein@example.com');

    const clientHistoryResponse = await request(app.getHttpServer())
      .get(`/api/crm/clients/${client.id}/history?limit=20`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(clientHistoryResponse.body).toHaveLength(1);
    expect(clientHistoryResponse.body[0].serviceId).toBe(service.id);

    const exportResponse = await request(app.getHttpServer())
      .get(`/api/crm/clients/${client.id}/export?limit=20`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(exportResponse.body.client.id).toBe(client.id);
    expect(exportResponse.body.history).toHaveLength(1);

    await request(app.getHttpServer())
      .delete(`/api/crm/clients/${client.id}/personal-data`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const afterAnonymizeResponse = await request(app.getHttpServer())
      .get(`/api/crm/clients/${client.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(afterAnonymizeResponse.body.firstName).toBe('Anonymized');
    expect(afterAnonymizeResponse.body.lastName).toBe('Client');
    expect(afterAnonymizeResponse.body.email).toBe(`anonymized+${client.id}@deleted.local`);
  });
});
