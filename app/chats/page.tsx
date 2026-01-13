"use client";

import { PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { Sidebar, SidebarInset, SidebarProvider } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { Header } from "../header";

type ConversationJson = {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListChatsResponse = {
  chats: ConversationJson[];
};

type CreateChatResponse = {
  chat: ConversationJson;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ChatsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const listUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "50");
    params.set("offset", "0");
    if (query.trim()) params.set("q", query.trim());
    return `/api/chats?${params.toString()}`;
  }, [query]);

  const list = useSWR<ListChatsResponse>(listUrl, fetcher, {
    keepPreviousData: true,
    fallbackData: { chats: [] },
  });

  const createChat = useSWRMutation<CreateChatResponse, unknown, string, { title?: string }>(
    "/api/chats",
    async (url, { arg }) => {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ title: arg?.title ?? "New Chat" }),
      });
      return res.json();
    },
  );

  const chats = list.data?.chats ?? [];

  return (
    <SidebarProvider>
      <div className="flex h-screen max-h-screen overflow-hidden bg-background">
        <Sidebar />

        <SidebarInset className="flex flex-1 flex-col overflow-hidden p-3">
          <Header className="flex items-center w-full px-1" />

          <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between px-1 py-2">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Chats</h1>
                <p className="text-sm text-muted-foreground">
                  Browse and search your recent chats.
                </p>
              </div>
              <Button
                onClick={async () => {
                  const data = await createChat.trigger({ title: "New Chat" });
                  if (data?.chat?.id) {
                    router.push(`/chats/${data.chat.id}`);
                  }
                }}
                disabled={createChat.isMutating}
              >
                <PlusIcon className="h-4 w-4" />
                New
              </Button>
            </div>

            <div className="px-1 pb-3">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title or id…"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex-1 overflow-hidden px-1">
              <ScrollArea className="h-full rounded-lg border border-border bg-card">
                <div className="divide-y divide-border">
                  {list.isLoading ? (
                    <div className="p-4 text-sm text-muted-foreground">Loading chats…</div>
                  ) : chats.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      {query.trim() ? "No chats match your search." : "No chats yet."}
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <Link
                        key={chat.id}
                        href={`/chats/${chat.id}`}
                        className={cn(
                          "block px-4 py-3 transition-colors hover:bg-accent",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {chat.title?.trim() ? chat.title : "Untitled"}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {chat.id}
                            </p>
                          </div>
                          <div className="shrink-0 text-xs text-muted-foreground">
                            {formatRelative(chat.updatedAt)}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}

                  {!list.isLoading && list.error ? (
                    <div className="p-4 text-sm text-destructive">Failed to load chats.</div>
                  ) : null}
                </div>
              </ScrollArea>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function formatRelative(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
