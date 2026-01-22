import { NextResponse, type NextRequest } from "next/server";
import z from "zod";

import { getServerAuth } from "@/lib/auth";
import { db } from "@/lib/database/db";
import { Conversation, ConversationWithMessageCount } from "@/lib/models/conversation";
import { createConversationRepository } from "@/lib/repositories/conversation-repository-impl";
import { createUserRepository } from "@/lib/repositories/user-repository-impl";

const ListChatsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  q: z.string().trim().min(1).max(200).optional(),
});

const CreateChatBodySchema = z.object({
  title: z.string().min(1).max(500).nullable().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await getServerAuth();
  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await createUserRepository(db).ensureByExternalId(auth.userId);

  const parsed = ListChatsQuerySchema.safeParse({
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
    offset: request.nextUrl.searchParams.get("offset") ?? undefined,
    q: request.nextUrl.searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  const conversations = await createConversationRepository(db).listRecentWithMessageCount(
    parsed.data.limit,
    parsed.data.offset,
    parsed.data.q,
    user.id,
  );

  return NextResponse.json<GETResponse>({ chats: conversations }, { status: 200 });
}

export async function POST(req: Request) {
  const auth = await getServerAuth();
  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await createUserRepository(db).ensureByExternalId(auth.userId);

  const body = await req.json().catch(() => null);
  const parsed = CreateChatBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const chat = await createConversationRepository(db).create({
    userId: user.id,
    title: parsed.data.title ?? null,
  });

  return NextResponse.json<POSTResponse>({ chat }, { status: 201 });
}

export interface GETResponse {
  chats: ConversationWithMessageCount[];
}

export interface POSTResponse {
  chat: Conversation;
}
