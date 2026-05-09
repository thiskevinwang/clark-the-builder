import { NextResponse } from "next/server";

import { platformDeleteApplication } from "@/lib/api";
import { getCurrentLocalUser } from "@/lib/auth";
import { createClient, createConfig } from "@/lib/api/client";
import { createResourceRepository } from "@/lib/repositories/resource-repository-impl";
import { getOwnedResourceByExternalId } from "@/lib/resource-ownership";
import { db } from "@/lib/database/db";

interface Params {
  params: Promise<{ applicationId: string }>;
}

const CLERK_APPLICATION_RESOURCE_TYPE = "clerk_application";

export async function DELETE(_req: Request, { params }: Params) {
  const currentUser = await getCurrentLocalUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;
  const ownedResource = await getOwnedResourceByExternalId(
    currentUser.id,
    CLERK_APPLICATION_RESOURCE_TYPE,
    applicationId,
  );
  if (!ownedResource) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const clerkPlatformToken = process.env.CLERK_PLATFORM_ACCESS_TOKEN;

  if (!clerkPlatformToken) {
    return NextResponse.json(
      { error: "CLERK_PLATFORM_ACCESS_TOKEN environment variable is not set" },
      { status: 500 },
    );
  }

  try {
    const client = createClient(
      createConfig({
        baseUrl: "https://api.clerk.com/v1",
        headers: {
          Authorization: `Bearer ${clerkPlatformToken}`,
        },
      }),
    );

    const response = await platformDeleteApplication({
      client,
      path: {
        applicationID: applicationId,
      },
    });

    if (response.error) {
      const errorMessage =
        response.error.errors?.[0]?.message ?? "Unknown error deleting application";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    await createResourceRepository(db).delete(currentUser.id, ownedResource.id);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
