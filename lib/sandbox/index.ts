/**
 * Sandbox abstraction layer.
 *
 * This module provides a generic interface for sandbox operations,
 * allowing the underlying provider to be swapped without changing
 * consuming code.
 */

export type {
  Sandbox,
  SandboxAPIError,
  SandboxCommand,
  SandboxCommandResult,
  SandboxCreateOptions,
  SandboxLogLine,
  SandboxProvider,
  SandboxRunCommandOptions,
  SandboxWriteFile,
} from "./types";

export { isSandboxAPIError } from "./types";

export { getVercelErrorFields, isVercelAPIError, vercelSandboxProvider } from "./vercel";

// Default sandbox provider
export { vercelSandboxProvider as sandboxProvider } from "./vercel";
