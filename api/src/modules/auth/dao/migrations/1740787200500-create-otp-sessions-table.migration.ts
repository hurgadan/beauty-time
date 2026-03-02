import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOtpSessionsTable1740787200500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'otp_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuidv7()',
          },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'client_id', type: 'uuid', isNullable: true },
          { name: 'email', type: 'varchar', isNullable: false },
          { name: 'otp_code_hash', type: 'varchar', isNullable: false },
          {
            name: 'purpose',
            type: 'varchar',
            isNullable: false,
            default: "'booking_confirm'",
          },
          {
            name: 'attempts',
            type: 'integer',
            isNullable: false,
            default: '0',
          },
          { name: 'expires_at', type: 'timestamptz', isNullable: false },
          { name: 'consumed_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'otp_sessions',
      new TableForeignKey({
        name: 'fk_otp_sessions_tenant_id',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'otp_sessions',
      new TableForeignKey({
        name: 'fk_otp_sessions_client_id',
        columnNames: ['client_id'],
        referencedTableName: 'clients',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('otp_sessions', true, true, true);
  }
}
