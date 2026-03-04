import { AppointmentStatus } from '@contracts';
import * as request from 'supertest';

import { getE2eApp, getE2eDataSource } from '../../../../test/e2e/support/e2e-app-context';
import { registerE2eHooks } from '../../../../test/e2e/support/register-e2e-hooks';
import { createAppointment } from '../../../../test/e2e/utils/factories/appointment.factory';
import { createService } from '../../../../test/e2e/utils/factories/service.factory';
import { createStaff } from '../../../../test/e2e/utils/factories/staff.factory';
import { createTenant } from '../../../../test/e2e/utils/factories/tenant.factory';
import { createTimeOff } from '../../../../test/e2e/utils/factories/time-off.factory';
import { createWorkingHours } from '../../../../test/e2e/utils/factories/working-hours.factory';

registerE2eHooks();

describe('Public booking flow (e2e)', () => {
  it('returns real availability and creates+confirms appointment with slot conflict protection', async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenant = await createTenant(dataSource, { slug: 'public-flow-tenant' });
    const staff = await createStaff(dataSource, {
      tenantId: tenant.id,
      email: 'public-staff@example.com',
      fullName: 'Public Staff',
    });
    const service = await createService(dataSource, {
      tenantId: tenant.id,
      durationMinutes: 30,
      bufferAfterMinutes: 15,
    });
    const existingService = await createService(dataSource, {
      tenantId: tenant.id,
      name: 'Existing Appointment Service',
      durationMinutes: 30,
    });

    await createWorkingHours(dataSource, {
      tenantId: tenant.id,
      staffId: staff.id,
      dayOfWeek: 2,
      startTime: '09:00:00',
      endTime: '11:00:00',
    });

    await createTimeOff(dataSource, {
      tenantId: tenant.id,
      staffId: staff.id,
      startsAtIso: '2026-03-10T10:00:00+01:00',
      endsAtIso: '2026-03-10T10:30:00+01:00',
      reason: 'Break',
    });

    const configResponse = await request(app.getHttpServer())
      .get('/api/book/public-flow-tenant/config')
      .expect(200);

    expect(configResponse.body.tenantSlug).toBe('public-flow-tenant');
    expect(configResponse.body.timezone).toBe('Europe/Berlin');
    expect(configResponse.body.services).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: service.id,
        }),
      ]),
    );
    expect(configResponse.body.staff).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: staff.id,
        }),
      ]),
    );

    const availabilityBefore = await request(app.getHttpServer())
      .post('/api/book/public-flow-tenant/availability/query')
      .send({
        serviceId: service.id,
        dateIso: '2026-03-10',
      })
      .expect(200);

    expect(availabilityBefore.body.slots).toEqual([
      { startsAtIso: '2026-03-10T08:00:00.000Z', available: true },
      { startsAtIso: '2026-03-10T09:30:00.000Z', available: true },
    ]);

    const createResponse = await request(app.getHttpServer())
      .post('/api/book/public-flow-tenant/appointments')
      .send({
        clientName: 'Anna Muller',
        clientEmail: 'anna.muller@example.com',
        serviceId: service.id,
        startsAtIso: '2026-03-10T09:00:00+01:00',
      })
      .expect(201);

    expect(createResponse.body.tenantSlug).toBe('public-flow-tenant');
    expect(typeof createResponse.body.id).toBe('string');

    await createAppointment(dataSource, {
      tenantId: tenant.id,
      staffId: staff.id,
      serviceId: existingService.id,
      clientId: (
        await dataSource.query(
          `SELECT id FROM clients WHERE tenant_id = $1::uuid AND email = $2 LIMIT 1`,
          [tenant.id, 'anna.muller@example.com'],
        )
      )[0].id as string,
      startsAtIso: '2026-03-10T10:30:00+01:00',
      endsAtIso: '2026-03-10T11:00:00+01:00',
      status: AppointmentStatus.BOOKED,
    });

    await request(app.getHttpServer())
      .post('/api/book/public-flow-tenant/appointments')
      .send({
        clientName: 'Another Client',
        clientEmail: 'another.client@example.com',
        serviceId: service.id,
        staffId: staff.id,
        startsAtIso: '2026-03-10T09:30:00+01:00',
      })
      .expect(409);

    const availabilityAfter = await request(app.getHttpServer())
      .post('/api/book/public-flow-tenant/availability/query')
      .send({
        serviceId: service.id,
        dateIso: '2026-03-10',
      })
      .expect(200);

    expect(availabilityAfter.body.slots).toEqual([]);

    const confirmResponse = await request(app.getHttpServer())
      .post(`/api/book/appointments/${createResponse.body.id}/confirm`)
      .expect(200);

    expect(confirmResponse.body.id).toBe(createResponse.body.id);
    expect(confirmResponse.body.status).toBe(AppointmentStatus.CONFIRMED_BY_REMINDER);
  });
});
