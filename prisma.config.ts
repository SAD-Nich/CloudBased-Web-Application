import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Used by Prisma Migrate (CLI)
    url: env("DATABASE_URL"),

    // Optional (recommended for some hosted DBs):
    // directUrl: env("DIRECT_URL"),
  },
});
