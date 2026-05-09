import type { UserJSON, UserWebhookEvent } from "@clerk/backend";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/database/db";
import { createUserRepository } from "@/lib/repositories/user-repository-impl";

function getPrimaryEmailAddress(user: UserJSON): string | null {
  if (!user.primary_email_address_id) {
    return null;
  }

  return (
    user.email_addresses.find((email) => email.id === user.primary_email_address_id)
      ?.email_address ?? null
  );
}

function toUserSyncInput(
  event: Extract<UserWebhookEvent, { type: "user.created" | "user.updated" }>,
) {
  return {
    externalUserId: event.data.id,
    emailAddress: getPrimaryEmailAddress(event.data),
    firstName: event.data.first_name,
    lastName: event.data.last_name,
    imageUrl: event.data.image_url,
  };
}

export async function POST(req: NextRequest) {
  try {
    const event = await verifyWebhook(req);
    const userRepository = createUserRepository(db);

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await userRepository.upsert(toUserSyncInput(event));
        break;
      case "user.deleted":
        if (!event.data.id) {
          return NextResponse.json(
            { error: "Missing user id in webhook payload" },
            { status: 400 },
          );
        }

        await userRepository.deleteByExternalUserId(event.data.id);
        break;
      default:
        break;
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error verifying Clerk webhook", error);
    return NextResponse.json({ error: "Error verifying webhook" }, { status: 400 });
  }
}
