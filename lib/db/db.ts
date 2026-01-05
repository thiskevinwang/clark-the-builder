import assert from "assert";
import postgres from "postgres";

const db = postgres({
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: true,
});

export type DB = typeof db;
export default db;

// Run this for one-off testing
// bun run lib/db/db.ts
if (import.meta.main) {
  const now = new Date();
  const [result] = await db`select now()`;
  await db.end();

  assert(
    new Date(result.now).getTime() >= now.getTime(),
    "Database is not working"
  );
}
