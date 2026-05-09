import { NextResponse, type NextRequest } from "next/server";
import z from "zod";

import { getCurrentLocalUser } from "@/lib/auth";
import { getOwnedResourceByExternalId } from "@/lib/resource-ownership";

import { sandboxProvider } from "../../../../../lib/sandbox";

const FileParamsSchema = z.object({
  sandboxId: z.string(),
  path: z.string(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sandboxId: string }> },
) {
  const currentUser = await getCurrentLocalUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sandboxId } = await params;
  const ownedResource = await getOwnedResourceByExternalId(
    currentUser.id,
    "vercel_sandbox",
    sandboxId,
  );
  if (!ownedResource) {
    return NextResponse.json({ error: "Sandbox not found" }, { status: 404 });
  }

  const fileParams = FileParamsSchema.safeParse({
    path: request.nextUrl.searchParams.get("path"),
    sandboxId,
  });

  if (fileParams.success === false) {
    return NextResponse.json(
      { error: "Invalid parameters. You must pass a `path` as query" },
      { status: 400 },
    );
  }

  const sandbox = await sandboxProvider.get(fileParams.data);
  const stream = await sandbox.readFile(fileParams.data);
  if (!stream) {
    return NextResponse.json({ error: "File not found in the Sandbox" }, { status: 404 });
  }

  return new NextResponse(
    new ReadableStream({
      async pull(controller) {
        for await (const chunk of stream) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    }),
  );
}
