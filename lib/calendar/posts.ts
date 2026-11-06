import { and, asc, eq, gte, lt } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  postTargets,
  posts,
  socialAccounts,
  type Platform,
  type PostStatus,
  type TargetStatus,
} from "@/lib/db/schema";
import { calendarStatus } from "./status";
import type { CalendarAccount, CalendarPost } from "./types";
import {
  dayIndex,
  formatClock,
  getZonedNow,
  jakartaWeekRangeUtc,
  type CivilDate,
} from "./week";

const PLATFORM_LABELS: Record<Platform, string> = {
  threads: "Threads",
  instagram: "Instagram",
  tiktok: "TikTok",
};

function shortHandle(handle: string): string {
  return handle.split(".")[0] || handle;
}

type GroupedPost = {
  id: string;
  baseCaption: string;
  postStatus: PostStatus;
  scheduledAt: Date;
  targets: {
    accountId: string;
    status: TargetStatus;
    captionOverride: string | null;
    errorCode: string | null;
    errorMessage: string | null;
  }[];
};

export async function getCalendarData(
  userId: string,
  weekStart: CivilDate,
): Promise<{ accounts: CalendarAccount[]; posts: CalendarPost[] }> {
  const db = getDb();
  const { start, end } = jakartaWeekRangeUtc(weekStart);

  const [accountRows, postRows] = await Promise.all([
    db
      .select({
        id: socialAccounts.id,
        platform: socialAccounts.platform,
        handle: socialAccounts.handle,
        status: socialAccounts.status,
      })
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId))
      .orderBy(asc(socialAccounts.createdAt)),
    db
      .select({
        postId: posts.id,
        baseCaption: posts.baseCaption,
        postStatus: posts.status,
        scheduledAt: posts.scheduledAt,
        accountId: postTargets.accountId,
        targetStatus: postTargets.status,
        captionOverride: postTargets.captionOverride,
        errorCode: postTargets.errorCode,
        errorMessage: postTargets.errorMessage,
      })
      .from(posts)
      .leftJoin(postTargets, eq(postTargets.postId, posts.id))
      .where(
        and(
          eq(posts.userId, userId),
          gte(posts.scheduledAt, start),
          lt(posts.scheduledAt, end),
        ),
      )
      .orderBy(asc(posts.scheduledAt), asc(postTargets.createdAt)),
  ]);

  const accounts = accountRows.map((account) => ({
    id: account.id,
    platform: account.platform,
    label: PLATFORM_LABELS[account.platform],
    handle: account.handle,
    short: shortHandle(account.handle),
    needsReconnect: account.status === "needs_reconnect",
  }));

  const grouped = new Map<string, GroupedPost>();
  for (const row of postRows) {
    if (!row.scheduledAt) {
      continue;
    }

    let post = grouped.get(row.postId);
    if (!post) {
      post = {
        id: row.postId,
        baseCaption: row.baseCaption,
        postStatus: row.postStatus,
        scheduledAt: row.scheduledAt,
        targets: [],
      };
      grouped.set(row.postId, post);
    }

    if (row.accountId && row.targetStatus) {
      post.targets.push({
        accountId: row.accountId,
        status: row.targetStatus,
        captionOverride: row.captionOverride,
        errorCode: row.errorCode,
        errorMessage: row.errorMessage,
      });
    }
  }

  const calendarPosts: CalendarPost[] = [];
  for (const post of grouped.values()) {
    const zoned = getZonedNow(post.scheduledAt);
    const day = dayIndex(weekStart, zoned.date);
    if (day === null) {
      continue;
    }

    const failed = post.targets.find((target) => target.status === "failed");
    const error = failed?.errorMessage ?? failed?.errorCode ?? undefined;
    const override = post.targets.find((target) => target.captionOverride?.trim());
    const caption =
      post.baseCaption.trim() ||
      override?.captionOverride?.trim() ||
      "Tanpa caption";

    calendarPosts.push({
      id: post.id,
      day,
      time: formatClock(zoned.minutes),
      targets: [...new Set(post.targets.map((target) => target.accountId))],
      status: calendarStatus(
        post.targets.map((target) => target.status),
        post.postStatus,
      ),
      caption,
      ...(error ? { error } : {}),
    });
  }

  calendarPosts.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));

  return { accounts, posts: calendarPosts };
}
