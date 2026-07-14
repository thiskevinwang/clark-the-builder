import { db } from "./database/db";
import type { Resource } from "./models/resource";
import { createResourceRepository } from "./repositories/resource-repository";

export async function getOwnedResourceByExternalId(
  userId: string,
  type: string,
  externalId: string,
): Promise<Resource | null> {
  const resourceRepository = createResourceRepository(db);
  const resource = await resourceRepository.getByExternalId(userId, externalId);

  if (!resource || resource.type !== type) {
    return null;
  }

  return resource;
}

export async function listOwnedExternalIdsByType(
  userId: string,
  type: string,
  limit = 500,
): Promise<Set<string>> {
  const resourceRepository = createResourceRepository(db);
  const resources = await resourceRepository.listByType(userId, type, limit, 0);

  return new Set(resources.map((resource) => resource.externalId));
}
