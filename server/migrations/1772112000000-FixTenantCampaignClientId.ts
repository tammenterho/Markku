import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTenantCampaignClientId1772112000000
  implements MigrationInterface
{
  name = 'FixTenantCampaignClientId1772112000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "clientId"`,
    );

    await queryRunner.query(`
      DO $$
      DECLARE
        v_schema_name text;
      BEGIN
        FOR v_schema_name IN
          SELECT s.schema_name
          FROM information_schema.schemata s
          WHERE s.schema_name LIKE 'tenant_%'
        LOOP
          EXECUTE format(
            'ALTER TABLE %I.campaigns DROP COLUMN IF EXISTS "clientId"',
            v_schema_name
          );
          EXECUTE format(
            'ALTER TABLE %I.campaigns ADD COLUMN IF NOT EXISTS "imageUrls" text[] DEFAULT ''{}''',
            v_schema_name
          );
        END LOOP;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "clientId" character varying(255)`,
    );

    await queryRunner.query(`
      DO $$
      DECLARE
        v_schema_name text;
      BEGIN
        FOR v_schema_name IN
          SELECT s.schema_name
          FROM information_schema.schemata s
          WHERE s.schema_name LIKE 'tenant_%'
        LOOP
          EXECUTE format(
            'ALTER TABLE %I.campaigns ADD COLUMN IF NOT EXISTS "clientId" character varying(255)',
            v_schema_name
          );
        END LOOP;
      END
      $$;
    `);
  }
}
