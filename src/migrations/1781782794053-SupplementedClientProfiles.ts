import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupplementedClientProfiles1781782794053 implements MigrationInterface {
  name = 'SupplementedClientProfiles1781782794053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."client-profiles_status_enum" RENAME TO "client-profiles_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."client-profiles_status_enum" AS ENUM('active', 'archived', 'lead')`,
    );
    await queryRunner.query(
      `ALTER TABLE "client-profiles" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "client-profiles" ALTER COLUMN "status" TYPE "public"."client-profiles_status_enum" USING "status"::"text"::"public"."client-profiles_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "client-profiles" ALTER COLUMN "status" SET DEFAULT 'active'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."client-profiles_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."client-profiles_status_enum_old" AS ENUM('active', 'inactive', 'lead')`,
    );
    await queryRunner.query(
      `ALTER TABLE "client-profiles" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "client-profiles" ALTER COLUMN "status" TYPE "public"."client-profiles_status_enum_old" USING "status"::"text"::"public"."client-profiles_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "client-profiles" ALTER COLUMN "status" SET DEFAULT 'active'`,
    );
    await queryRunner.query(`DROP TYPE "public"."client-profiles_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."client-profiles_status_enum_old" RENAME TO "client-profiles_status_enum"`,
    );
  }
}
