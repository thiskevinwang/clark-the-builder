import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/database/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(`${process.env.DATABASE_URL!}`, {
  // 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY'
  // https://stackoverflow.com/a/68214271/9823455
  ssl: "allow",
});

export const db = drizzle(client, { schema });

export type DB = typeof db;
