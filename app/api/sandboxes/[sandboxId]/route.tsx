import { NextRequest, NextResponse } from "next/server";

import { getCurrentLocalUser } from "@/lib/auth";
import { getOwnedResourceByExternalId } from "@/lib/resource-ownership";

import { isSandboxAPIError, sandboxProvider } from "../../../../lib/sandbox";

/**
 * We must change the SDK to add data to the instance and then
 * use it to retrieve the status of the Sandbox.
 */
export async function GET(
  _request: NextRequest,
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

  try {
    const sandbox = await sandboxProvider.get({ sandboxId });
    await sandbox.runCommand({
      cmd: "echo",
      args: ["Sandbox status check"],
    });
    return NextResponse.json({ status: "running" });
  } catch (error) {
    if (isSandboxAPIError(error) && error.json?.error?.code === "sandbox_stopped") {
      return NextResponse.json({ status: "stopped" });
    } else {
      throw error;
    }
  }
}
