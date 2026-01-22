import { and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import z from "zod";

import { getServerAuth } from "@/lib/auth";
import { db } from "@/lib/database/db";
import { conversations } from "@/lib/database/schema";
import { createUserRepository } from "@/lib/repositories/user-repository-impl";

const BatchDeleteChatsBodySchema = z
  .object({
    chatIds: z.array(z.string().trim().min(1)).min(1).max(200),
  })
  .strict();

export async function POST(req: Request) {
  const auth = await getServerAuth();
  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await createUserRepository(db).ensureByExternalId(auth.userId);

  const body = await req.json().catch(() => null);
  const parsed = BatchDeleteChatsBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Deduplicate IDs for safety.
  const chatIds = Array.from(new Set(parsed.data.chatIds));

  const deleted = await db
    .delete(conversations)
    .where(and(eq(conversations.userId, user.id), inArray(conversations.id, chatIds)))
    .returning({ id: conversations.id });

  return NextResponse.json<POSTResponse>(
    {
      deletedIds: deleted.map((r) => r.id),
      deletedCount: deleted.length,
    },
    { status: 200 },
  );
}

export interface POSTResponse {
  deletedIds: string[];
  deletedCount: number;
}
