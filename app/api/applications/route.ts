import { NextResponse } from "next/server";

import type { PlatformApplicationResponse, PlatformApplicationTransferResponse } from "@/lib/api";
import { platformListApplicationTransfers, platformListApplications } from "@/lib/api";
import { createClient, createConfig } from "@/lib/api/client";
import { getCurrentLocalUser } from "@/lib/auth";
import { listOwnedExternalIdsByType } from "@/lib/resource-ownership";

export interface ApplicationWithTransfers extends PlatformApplicationResponse {
  transfers?: PlatformApplicationTransferResponse[];
}

export interface ApplicationsResponse {
  applications: ApplicationWithTransfers[];
}

const CLERK_APPLICATION_RESOURCE_TYPE = "clerk_application";

export async function GET() {
  const currentUser = await getCurrentLocalUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownedApplicationIds = await listOwnedExternalIdsByType(
    currentUser.id,
    CLERK_APPLICATION_RESOURCE_TYPE,
  );
  if (ownedApplicationIds.size === 0) {
    return NextResponse.json({ applications: [] satisfies ApplicationWithTransfers[] });
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

    // Fetch applications and transfers in parallel
    const [applicationsResponse, transfersResponse] = await Promise.all([
      platformListApplications({
        client,
        query: {
          include_secret_keys: true,
        },
      }),
      platformListApplicationTransfers({
        client,
        query: {
          limit: 500, // Fetch up to 500 transfers
          status: ["pending", "completed"],
        },
      }),
    ]);

    if (applicationsResponse.error) {
      const errorMessage =
        applicationsResponse.error.errors?.[0]?.message ?? "Unknown error listing applications";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const applications = (applicationsResponse.data ?? []).filter((app) =>
      ownedApplicationIds.has(app.application_id),
    );

    // Build a map of application_id -> transfers for efficient lookup
    const transfersByAppId = new Map<string, PlatformApplicationTransferResponse[]>();

    if (transfersResponse.data) {
      for (const transfer of transfersResponse.data.data) {
        if (!ownedApplicationIds.has(transfer.application_id)) {
          continue;
        }
        const existing = transfersByAppId.get(transfer.application_id) ?? [];
        existing.push(transfer);
        transfersByAppId.set(transfer.application_id, existing);
      }
    }

    // Merge transfers into applications
    const applicationsWithTransfers: ApplicationWithTransfers[] = applications.map((app) => ({
      ...app,
      transfers: transfersByAppId.get(app.application_id),
    }));

    return NextResponse.json({
      applications: applicationsWithTransfers,
    } satisfies ApplicationsResponse);
  } catch (error) {
    console.error("Error listing applications:", error);
    return NextResponse.json({ error: "Failed to list applications" }, { status: 500 });
  }
}
