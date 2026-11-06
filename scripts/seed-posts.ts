import { config } from "dotenv";
import { and, eq, gte, lt } from "drizzle-orm";
import { z } from "zod";

import type { CalendarPostStatus } from "../lib/calendar/types";
import { addDays, getZonedNow, jakartaToUtc, startOfWeek } from "../lib/calendar/week";
import { getDb } from "../lib/db/client";
import {
  postTargets,
  posts,
  socialAccounts,
  users,
  type Platform,
  type PostStatus,
  type TargetStatus,
} from "../lib/db/schema";
import { SEED_ACCOUNTS, SEED_POSTS } from "./seed-data";

config({ path: [".env.local", ".env"] });

const seedEnvSchema = z.object({
  OWNER_EMAIL: z.string().trim().toLowerCase().email(),
});

const CONTENT_TYPES: Record<Platform, string> = {
  threads: "text",
  instagram: "image",
  tiktok: "video",
};

function postStatusFor(status: CalendarPostStatus): PostStatus {
  if (status === "published") return "done";
  if (status === "partial") return "partial";
  if (status === "failed") return "failed";
  return "scheduled";
}

function targetStatusesFor(status: CalendarPostStatus, count: number): TargetStatus[] {
  const fill = (value: TargetStatus) => Array.from({ length: count }, () => value);

  if (status === "published") return fill("published");
  if (status === "failed") return fill("failed");
  if (status === "partial") {
    return count > 1 ? ["published", ...fill("failed").slice(1)] : ["failed"];
  }
  if (status === "publishing") return ["publishing", ...fill("scheduled").slice(1)];
  return fill("scheduled");
}

async function main() {
  const parsed = seedEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Set OWNER_EMAIL di .env.local.");
    process.exit(1);
  }

  const db = getDb();
  const [owner] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.OWNER_EMAIL))
    .limit(1);

  if (!owner) {
    console.error("Owner belum ada. Jalankan `pnpm db:seed` dulu.");
    process.exit(1);
  }

  const weekStart = startOfWeek(getZonedNow(new Date()).date);
  const weekEnd = addDays(weekStart, 7);
  const start = jakartaToUtc(weekStart);
  const end = jakartaToUtc(weekEnd);

  const [existing] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(
        eq(posts.userId, owner.id),
        gte(posts.scheduledAt, start),
        lt(posts.scheduledAt, end),
      ),
    )
    .limit(1);

  if (existing) {
    console.log("Post minggu ini sudah ada. Seed dilewati.");
    process.exit(0);
  }

  const accountIds = new Map<string, string>();
  for (const account of SEED_ACCOUNTS) {
    const status = account.needsReconnect ? "needs_reconnect" : "active";
    const [row] = await db
      .insert(socialAccounts)
      .values({
        userId: owner.id,
        platform: account.platform,
        externalId: account.externalId,
        handle: account.handle,
        // Placeholder only. Real tokens are encrypted and never seeded.
        accessTokenEnc: "seed-placeholder-not-a-token",
        status,
      })
      .onConflictDoUpdate({
        target: [socialAccounts.platform, socialAccounts.externalId],
        set: { handle: account.handle, status, updatedAt: new Date() },
      })
      .returning({ id: socialAccounts.id });

    accountIds.set(account.key, row.id);
  }

  await db.transaction(async (tx) => {
    for (const post of SEED_POSTS) {
      const [hour, minute] = post.time.split(":").map(Number);
      const scheduledAt = jakartaToUtc(addDays(weekStart, post.day), hour * 60 + minute);

      const [row] = await tx
        .insert(posts)
        .values({
          userId: owner.id,
          baseCaption: post.caption,
          scheduledAt,
          status: postStatusFor(post.status),
        })
        .returning({ id: posts.id });

      const statuses = targetStatusesFor(post.status, post.targets.length);
      await tx.insert(postTargets).values(
        post.targets.map((key, index) => {
          const account = SEED_ACCOUNTS.find((item) => item.key === key);
          const accountId = accountIds.get(key);

          if (!account || !accountId) {
            throw new Error(`unknown seed account: ${key}`);
          }

          const status = statuses[index];
          return {
            postId: row.id,
            accountId,
            contentType: CONTENT_TYPES[account.platform],
            status,
            publishedAt: status === "published" ? scheduledAt : null,
            errorCode: status === "failed" ? "SEED_ERROR" : null,
            errorMessage:
              status === "failed" ? (post.error ?? "Post gagal terbit.") : null,
          };
        }),
      );
    }
  });

  console.log(`Seeded ${SEED_POSTS.length} post for ${weekStart.year}-${weekStart.month}-${weekStart.day}.`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("seed posts failed", error);
  process.exit(1);
});
