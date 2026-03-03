import { DataSource } from 'typeorm';

export interface TimeOffSeed {
  id: string;
  tenantId: string;
  staffId: string;
}

export async function createTimeOff(
  dataSource: DataSource,
  seed: {
    tenantId: string;
    staffId: string;
    startsAtIso: string;
    endsAtIso: string;
    reason?: string | null;
  },
): Promise<TimeOffSeed> {
  const result = await dataSource.query(
    `
      INSERT INTO time_off (id, tenant_id, staff_id, starts_at, ends_at, reason)
      VALUES (uuidv7(), $1::uuid, $2::uuid, $3::timestamptz, $4::timestamptz, $5)
      RETURNING id, tenant_id AS "tenantId", staff_id AS "staffId"
    `,
    [seed.tenantId, seed.staffId, seed.startsAtIso, seed.endsAtIso, seed.reason ?? null],
  );

  return result[0] as TimeOffSeed;
}
