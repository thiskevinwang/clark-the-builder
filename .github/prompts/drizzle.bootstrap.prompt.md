---
description: Bootstrap a project with drizzle for PostgreSQL
---

## Preflight

Verify installed dependencies in `package.json`.

Verify local versions

```zsh
bun why drizzle-orm
bun why drizzle-kit
```

Compare with remote versions

```zsh
bun info drizzle-orm
bun info drizzle-kit
```

If not installed or outdated, run:

```zsh
bun i -D drizzle-kit
bun i drizzle-orm
```

## Files

Create the following files at the root of the project:

### Create Drizzle Config

```ts filename="drizzle.config.ts"
import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/database/schema.ts",
  out: "./lib/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // PostgreSQL migration issue in AWS RDS with Drizzle ORM: 'no pg_hba.conf entry for host' error
    // https://stackoverflow.com/questions/76818549/postgresql-migration-issue-in-aws-rds-with-drizzle-orm-no-pg-hba-conf-entry-fo
    // [BUG]: dbCredentials.ssl is not working while introspecting #831
    // https://github.com/drizzle-team/drizzle-orm/issues/831
    url: `${process.env.DATABASE_URL!}?sslmode=require`,
    ssl: true,
  },
} satisfies Config;
```

### Initialize schema

```ts filename="lib/database/schema.ts"
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const testTable = pgTable("test_table", {
  id: text("id").primaryKey(),
  verified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
});

export type TestTable = typeof testTable.$inferSelect;
```

### Create the db dependency

```ts filename="lib/database/db.ts"
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
```

## Add DATABASE_URL env variable

```zsh
cat >> .env << EOF

# Added by /drizzle.bootstrap.prompt.md on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
EOF
```

## Suggest next steps

The initial migration can be generated via:

```zsh
bunx drizzle-kit generate
```
