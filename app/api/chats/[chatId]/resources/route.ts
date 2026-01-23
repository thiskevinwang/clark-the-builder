import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/database/db";
import type { Resource } from "@/lib/models/resource";
import { createResourceRepository } from "@/lib/repositories/resource-repository-impl";

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { chatId } = await params;

  const resources = await createResourceRepository(db).listByConversationId(chatId);

  return NextResponse.json<GETResponse>({ resources }, { status: 200 });
}

export type GETResponse = { resources: Resource[] };
