export interface User {
  id: string;
  externalUserId: string;
  emailAddress: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  id?: string;
  externalUserId: string;
  emailAddress?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

export type UpsertUserInput = CreateUserInput;
