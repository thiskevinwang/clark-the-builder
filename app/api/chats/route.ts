import { NextResponse, type NextRequest } from "next/server";
import z from "zod";

import { db } from "@/lib/database/db";
import { Conversation } from "@/lib/models/conversation";
import { createConversationRepository } from "@/lib/repositories/conversation-repository-impl";

const ListChatsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  q: z.string().trim().min(1).max(200).optional(),
});

const CreateChatBodySchema = z.object({
  title: z.string().min(1).max(500).nullable().optional(),
});

export async function GET(request: NextRequest) {
  const parsed = ListChatsQuerySchema.safeParse({
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
    offset: request.nextUrl.searchParams.get("offset") ?? undefined,
    q: request.nextUrl.searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  const conversations = await createConversationRepository(db).listRecent(
    parsed.data.limit,
    parsed.data.offset,
    parsed.data.q,
  );

  return NextResponse.json<GETResponse>({ chats: conversations }, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CreateChatBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const chat = await createConversationRepository(db).create({
    title: parsed.data.title ?? null,
  });

  return NextResponse.json<POSTResponse>({ chat }, { status: 201 });
}

export interface GETResponse {
  chats: Conversation[];
}

export interface POSTResponse {
  chat: Conversation;
}
