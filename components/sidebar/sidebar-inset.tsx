"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useSidebar } from "./sidebar-state";

interface SidebarInsetProps {
  className?: string;
  children: ReactNode;
}

/**
 * Applies left padding on md+ to prevent main content from sitting underneath the fixed sidebar.
 * - When sidebar is open: reserve full width (w-72)
 * - When sidebar is collapsed (icon rail): reserve compact width (md:w-16)
 */
export function SidebarInset({ className, children }: SidebarInsetProps) {
  const { isOpen } = useSidebar();

  return (
    <div className={cn(isOpen ? "md:pl-72" : "md:pl-16", className)}>
      {children}
    </div>
  );
}
