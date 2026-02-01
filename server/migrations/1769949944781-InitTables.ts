import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTables1769949944781 implements MigrationInterface {
  name = 'InitTables1769949944781';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "passwordHash" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD "createdBy" character varying(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "start"`);
    await queryRunner.query(`ALTER TABLE "campaigns" ADD "start" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "end"`);
    await queryRunner.query(`ALTER TABLE "campaigns" ADD "end" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "end"`);
    await queryRunner.query(`ALTER TABLE "campaigns" ADD "end" date`);
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "start"`);
    await queryRunner.query(`ALTER TABLE "campaigns" ADD "start" date`);
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "createdBy"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
