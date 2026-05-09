import type { CreateResourceInput, Resource, UpdateResourceInput } from "../models/resource";

export interface ResourceRepository {
  getById(userId: string, id: string): Promise<Resource | null>;
  getByExternalId(userId: string, externalId: string): Promise<Resource | null>;
  listByType(userId: string, type: string, limit?: number, offset?: number): Promise<Resource[]>;
  listByConversationId(userId: string, conversationId: string): Promise<Resource[]>;
  create(input: CreateResourceInput): Promise<Resource>;
  update(userId: string, id: string, input: UpdateResourceInput): Promise<Resource | null>;
  delete(userId: string, id: string): Promise<boolean>;
}
