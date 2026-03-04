import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateAuditLogsTable1740787200700 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuidv7()',
          },
          { name: 'tenant_id', type: 'uuid', isNullable: true },
          { name: 'actor_type', type: 'varchar', isNullable: false },
          { name: 'actor_id', type: 'varchar', isNullable: true },
          { name: 'action', type: 'varchar', isNullable: false },
          { name: 'entity_type', type: 'varchar', isNullable: true },
          { name: 'entity_id', type: 'varchar', isNullable: true },
          { name: 'ip_address', type: 'varchar', isNullable: true },
          { name: 'user_agent', type: 'varchar', isNullable: true },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: false,
            default: "'{}'::jsonb",
          },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_tenant_created_at',
        columnNames: ['tenant_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_action_created_at',
        columnNames: ['action', 'created_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        name: 'fk_audit_logs_tenant_id',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs', true, true, true);
  }
}
