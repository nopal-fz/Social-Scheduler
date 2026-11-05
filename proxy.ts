import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const userId = token ? verifySessionToken(token, getEnv().SESSION_SECRET) : null;

  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|icon.svg|favicon.ico).*)"],
};
