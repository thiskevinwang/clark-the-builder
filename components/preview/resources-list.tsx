"use client";

import { BoxIcon, KeyIcon, ServerIcon } from "lucide-react";
import useSWR from "swr";

import type { GETResponse } from "@/app/api/chats/[chatId]/resources/route";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Resource } from "@/lib/models/resource";

interface Props {
  chatId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const RESOURCE_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  clerk_application: { label: "Clerk App", icon: KeyIcon },
  vercel_sandbox: { label: "Sandbox", icon: ServerIcon },
  planetscale_db: { label: "PlanetScale DB", icon: BoxIcon },
};

function ResourceItem({ resource }: { resource: Resource }) {
  const config = RESOURCE_TYPE_CONFIG[resource.type] ?? {
    label: resource.type,
    icon: BoxIcon,
  };
  const Icon = config.icon;
  const name = (resource.metadata as { name?: string })?.name ?? resource.externalId;

  return (
    <div className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md transition-colors">
      <div className="p-2 rounded-md bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-xs text-muted-foreground">{config.label}</div>
      </div>
    </div>
  );
}

export function ResourcesList({ chatId }: Props) {
  const { data, isLoading, error } = useSWR<GETResponse>(
    chatId ? `/api/chats/${chatId}/resources` : null,
    fetcher,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Loading resources...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive text-sm">
        Failed to load resources
      </div>
    );
  }

  const resources = data?.resources ?? [];

  if (resources.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No resources yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {resources.map((resource) => (
          <ResourceItem key={resource.id} resource={resource} />
        ))}
      </div>
    </ScrollArea>
  );
}
