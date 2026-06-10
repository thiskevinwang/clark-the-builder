/**
 * Generic sandbox abstraction types.
 * This allows swapping out the underlying sandbox provider.
 */

export interface SandboxCreateOptions {
  name?: string;
  timeout?: number;
  ports?: number[];
  env?: Record<string, string>;
  persistent?: boolean;
}

export interface SandboxGetOptions {
  sandboxId: string;
  resume?: boolean;
}

export interface SandboxRunCommandOptions {
  cmd: string;
  args?: string[];
  sudo?: boolean;
  detached?: boolean;
}

export interface SandboxWriteFile {
  path: string;
  content: Buffer;
}

export interface SandboxCommand {
  cmdId: string;
  startedAt?: number;
  wait(): Promise<SandboxCommandResult>;
  logs(): AsyncIterable<SandboxLogLine>;
}

export interface SandboxCommandResult {
  exitCode: number;
  stdout(): Promise<string>;
  stderr(): Promise<string>;
}

export interface SandboxLogLine {
  data: string;
  stream: "stdout" | "stderr";
}

export interface Sandbox {
  sandboxId: string;
  sandboxName: string;
  status: "pending" | "running" | "stopping" | "stopped" | "failed" | "aborted" | "snapshotting";
  domain(port: number): string;
  runCommand(options: SandboxRunCommandOptions): Promise<SandboxCommand>;
  getCommand(cmdId: string): Promise<SandboxCommand>;
  writeFiles(files: SandboxWriteFile[]): Promise<void>;
  readFile(options: { path: string }): Promise<NodeJS.ReadableStream | null>;
}

export interface SandboxProvider {
  create(options: SandboxCreateOptions): Promise<Sandbox>;
  get(options: SandboxGetOptions): Promise<Sandbox>;
}

export interface SandboxAPIError extends Error {
  json?: { error?: { code?: string } };
  text?: string;
}

export function isSandboxAPIError(error: unknown): error is SandboxAPIError {
  return error instanceof Error && "json" in error;
}
