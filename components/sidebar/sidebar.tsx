"use client";

import {
  ArchiveIcon,
  MessagesSquareIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { ClarkAvatar } from "../clark-avatar";
import { useSidebar } from "./sidebar-state";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isOpen, close, open } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = !isOpen;

  const isChatsActive = pathname === "/chats" || pathname.startsWith("/chats/");
  const isArtifactsActive = pathname === "/artifacts" || pathname.startsWith("/artifacts/");

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
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-border bg-card transition-all duration-300 ease-out",
          // On small screens, slide fully off-canvas when closed (current behavior)
          isOpen
            ? "translate-x-0"
            : "-translate-x-full pointer-events-none md:translate-x-0 md:pointer-events-auto",
          // On md+ keep the sidebar visible as an icon-only rail when closed
          isOpen ? "w-72" : "w-72 md:w-16",
          className,
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between p-3",
            isCollapsed && "md:justify-center md:px-2",
          )}
        >
          <div className={cn("flex flex-row items-center gap-2", isCollapsed && "md:hidden")}>
            <ClarkAvatar size={28} className="rounded-md" />
            <Link href="/" className="hover:underline">
              <span>
                <div className="dark:block hidden">
                  <span className="hidden md:inline text-lg tracking-tight font-semibold text-foreground font-serif!">
                    Karl
                  </span>
                </div>
                <div className="dark:hidden block">
                  <span className="hidden md:inline text-lg tracking-tight font-semibold text-foreground font-serif!">
                    Clark
                  </span>
                </div>
              </span>
            </Link>
          </div>

          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={open}
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpenIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={close}
              aria-label="Collapse sidebar"
            >
              <PanelLeftCloseIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 min-h-0">
          <div className={cn("p-2", isCollapsed && "md:px-1")}>
            <div className="mb-4">
              <div className="space-y-1">
                {isCollapsed ? (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/chats"
                          onClick={close}
                          aria-label="Chats"
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent",
                            "md:justify-center md:gap-0",
                            isChatsActive
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <MessagesSquareIcon className="h-3.5 w-3.5" />
                          </div>
                          <span className="md:hidden">Chats</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">Chats</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/artifacts"
                          onClick={close}
                          aria-label="Artifacts"
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent",
                            "md:justify-center md:gap-0",
                            isArtifactsActive
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <ArchiveIcon className="h-3.5 w-3.5" />
                          </div>
                          <span className="md:hidden">Artifacts</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">Artifacts</TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Link
                      href="/chats"
                      onClick={close}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent",
                        isChatsActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <MessagesSquareIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium">Chats</span>
                    </Link>

                    <Link
                      href="/artifacts"
                      onClick={close}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent",
                        isArtifactsActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <ArchiveIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium">Artifacts</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
