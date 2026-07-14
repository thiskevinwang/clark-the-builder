import { NextResponse, type NextRequest } from "next/server";

import { getCurrentLocalUser } from "@/lib/auth";
import { db } from "@/lib/database/db";
import type { Resource } from "@/lib/models/resource";
import { createConversationRepository } from "@/lib/repositories/conversation-repository";
import { createResourceRepository } from "@/lib/repositories/resource-repository";

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const currentUser = await getCurrentLocalUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  const conversation = await createConversationRepository(db).getById(currentUser.id, chatId);
  if (!conversation) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const resources = await createResourceRepository(db).listByConversationId(currentUser.id, chatId);

  return NextResponse.json<GETResponse>({ resources }, { status: 200 });
}

export type GETResponse = { resources: Resource[] };
