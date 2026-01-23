"use client";

import { CheckIcon, GiftIcon } from "lucide-react";
import { useState } from "react";

import type { DataPart } from "@/ai/messages/data-parts";

import { ClaimAppModal } from "@/components/modals/claim-app-modal";
import { Button } from "@/components/ui/button";
import { useClerkAppsStore } from "@/lib/storage/clerk-apps-store";

import { DataPartComponent } from "../data-part";

interface Props {
  message: DataPart["create-clerk-app"];
}

export function CreateClerkApp({ message }: Props) {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const { apps } = useClerkAppsStore();

  // Check if this app has already been transferred/claimed
  const app = message.applicationId
    ? apps.find((a) => a.applicationId === message.applicationId)
    : null;
  const isTransferred = app?.ownership === "transferred";

  return (
    <DataPartComponent
      title={"Create Clerk App"}
      defaultOpen
      loading={message.status == "loading"}
      error={message.error?.message || message.status == "error"}
    >
      <div className="flex items-center gap-3">
        <span>
          {message.status === "done" && `Clerk app created: "${message.name}"`}
          {message.status === "loading" && `Creating Clerk app "${message.name}"`}
          {message.status === "error" && `Failed to create Clerk app "${message.name}"`}
        </span>
        {message.status === "done" &&
          message.applicationId &&
          (isTransferred ? (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              <CheckIcon className="w-3 h-3" />
              Claimed
            </span>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => setClaimModalOpen(true)}
              className="ml-auto h-7 text-xs gap-1.5"
            >
              <GiftIcon className="w-3 h-3" />
              Claim
            </Button>
          ))}
      </div>

      {message.applicationId && (
        <ClaimAppModal
          open={claimModalOpen}
          onOpenChange={setClaimModalOpen}
          applicationId={message.applicationId}
          appName={message.name}
        />
      )}
    </DataPartComponent>
  );
}
