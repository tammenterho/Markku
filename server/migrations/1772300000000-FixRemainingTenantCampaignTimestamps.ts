import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixRemainingTenantCampaignTimestamps1772300000000
  implements MigrationInterface
{
  name = 'FixRemainingTenantCampaignTimestamps1772300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        schema_name text;
        col_name text;
      BEGIN
        FOR schema_name IN
          SELECT DISTINCT c.table_schema
          FROM information_schema.columns c
          WHERE c.table_name = 'campaigns'
            AND (c.table_schema = 'public' OR c.table_schema LIKE 'tenant_%')
        LOOP
          FOR col_name IN
            SELECT unnest(ARRAY['start', 'end', 'createdAt', 'updatedAt'])
          LOOP
            IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_schema = schema_name
                AND table_name = 'campaigns'
                AND column_name = col_name
                AND data_type = 'timestamp without time zone'
            ) THEN
              EXECUTE format(
                'ALTER TABLE %I.campaigns ALTER COLUMN %I TYPE timestamptz USING %I AT TIME ZONE ''Europe/Helsinki''',
                schema_name,
                col_name,
                col_name
              );
            END IF;
          END LOOP;
        END LOOP;
      END
      $$;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally left empty to avoid accidental data shifts on rollback.
  }
}
