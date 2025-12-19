"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useClerkAppsInit,
  useClerkAppsStore,
} from "@/lib/storage/clerk-apps-store";
import type { ClerkAppData } from "@/lib/storage/types";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  KeyIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { apps, isLoaded, isSyncing, removeApp } = useClerkAppsStore();

  // Initialize the store on mount
  useClerkAppsInit();

  return (
    <div
      className={cn(
        "relative flex flex-col border-r border-border bg-card transition-all duration-300 overflow-hidden",
        isCollapsed ? "w-12" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-3">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Apps</h2>
            {isSyncing && (
              <Loader2Icon className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 w-7 p-0", isCollapsed && "mx-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Apps List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2">
          {!isLoaded ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {isCollapsed ? (
                <Loader2Icon className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
          ) : apps.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {isCollapsed ? (
                isSyncing ? (
                  <Loader2Icon className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  <KeyIcon className="mx-auto h-4 w-4 opacity-50" />
                )
              ) : isSyncing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : (
                "No apps yet"
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {apps.map((app) => (
                <AppItem
                  key={app.applicationId}
                  app={app}
                  isCollapsed={isCollapsed}
                  onRemove={() => removeApp(app.applicationId)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer - New App hint */}
      {!isCollapsed && (
        <div className="shrink-0 border-t border-border p-3">
          <p className="text-xs text-muted-foreground">
            Ask the assistant to create a new Clerk app
          </p>
        </div>
      )}
    </div>
  );
}

interface AppItemProps {
  app: ClerkAppData;
  isCollapsed: boolean;
  onRemove: () => void;
}

function AppItem({ app, isCollapsed, onRemove }: AppItemProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/applications/${app.applicationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete application");
      }

      // Remove from local storage after successful API call
      onRemove();
      toast.success(`"${app.name}" deleted successfully`);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete application"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isCollapsed) {
    return (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary mx-auto"
        title={app.name}
      >
        <KeyIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <>
      <div
        className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent"
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <KeyIcon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate font-medium text-foreground">{app.name}</p>
          <div className="flex items-center gap-2">
            <p className="truncate text-xs text-muted-foreground">
              {formatDate(app.createdAt)}
            </p>
          </div>
        </div>
        {showDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{app.name}</strong>? This
              action cannot be undone and will permanently remove the
              application from Clerk.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
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
