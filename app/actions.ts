"use server";

import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/current-user";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { buildCalendarHref } from "@/lib/calendar/filter";
import { parseComposerInput } from "@/lib/composer/schema";
import { getDb } from "@/lib/db/client";
import { postTargets, posts, socialAccounts } from "@/lib/db/schema";

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export type ComposerState = { error: string | null };

export async function createPost(
  _prevState: ComposerState,
  formData: FormData,
): Promise<ComposerState> {
  const user = await requireUser();

  const db = getDb();

  const accountRows = await db
    .select({ id: socialAccounts.id })
    .from(socialAccounts)
    .where(
      and(eq(socialAccounts.userId, user.id), eq(socialAccounts.platform, "threads")),
    );

  const rawAccounts = formData.get("accounts");
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  const parsed = parseComposerInput(
    {
      caption: text("caption"),
      accountIds: formData
        .getAll("accountIds")
        .filter((value): value is string => typeof value === "string"),
      date: text("date"),
      time: text("time"),
    },
    { allowedAccountIds: accountRows.map((row) => row.id), now: new Date() },
  );

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const { caption, accountIds, scheduledAt, weekStartIso, day } = parsed.value;

  await db.transaction(async (tx) => {
    const [post] = await tx
      .insert(posts)
      .values({ userId: user.id, baseCaption: caption, scheduledAt, status: "scheduled" })
      .returning({ id: posts.id });

    await tx.insert(postTargets).values(
      accountIds.map((accountId) => ({
        postId: post.id,
        accountId,
        contentType: "text",
      })),
    );
  });

  // shortcut: job publish belum dibuat karena handler-nya baru ada di M1;
  // sambungkan pg-boss di sini saat publisher Threads selesai.
  revalidatePath("/");

  redirect(
    buildCalendarHref({
      week: weekStartIso,
      day,
      accounts: typeof rawAccounts === "string" ? rawAccounts : null,
      saved: true,
    }),
  );
}
