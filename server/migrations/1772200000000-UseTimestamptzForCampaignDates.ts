import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseTimestamptzForCampaignDates1772200000000
  implements MigrationInterface
{
  name = 'UseTimestamptzForCampaignDates1772200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "campaigns"
      ALTER COLUMN "start" TYPE timestamptz USING "start" AT TIME ZONE 'Europe/Helsinki',
      ALTER COLUMN "end" TYPE timestamptz USING "end" AT TIME ZONE 'Europe/Helsinki',
      ALTER COLUMN "createdAt" TYPE timestamptz USING "createdAt" AT TIME ZONE 'Europe/Helsinki',
      ALTER COLUMN "updatedAt" TYPE timestamptz USING "updatedAt" AT TIME ZONE 'Europe/Helsinki';
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
             ALTER COLUMN "start" TYPE timestamptz USING "start" AT TIME ZONE ''Europe/Helsinki'',
             ALTER COLUMN "end" TYPE timestamptz USING "end" AT TIME ZONE ''Europe/Helsinki'',
             ALTER COLUMN "createdAt" TYPE timestamptz USING "createdAt" AT TIME ZONE ''Europe/Helsinki'',
             ALTER COLUMN "updatedAt" TYPE timestamptz USING "updatedAt" AT TIME ZONE ''Europe/Helsinki''',
            schema_name
          );
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
