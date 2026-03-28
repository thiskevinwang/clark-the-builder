"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { ClarkAvatar } from "@/components/clark-avatar";
import { Button } from "@/components/ui/button";
import {
  buildAuthHref,
  CLERK_SIGN_IN_PATH,
  CLERK_SIGN_UP_PATH,
  DEFAULT_AUTH_REDIRECT_PATH,
  normalizeAuthRedirectPath,
} from "@/lib/clerk-routing";

export function SignInToContinue() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const redirectPath = normalizeAuthRedirectPath(currentPath || DEFAULT_AUTH_REDIRECT_PATH);

  return (
    <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card/90 p-6 shadow-2xl backdrop-blur sm:p-8">
      <div className="flex items-center gap-3">
        <ClarkAvatar size={40} className="rounded-xl shadow-lg" />
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Welcome back
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Sign in to continue
          </h2>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-muted-foreground">
        Sign in or create an account to keep building. You&apos;ll come right back here when you
        finish.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Button asChild size="lg" className="w-full justify-center rounded-xl">
          <Link href={buildAuthHref(CLERK_SIGN_IN_PATH, redirectPath)}>Sign in</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full justify-center rounded-xl">
          <Link href={buildAuthHref(CLERK_SIGN_UP_PATH, redirectPath)}>Create account</Link>
        </Button>
      </div>
    </div>
  );
}
