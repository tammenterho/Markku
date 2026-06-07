import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTenant5CampaignTimestamps1772400000000
  implements MigrationInterface
{
  name = 'FixTenant5CampaignTimestamps1772400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        col_name text;
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'tenant_5'
            AND table_name = 'campaigns'
        ) THEN
          FOR col_name IN
            SELECT unnest(ARRAY['start', 'end', 'createdAt', 'updatedAt'])
          LOOP
            IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_schema = 'tenant_5'
                AND table_name = 'campaigns'
                AND column_name = col_name
                AND data_type = 'timestamp without time zone'
            ) THEN
              EXECUTE format(
                'ALTER TABLE tenant_5.campaigns ALTER COLUMN %I TYPE timestamptz USING %I AT TIME ZONE ''Europe/Helsinki''',
                col_name,
                col_name
              );
            END IF;
          END LOOP;
        END IF;
      END
      $$;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally left empty to avoid accidental data shifts on rollback.
  }
}
