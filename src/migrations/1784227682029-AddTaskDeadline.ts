import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskDeadline1784227682029 implements MigrationInterface {
    name = 'AddTaskDeadline1784227682029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "deadline" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "deadline"`);
    }

}
