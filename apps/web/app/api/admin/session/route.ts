import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminSessionCookieOptions,
  isAdminLoginConfigured,
  isAdminSessionValueValid,
  getAdminSessionCookieValue,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

type SessionRequest = {
  username?: string;
  password?: string;
};

export async function GET() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return NextResponse.json({
    authenticated: isAdminSessionValueValid(sessionValue),
  });
}

export async function POST(request: Request) {
  if (!isAdminLoginConfigured()) {
    return NextResponse.json({ error: "Admin login is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as SessionRequest;
  if (!verifyAdminCredentials(body.username ?? "", body.password ?? "")) {
    return NextResponse.json({ error: "Invalid admin username or password." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, getAdminSessionCookieValue(), getAdminSessionCookieOptions());
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
