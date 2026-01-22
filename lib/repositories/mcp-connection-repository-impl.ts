import { and, desc, eq, ilike, or } from "drizzle-orm";

import type { DB } from "@/lib/database/db";
import { MCPConnectionRow, mcpConnections } from "@/lib/database/schema";

import type {
  CreateMCPConnectionInput,
  MCPConnection,
  UpdateMCPConnectionInput,
} from "../models/mcp-connection";
import type { MCPConnectionRepository } from "./mcp-connection-repository";

const rowToModel = (row: MCPConnectionRow): MCPConnection => ({
  id: row.id,
  userId: row.userId ?? null,
  name: row.name,
  url: row.url,
  auth: row.auth as MCPConnection["auth"],
  enabled: row.enabled,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const buildInsertValues = (
  input: CreateMCPConnectionInput,
): typeof mcpConnections.$inferInsert => ({
  ...(input.id ? { id: input.id } : {}),
  ...(input.userId ? { userId: input.userId } : {}),
  name: input.name,
  url: input.url,
  ...(input.auth !== undefined ? { auth: input.auth as MCPConnectionRow["auth"] } : {}),
  ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
});

export const createMCPConnectionRepository = (db: DB): MCPConnectionRepository => ({
  async getById(id, userId) {
    const where = userId
      ? and(eq(mcpConnections.id, id), eq(mcpConnections.userId, userId))
      : eq(mcpConnections.id, id);
    const rows = await db.select().from(mcpConnections).where(where).limit(1);
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async listRecent(limit, offset = 0, query, userId) {
    const q = query?.trim();
    const whereQuery = q
      ? or(
          ilike(mcpConnections.name, `%${q}%`),
          ilike(mcpConnections.url, `%${q}%`),
          ilike(mcpConnections.id, `%${q}%`),
        )
      : undefined;
    const whereUser = userId ? eq(mcpConnections.userId, userId) : undefined;
    const where = whereQuery && whereUser ? and(whereQuery, whereUser) : (whereQuery ?? whereUser);

    const rows = await db
      .select()
      .from(mcpConnections)
      .where(where)
      .orderBy(desc(mcpConnections.updatedAt))
      .limit(limit)
      .offset(offset);

    return rows.map(rowToModel);
  },
  async create(input) {
    const rows = await db.insert(mcpConnections).values(buildInsertValues(input)).returning();
    return rowToModel(rows[0]);
  },
  async update(id: string, input: UpdateMCPConnectionInput, userId) {
    const set: Partial<MCPConnectionRow> = {};
    if (input.name !== undefined) set.name = input.name;
    if (input.url !== undefined) set.url = input.url;
    if (Object.prototype.hasOwnProperty.call(input, "auth")) {
      set.auth = (input.auth ?? null) as MCPConnectionRow["auth"];
    }
    if (input.enabled !== undefined) set.enabled = input.enabled;

    if (Object.keys(set).length === 0) {
      const where = userId
        ? and(eq(mcpConnections.id, id), eq(mcpConnections.userId, userId))
        : eq(mcpConnections.id, id);
      const rows = await db.select().from(mcpConnections).where(where).limit(1);
      return rows[0] ? rowToModel(rows[0]) : null;
    }

    const rows = await db
      .update(mcpConnections)
      .set(set)
      .where(
        userId
          ? and(eq(mcpConnections.id, id), eq(mcpConnections.userId, userId))
          : eq(mcpConnections.id, id),
      )
      .returning();
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async delete(id: string, userId) {
    const rows = await db
      .delete(mcpConnections)
      .where(
        userId
          ? and(eq(mcpConnections.id, id), eq(mcpConnections.userId, userId))
          : eq(mcpConnections.id, id),
      )
      .returning({ id: mcpConnections.id });
    return rows.length > 0;
  },
});
