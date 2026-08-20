import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupplementedClientProfiles1781782359799 implements MigrationInterface {
  name = 'SupplementedClientProfiles1781782359799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "client-profiles" ADD "contact_person" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "client-profiles" ADD "contact_email" character varying(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "client-profiles" DROP COLUMN "contact_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "client-profiles" DROP COLUMN "contact_person"`,
    );
  }
}
