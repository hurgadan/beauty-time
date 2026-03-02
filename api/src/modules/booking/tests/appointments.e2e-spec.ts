import { AppointmentStatus } from '@contracts';
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

describe('Appointments/Staff/Services (e2e)', () => {
  it('POST /api/crm/services creates service and GET /api/crm/services/list returns tenant-only data', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenantA = await createTenant(dataSource, { slug: 'e2e-crm-a' });
    const tenantB = await createTenant(dataSource, { slug: 'e2e-crm-b' });

    await createService(dataSource, {
      tenantId: tenantB.id,
      name: 'Hidden TenantB Service',
    });

    const tokenA = createAuthToken(tenantA.id);

    const createResponse = await request(app.getHttpServer())
      .post('/api/crm/services')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Visible TenantA Service',
        priceCents: 4500,
        durationMinutes: 40,
      })
      .expect(201);

    expect(createResponse.body.name).toBe('Visible TenantA Service');
    expect(createResponse.body.tenantId).toBe(tenantA.id);

    const listResponse = await request(app.getHttpServer())
      .get('/api/crm/services/list')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].name).toBe('Visible TenantA Service');
    expect(listResponse.body[0].tenantId).toBe(tenantA.id);
  });

  it('POST /api/crm/appointments blocks overlapping slot for same staff', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenant = await createTenant(dataSource, { slug: 'e2e-crm-overlap' });
    const staff = await createStaff(dataSource, { tenantId: tenant.id });
    const service = await createService(dataSource, { tenantId: tenant.id });
    const clientA = await createClient(dataSource, {
      tenantId: tenant.id,
      email: 'client-a@example.com',
    });
    const clientB = await createClient(dataSource, {
      tenantId: tenant.id,
      email: 'client-b@example.com',
    });

    const token = createAuthToken(tenant.id);

    await request(app.getHttpServer())
      .post('/api/crm/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        staffId: staff.id,
        serviceId: service.id,
        clientId: clientA.id,
        startsAtIso: '2026-03-10T09:00:00+01:00',
        endsAtIso: '2026-03-10T10:00:00+01:00',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/crm/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        staffId: staff.id,
        serviceId: service.id,
        clientId: clientB.id,
        startsAtIso: '2026-03-10T09:30:00+01:00',
        endsAtIso: '2026-03-10T10:30:00+01:00',
      })
      .expect(409);
  });

  it('GET /api/crm/staff/list and /api/crm/appointments/list support filtering and limit', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenant = await createTenant(dataSource, { slug: 'e2e-crm-filters' });
    const staffAnna = await createStaff(dataSource, {
      tenantId: tenant.id,
      fullName: 'Anna Muller',
      email: 'anna@example.com',
    });
    const staffEva = await createStaff(dataSource, {
      tenantId: tenant.id,
      fullName: 'Eva Schmidt',
      email: 'eva@example.com',
    });

    const service = await createService(dataSource, { tenantId: tenant.id });
    const client = await createClient(dataSource, { tenantId: tenant.id });

    await createAppointment(dataSource, {
      tenantId: tenant.id,
      staffId: staffAnna.id,
      serviceId: service.id,
      clientId: client.id,
      startsAtIso: '2026-03-12T09:00:00+01:00',
      endsAtIso: '2026-03-12T10:00:00+01:00',
      status: AppointmentStatus.BOOKED,
    });

    await createAppointment(dataSource, {
      tenantId: tenant.id,
      staffId: staffEva.id,
      serviceId: service.id,
      clientId: client.id,
      startsAtIso: '2026-03-12T11:00:00+01:00',
      endsAtIso: '2026-03-12T12:00:00+01:00',
      status: AppointmentStatus.CANCELLED_BY_STAFF,
    });

    const token = createAuthToken(tenant.id);

    const staffResponse = await request(app.getHttpServer())
      .get('/api/crm/staff/list?search=anna&limit=1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(staffResponse.body).toHaveLength(1);
    expect(staffResponse.body[0].fullName).toBe('Anna Muller');

    const appointmentsResponse = await request(app.getHttpServer())
      .get(
        `/api/crm/appointments/list?staffId=${staffAnna.id}&status=${AppointmentStatus.BOOKED}&limit=1`,
      )
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(appointmentsResponse.body).toHaveLength(1);
    expect(appointmentsResponse.body[0].staffId).toBe(staffAnna.id);
    expect(appointmentsResponse.body[0].status).toBe(AppointmentStatus.BOOKED);
  });
});
