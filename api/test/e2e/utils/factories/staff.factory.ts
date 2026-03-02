import { DataSource } from "typeorm";

import { StaffRole } from "@modules/staff/enums/staff-role.enum";

export interface StaffSeed {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
}

export async function createStaff(
  dataSource: DataSource,
  seed: {
    tenantId: string;
    email?: string;
    fullName?: string;
    role?: StaffRole;
  },
): Promise<StaffSeed> {
  const result = await dataSource.query(
    `
      INSERT INTO staff (id, tenant_id, email, full_name, role, is_active)
      VALUES (uuidv7(), $1::uuid, $2, $3, $4, true)
      RETURNING id, tenant_id AS "tenantId", email, full_name AS "fullName"
    `,
    [
      seed.tenantId,
      seed.email ?? "staff@example.com",
      seed.fullName ?? "E2E Staff",
      seed.role ?? StaffRole.STAFF,
    ],
  );

  return result[0] as StaffSeed;
}
