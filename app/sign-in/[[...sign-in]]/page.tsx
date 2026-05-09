import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import {
  AUTH_REDIRECT_QUERY_PARAM,
  buildAuthHref,
  CLERK_SIGN_IN_PATH,
  CLERK_SIGN_UP_PATH,
  normalizeAuthRedirectPath,
} from "@/lib/clerk-routing";

interface SignInPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { userId } = await auth();
  const params = await searchParams;
  const redirectPath = normalizeAuthRedirectPath(readQueryParam(params[AUTH_REDIRECT_QUERY_PARAM]));

  if (userId) {
    redirect(redirectPath);
  }

  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="Sign in to continue"
      description="Pick up where you left off and keep building."
      footer={
        <span>
          Don&apos;t have an account?{" "}
          <Link
            href={buildAuthHref(CLERK_SIGN_UP_PATH, redirectPath)}
            className="font-medium text-foreground hover:underline"
          >
            Sign up
          </Link>
          .
        </span>
      }
    >
      <SignIn
        routing="path"
        path={CLERK_SIGN_IN_PATH}
        signUpUrl={buildAuthHref(CLERK_SIGN_UP_PATH, redirectPath)}
        fallbackRedirectUrl={redirectPath}
        signUpFallbackRedirectUrl={redirectPath}
      />
    </AuthPageShell>
  );
}
