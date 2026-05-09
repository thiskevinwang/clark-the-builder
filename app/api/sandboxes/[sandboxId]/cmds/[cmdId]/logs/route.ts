import { NextResponse, type NextRequest } from "next/server";

import { getCurrentLocalUser } from "@/lib/auth";
import { getOwnedResourceByExternalId } from "@/lib/resource-ownership";

import { sandboxProvider } from "../../../../../../../lib/sandbox";

interface Params {
  sandboxId: string;
  cmdId: string;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<Params> }) {
  const currentUser = await getCurrentLocalUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logParams = await params;
  const ownedResource = await getOwnedResourceByExternalId(
    currentUser.id,
    "vercel_sandbox",
    logParams.sandboxId,
  );
  if (!ownedResource) {
    return NextResponse.json({ error: "Sandbox not found" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  const sandbox = await sandboxProvider.get(logParams);
  const command = await sandbox.getCommand(logParams.cmdId);

  return new NextResponse(
    new ReadableStream({
      async pull(controller) {
        for await (const logline of command.logs()) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                data: logline.data,
                stream: logline.stream,
                timestamp: Date.now(),
              }) + "\n",
            ),
          );
        }
        controller.close();
      },
    }),
    { headers: { "Content-Type": "application/x-ndjson" } },
  );
}
