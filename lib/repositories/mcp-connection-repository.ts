import type {
  CreateMCPConnectionInput,
  MCPConnection,
  UpdateMCPConnectionInput,
} from "../models/mcp-connection";

export interface MCPConnectionRepository {
  getById(id: string, userId?: string): Promise<MCPConnection | null>;
  listRecent(
    limit: number,
    offset?: number,
    query?: string,
    userId?: string,
  ): Promise<MCPConnection[]>;
  create(input: CreateMCPConnectionInput): Promise<MCPConnection>;
  update(
    id: string,
    input: UpdateMCPConnectionInput,
    userId?: string,
  ): Promise<MCPConnection | null>;
  delete(id: string, userId?: string): Promise<boolean>;
}
