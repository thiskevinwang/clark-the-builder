import type {
  CreateMCPConnectionInput,
  MCPConnection,
  UpdateMCPConnectionInput,
} from "../models/mcp-connection";

export interface MCPConnectionRepository {
  getById(userId: string, id: string): Promise<MCPConnection | null>;
  listRecent(
    userId: string,
    limit: number,
    offset?: number,
    query?: string,
  ): Promise<MCPConnection[]>;
  create(input: CreateMCPConnectionInput): Promise<MCPConnection>;
  update(
    userId: string,
    id: string,
    input: UpdateMCPConnectionInput,
  ): Promise<MCPConnection | null>;
  delete(userId: string, id: string): Promise<boolean>;
}
