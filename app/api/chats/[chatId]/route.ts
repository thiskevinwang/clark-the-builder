import { NextResponse } from "next/server";
import z from "zod";

import { getCurrentLocalUser } from "@/lib/auth";
import { db } from "@/lib/database/db";
import { Conversation } from "@/lib/models/conversation";
import { createConversationRepository } from "@/lib/repositories/conversation-repository";

const ParamsSchema = z.object({
  chatId: z.string().nonempty(),
});

const UpdateChatBodySchema = z
  .object({
    title: z.string().min(1).max(500).nullable().optional(),
  })
  .strict();

export async function GET(_req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const currentUser = await getCurrentLocalUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  const parsedParams = ParamsSchema.safeParse({ chatId });
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
  }

  const chat = await createConversationRepository(db).getById(
    currentUser.id,
    parsedParams.data.chatId,
  );
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return NextResponse.json<GETResponse>({ chat }, { status: 200 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const currentUser = await getCurrentLocalUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  const parsedParams = ParamsSchema.safeParse({ chatId });
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
  }

  const conversationRepo = createConversationRepository(db);

  const body = await req.json().catch(() => null);
  const parsedBody = UpdateChatBodySchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const chat = await conversationRepo.update(
    currentUser.id,
    parsedParams.data.chatId,
    parsedBody.data,
  );

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return NextResponse.json<PATCHResponse>({ chat }, { status: 200 });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const currentUser = await getCurrentLocalUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  const parsedParams = ParamsSchema.safeParse({ chatId });
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
  }

  const conversationRepo = createConversationRepository(db);
  const deleted = await conversationRepo.delete(currentUser.id, parsedParams.data.chatId);
  if (!deleted) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return NextResponse.json<DELETEResponse>({ deleted: true }, { status: 200 });
}

export interface GETResponse {
  chat: Conversation;
}
export interface PATCHResponse {
  chat: Conversation;
}
export interface DELETEResponse {
  deleted: boolean;
}
