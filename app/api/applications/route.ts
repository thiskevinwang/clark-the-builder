import { platformListApplications } from "@/lib/api";
import { createClient, createConfig } from "@/lib/api/client";
import { NextResponse } from "next/server";

export async function GET() {
  const clerkPlatformToken = process.env.CLERK_PLATFORM_ACCESS_TOKEN;

  if (!clerkPlatformToken) {
    return NextResponse.json(
      { error: "CLERK_PLATFORM_ACCESS_TOKEN environment variable is not set" },
      { status: 500 }
    );
  }

  try {
    const client = createClient(
      createConfig({
        baseUrl: "https://api.clerk.com/v1",
        headers: {
          Authorization: `Bearer ${clerkPlatformToken}`,
        },
      })
    );

    const response = await platformListApplications({
      client,
    });

    if (response.error) {
      const errorMessage =
        response.error.errors?.[0]?.message ?? "Unknown error listing applications";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Map the response to include application IDs and publishable keys
    const applications = response.data.map((app) => {
      const devInstance = app.instances.find(
        (i) => i.environment_type === "development"
      );
      return {
        applicationId: app.application_id,
        publishableKey: devInstance?.publishable_key,
      };
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error listing applications:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

