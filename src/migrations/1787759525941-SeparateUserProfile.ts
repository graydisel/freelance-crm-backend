import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeparateUserProfile1787759525941 implements MigrationInterface {
  name = 'SeparateUserProfile1787759525941';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "user_id" uuid, CONSTRAINT "REL_6ca9503d77ae39b4b5a6cc3ba8" UNIQUE ("user_id"), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "user_profiles" ("first_name", "last_name", "user_id") SELECT "first_name", "last_name", "id" FROM "users"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
    await queryRunner.query(
      `ALTER TYPE "public"."projects_status_enum" ADD VALUE 'archived'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."projects_status_enum_old" AS ENUM('planning', 'active', 'review', 'completed', 'paused')`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ALTER COLUMN "status" TYPE "public"."projects_status_enum_old" USING "status"::"text"::"public"."projects_status_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."projects_status_enum_old" RENAME TO "projects_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_name" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "first_name" character varying(100)`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "first_name" = p."first_name", "last_name" = p."last_name" FROM "user_profiles" p WHERE p."user_id" = "users"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "user_profiles"`);
  }
}
