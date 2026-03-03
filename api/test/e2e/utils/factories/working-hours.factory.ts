import { DataSource } from 'typeorm';

export interface WorkingHoursSeed {
  id: string;
  tenantId: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export async function createWorkingHours(
  dataSource: DataSource,
  seed: {
    tenantId: string;
    staffId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  },
): Promise<WorkingHoursSeed> {
  const result = await dataSource.query(
    `
      INSERT INTO working_hours (id, tenant_id, staff_id, day_of_week, start_time, end_time)
      VALUES (uuidv7(), $1::uuid, $2::uuid, $3::smallint, $4::time, $5::time)
      RETURNING
        id,
        tenant_id AS "tenantId",
        staff_id AS "staffId",
        day_of_week AS "dayOfWeek",
        start_time AS "startTime",
        end_time AS "endTime"
    `,
    [seed.tenantId, seed.staffId, seed.dayOfWeek, seed.startTime, seed.endTime],
  );

  return result[0] as WorkingHoursSeed;
}
