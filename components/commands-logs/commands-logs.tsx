"use client";

import type { Command } from "./types";
import { Panel, PanelHeader } from "@/components/panels/panels";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SquareChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  className?: string;
  commands: Command[];
}

export function CommandsLogs(props: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [props.commands]);

  return (
    <Panel className={props.className}>
      <PanelHeader>
        <SquareChevronRight className="mr-2 w-4 text-primary" />
        <span className="font-medium">Logs</span>
      </PanelHeader>
      <div className="h-[calc(100%-2rem)]">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-3">
            {props.commands.map((command) => {
              const date = new Date(command.startedAt).toLocaleTimeString(
                "en-US",
                {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }
              );

              const line = `${command.command} ${command.args.join(" ")}`;
              const body = command.logs?.map((log) => log.data).join("") || "";
              return (
                <pre
                  key={command.cmdId}
                  className="whitespace-pre-wrap font-mono text-xs text-muted-foreground bg-secondary/50 rounded-md p-2"
                >
                  <span className="text-primary">[{date}]</span> {line}
                  {body && (
                    <span className="block mt-1 text-foreground">{body}</span>
                  )}
                </pre>
              );
            })}
          </div>
          <div ref={bottomRef} />
        </ScrollArea>
      </div>
    </Panel>
  );
}
