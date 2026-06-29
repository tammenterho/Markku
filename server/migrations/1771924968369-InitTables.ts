import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTables1771924968369 implements MigrationInterface {
  name = 'InitTables1771924968369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "clientId"`,
    );

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'companies'
            AND column_name = 'linkId'
        ) THEN
          ALTER TABLE "companies" ALTER COLUMN "linkId" DROP DEFAULT;
          ALTER TABLE "companies" ALTER COLUMN "linkId" SET DEFAULT gen_random_uuid();
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "linkId" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "linkId" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD "clientId" character varying(255) NOT NULL`,
    );
  }
}
