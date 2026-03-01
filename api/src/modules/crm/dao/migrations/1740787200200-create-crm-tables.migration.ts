import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCrmTables1740787200200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'staff',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuidv7()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'email', type: 'varchar', isNullable: false },
          { name: 'full_name', type: 'varchar', isNullable: false },
          { name: 'role', type: 'enum', enumName: 'staff_role_enum', enum: ['owner', 'staff'], default: "'staff'", isNullable: false },
          { name: 'is_active', type: 'boolean', default: 'true', isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('staff', new TableIndex({ name: 'uq_staff_tenant_email', columnNames: ['tenant_id', 'email'], isUnique: true }));
    await queryRunner.createForeignKey(
      'staff',
      new TableForeignKey({ name: 'fk_staff_tenant_id', columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'services',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuidv7()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'price_cents', type: 'integer', isNullable: false },
          { name: 'duration_minutes', type: 'integer', isNullable: false },
          { name: 'buffer_before_minutes', type: 'integer', default: '0', isNullable: false },
          { name: 'buffer_after_minutes', type: 'integer', default: '0', isNullable: false },
          { name: 'is_active', type: 'boolean', default: 'true', isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'services',
      new TableForeignKey({ name: 'fk_services_tenant_id', columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'working_hours',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuidv7()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'staff_id', type: 'uuid', isNullable: false },
          { name: 'day_of_week', type: 'smallint', isNullable: false },
          { name: 'start_time', type: 'time', isNullable: false },
          { name: 'end_time', type: 'time', isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'working_hours',
      new TableForeignKey({ name: 'fk_working_hours_tenant_id', columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );
    await queryRunner.createForeignKey(
      'working_hours',
      new TableForeignKey({ name: 'fk_working_hours_staff_id', columnNames: ['staff_id'], referencedTableName: 'staff', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'time_off',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuidv7()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'staff_id', type: 'uuid', isNullable: false },
          { name: 'starts_at', type: 'timestamptz', isNullable: false },
          { name: 'ends_at', type: 'timestamptz', isNullable: false },
          { name: 'reason', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'time_off',
      new TableForeignKey({ name: 'fk_time_off_tenant_id', columnNames: ['tenant_id'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );
    await queryRunner.createForeignKey(
      'time_off',
      new TableForeignKey({ name: 'fk_time_off_staff_id', columnNames: ['staff_id'], referencedTableName: 'staff', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('time_off', true, true, true);
    await queryRunner.dropTable('working_hours', true, true, true);
    await queryRunner.dropTable('services', true, true, true);
    await queryRunner.dropTable('staff', true, true, true);
  }
}
