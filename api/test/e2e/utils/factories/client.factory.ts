import { DataSource } from "typeorm";

export interface ClientSeed {
  id: string;
  tenantId: string;
  email: string;
}

export async function createClient(
  dataSource: DataSource,
  seed: {
    tenantId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  },
): Promise<ClientSeed> {
  const result = await dataSource.query(
    `
      INSERT INTO clients (
        id,
        tenant_id,
        first_name,
        last_name,
        salutation,
        gender,
        email,
        phone
      )
      VALUES (uuidv7(), $1::uuid, $2, $3, 'none', 'unspecified', $4, NULL)
      RETURNING id, tenant_id AS "tenantId", email
    `,
    [
      seed.tenantId,
      seed.firstName ?? "E2E",
      seed.lastName ?? "Client",
      seed.email ?? "client@example.com",
    ],
  );

  return result[0] as ClientSeed;
}
