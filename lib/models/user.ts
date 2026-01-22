export interface User {
  id: string;
  externalId: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertUserInput {
  externalId: string;
  email?: string | null;
  name?: string | null;
  imageUrl?: string | null;
}
