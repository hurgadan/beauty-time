import { DataSource } from "typeorm";

import { AppointmentStatus } from "@contracts";

export interface AppointmentSeed {
  id: string;
  tenantId: string;
  staffId: string;
  serviceId: string;
  clientId: string;
}

export async function createAppointment(
  dataSource: DataSource,
  seed: {
    tenantId: string;
    staffId: string;
    serviceId: string;
    clientId: string;
    startsAtIso: string;
    endsAtIso: string;
    status?: AppointmentStatus;
    notes?: string | null;
  },
): Promise<AppointmentSeed> {
  const result = await dataSource.query(
    `
      INSERT INTO appointments (
        id,
        tenant_id,
        staff_id,
        service_id,
        client_id,
        starts_at,
        ends_at,
        status,
        notes
      )
      VALUES (uuidv7(), $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::timestamptz, $6::timestamptz, $7, $8)
      RETURNING id, tenant_id AS "tenantId", staff_id AS "staffId", service_id AS "serviceId", client_id AS "clientId"
    `,
    [
      seed.tenantId,
      seed.staffId,
      seed.serviceId,
      seed.clientId,
      seed.startsAtIso,
      seed.endsAtIso,
      seed.status ?? AppointmentStatus.BOOKED,
      seed.notes ?? null,
    ],
  );

  return result[0] as AppointmentSeed;
}
