"use client";

import { PreviewPanel as PreviewPanelComponent } from "@/components/preview/preview-panel";
import { useSandboxStore } from "./state";

interface Props {
  className?: string;
}

export function PreviewPanel({ className }: Props) {
  const { sandboxId, status, url, urlUUID, paths } = useSandboxStore();
  return (
    <PreviewPanelComponent
      key={urlUUID}
      className={className}
      disabled={status === "stopped"}
      url={url}
      paths={paths}
      sandboxId={sandboxId}
    />
  );
}
