"use client";

import { PanelLeftIcon } from "lucide-react";

import { ClarkAvatar } from "@/components/clark-avatar";
import { useSidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function Header({ className }: Props) {
  const { isOpen, toggle } = useSidebar();

  return (
    <header className={cn("flex items-center justify-between py-2", className)}>
      <div className="flex items-center gap-2.5">
        {/* Open sidebar button - shown when sidebar is closed */}
        {!isOpen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <PanelLeftIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>

            <TooltipContent side="right">
              <span className="flex items-center gap-2">
                Open sidebar
                <kbd className="inline-flex h-5 items-center gap-0.5 rounded bg-primary-foreground/20 px-1.5 font-mono text-[10px] font-medium">
                  ⌘.
                </kbd>
              </span>
            </TooltipContent>
          </Tooltip>
        )}

        <ClarkAvatar size={28} className="rounded-md" />
        <span className="font-mono hidden md:inline text-sm font-semibold text-foreground tracking-tight">
          Clerk0
        </span>
      </div>
    </header>
  );
}
