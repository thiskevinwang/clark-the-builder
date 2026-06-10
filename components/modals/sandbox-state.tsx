"use client";

import { useEffect } from "react";
import useSWR from "swr";

import { useSandboxStore } from "@/app/state";

export function SandboxState() {
  const { sandboxId, setStatus } = useSandboxStore();
  return sandboxId ? <DirtyChecker sandboxId={sandboxId} setStatus={setStatus} /> : null;
}

interface DirtyCheckerProps {
  sandboxId: string;
  setStatus: (status: "running" | "stopped") => void;
}

function DirtyChecker({ sandboxId, setStatus }: DirtyCheckerProps) {
  useEffect(() => {
    let cancelled = false;

    async function resumeSandbox() {
      const response = await fetch(`/api/sandboxes/${sandboxId}`, { method: "POST" });
      if (!response.ok || cancelled) {
        return;
      }

      const { status } = (await response.json()) as { status?: string };
      setStatus(status === "stopped" ? "stopped" : "running");
    }

    void resumeSandbox();

    return () => {
      cancelled = true;
    };
  }, [sandboxId, setStatus]);

  const content = useSWR<string>(
    `/api/sandboxes/${sandboxId}`,
    async (pathname: string, init: RequestInit) => {
      const response = await fetch(pathname, init);
      const { status } = await response.json();
      return status;
    },
    { refreshInterval: 1000 },
  );

  useEffect(() => {
    if (content.data === "stopped") {
      setStatus("stopped");
    } else if (content.data) {
      setStatus("running");
    }
  }, [setStatus, content.data]);

  return null;
}
