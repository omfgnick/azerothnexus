import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { LOCALE_COOKIE_NAME, SUPPORTED_LOCALES } from "@/lib/locale";

type LocaleRequest = {
  locale?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LocaleRequest;
  const locale = body.locale;

  if (!locale || !SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) {
    return NextResponse.json({ error: "Unsupported locale." }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  return NextResponse.json({ ok: true, locale });
}
