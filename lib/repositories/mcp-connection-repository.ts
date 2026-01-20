import type {
  CreateMCPConnectionInput,
  MCPConnection,
  UpdateMCPConnectionInput,
} from "../models/mcp-connection";

export interface MCPConnectionRepository {
  getById(id: string): Promise<MCPConnection | null>;
  listRecent(limit: number, offset?: number, query?: string): Promise<MCPConnection[]>;
  create(input: CreateMCPConnectionInput): Promise<MCPConnection>;
  update(id: string, input: UpdateMCPConnectionInput): Promise<MCPConnection | null>;
  delete(id: string): Promise<boolean>;
}
