import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1738680000000 implements MigrationInterface {
  name = "InitialSchema1738680000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(
      `CREATE TYPE "posts_visibility_enum" AS ENUM ('public', 'private')`
    );
    await queryRunner.query(
      `CREATE TYPE "likes_target_type_enum" AS ENUM ('post', 'comment')`
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "avatar_url" character varying(512),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`
    );

    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "author_id" uuid NOT NULL,
        "content" text,
        "image_url" character varying(512),
        "visibility" "posts_visibility_enum" NOT NULL DEFAULT 'public',
        "like_count" integer NOT NULL DEFAULT 0,
        "comment_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_posts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_posts_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_feed" ON "posts" ("created_at", "visibility")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_author_created" ON "posts" ("author_id", "created_at")`
    );

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "post_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "parent_id" uuid,
        "content" text NOT NULL,
        "like_count" integer NOT NULL DEFAULT 0,
        "reply_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_parent" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_post_created" ON "comments" ("post_id", "created_at")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_parent_created" ON "comments" ("parent_id", "created_at")`
    );

    await queryRunner.query(`
      CREATE TABLE "likes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "target_id" uuid NOT NULL,
        "target_type" "likes_target_type_enum" NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_likes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_likes_user_target" UNIQUE ("user_id", "target_id", "target_type"),
        CONSTRAINT "FK_likes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_likes_target" ON "likes" ("target_id", "target_type")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_likes_user" ON "likes" ("user_id")`
    );

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying(255) NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_refresh_tokens_token_hash" ON "refresh_tokens" ("token_hash")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_user_expires" ON "refresh_tokens" ("user_id", "expires_at")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "likes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "posts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "likes_target_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "posts_visibility_enum"`);
  }
}
