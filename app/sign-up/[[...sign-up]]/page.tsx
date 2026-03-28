import { SignUp } from "@clerk/nextjs";
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

interface SignUpPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { userId } = await auth();
  const params = await searchParams;
  const redirectPath = normalizeAuthRedirectPath(readQueryParam(params[AUTH_REDIRECT_QUERY_PARAM]));

  if (userId) {
    redirect(redirectPath);
  }

  return (
    <AuthPageShell
      eyebrow="Get started"
      title="Sign up to start building"
      description="Create your account and start building in a few clicks."
      footer={
        <span>
          Already have an account?{" "}
          <Link
            href={buildAuthHref(CLERK_SIGN_IN_PATH, redirectPath)}
            className="font-medium text-foreground hover:underline"
          >
            Sign in
          </Link>
          .
        </span>
      }
    >
      <SignUp
        routing="path"
        path={CLERK_SIGN_UP_PATH}
        signInUrl={buildAuthHref(CLERK_SIGN_IN_PATH, redirectPath)}
        fallbackRedirectUrl={redirectPath}
        signInFallbackRedirectUrl={redirectPath}
      />
    </AuthPageShell>
  );
}
