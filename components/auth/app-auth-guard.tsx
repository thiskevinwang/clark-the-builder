"use client";

import { useUser } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { SignInToContinue } from "./sign-in-to-continue";

interface AppAuthGuardProps {
  children: ReactNode;
  className?: string;
}

export function AppAuthGuard({ children, className }: AppAuthGuardProps) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center px-4 py-10 text-sm text-muted-foreground",
          className,
        )}
      >
        Checking your session...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className={cn("flex flex-1 items-center justify-center px-4 py-10", className)}>
        <SignInToContinue />
      </div>
    );
  }

  return <>{children}</>;
}
