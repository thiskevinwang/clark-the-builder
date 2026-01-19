"use client";

import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  useBatchDeleteChatsMutation,
  useCreateChatMutation,
  useListChatsQuery,
} from "@/app/api/hooks";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { Header } from "../header";

type NonUndefined<T> = T extends undefined ? never : T;
type ConversationJson = NonUndefined<ReturnType<typeof useCreateChatMutation>["data"]>["chat"];

export default function ChatsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(() => new Set());

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<ConversationJson | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const list = useListChatsQuery({ query });
  const chats = list.data?.chats ?? [];

  const createChat = useCreateChatMutation();

  const visibleChatIds = useMemo(() => new Set(chats.map((c) => c.id)), [chats]);
  const selectedVisibleCount = useMemo(() => {
    let count = 0;
    for (const id of selectedChatIds) {
      if (visibleChatIds.has(id)) count += 1;
    }
    return count;
  }, [selectedChatIds, visibleChatIds]);

  const allVisibleSelected = useMemo(() => {
    if (chats.length === 0) return false;
    return chats.every((c) => selectedChatIds.has(c.id));
  }, [chats, selectedChatIds]);

  const someVisibleSelected = useMemo(() => {
    if (chats.length === 0) return false;
    return chats.some((c) => selectedChatIds.has(c.id));
  }, [chats, selectedChatIds]);

  const toggleSelected = (chatId: string) => {
    setSelectedChatIds((prev) => {
      const next = new Set(prev);
      if (next.has(chatId)) next.delete(chatId);
      else next.add(chatId);
      return next;
    });
  };

  const setAllVisibleSelected = (selected: boolean) => {
    setSelectedChatIds((prev) => {
      const next = new Set(prev);
      for (const c of chats) {
        if (selected) next.add(c.id);
        else next.delete(c.id);
      }
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedChatIds(new Set());
  };

  const openRename = (chat: ConversationJson) => {
    if (!chat) return;
    setActiveChat(chat);
    setRenameTitle(chat.title?.trim() ? chat.title : "");
    setRenameDialogOpen(true);
  };

  const openDelete = (chat: ConversationJson) => {
    setActiveChat(chat);
    setDeleteDialogOpen(true);
  };

  const deleteMany = useBatchDeleteChatsMutation();

  return (
    <SidebarProvider>
      <div className="flex h-screen max-h-screen overflow-hidden bg-background">
        <Sidebar />

        <SidebarInset className="flex flex-1 flex-col overflow-hidden p-3">
          <Header className="flex items-center w-full px-1" />

          <div className="flex w-full max-w-4xl mx-auto flex-1 min-h-0 flex-col">
            <div className="flex min-h-0 w-full flex-col overflow-hidden">
              <div className="flex items-center justify-between px-1 py-2">
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Chats</h1>
                  <p className="text-sm text-muted-foreground">
                    Browse and search your recent chats.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (selectionMode) exitSelectionMode();
                      else setSelectionMode(true);
                    }}
                  >
                    {selectionMode ? "Done" : "Select"}
                  </Button>

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

              {selectionMode ? (
                <div className="flex items-center justify-between px-1 pb-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      aria-label={allVisibleSelected ? "Deselect all" : "Select all"}
                      checked={
                        allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false
                      }
                      onCheckedChange={(value) => {
                        setAllVisibleSelected(value === true);
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedVisibleCount} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={selectedChatIds.size === 0 || deleteMany.isMutating}
                      onClick={() => setBatchDeleteDialogOpen(true)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">Delete selected</span>
                    </Button>
                  </div>

                  <Button variant="ghost" size="icon" onClick={exitSelectionMode}>
                    <XIcon className="h-4 w-4" />
                    <span className="sr-only">Exit selection mode</span>
                  </Button>
                </div>
              ) : null}

              <div className="flex flex-1 min-h-0 overflow-hidden px-1">
                <ScrollArea className="h-full w-full rounded-lg border border-border bg-card">
                  <div className="divide-y divide-border">
                    {list.isLoading ? (
                      <div className="p-4 text-sm text-muted-foreground">Loading chats…</div>
                    ) : chats.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground">
                        {query.trim() ? "No chats match your search." : "No chats yet."}
                      </div>
                    ) : (
                      chats.map((chat) => {
                        if (selectionMode) {
                          const isSelected = selectedChatIds.has(chat.id);
                          return (
                            <div
                              key={chat.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => toggleSelected(chat.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  toggleSelected(chat.id);
                                }
                              }}
                              className={cn(
                                "flex items-start justify-between gap-3 px-4 py-3 transition-colors",
                                isSelected ? "bg-accent" : "hover:bg-accent",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              )}
                            >
                              <div className="flex min-w-0 items-start gap-3">
                                <Checkbox
                                  aria-label={isSelected ? "Deselect chat" : "Select chat"}
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSelected(chat.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-1"
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-foreground">
                                    {chat.title?.trim() ? chat.title : "Untitled"}
                                  </p>
                                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {chat.id}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 text-right text-xs text-muted-foreground">
                                <div>{formatRelative(new Date(chat.updatedAt).toISOString())}</div>
                                <div className="mt-1">
                                  {chat.messageCount} message{chat.messageCount === 1 ? "" : "s"}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={chat.id}
                            role="link"
                            tabIndex={0}
                            onClick={() => router.push(`/chats/${chat.id}`)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") router.push(`/chats/${chat.id}`);
                            }}
                            className={cn(
                              "flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            )}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {chat.title?.trim() ? chat.title : "Untitled"}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {chat.id}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-start gap-3">
                              <div className="text-right text-xs text-muted-foreground">
                                <div>{formatRelative(new Date(chat.updatedAt).toISOString())}</div>
                                <div className="mt-1">
                                  {chat.messageCount} message{chat.messageCount === 1 ? "" : "s"}
                                </div>
                              </div>

                              <ChatRowMenu
                                onRename={() => openRename(chat)}
                                onDelete={() => openDelete(chat)}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}

                    {!list.isLoading && list.error ? (
                      <div className="p-4 text-sm text-destructive">Failed to load chats.</div>
                    ) : null}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Rename dialog */}
      <Dialog
        open={renameDialogOpen}
        onOpenChange={(open) => {
          setRenameDialogOpen(open);
          if (!open) {
            setActiveChat(null);
            setRenameTitle("");
            setIsRenaming(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
            <DialogDescription>Give this chat a new title.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="Untitled"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Leave blank to keep it as “Untitled”.</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!activeChat || isRenaming}
              onClick={async () => {
                if (!activeChat) return;
                setIsRenaming(true);
                try {
                  const res = await fetch(`/api/chats/${activeChat.id}`, {
                    method: "PATCH",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ title: renameTitle.trim() ? renameTitle.trim() : null }),
                  });
                  if (!res.ok) return;
                  await list.mutate();
                  setRenameDialogOpen(false);
                } finally {
                  setIsRenaming(false);
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete single dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setActiveChat(null);
            setIsDeleting(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete chat?</DialogTitle>
            <DialogDescription>
              This will permanently delete the chat and all its messages.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!activeChat || isDeleting}
              onClick={async () => {
                if (!activeChat) return;
                setIsDeleting(true);
                try {
                  const res = await fetch(`/api/chats/${activeChat.id}`, { method: "DELETE" });
                  if (!res.ok) return;
                  await list.mutate();
                  setDeleteDialogOpen(false);
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch delete dialog */}
      <Dialog
        open={batchDeleteDialogOpen}
        onOpenChange={(open) => {
          setBatchDeleteDialogOpen(open);
          if (!open) setIsDeleting(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete selected chats?</DialogTitle>
            <DialogDescription>
              This will permanently delete {selectedChatIds.size} chat
              {selectedChatIds.size === 1 ? "" : "s"} and all related messages.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={selectedChatIds.size === 0 || deleteMany.isMutating}
              onClick={async () => {
                const chatIds = Array.from(selectedChatIds);
                if (chatIds.length === 0) return;
                await deleteMany.trigger({ chatIds });
                await list.mutate();
                setBatchDeleteDialogOpen(false);
                exitSelectionMode();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

function ChatRowMenu({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) {
  const itemClass =
    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent focus:outline-none";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Chat actions</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-44 p-1"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          className={itemClass}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRename();
          }}
        >
          <PencilIcon className="h-4 w-4" />
          Rename
        </button>
        <button
          type="button"
          className={cn(itemClass, "text-destructive hover:bg-destructive/10")}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2Icon className="h-4 w-4" />
          Delete
        </button>
      </PopoverContent>
    </Popover>
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
