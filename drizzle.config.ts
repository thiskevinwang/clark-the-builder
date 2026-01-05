import { defineConfig } from "drizzle-kit";
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/drizzle/schema.ts",
  out: "./lib/db/drizzle",
  dbCredentials: {
    host: process.env.DB_HOST || "",
    database: process.env.DB_NAME || "",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: true,
  },
});
