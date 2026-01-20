import { NextResponse } from "next/server";
import z from "zod";

import { db } from "@/lib/database/db";
import type {
  MCPConnection,
  MCPConnectionAuth,
  UpdateMCPConnectionInput,
} from "@/lib/models/mcp-connection";
import { createMCPConnectionRepository } from "@/lib/repositories/mcp-connection-repository-impl";

const ParamsSchema = z.object({
  connectionId: z.string().nonempty(),
});

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

const UpdateConnectionBodySchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    url: z.string().trim().url().max(2000).optional(),
    enabled: z.boolean().optional(),
    auth: AuthSchema.nullable().optional(),
  })
  .strict();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ connectionId: string }> },
) {
  const { connectionId } = await params;
  const parsedParams = ParamsSchema.safeParse({ connectionId });
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid connectionId" }, { status: 400 });
  }

  const connection = await createMCPConnectionRepository(db).getById(
    parsedParams.data.connectionId,
  );
  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  return NextResponse.json<GETResponse>({ connection }, { status: 200 });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ connectionId: string }> },
) {
  const { connectionId } = await params;
  const parsedParams = ParamsSchema.safeParse({ connectionId });
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid connectionId" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsedBody = UpdateConnectionBodySchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const input: UpdateMCPConnectionInput = {};
  if (parsedBody.data.name !== undefined) input.name = parsedBody.data.name;
  if (parsedBody.data.url !== undefined) input.url = parsedBody.data.url;
  if (parsedBody.data.enabled !== undefined) input.enabled = parsedBody.data.enabled;
  if (Object.prototype.hasOwnProperty.call(parsedBody.data, "auth")) {
    input.auth = parsedBody.data.auth ?? null;
  }

  const connection = await createMCPConnectionRepository(db).update(
    parsedParams.data.connectionId,
    input,
  );

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  return NextResponse.json<PATCHResponse>({ connection }, { status: 200 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ connectionId: string }> },
) {
  const { connectionId } = await params;
  const parsedParams = ParamsSchema.safeParse({ connectionId });
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid connectionId" }, { status: 400 });
  }

  const deleted = await createMCPConnectionRepository(db).delete(parsedParams.data.connectionId);
  if (!deleted) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  return NextResponse.json<DELETEResponse>({ deleted: true }, { status: 200 });
}

export interface GETResponse {
  connection: MCPConnection;
}
export interface PATCHResponse {
  connection: MCPConnection;
}
export interface DELETEResponse {
  deleted: boolean;
}
