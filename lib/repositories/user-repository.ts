import type { CreateUserInput, UpsertUserInput, User } from "../models/user";

export interface UserRepository {
  getById(id: string): Promise<User | null>;
  getByExternalUserId(externalUserId: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  upsert(input: UpsertUserInput): Promise<User>;
  deleteByExternalUserId(externalUserId: string): Promise<boolean>;
}
