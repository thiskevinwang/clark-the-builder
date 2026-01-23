import type { CreateResourceInput, Resource, UpdateResourceInput } from "../models/resource";

export interface ResourceRepository {
  getById(id: string): Promise<Resource | null>;
  getByExternalId(externalId: string): Promise<Resource | null>;
  listByType(type: string, limit?: number, offset?: number): Promise<Resource[]>;
  listByConversationId(conversationId: string): Promise<Resource[]>;
  create(input: CreateResourceInput): Promise<Resource>;
  update(id: string, input: UpdateResourceInput): Promise<Resource | null>;
  delete(id: string): Promise<boolean>;
}
