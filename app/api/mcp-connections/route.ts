import { NextResponse, type NextRequest } from "next/server";
import z from "zod";

import { db } from "@/lib/database/db";
import type { MCPConnection, MCPConnectionAuth } from "@/lib/models/mcp-connection";
import { createMCPConnectionRepository } from "@/lib/repositories/mcp-connection-repository-impl";

const HeadersSchema = z.record(z.string().min(1)).refine((value) => Object.keys(value).length > 0, {
  message: "Headers must not be empty",
});

const AuthSchema: z.ZodType<MCPConnectionAuth> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }).strict(),
  z.object({ type: z.literal("bearer"), bearer: z.string().min(1) }).strict(),
  z
    .object({
      type: z.literal("headers"),
      headers: HeadersSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("oauth"),
      oauth: z
        .object({
          clientId: z.string().min(1),
          clientSecret: z.string().min(1),
          tokenUrl: z.string().url(),
        })
        .strict(),
    })
    .strict(),
]) as z.ZodType<MCPConnectionAuth>;

const ListConnectionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  q: z.string().trim().min(1).max(200).optional(),
});

const CreateConnectionBodySchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    url: z.string().trim().url().max(2000),
    enabled: z.boolean().optional(),
    auth: AuthSchema.nullable().optional(),
  })
  .strict();

export async function GET(request: NextRequest) {
  const parsed = ListConnectionsQuerySchema.safeParse({
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
    offset: request.nextUrl.searchParams.get("offset") ?? undefined,
    q: request.nextUrl.searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  const connections = await createMCPConnectionRepository(db).listRecent(
    parsed.data.limit,
    parsed.data.offset,
    parsed.data.q,
  );

  return NextResponse.json<GETResponse>({ connections }, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CreateConnectionBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const connection = await createMCPConnectionRepository(db).create({
    name: parsed.data.name,
    url: parsed.data.url,
    ...(Object.prototype.hasOwnProperty.call(parsed.data, "auth")
      ? { auth: parsed.data.auth ?? null }
      : {}),
    ...(parsed.data.enabled !== undefined ? { enabled: parsed.data.enabled } : {}),
  });

  return NextResponse.json<POSTResponse>({ connection }, { status: 201 });
}

export interface GETResponse {
  connections: MCPConnection[];
}

export interface POSTResponse {
  connection: MCPConnection;
}
