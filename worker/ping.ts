import { config } from "dotenv";
import { PgBoss } from "pg-boss";

import { getEnv } from "../lib/env";

config({ path: [".env.local", ".env"] });

const HEARTBEAT_QUEUE = "heartbeat";

async function main() {
  const boss = new PgBoss({ connectionString: getEnv().DATABASE_URL });

  await boss.start();
  await boss.createQueue(HEARTBEAT_QUEUE);

  const id = await boss.send(HEARTBEAT_QUEUE, { sentAt: new Date().toISOString() });
  console.log(`enqueued ${HEARTBEAT_QUEUE} ${id}`);

  await boss.stop();
}

main().catch((error: unknown) => {
  console.error("ping failed", error);
  process.exit(1);
});
