import type { DynamicToolUIPart } from "ai";
import { CheckIcon, ChevronsUpDown, XIcon } from "lucide-react";
import { Streamdown } from "streamdown";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { ToolHeader } from "../tool-header";
import { ToolMessage } from "../tool-message";
import { Spinner } from "./spinner";

interface Props {
  part: DynamicToolUIPart;
}

export function ToolInvocation({ part }: Props) {
  const toolName = part.toolName;
  const isLoading = part.state === "input-streaming" || part.state === "input-available";
  const isError = part.state === "output-error";

  return (
    <ToolMessage>
      <Collapsible className="w-full">
        <div className="flex items-center gap-2 w-full">
          {/* Title and tool name */}
          <div className="flex flex-col">
            <ToolHeader>Tool</ToolHeader>

            <div className="relative pl-6 min-h-5">
              <Spinner className="absolute left-0 top-0" loading={isLoading}>
                {isError ? (
                  <XIcon className="w-4 h-4 text-red-700" />
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
              </Spinner>
              <span>{toolName}</span>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 ml-auto">
              <ChevronsUpDown />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <Streamdown className="max-w-full overflow-x-auto">
            {part.output?.content?.[0].text}
          </Streamdown>
        </CollapsibleContent>
      </Collapsible>
    </ToolMessage>
  );
}
