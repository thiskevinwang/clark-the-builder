"use client";

import { CheckCircle2Icon, ExternalLinkIcon, KeyRoundIcon, Loader2Icon } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PlatformApplicationTransferResponse } from "@/lib/api";
import { useClerkAppsStore } from "@/lib/storage/clerk-apps-store";

type ClaimStep = "initial" | "loading" | "success" | "error";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  appName: string;
}

export function ClaimAppModal({ open, onOpenChange, applicationId, appName }: Props) {
  const [step, setStep] = useState<ClaimStep>("initial");
  const [transferCode, setTransferCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { loadApps } = useClerkAppsStore();

  const handleClaimNow = useCallback(async () => {
    setStep("loading");
    setError(null);

    try {
      const response = await fetch(`/api/applications/${applicationId}/transfer`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create transfer");
      }

      const transfer: PlatformApplicationTransferResponse = await response.json();
      setTransferCode(transfer.code);
      // Reload apps to get updated transfer state from API
      await loadApps();
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setStep("error");
    }
  }, [applicationId, loadApps]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Reset state after modal closes
    setTimeout(() => {
      setStep("initial");
      setTransferCode(null);
      setError(null);
    }, 200);
  }, [onOpenChange]);

  const dashboardUrl = transferCode
    ? `https://dashboard.clerk.com/apps/transfer?code=${transferCode}`
    : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={step !== "loading"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRoundIcon className="size-5 text-primary" />
            Claim Your Clerk App
          </DialogTitle>
          <DialogDescription>
            {step === "initial" && (
              <>
                Transfer{" "}
                <span className="font-medium text-foreground">&ldquo;{appName}&rdquo;</span> to your
                own Clerk account.
              </>
            )}
            {step === "loading" && "Creating transfer request..."}
            {step === "success" && "Transfer request created successfully!"}
            {step === "error" && "Something went wrong"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {step === "initial" && (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Claiming this app will transfer it to your Clerk account. Once transferred, Clerk0
                will no longer have access to manage this app.
              </p>
              <p>Your app&apos;s configuration and data will be preserved.</p>
            </div>
          )}

          {step === "loading" && (
            <div className="flex items-center justify-center py-6">
              <Loader2Icon className="size-8 animate-spin text-primary" />
            </div>
          )}

          {step === "success" && dashboardUrl && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                <CheckCircle2Icon className="size-5 shrink-0 text-green-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Transfer code generated</p>
                  <p className="text-sm text-muted-foreground">
                    Visit the Clerk dashboard to complete the transfer and add this app to your
                    account.
                  </p>
                </div>
              </div>

              <Button asChild className="w-full" size="lg">
                <a href={dashboardUrl} target="_blank" rel="noopener noreferrer">
                  Open Clerk Dashboard
                  <ExternalLinkIcon className="size-4" />
                </a>
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                The transfer expires in 24 hours
              </p>
            </div>
          )}

          {step === "error" && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {step === "initial" && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              Maybe Later
            </Button>
            <Button onClick={handleClaimNow}>Claim Now</Button>
          </DialogFooter>
        )}

        {step === "error" && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={handleClaimNow}>Try Again</Button>
          </DialogFooter>
        )}

        {step === "success" && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Done
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
