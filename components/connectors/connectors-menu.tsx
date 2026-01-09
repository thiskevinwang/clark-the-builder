"use client";

import { Cable, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { AddConnectorDialog } from "./add-connector-dialog";
import { useMCPConnectors } from "./use-mcp-connectors";

export function ConnectorsMenu() {
  const { connectors, isLoaded, addConnector, removeConnector } = useMCPConnectors();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground relative"
        >
          <Cable className="w-4 h-4" />
          {connectors.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {connectors.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b border-border">
          <h4 className="text-sm font-medium text-foreground">MCP</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Add MCP connectors to your chat</p>
        </div>
        <div className="p-2">
          {isLoaded && connectors.length > 0 && (
            <div className="space-y-1 mb-2">
              {connectors.map((connector) => (
                <div
                  key={connector.name}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{connector.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{connector.url}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => removeConnector(connector.name)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <AddConnectorDialog onAdd={addConnector} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
