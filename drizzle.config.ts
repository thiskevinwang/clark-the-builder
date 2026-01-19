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
