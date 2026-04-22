// Prisma CLI config — uses DIRECT connection for migrations
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct connection for migrations (not pooler)
    url: process.env["DATABASE_URL_DIRECT"] || process.env["DATABASE_URL"],
  },
});
