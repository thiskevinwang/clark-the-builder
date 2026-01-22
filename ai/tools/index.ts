import type { InferUITools, UIMessage, UIMessageStreamWriter } from "ai";

import type { ModelId } from "../constants";
import type { DataPart } from "../messages/data-parts";
import { createClerkApp } from "./create-clerk-app";
import { createPscaleDb } from "./create-pscale-db";
import { createSandbox } from "./create-sandbox";
import { generateFiles } from "./generate-files";
import { getSandboxURL } from "./get-sandbox-url";
import { runCommand } from "./run-command";
import { waitTool } from "./wait";

interface Params {
  chatId: string;
  modelId: ModelId;
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
}

export function tools({ chatId, modelId, writer }: Params) {
  console.log("Creating tools for chatId:", chatId);
  return {
    createClerkApp: createClerkApp({ writer }),
    createPscaleDb: createPscaleDb({ writer }),
    createSandbox: createSandbox({ writer }),
    generateFiles: generateFiles({ writer, modelId }),
    getSandboxURL: getSandboxURL({ writer }),
    runCommand: runCommand({ writer }),
    waitTool: waitTool({ writer }),
  };
}

export type ToolSet = InferUITools<ReturnType<typeof tools>>;
