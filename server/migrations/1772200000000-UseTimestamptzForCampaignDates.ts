import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UseTimestamptzForCampaignDates1772200000000
  implements MigrationInterface
{
  name = 'UseTimestamptzForCampaignDates1772200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        v_schema_name text;
        col_name text;
      BEGIN
        FOR v_schema_name IN
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
              WHERE table_schema = v_schema_name
                AND table_name = 'campaigns'
                AND column_name = col_name
                AND data_type = 'timestamp without time zone'
            ) THEN
              EXECUTE format(
                'ALTER TABLE %I.campaigns ALTER COLUMN %I TYPE timestamptz USING %I AT TIME ZONE ''Europe/Helsinki''',
                v_schema_name,
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "campaigns"
      ALTER COLUMN "start" TYPE timestamp USING "start" AT TIME ZONE 'Europe/Helsinki',
      ALTER COLUMN "end" TYPE timestamp USING "end" AT TIME ZONE 'Europe/Helsinki',
      ALTER COLUMN "createdAt" TYPE timestamp USING "createdAt" AT TIME ZONE 'Europe/Helsinki',
      ALTER COLUMN "updatedAt" TYPE timestamp USING "updatedAt" AT TIME ZONE 'Europe/Helsinki';
    `);

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
            'ALTER TABLE %I.campaigns
             ALTER COLUMN "start" TYPE timestamp USING "start" AT TIME ZONE ''Europe/Helsinki'',
             ALTER COLUMN "end" TYPE timestamp USING "end" AT TIME ZONE ''Europe/Helsinki'',
             ALTER COLUMN "createdAt" TYPE timestamp USING "createdAt" AT TIME ZONE ''Europe/Helsinki'',
             ALTER COLUMN "updatedAt" TYPE timestamp USING "updatedAt" AT TIME ZONE ''Europe/Helsinki''',
            schema_name
          );
        END LOOP;
      END
      $$;
    `);
  }
}
