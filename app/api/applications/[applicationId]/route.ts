import { platformDeleteApplication } from "@/lib/api";
import { createClient, createConfig } from "@/lib/api/client";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await params;

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

    return NextResponse.json({ success: true, deleted: response.data });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

