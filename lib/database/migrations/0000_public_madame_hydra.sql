CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "external_user_id" text NOT NULL,
  "email_address" text,
  "first_name" text,
  "last_name" text,
  "image_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "title" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcp_connections" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "url" text NOT NULL,
  "auth" jsonb DEFAULT 'null'::jsonb,
  "enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
  "id" text PRIMARY KEY NOT NULL,
  "conversation_id" text NOT NULL,
  "role" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "parts" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "parent_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "external_id" text,
  CONSTRAINT "uniq_messages_external_id" UNIQUE("external_id"),
  CONSTRAINT "chk_messages_role" CHECK (
    "messages"."role" IS NULL
    OR "messages"."role" IN ('system', 'user', 'assistant', 'developer', 'tool')
  )
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resources" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "type" text NOT NULL,
  "external_id" text NOT NULL,
  "conversation_id" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversations"
  ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "mcp_connections"
  ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "resources"
  ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
DO $$
DECLARE legacy_user_id text;
BEGIN
  IF EXISTS (SELECT 1 FROM "conversations" WHERE "user_id" IS NULL)
    OR EXISTS (SELECT 1 FROM "mcp_connections" WHERE "user_id" IS NULL)
    OR EXISTS (SELECT 1 FROM "resources" WHERE "user_id" IS NULL) THEN
    INSERT INTO "users" (
      "id",
      "external_user_id",
      "first_name",
      "last_name",
      "created_at",
      "updated_at"
    )
    VALUES (
      'usr_legacy_local_user',
      'legacy-local-user',
      'Legacy',
      'User',
      now(),
      now()
    )
    ON CONFLICT ("external_user_id") DO UPDATE
    SET "updated_at" = now()
    RETURNING "id" INTO legacy_user_id;

    UPDATE "conversations"
    SET "user_id" = legacy_user_id
    WHERE "user_id" IS NULL;

    UPDATE "mcp_connections"
    SET "user_id" = legacy_user_id
    WHERE "user_id" IS NULL;

    UPDATE "resources"
    SET "user_id" = legacy_user_id
    WHERE "user_id" IS NULL;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "conversations"
  ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "mcp_connections"
  ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "resources"
  ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "mcp_connections"
  DROP CONSTRAINT IF EXISTS "uniq_mcp_connections_name";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_conversations_updated_at";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_mcp_connections_updated_at";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_resources_type";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_resources_conversation_id";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_resources_external_id";
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "conversations"
    ADD CONSTRAINT "conversations_user_id_users_id_fk"
    FOREIGN KEY ("user_id")
    REFERENCES "public"."users"("id")
    ON DELETE cascade
    ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "mcp_connections"
    ADD CONSTRAINT "mcp_connections_user_id_users_id_fk"
    FOREIGN KEY ("user_id")
    REFERENCES "public"."users"("id")
    ON DELETE cascade
    ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "messages"
    ADD CONSTRAINT "messages_conversation_id_conversations_id_fk"
    FOREIGN KEY ("conversation_id")
    REFERENCES "public"."conversations"("id")
    ON DELETE cascade
    ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "resources"
    ADD CONSTRAINT "resources_user_id_users_id_fk"
    FOREIGN KEY ("user_id")
    REFERENCES "public"."users"("id")
    ON DELETE cascade
    ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "resources"
    ADD CONSTRAINT "resources_conversation_id_conversations_id_fk"
    FOREIGN KEY ("conversation_id")
    REFERENCES "public"."conversations"("id")
    ON DELETE set null
    ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_users_external_user_id"
  ON "users" USING btree ("external_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_updated_at"
  ON "users" USING btree ("updated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_conversations_user_id_updated_at"
  ON "conversations" USING btree ("user_id", "updated_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_mcp_connections_user_id_name"
  ON "mcp_connections" USING btree ("user_id", "name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mcp_connections_user_id_updated_at"
  ON "mcp_connections" USING btree ("user_id", "updated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id_created_at"
  ON "messages" USING btree ("conversation_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_resources_user_id_type"
  ON "resources" USING btree ("user_id", "type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_resources_user_id_conversation_id"
  ON "resources" USING btree ("user_id", "conversation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_resources_user_id_external_id"
  ON "resources" USING btree ("user_id", "external_id");
