import { DataSource } from 'typeorm';

export interface TenantSeed {
  id: string;
  slug: string;
}

export async function createTenant(dataSource: DataSource, seed?: Partial<TenantSeed>): Promise<TenantSeed> {
  const result = await dataSource.query(
    `
      INSERT INTO tenants (id, name, slug, timezone)
      VALUES (COALESCE($1::uuid, uuidv7()), 'E2E Tenant', COALESCE($2, 'e2e-tenant'), 'Europe/Berlin')
      RETURNING id, slug
    `,
    [seed?.id ?? null, seed?.slug ?? null],
  );

  return result[0] as TenantSeed;
}
