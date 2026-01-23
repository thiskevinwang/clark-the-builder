"use client";

import { PreviewPanel as PreviewPanelComponent } from "@/components/preview/preview-panel";
import { useSharedChatContext } from "@/lib/chat-context";

import { useSandboxStore } from "./state";

interface Props {
  className?: string;
}

export function PreviewPanel({ className }: Props) {
  const { chat } = useSharedChatContext();
  const { sandboxId, status, url, urlUUID, paths } = useSandboxStore();
  return (
    <PreviewPanelComponent
      key={urlUUID}
      className={className}
      disabled={status === "stopped"}
      url={url}
      paths={paths}
      sandboxId={sandboxId}
      chatId={chat?.id}
    />
  );
}
