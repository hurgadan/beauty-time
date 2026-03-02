import { DataSource } from "typeorm";

export interface ServiceSeed {
  id: string;
  tenantId: string;
  name: string;
}

export async function createService(
  dataSource: DataSource,
  seed: {
    tenantId: string;
    name?: string;
    priceCents?: number;
    durationMinutes?: number;
  },
): Promise<ServiceSeed> {
  const result = await dataSource.query(
    `
      INSERT INTO services (
        id,
        tenant_id,
        name,
        description,
        price_cents,
        duration_minutes,
        buffer_before_minutes,
        buffer_after_minutes,
        is_active
      )
      VALUES (uuidv7(), $1::uuid, $2, NULL, $3, $4, 0, 0, true)
      RETURNING id, tenant_id AS "tenantId", name
    `,
    [
      seed.tenantId,
      seed.name ?? "E2E Service",
      seed.priceCents ?? 3500,
      seed.durationMinutes ?? 30,
    ],
  );

  return result[0] as ServiceSeed;
}
