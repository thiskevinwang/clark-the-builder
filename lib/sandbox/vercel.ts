/**
 * Vercel Sandbox implementation of the generic sandbox interface.
 */
import { Command as VercelCommand, Sandbox as VercelSandbox } from "@vercel/sandbox";
import { APIError } from "@vercel/sandbox/dist/api-client/api-error";

import type {
  Sandbox,
  SandboxCommand,
  SandboxCommandResult,
  SandboxCreateOptions,
  SandboxLogLine,
  SandboxProvider,
  SandboxRunCommandOptions,
  SandboxWriteFile,
} from "./types";

function wrapCommand(cmd: VercelCommand): SandboxCommand {
  return {
    cmdId: cmd.cmdId,
    startedAt: cmd.startedAt,
    async wait(): Promise<SandboxCommandResult> {
      const done = await cmd.wait();
      return {
        exitCode: done.exitCode,
        stdout: () => done.stdout(),
        stderr: () => done.stderr(),
      };
    },
    async *logs(): AsyncIterable<SandboxLogLine> {
      for await (const logline of cmd.logs()) {
        yield {
          data: logline.data,
          stream: logline.stream,
        };
      }
    },
  };
}

function wrapSandbox(sandbox: VercelSandbox): Sandbox {
  return {
    sandboxId: sandbox.sandboxId,
    domain: (port: number) => sandbox.domain(port),
    async runCommand(options: SandboxRunCommandOptions): Promise<SandboxCommand> {
      const cmd = await sandbox.runCommand(options);
      return wrapCommand(cmd);
    },
    async getCommand(cmdId: string): Promise<SandboxCommand> {
      const cmd = await sandbox.getCommand(cmdId);
      return wrapCommand(cmd);
    },
    async writeFiles(files: SandboxWriteFile[]): Promise<void> {
      await sandbox.writeFiles(files);
    },
    async readFile(options: { path: string }): Promise<NodeJS.ReadableStream | null> {
      return sandbox.readFile(options);
    },
  };
}

export const vercelSandboxProvider: SandboxProvider = {
  async create(options: SandboxCreateOptions): Promise<Sandbox> {
    const sandbox = await VercelSandbox.create({
      timeout: options.timeout,
      ports: options.ports,
      runtime: "node24",
    });
    return wrapSandbox(sandbox);
  },
  async get(options: { sandboxId: string }): Promise<Sandbox> {
    const sandbox = await VercelSandbox.get(options);
    return wrapSandbox(sandbox);
  },
};

/**
 * Check if an error is a Vercel Sandbox API error.
 */
export function isVercelAPIError(error: unknown): error is APIError<unknown> {
  return error instanceof APIError;
}

/**
 * Extract error fields from a Vercel Sandbox API error.
 */
export function getVercelErrorFields(error: APIError<unknown>): {
  message: string;
  json?: unknown;
  text?: string;
} {
  return {
    message: error.message,
    json: error.json,
    text: error.text,
  };
}
