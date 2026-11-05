import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const platforms = ["threads", "instagram", "tiktok"] as const;
export type Platform = (typeof platforms)[number];

export const accountStatuses = ["active", "needs_reconnect"] as const;
export type AccountStatus = (typeof accountStatuses)[number];

export const postStatuses = ["draft", "scheduled", "done", "partial", "failed"] as const;
export type PostStatus = (typeof postStatuses)[number];

export const targetStatuses = ["scheduled", "publishing", "published", "failed"] as const;
export type TargetStatus = (typeof targetStatuses)[number];

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  timezone: text("timezone").notNull().default("Asia/Jakarta"),
  ...timestamps,
});

export const socialAccounts = pgTable(
  "social_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: text("platform").$type<Platform>().notNull(),
    externalId: text("external_id").notNull(),
    handle: text("handle").notNull(),
    accessTokenEnc: text("access_token_enc").notNull(),
    refreshTokenEnc: text("refresh_token_enc"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    status: text("status").$type<AccountStatus>().notNull().default("active"),
    ...timestamps,
  },
  (table) => [uniqueIndex("social_accounts_platform_external_id_idx").on(table.platform, table.externalId)],
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    baseCaption: text("base_caption").notNull().default(""),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    status: text("status").$type<PostStatus>().notNull().default("draft"),
    ...timestamps,
  },
  (table) => [index("posts_scheduled_at_idx").on(table.scheduledAt)],
);

export const postTargets = pgTable(
  "post_targets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => socialAccounts.id, { onDelete: "cascade" }),
    contentType: text("content_type").notNull(),
    captionOverride: text("caption_override"),
    status: text("status").$type<TargetStatus>().notNull().default("scheduled"),
    attempts: integer("attempts").notNull().default(0),
    creationId: text("creation_id"),
    externalPostId: text("external_post_id"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("post_targets_post_id_idx").on(table.postId),
    index("post_targets_account_id_idx").on(table.accountId),
  ],
);
