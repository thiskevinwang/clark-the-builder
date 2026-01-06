import { platformCreateApplicationTransfer } from "@/lib/api";
import { createClient, createConfig } from "@/lib/api/client";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ applicationId: string }>;
}

export async function POST(_req: Request, { params }: Params) {
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
          "Content-Type": "application/json",
        },
      })
    );

    const response = await platformCreateApplicationTransfer({
      client,
      path: {
        applicationID: applicationId,
      },
      // @ts-expect-error - body is not used for this request,
      // we pass something other than `undefined` to bypass heyapi's
      // generated code that strips Content-Type header if body is `undefined`
      body: null,
    });

    if (response.error) {
      const errorMessage =
        response.error.errors?.[0]?.message ??
        "Unknown error creating transfer";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
