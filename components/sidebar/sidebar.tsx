"use client";

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  KeyIcon,
  LoaderIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClerkAppsInit, useClerkAppsStore } from "@/lib/storage/clerk-apps-store";
import type { ClerkAppData, ClerkAppOwnership } from "@/lib/storage/types";
import { cn } from "@/lib/utils";

import { useSidebar } from "./sidebar-state";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isOpen, close } = useSidebar();
  const { apps, isLoaded, isLoading, removeApp } = useClerkAppsStore();

  // Initialize the store on mount
  useClerkAppsInit();

  // Separate apps by ownership
  const ownedApps = apps.filter((app) => app.ownership === "owned");
  const transferredApps = apps.filter((app) => app.ownership === "transferred");

  const hasAnyApps = apps.length > 0;

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-border bg-card transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-3">
          <h2 className="text-sm font-semibold text-foreground">Apps</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={close}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Apps List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-2">
            {isLoading && !isLoaded ? (
              <div className="flex items-center justify-center gap-2 px-2 py-4 text-sm text-muted-foreground">
                <LoaderIcon className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : !hasAnyApps ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">No apps yet</div>
            ) : (
              <div className="space-y-4">
                {/* Owned apps */}
                {ownedApps.length > 0 && (
                  <AppSection title="Your Apps" apps={ownedApps} onRemove={removeApp} />
                )}

                {/* Transferred apps */}
                {transferredApps.length > 0 && (
                  <AppSection
                    title="Transferred"
                    description="Claimed by another account"
                    apps={transferredApps}
                    onRemove={removeApp}
                  />
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer - New App hint */}
        <div className="shrink-0 border-t border-border p-3">
          <p className="text-xs text-muted-foreground">
            Ask the assistant to create a new Clerk app
          </p>
        </div>
      </div>
    </>
  );
}

interface AppSectionProps {
  title: string;
  description?: string;
  apps: ClerkAppData[];
  onRemove: (applicationId: string) => Promise<void>;
}

function AppSection({ title, description, apps, onRemove }: AppSectionProps) {
  return (
    <div>
      <div className="px-2 mb-1">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground/70">{description}</p>}
      </div>
      <div className="space-y-1">
        {apps.map((app) => (
          <AppItem key={app.applicationId} app={app} onRemove={() => onRemove(app.applicationId)} />
        ))}
      </div>
    </div>
  );
}

interface AppItemProps {
  app: ClerkAppData;
  onRemove: () => Promise<void>;
}

function AppItem({ app, onRemove }: AppItemProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { icon: StatusIcon } = getOwnershipIcon(app.ownership);
  const hasPendingTransfer = app.transfer?.status === "pending";

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await onRemove();
      setDeleteDialogOpen(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete app");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!isDeleting) {
      setDeleteDialogOpen(open);
      if (!open) {
        setDeleteError(null);
      }
    }
  };

  return (
    <>
      <div
        className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent"
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            app.ownership === "transferred"
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary",
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-1">
            <p
              className={cn(
                "truncate font-medium",
                app.ownership === "transferred" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {app.name}
            </p>
            {hasPendingTransfer && (
              <span className="shrink-0 rounded bg-yellow-500/10 px-1 py-0.5 text-[10px] font-medium text-yellow-600">
                Pending
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">{formatDate(app.createdAt)}</p>
        </div>
        {showDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={handleDeleteClick}
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              Delete Clerk App
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">&ldquo;{app.name}&rdquo;</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              This action is permanent and cannot be reversed. The Clerk app and all associated data
              will be permanently deleted.
            </p>
          </div>
          {deleteError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">{deleteError}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete App"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getOwnershipIcon(ownership: ClerkAppOwnership) {
  switch (ownership) {
    case "transferred":
      return { icon: CheckCircleIcon };
    case "owned":
    default:
      return { icon: KeyIcon };
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
