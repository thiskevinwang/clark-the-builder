"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useAuth } from "./use-auth";

interface AuthUserAvatarProps {
  collapsed?: boolean;
  className?: string;
}

export function AuthUserAvatar({ collapsed, className }: AuthUserAvatarProps) {
  const { isLoaded, isSignedIn, user } = useAuth();

  if (!isLoaded) {
    return <div className={cn("h-9 w-full rounded-md bg-muted/40", className)} aria-hidden />;
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn(
            "w-full justify-start gap-2 text-muted-foreground hover:text-foreground",
            collapsed && "h-9 w-9 justify-center",
            className,
          )}
        >
          <span className="h-7 w-7 rounded-full bg-muted/70" aria-hidden />
          {!collapsed && <span className="text-sm">Sign in</span>}
        </Button>
      </SignInButton>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 p-2",
        collapsed && "justify-center p-1.5",
        className,
      )}
    >
      <UserButton
        appearance={{
          elements: {
            avatarBox: cn("h-7 w-7", collapsed && "h-8 w-8"),
          },
        }}
      />
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {user?.name ?? user?.email ?? "Signed in"}
          </p>
          <p className="truncate text-xs text-muted-foreground">Signed in</p>
        </div>
      )}
    </div>
  );
}
