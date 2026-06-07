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
        schema_name text;
      BEGIN
        FOR schema_name IN
          SELECT schema_name
          FROM information_schema.schemata
          WHERE schema_name LIKE 'tenant_%'
        LOOP
          EXECUTE format(
            'ALTER TABLE %I.campaigns DROP COLUMN IF EXISTS "clientId"',
            schema_name
          );
          EXECUTE format(
            'ALTER TABLE %I.campaigns ADD COLUMN IF NOT EXISTS "imageUrls" text[] DEFAULT ''{}''',
            schema_name
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
        schema_name text;
      BEGIN
        FOR schema_name IN
          SELECT schema_name
          FROM information_schema.schemata
          WHERE schema_name LIKE 'tenant_%'
        LOOP
          EXECUTE format(
            'ALTER TABLE %I.campaigns ADD COLUMN IF NOT EXISTS "clientId" character varying(255)',
            schema_name
          );
        END LOOP;
      END
      $$;
    `);
  }
}
