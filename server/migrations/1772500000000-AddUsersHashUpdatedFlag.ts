import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersHashUpdatedFlag1772500000000
  implements MigrationInterface
{
  name = 'AddUsersHashUpdatedFlag1772500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "hashUpdated" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "hashUpdated"
    `);
  }
}
