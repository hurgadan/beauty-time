import { DataSource } from 'typeorm';

const EXCLUDED_TABLES = new Set(['migrations']);

export async function clearDatabase(dataSource: DataSource): Promise<void> {
  const tablesRaw = (await dataSource.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  `)) as Array<{ tablename: string }>;

  const tableNames = tablesRaw
    .map((entry) => entry.tablename)
    .filter((name) => !EXCLUDED_TABLES.has(name));

  if (tableNames.length === 0) {
    return;
  }

  const tableList = tableNames.map((name) => `"${name}"`).join(', ');
  await dataSource.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
}
