import { UIMessagePart } from "ai";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import type { DataPart } from "@/ai/messages/data-parts";
import type { ToolSet } from "@/ai/tools";

import {
  genConversationId,
  genMcpConnectionId,
  genMessageId,
  genUserId,
} from "@/lib/identifiers/generator";
import { genResourceId } from "@/lib/identifiers/generator";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(genUserId),
    externalUserId: text("external_user_id").notNull(),
    emailAddress: text("email_address"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex("uniq_users_external_user_id").on(t.externalUserId),
    index("idx_users_updated_at").on(t.updatedAt),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey().$defaultFn(genConversationId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("idx_conversations_user_id_updated_at").on(t.userId, t.updatedAt)],
);

export type ConversationRow = typeof conversations.$inferSelect;
export type NewConversationRow = typeof conversations.$inferInsert;

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey().$defaultFn(genMessageId),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role").$type<"system" | "user" | "assistant" | "developer" | "tool">(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    parts: jsonb("parts").$type<Array<UIMessagePart<DataPart, ToolSet>>>().notNull().default([]),
    parentId: text("parent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    // An optional unique external ID:
    // nulls are NOT considered equal, so multiple nulls are allowed.
    externalId: text("external_id").unique("uniq_messages_external_id", {
      nulls: "distinct",
    }),
  },
  (t) => [
    index("idx_messages_conversation_id_created_at").on(t.conversationId, t.createdAt),
    check(
      "chk_messages_role",
      sql`${t.role} IS NULL OR ${t.role} IN ('system', 'user', 'assistant', 'developer', 'tool')`,
    ),
  ],
);

export type MessageRow = typeof messages.$inferSelect;
export type NewMessageRow = typeof messages.$inferInsert;

export const mcpConnections = pgTable(
  "mcp_connections",
  {
    id: text("id").primaryKey().$defaultFn(genMcpConnectionId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    url: text("url").notNull(),
    auth: jsonb("auth").$type<Record<string, unknown> | null>().default(null),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex("uniq_mcp_connections_user_id_name").on(t.userId, t.name),
    index("idx_mcp_connections_user_id_updated_at").on(t.userId, t.updatedAt),
  ],
);

export type MCPConnectionRow = typeof mcpConnections.$inferSelect;
export type NewMCPConnectionRow = typeof mcpConnections.$inferInsert;

export const resources = pgTable(
  "resources",
  {
    id: text("id").primaryKey().$defaultFn(genResourceId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    externalId: text("external_id").notNull(),
    conversationId: text("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("idx_resources_user_id_type").on(t.userId, t.type),
    index("idx_resources_user_id_conversation_id").on(t.userId, t.conversationId),
    index("idx_resources_user_id_external_id").on(t.userId, t.externalId),
  ],
);

export type ResourceRow = typeof resources.$inferSelect;
export type NewResourceRow = typeof resources.$inferInsert;
