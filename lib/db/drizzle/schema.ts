// bunx drizzle-kit generate --name=init
// bunx drizzle-kit push

import { sql } from "drizzle-orm";
import { check, pgTable } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", (t) => ({
  id: t
    .uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  clerk_user_id: t.varchar().unique(),
  clerk_email: t.varchar().unique(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp().notNull().defaultNow(),
}));

export const chatsTable = pgTable("chats", (t) => ({
  id: t
    .uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  userId: t.uuid().references(() => usersTable.id),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp().notNull().defaultNow(),
}));

export const messagesTable = pgTable(
  "messages",
  (t) => ({
    id: t
      .uuid()
      .primaryKey()
      .default(sql`uuidv7()`),
    chatId: t
      .uuid()
      .notNull()
      .references(() => chatsTable.id),
    content: t.text().notNull(),
    role: t.varchar().notNull(),
    createdAt: t.timestamp().notNull().defaultNow(),
    updatedAt: t.timestamp().notNull().defaultNow(),
  }),
  () => {
    return [check("role", sql`role in ('user', 'assistant')`)];
  }
);

// a reference to Clerk's applications
export const applicationsTable = pgTable("ext_clerk_applications", (t) => ({
  id: t
    .uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  clerk_application_id: t.varchar().unique(),
  clerk_application_publishable_key: t.varchar().unique(),
  clerk_application_secret_key: t.varchar().unique(),
  clerk_application_transfer_id: t.varchar().unique(),
  name: t.varchar().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp().notNull().defaultNow(),
}));

// a reference to Vercel's sandboxes
export const sandboxTable = pgTable("ext_vercel_sandboxes", (t) => ({
  id: t
    .uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  vercel_sandbox_id: t.varchar().unique(),
  vercel_sandbox_url: t.varchar().unique(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp().notNull().defaultNow(),
}));
