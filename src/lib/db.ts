import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton — Prisma 7 with pg adapter.
 * Pool SSL relaxed for managed Postgres (RDS). Query params like sslmode=verify-full
 * on DATABASE_URL override pg's ssl object; we strip them so rejectUnauthorized works.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Remove libpq ssl params so Pool.ssl is the single source of truth for RDS TLS. */
function databaseUrlForPg(connectionString: string): string {
  try {
    const u = new URL(connectionString);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("sslrootcert");
    u.searchParams.delete("sslcert");
    u.searchParams.delete("sslkey");
    return u.toString();
  } catch {
    return connectionString;
  }
}

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  // Previous (reference only — RDS URLs with sslmode=verify-* could still fail TLS):
  // const connectionString = process.env.DATABASE_URL;
  // const pool = new Pool({
  //   connectionString,
  //   ssl: { rejectUnauthorized: false },
  //   max: 5,
  //   idleTimeoutMillis: 60000,
  //   connectionTimeoutMillis: 20000,
  // });

  const pool = new Pool({
    connectionString: databaseUrlForPg(raw),
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 20000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;

// Previous singleton pattern (dev-only cache):
// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = db;
// }
