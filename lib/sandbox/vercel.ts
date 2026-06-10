/**
 * Vercel Sandbox implementation of the generic sandbox interface.
 */
import {
  APIError,
  Command as VercelCommand,
  CommandFinished as VercelCommandFinished,
  Sandbox as VercelSandbox,
} from "@vercel/sandbox";

import type {
  Sandbox,
  SandboxCommand,
  SandboxCommandResult,
  SandboxCreateOptions,
  SandboxGetOptions,
  SandboxLogLine,
  SandboxProvider,
  SandboxRunCommandOptions,
  SandboxWriteFile,
} from "./types";

function getSandboxCredentials() {
  if (process.env.VERCEL_TOKEN && process.env.VERCEL_TEAM_ID && process.env.VERCEL_PROJECT_ID) {
    return {
      token: process.env.VERCEL_TOKEN,
      teamId: process.env.VERCEL_TEAM_ID,
      projectId: process.env.VERCEL_PROJECT_ID,
    };
  }

  return {};
}

function wrapCommandResult(done: VercelCommandFinished): SandboxCommandResult {
  return {
    exitCode: done.exitCode,
    stdout: () => done.stdout(),
    stderr: () => done.stderr(),
  };
}

function wrapCommand(cmd: VercelCommand | VercelCommandFinished): SandboxCommand {
  return {
    cmdId: cmd.cmdId,
    startedAt: cmd.startedAt,
    async wait(): Promise<SandboxCommandResult> {
      const done = cmd instanceof VercelCommandFinished ? cmd : await cmd.wait();
      return wrapCommandResult(done);
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
    cwd: sandbox.cwd,
    sandboxId: sandbox.name,
    sandboxName: sandbox.name,
    status: sandbox.status,
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
    async readFile(options: { path: string; cwd?: string }): Promise<NodeJS.ReadableStream | null> {
      return sandbox.readFile(options);
    },
  };
}

export const vercelSandboxProvider: SandboxProvider = {
  async create(options: SandboxCreateOptions): Promise<Sandbox> {
    const sandbox = await VercelSandbox.getOrCreate({
      ...getSandboxCredentials(),
      name: options.name,
      timeout: options.timeout,
      ports: options.ports,
      runtime: "node24",
      env: options.env,
      persistent: options.persistent ?? true,
    });
    return wrapSandbox(sandbox);
  },
  async get(options: SandboxGetOptions): Promise<Sandbox> {
    const sandbox = await VercelSandbox.get({
      ...getSandboxCredentials(),
      name: options.sandboxId,
      resume: options.resume ?? true,
    });
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
