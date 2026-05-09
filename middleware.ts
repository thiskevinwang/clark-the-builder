import { clerkMiddleware } from "@clerk/nextjs/server";

import { CLERK_SIGN_IN_PATH, CLERK_SIGN_UP_PATH } from "@/lib/clerk-routing";

export default clerkMiddleware({
  signInUrl: CLERK_SIGN_IN_PATH,
  signUpUrl: CLERK_SIGN_UP_PATH,
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
