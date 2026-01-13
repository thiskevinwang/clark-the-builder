import type { InferUITools, UIMessage, UIMessageStreamWriter } from "ai";

import { MessageRepository } from "@/lib/repositories/message-repository";

import type { ModelId } from "../constants";
import type { DataPart } from "../messages/data-parts";
import { createClerkApp } from "./create-clerk-app";
import { createSandbox } from "./create-sandbox";
import { generateFiles } from "./generate-files";
import { getSandboxURL } from "./get-sandbox-url";
import { runCommand } from "./run-command";

interface Params {
  messageRepository: MessageRepository;
  chatId: string;
  modelId: ModelId;
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
}

export function tools({ messageRepository, chatId, modelId, writer }: Params) {
  return {
    createClerkApp: createClerkApp({ messageRepository, chatId, writer }),
    createSandbox: createSandbox({ writer }),
    generateFiles: generateFiles({ writer, modelId }),
    getSandboxURL: getSandboxURL({ writer }),
    runCommand: runCommand({ writer }),
  };
}

export type ToolSet = InferUITools<ReturnType<typeof tools>>;
