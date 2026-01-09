"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "clark:mcp-connectors";

export type AuthType = "none" | "bearer" | "headers" | "oauth";

export interface MCPServerAuth {
  type: AuthType;
  bearer?: string;
  headers?: Record<string, string>;
  oauth?: {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
  };
}
export interface MCPServer {
  url: string;
  auth?: MCPServerAuth;
}

export interface MCPConnector extends MCPServer {
  name: string;
}

export interface MCPConnectorsConfig {
  mcpServers: Record<string, MCPServer>;
}

export function useMCPConnectors() {
  const [config, setConfig] = useState<MCPConnectorsConfig>({ mcpServers: {} });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {
        setConfig({ mcpServers: {} });
      }
    }
    setIsLoaded(true);
  }, []);

  const saveConfig = useCallback((newConfig: MCPConnectorsConfig) => {
    setConfig(newConfig);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    }
  }, []);

  const addConnector = useCallback(
    (name: string, server: MCPServer) => {
      const newConfig = {
        ...config,
        mcpServers: {
          ...config.mcpServers,
          [name]: server,
        },
      };
      saveConfig(newConfig);
    },
    [config, saveConfig],
  );

  const removeConnector = useCallback(
    (name: string) => {
      const { [name]: _, ...rest } = config.mcpServers;
      saveConfig({ mcpServers: rest });
    },
    [config, saveConfig],
  );

  const connectors = Object.entries(config.mcpServers).map(([name, server]) => ({
    name,
    ...server,
  })) satisfies MCPConnector[];

  return {
    config,
    connectors,
    isLoaded,
    addConnector,
    removeConnector,
  };
}
