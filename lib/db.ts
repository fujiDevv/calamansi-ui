import { Pool } from "pg";

const globalForPg = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

function shouldUseSsl(connectionString: string) {
  try {
    const host = new URL(connectionString).hostname;

    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return true;
  }
}

export function getPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({
      connectionString,
      max: 5,
      ssl: shouldUseSsl(connectionString)
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }

  return globalForPg.pgPool;
}
