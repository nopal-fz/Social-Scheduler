import { config } from "dotenv";
import { PgBoss } from "pg-boss";

import { getEnv } from "../lib/env";

config({ path: [".env.local", ".env"] });

const HEARTBEAT_QUEUE = "heartbeat";

type HeartbeatData = { sentAt: string };

async function main() {
  const boss = new PgBoss({ connectionString: getEnv().DATABASE_URL });

  boss.on("error", (error) => console.error("pg-boss error", error));

  await boss.start();
  await boss.createQueue(HEARTBEAT_QUEUE);

  // No side effects, so re-running this job is safe.
  await boss.work<HeartbeatData>(HEARTBEAT_QUEUE, async ([job]) => {
    console.log(`heartbeat ${job.id} sentAt=${job.data.sentAt}`);
  });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      void boss.stop().then(() => process.exit(0));
    });
  }

  console.log(`worker ready, queue=${HEARTBEAT_QUEUE}`);
}

main().catch((error: unknown) => {
  console.error("worker failed", error);
  process.exit(1);
});
