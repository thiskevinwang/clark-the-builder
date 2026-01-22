import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks/clerk(.*)",
  "/api/applications(.*)",
  "/_next(.*)",
  "/favicon.ico",
]);

const middleware = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  await auth.protect();
});

export function authMiddleware(req: NextRequest) {
  return middleware(req);
}
