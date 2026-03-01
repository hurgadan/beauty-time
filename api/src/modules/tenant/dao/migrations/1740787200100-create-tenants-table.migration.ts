import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateTenantsTable1740787200100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "tenants",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuidv7()",
          },
          { name: "name", type: "varchar", isNullable: false },
          { name: "slug", type: "varchar", isNullable: false },
          {
            name: "timezone",
            type: "varchar",
            isNullable: false,
            default: "'Europe/Berlin'",
          },
          { name: "created_at", type: "timestamptz", default: "now()" },
          { name: "updated_at", type: "timestamptz", default: "now()" },
          { name: "deleted_at", type: "timestamptz", isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "tenants",
      new TableIndex({
        name: "uq_tenants_slug",
        columnNames: ["slug"],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("tenants", "uq_tenants_slug");
    await queryRunner.dropTable("tenants", true, true, true);
  }
}
