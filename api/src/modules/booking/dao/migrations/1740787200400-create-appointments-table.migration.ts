import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAppointmentsTable1740787200400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'appointments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuidv7()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'staff_id', type: 'uuid', isNullable: false },
          { name: 'service_id', type: 'uuid', isNullable: false },
          { name: 'client_id', type: 'uuid', isNullable: false },
          {
            name: 'status',
            type: 'enum',
            enumName: 'appointment_status_enum',
            enum: ['booked', 'confirmed_by_reminder', 'completed', 'cancelled_by_client', 'cancelled_by_staff', 'no_show'],
            default: "'booked'",
            isNullable: false,
          },
          { name: 'starts_at', type: 'timestamptz', isNullable: false },
          { name: 'ends_at', type: 'timestamptz', isNullable: false },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'appointments',
      new TableForeignKey({ name: 'fk_appointments_tenant_id', columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );
    await queryRunner.createForeignKey(
      'appointments',
      new TableForeignKey({ name: 'fk_appointments_staff_id', columnNames: ['staff_id'], referencedTableName: 'staff', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }),
    );
    await queryRunner.createForeignKey(
      'appointments',
      new TableForeignKey({ name: 'fk_appointments_service_id', columnNames: ['service_id'], referencedTableName: 'services', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }),
    );
    await queryRunner.createForeignKey(
      'appointments',
      new TableForeignKey({ name: 'fk_appointments_client_id', columnNames: ['client_id'], referencedTableName: 'clients', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('appointments', true, true, true);
  }
}
