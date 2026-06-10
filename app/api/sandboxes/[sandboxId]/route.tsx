import { NextRequest, NextResponse } from "next/server";

import { getCurrentLocalUser } from "@/lib/auth";
import { getOwnedResourceByExternalId } from "@/lib/resource-ownership";

import { sandboxProvider } from "../../../../lib/sandbox";

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

  const sandbox = await sandboxProvider.get({ sandboxId, resume: false });
  return NextResponse.json({ status: sandbox.status });
}

export async function POST(
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

  const sandbox = await sandboxProvider.get({ sandboxId, resume: true });
  return NextResponse.json({ status: sandbox.status });
}
