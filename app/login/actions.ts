"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password";
import { createRateLimiter, type RateLimiter } from "@/lib/auth/rate-limit";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSessionToken } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getEnv } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const globalForLimiter = globalThis as typeof globalThis & {
  __jadwalinLoginLimiter?: RateLimiter;
};

// Cached on globalThis so the limit survives dev module reloads.
const limiter = (globalForLimiter.__jadwalinLoginLimiter ??= createRateLimiter({
  limit: 5,
  windowMs: 15 * 60 * 1000,
}));

function fail(code: "invalid" | "rate"): never {
  redirect(`/login?error=${code}`);
}

export async function login(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    fail("invalid");
  }

  // Keyed by email, not IP: stable across connections and enough for a single-owner app.
  if (!limiter.consume(parsed.data.email)) {
    fail("rate");
  }

  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    fail("invalid");
  }

  (await cookies()).set(SESSION_COOKIE, createSessionToken(user.id, getEnv().SESSION_SECRET), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  redirect("/");
}
