import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME, isAdminSessionValueValid } from "@/lib/admin-auth";

function unauthorizedJson() {
  return NextResponse.json({ error: "Admin login required." }, { status: 401 });
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-pathname", pathname);

  const sessionValue = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = isAdminSessionValueValid(sessionValue);

  if (pathname === "/api/refresh" && !isAuthenticated) {
    return unauthorizedJson();
  }

  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/session" && !isAuthenticated) {
    return unauthorizedJson();
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/refresh"],
};
