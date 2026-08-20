import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientStatus1781521153442 implements MigrationInterface {
  name = 'AddClientStatus1781521153442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."client-profiles_status_enum" AS ENUM('active', 'inactive', 'lead')`,
    );
    await queryRunner.query(
      `ALTER TABLE "client-profiles" ADD "status" "public"."client-profiles_status_enum" NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."tasks_status_enum" ADD VALUE 'review'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_status_enum_old" AS ENUM('todo', 'in-progress', 'done')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "status" TYPE "public"."tasks_status_enum_old" USING "status"::"text"::"public"."tasks_status_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."tasks_status_enum_old" RENAME TO "tasks_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "client-profiles" DROP COLUMN "status"`,
    );
    await queryRunner.query(`DROP TYPE "public"."client-profiles_status_enum"`);
  }
}
