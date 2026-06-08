import { MigrationInterface, QueryRunner } from "typeorm";

export class PerformanceIndexes1738690000000 implements MigrationInterface {
  name = "PerformanceIndexes1738690000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_posts_public_feed"
      ON "posts" ("created_at" DESC, "id" DESC)
      WHERE visibility = 'public'
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_comments_post_toplevel"
      ON "comments" ("post_id", "created_at" ASC)
      WHERE parent_id IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_likes_batch"
      ON "likes" ("user_id", "target_type", "target_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_likes_batch"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comments_post_toplevel"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_public_feed"`);
  }
}
