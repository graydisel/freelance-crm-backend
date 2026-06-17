import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAtClient1781543901314 implements MigrationInterface {
    name = 'AddCreatedAtClient1781543901314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiles" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiles" DROP COLUMN "created_at"`);
    }

}
