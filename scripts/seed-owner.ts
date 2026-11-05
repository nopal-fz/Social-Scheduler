import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { hashPassword } from "../lib/auth/password";
import { getDb } from "../lib/db/client";
import { users } from "../lib/db/schema";

config({ path: [".env.local", ".env"] });

const seedEnvSchema = z.object({
  OWNER_EMAIL: z.string().trim().toLowerCase().email(),
  OWNER_PASSWORD: z.string().min(8),
});

async function main() {
  const parsed = seedEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Set OWNER_EMAIL dan OWNER_PASSWORD (min 8 karakter) di .env.local.");
    process.exit(1);
  }

  const { OWNER_EMAIL, OWNER_PASSWORD } = parsed.data;
  const db = getDb();
  const passwordHash = await hashPassword(OWNER_PASSWORD);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, OWNER_EMAIL))
    .limit(1);

  if (existing) {
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, existing.id));
    console.log(`updated owner ${OWNER_EMAIL}`);
  } else {
    await db.insert(users).values({ email: OWNER_EMAIL, passwordHash });
    console.log(`created owner ${OWNER_EMAIL}`);
  }

  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("seed failed", error);
  process.exit(1);
});
