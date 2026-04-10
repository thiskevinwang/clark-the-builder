import { NextResponse, type NextRequest } from "next/server";

import { getCurrentLocalUser } from "@/lib/auth";
import { getOwnedResourceByExternalId } from "@/lib/resource-ownership";

import { sandboxProvider } from "../../../../../../lib/sandbox";

interface Params {
  sandboxId: string;
  cmdId: string;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<Params> }) {
  const currentUser = await getCurrentLocalUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cmdParams = await params;
  const ownedResource = await getOwnedResourceByExternalId(
    currentUser.id,
    "vercel_sandbox",
    cmdParams.sandboxId,
  );
  if (!ownedResource) {
    return NextResponse.json({ error: "Sandbox not found" }, { status: 404 });
  }

  const sandbox = await sandboxProvider.get(cmdParams);
  const command = await sandbox.getCommand(cmdParams.cmdId);

  /**
   * The wait can get to fail when the Sandbox is stopped but the command
   * was still running. In such case we return empty for finish data.
   */
  const done = await command.wait().catch(() => null);
  return NextResponse.json({
    sandboxId: sandbox.sandboxId,
    cmdId: command.cmdId,
    startedAt: command.startedAt,
    exitCode: done?.exitCode,
  });
}
