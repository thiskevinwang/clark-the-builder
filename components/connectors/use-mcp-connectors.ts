"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { MCPConnectionAuth } from "@/lib/models/mcp-connection";

export type AuthType = "none" | "bearer" | "headers" | "oauth";

export type MCPServerAuth = MCPConnectionAuth;

export interface MCPServer {
  url: string;
  auth?: MCPServerAuth | null;
  enabled?: boolean;
}

export interface MCPConnector extends MCPServer {
  id: string;
  name: string;
}

export interface CreateConnectorInput {
  name: string;
  url: string;
  auth?: MCPServerAuth | null;
  enabled?: boolean;
}

interface MCPConnectionRecord {
  id: string;
  name: string;
  url: string;
  auth: MCPServerAuth | null;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function useMCPConnectors() {
  const [connections, setConnections] = useState<MCPConnectionRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/mcp-connections", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load MCP connections");
      const data = (await res.json()) as { connections: MCPConnectionRecord[] };
      setConnections(data.connections);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void fetchConnections();
  }, [fetchConnections]);

  const addConnector = useCallback(async (input: CreateConnectorInput) => {
    const res = await fetch("/api/mcp-connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        url: input.url,
        ...(Object.prototype.hasOwnProperty.call(input, "auth")
          ? { auth: input.auth ?? null }
          : {}),
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create MCP connection");
    }

    const data = (await res.json()) as { connection: MCPConnectionRecord };
    setConnections((prev) => [data.connection, ...prev]);
  }, []);

  const removeConnector = useCallback(async (id: string) => {
    const res = await fetch(`/api/mcp-connections/${id}`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error("Failed to delete MCP connection");
    }
    setConnections((prev) => prev.filter((connection) => connection.id !== id));
  }, []);

  const toggleConnector = useCallback(async (id: string, enabled: boolean) => {
    const res = await fetch(`/api/mcp-connections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) {
      throw new Error("Failed to update MCP connection");
    }
    const data = (await res.json()) as { connection: MCPConnectionRecord };
    setConnections((prev) =>
      prev.map((connection) => (connection.id === id ? data.connection : connection)),
    );
  }, []);

  const connectors = useMemo(
    () =>
      connections.map((connection) => ({
        id: connection.id,
        name: connection.name,
        url: connection.url,
        auth: connection.auth ?? undefined,
        enabled: connection.enabled,
      })) satisfies MCPConnector[],
    [connections],
  );

  return {
    connectors,
    isLoaded,
    addConnector,
    removeConnector,
    toggleConnector,
  };
}
