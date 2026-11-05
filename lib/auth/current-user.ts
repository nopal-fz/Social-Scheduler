import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getEnv } from "@/lib/env";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export type CurrentUser = {
  id: string;
  email: string;
  timezone: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Auth reads request state, so never prerender this route.
  await connection();

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const userId = verifySessionToken(token, getEnv().SESSION_SECRET);
  if (!userId) {
    return null;
  }

  const [user] = await getDb()
    .select({ id: users.id, email: users.email, timezone: users.timezone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
