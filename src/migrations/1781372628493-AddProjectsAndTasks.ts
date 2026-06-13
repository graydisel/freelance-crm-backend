import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProjectsAndTasks1781372628493 implements MigrationInterface {
    name = 'AddProjectsAndTasks1781372628493'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."projects_status_enum" AS ENUM('planning', 'active', 'review', 'completed', 'paused')`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "status" "public"."projects_status_enum" NOT NULL DEFAULT 'planning'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
    }

}
