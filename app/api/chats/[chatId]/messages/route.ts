import { NextResponse } from "next/server";
import z from "zod";

import { db } from "@/lib/database/db";
import { CreateMessageInput, Message } from "@/lib/models/message";
import { createConversationRepository } from "@/lib/repositories/conversation-repository-impl";
import { createMessageRepository } from "@/lib/repositories/message-repository-impl";

const ParamsSchema = z.object({
  chatId: z.string().nonempty(),
});

export interface CreateMessageBody {
  message: Omit<CreateMessageInput, "id">;
}

export async function GET(_req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const parsedParams = ParamsSchema.safeParse({ chatId });
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
  }

  const conversationRepo = createConversationRepository(db);
  const conversation = await conversationRepo.getById(parsedParams.data.chatId);
  if (!conversation) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const messageRepo = createMessageRepository(db);
  const rows = await messageRepo.listByConversationId(conversation.id);

  return NextResponse.json<GETResponse>({ messages: rows }, { status: 200 });
}

export async function POST(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const conversationRepo = createConversationRepository(db);
  const conversation = await conversationRepo.getById(chatId);
  if (!conversation) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as CreateMessageBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messageRepo = createMessageRepository(db);
  const message = await messageRepo.create({
    conversationId: chatId,
    role: body.message.role,
    parts: body.message.parts,
    metadata: body.message.metadata,
  });
  return NextResponse.json<POSTResponse>({ message }, { status: 201 });
}

export interface GETResponse {
  messages: Message[];
}

export interface POSTResponse {
  message: Message;
}
