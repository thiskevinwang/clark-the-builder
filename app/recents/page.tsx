"use client";

import { ClarkAvatar } from "@/components/clark-avatar";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2Icon,
  MessageSquareIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ChatItem {
  id: string;
  title: string | null;
  createdAt: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
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

export default function RecentsPage() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchChats() {
      try {
        const response = await fetch("/api/chats");
        if (response.ok) {
          const data = await response.json();
          setChats(data.chats ?? []);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChats();
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-2xl font-semibold text-foreground">Chats</h1>
          <Button asChild>
            <Link href="/">
              <PlusIcon className="h-4 w-4 mr-2" />
              New chat
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your chats..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat count */}
        <div className="px-4 pb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredChats.length} chats with Clark</span>
          {filteredChats.length > 0 && (
            <button className="text-primary hover:underline">Select</button>
          )}
        </div>

        {/* Chat list or empty state */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Loading chats...
              </p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="mb-6">
                <div className="relative inline-block">
                  <MessageSquareIcon
                    className="h-16 w-16 text-muted-foreground/30"
                    strokeWidth={1}
                  />
                  <ClarkAvatar
                    size={32}
                    className="absolute -bottom-1 -right-1 rounded-full border-2 border-background"
                  />
                </div>
              </div>
              <h2 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? "No chats found" : "Ready for your first chat?"}
              </h2>
              <p className="text-muted-foreground max-w-sm mb-6">
                {searchQuery
                  ? "Try a different search term."
                  : "Think through anything with Clark—from big ideas to quick questions. Your chats will show up here."}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New chat
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredChats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chats/${chat.id}`}
                  className="block px-4 py-3 hover:bg-accent transition-colors"
                >
                  <p className="font-medium text-foreground truncate">
                    {chat.title ?? "Untitled chat"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(chat.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
