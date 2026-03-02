import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateNotificationJobsTable1740787200600 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notification_jobs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuidv7()',
          },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'appointment_id', type: 'uuid', isNullable: true },
          {
            name: 'channel',
            type: 'enum',
            enumName: 'notification_channel_enum',
            enum: ['email'],
            isNullable: false,
          },
          { name: 'template', type: 'varchar', isNullable: false },
          { name: 'recipient', type: 'varchar', isNullable: false },
          { name: 'scheduled_at', type: 'timestamptz', isNullable: false },
          { name: 'sent_at', type: 'timestamptz', isNullable: true },
          {
            name: 'status',
            type: 'enum',
            enumName: 'notification_job_status_enum',
            enum: ['pending', 'sent', 'failed', 'cancelled'],
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'attempts',
            type: 'integer',
            default: '0',
            isNullable: false,
          },
          { name: 'last_error', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'notification_jobs',
      new TableForeignKey({
        name: 'fk_notification_jobs_tenant_id',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'notification_jobs',
      new TableForeignKey({
        name: 'fk_notification_jobs_appointment_id',
        columnNames: ['appointment_id'],
        referencedTableName: 'appointments',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notification_jobs', true, true, true);
  }
}
