"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import { useMemo } from "react";
import { useAvailableModels } from "./use-available-models";
import { useModelId } from "./use-settings";

export function ModelSelector({ className }: { className?: string }) {
  const [modelId, setModelId] = useModelId();
  const { models: available, isLoading, error } = useAvailableModels();
  const models = useMemo(
    () => available?.sort((a, b) => a.label.localeCompare(b.label)) || [],
    [available]
  );

  return (
    <Select
      value={modelId}
      onValueChange={(value) => {
        // `useQueryState` setters are async; the Select API expects void.
        void setModelId(value as any);
      }}
      disabled={isLoading || !!error || !models?.length}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          // no line break; truncate if overflow
          "truncate",
          "text-xs font-mono",
          // ghost
          "border-none shadow-none bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent gap-1.5 px-2",

          className
        )}
      >
        {isLoading ? (
          <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
        ) : error ? (
          <span className="text-red-500">Error</span>
        ) : !models?.length ? (
          <span>No models</span>
        ) : (
          <SelectValue placeholder="Select model" />
        )}
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>Models</SelectLabel>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
