import { NextResponse } from "next/server";

import type { PlatformApplicationResponse, PlatformApplicationTransferResponse } from "@/lib/api";
import { platformListApplicationTransfers, platformListApplications } from "@/lib/api";
import { createClient, createConfig } from "@/lib/api/client";

export interface ApplicationWithTransfers extends PlatformApplicationResponse {
  transfers?: PlatformApplicationTransferResponse[];
}

export interface ApplicationsResponse {
  applications: ApplicationWithTransfers[];
}

export async function GET() {
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

    const applications = applicationsResponse.data ?? [];

    // Build a map of application_id -> transfers for efficient lookup
    const transfersByAppId = new Map<string, PlatformApplicationTransferResponse[]>();

    if (transfersResponse.data) {
      for (const transfer of transfersResponse.data.data) {
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
