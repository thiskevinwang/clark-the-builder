import { type DB } from "@/lib/db/db";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * Should only be used in the repository layer.
 */
export function getClient(db: DB) {
  return drizzle({
    client: db,
    schema,
  });
}
