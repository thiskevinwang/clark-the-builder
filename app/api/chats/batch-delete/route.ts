import { NextResponse } from "next/server";
import z from "zod";

import { getCurrentLocalUser } from "@/lib/auth";
import { db } from "@/lib/database/db";
import { createConversationRepository } from "@/lib/repositories/conversation-repository-impl";

const BatchDeleteChatsBodySchema = z
  .object({
    chatIds: z.array(z.string().trim().min(1)).min(1).max(200),
  })
  .strict();

export async function POST(req: Request) {
  const currentUser = await getCurrentLocalUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = BatchDeleteChatsBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Deduplicate IDs for safety.
  const chatIds = Array.from(new Set(parsed.data.chatIds));

  const deletedIds = await createConversationRepository(db).deleteMany(currentUser.id, chatIds);

  return NextResponse.json<POSTResponse>(
    {
      deletedIds,
      deletedCount: deletedIds.length,
    },
    { status: 200 },
  );
}

export interface POSTResponse {
  deletedIds: string[];
  deletedCount: number;
}
