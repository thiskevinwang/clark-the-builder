export const CLERK_SIGN_IN_PATH = "/sign-in";
export const CLERK_SIGN_UP_PATH = "/sign-up";
export const DEFAULT_AUTH_REDIRECT_PATH = "/";
export const AUTH_REDIRECT_QUERY_PARAM = "redirect_url";

export function normalizeAuthRedirectPath(value: string | null | undefined): string {
  if (!value) return DEFAULT_AUTH_REDIRECT_PATH;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT_PATH;
  }

  return trimmed;
}

export function buildAuthHref(basePath: string, redirectPath: string): string {
  const normalizedRedirectPath = normalizeAuthRedirectPath(redirectPath);
  if (normalizedRedirectPath === DEFAULT_AUTH_REDIRECT_PATH) {
    return basePath;
  }

  const searchParams = new URLSearchParams({
    [AUTH_REDIRECT_QUERY_PARAM]: normalizedRedirectPath,
  });

  return `${basePath}?${searchParams.toString()}`;
}
