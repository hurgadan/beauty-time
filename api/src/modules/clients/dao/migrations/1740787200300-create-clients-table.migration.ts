import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateClientsTable1740787200300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'clients',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuidv7()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'first_name', type: 'varchar', isNullable: false },
          { name: 'last_name', type: 'varchar', isNullable: false },
          {
            name: 'salutation',
            type: 'enum',
            enumName: 'client_salutation_enum',
            enum: ['herr', 'frau', 'none'],
            default: "'none'",
            isNullable: false,
          },
          {
            name: 'gender',
            type: 'enum',
            enumName: 'client_gender_enum',
            enum: ['male', 'female', 'diverse', 'unspecified'],
            default: "'unspecified'",
            isNullable: false,
          },
          { name: 'email', type: 'varchar', isNullable: false },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'clients',
      new TableIndex({ name: 'uq_clients_tenant_email', columnNames: ['tenant_id', 'email'], isUnique: true }),
    );

    await queryRunner.createForeignKey(
      'clients',
      new TableForeignKey({
        name: 'fk_clients_tenant_id',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('clients', true, true, true);
  }
}
