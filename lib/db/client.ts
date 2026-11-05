import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  __jadwalinPool?: Pool;
};

let pool: Pool | undefined;

export function getDb(): NodePgDatabase<typeof schema> {
  pool ??= globalForDb.__jadwalinPool ?? new Pool({ connectionString: getEnv().DATABASE_URL });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__jadwalinPool = pool;
  }

  return drizzle(pool, { schema });
}
