CREATE TABLE "ext_clerk_applications" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"clerk_application_id" varchar,
	"clerk_application_publishable_key" varchar,
	"clerk_application_secret_key" varchar,
	"clerk_application_transfer_id" varchar,
	"name" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ext_clerk_applications_clerk_application_id_unique" UNIQUE("clerk_application_id"),
	CONSTRAINT "ext_clerk_applications_clerk_application_publishable_key_unique" UNIQUE("clerk_application_publishable_key"),
	CONSTRAINT "ext_clerk_applications_clerk_application_secret_key_unique" UNIQUE("clerk_application_secret_key"),
	CONSTRAINT "ext_clerk_applications_clerk_application_transfer_id_unique" UNIQUE("clerk_application_transfer_id")
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"userId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"chatId" uuid NOT NULL,
	"content" text NOT NULL,
	"role" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role" CHECK (role in ('user', 'assistant'))
);
--> statement-breakpoint
CREATE TABLE "ext_vercel_sandboxes" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"vercel_sandbox_id" varchar,
	"vercel_sandbox_url" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ext_vercel_sandboxes_vercel_sandbox_id_unique" UNIQUE("vercel_sandbox_id"),
	CONSTRAINT "ext_vercel_sandboxes_vercel_sandbox_url_unique" UNIQUE("vercel_sandbox_url")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"clerk_user_id" varchar,
	"clerk_email" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_clerk_email_unique" UNIQUE("clerk_email")
);
--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;