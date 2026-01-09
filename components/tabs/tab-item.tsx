"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useTabState } from "./use-tab-state";

interface Props {
  children: ReactNode;
  tabId: string;
}

export function TabItem({ children, tabId }: Props) {
  const [activeTabId, setTabId] = useTabState();
  const isActive = activeTabId === tabId;
  return (
    <li
      onClick={() => setTabId(tabId)}
      className={cn(
        "px-3 py-1.5 rounded-md cursor-pointer text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
      )}
    >
      {children}
    </li>
  );
}
