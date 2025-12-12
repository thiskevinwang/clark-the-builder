"use client";

import { Button } from "@/components/ui/button";
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
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { apps, isLoaded, removeApp } = useClerkAppsStore();

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
          <h2 className="text-sm font-semibold text-foreground">Apps</h2>
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
              {isCollapsed ? "..." : "Loading..."}
            </div>
          ) : apps.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {isCollapsed ? (
                <KeyIcon className="mx-auto h-4 w-4 opacity-50" />
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
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(app.createdAt)}
        </p>
      </div>
      {showDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
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
