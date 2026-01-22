export type MCPAuthType = "none" | "bearer" | "headers" | "oauth";

export interface MCPConnectionAuth {
  type: MCPAuthType;
  bearer?: string;
  headers?: Record<string, string>;
  oauth?: {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
  };
}

export interface MCPConnection {
  id: string;
  userId: string | null;
  name: string;
  url: string;
  auth: MCPConnectionAuth | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMCPConnectionInput {
  id?: string;
  userId?: string | null;
  name: string;
  url: string;
  auth?: MCPConnectionAuth | null;
  enabled?: boolean;
}

export interface UpdateMCPConnectionInput {
  name?: string;
  url?: string;
  auth?: MCPConnectionAuth | null;
  enabled?: boolean;
}
