import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectsAndTasks1781371955785 implements MigrationInterface {
  name = 'AddProjectsAndTasks1781371955785';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN IF EXISTS "client_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN IF EXISTS "budget"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_priority_enum" AS ENUM('low', 'medium', 'high')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "assignee_id" uuid`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "creator_id" uuid`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "description" text`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "projects" ADD "client_id" uuid`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "manager_id" uuid`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "title"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "title" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_855d484825b715c545349212c7f" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_f4cb489461bc751498a28852356" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_ca29f959102228649e714827478" FOREIGN KEY ("client_id") REFERENCES "client-profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_87bd52575ded2be008b89dd7b21" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_87bd52575ded2be008b89dd7b21"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_ca29f959102228649e714827478"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_f4cb489461bc751498a28852356"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_855d484825b715c545349212c7f"`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "title"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "title" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "manager_id"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "client_id"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "creator_id"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "assignee_id"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "priority"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "budget" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "client_name" character varying NOT NULL`,
    );
  }
}
