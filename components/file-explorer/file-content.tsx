"use client";

import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { PulseLoader } from "react-spinners";
import useSWR from "swr";
import { SyntaxHighlighter } from "./syntax-highlighter";

interface Props {
  sandboxId: string;
  path: string;
}

/**
 * Check if a file path is an env file (e.g., .env, .env.local, .env.production)
 */
function isEnvFile(path: string): boolean {
  const filename = path.split("/").pop() ?? "";
  return filename === ".env" || filename.startsWith(".env.");
}

/**
 * Mask sensitive values in env file content
 * Preserves keys but replaces values with asterisks
 */
function maskEnvContent(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith("#")) {
        return line;
      }
      // Match KEY=VALUE pattern
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        // Replace value with asterisks of similar length (min 8, max 24)
        const maskedLength = Math.min(Math.max(value.length, 8), 24);
        return `${key}=${"•".repeat(maskedLength)}`;
      }
      return line;
    })
    .join("\n");
}

export const FileContent = memo(function FileContent({
  sandboxId,
  path,
}: Props) {
  const [showSensitive, setShowSensitive] = useState(false);
  const isEnv = isEnvFile(path);

  const searchParams = new URLSearchParams({ path });
  const content = useSWR(
    `/api/sandboxes/${sandboxId}/files?${searchParams.toString()}`,
    async (pathname: string, init: RequestInit) => {
      const response = await fetch(pathname, init);
      const text = await response.text();
      return text;
    },
    { refreshInterval: 1000 }
  );

  const toggleVisibility = useCallback(() => {
    setShowSensitive((prev) => !prev);
  }, []);

  const displayContent = useMemo(() => {
    if (!content.data) return "";
    if (isEnv && !showSensitive) {
      return maskEnvContent(content.data);
    }
    return content.data;
  }, [content.data, isEnv, showSensitive]);

  if (content.isLoading || !content.data) {
    return (
      <div className="absolute w-full h-full flex items-center text-center">
        <div className="flex-1">
          <PulseLoader className="opacity-60" size={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isEnv && (
        <button
          onClick={toggleVisibility}
          className={cn(
            "absolute top-2 right-4 z-10 p-1.5 rounded-md transition-colors",
            "bg-secondary/80 hover:bg-secondary border border-border",
            "text-muted-foreground hover:text-foreground"
          )}
          title={
            showSensitive ? "Hide sensitive values" : "Show sensitive values"
          }
        >
          {showSensitive ? (
            <EyeOffIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </button>
      )}
      <SyntaxHighlighter path={path} code={displayContent} />
    </div>
  );
});
