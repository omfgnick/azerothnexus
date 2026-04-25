import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminProxyConfig } from "@/app/api/admin/shared";

export async function POST() {
  const config = getAdminProxyConfig();
  if (!config) {
    return NextResponse.json({ error: "ADMIN_API_TOKEN is not configured in the web app." }, { status: 503 });
  }

  const response = await fetch(`${config.apiBaseUrl}/api/admin/refresh/all`, {
    method: "POST",
    headers: {
      "X-Admin-Token": config.adminToken,
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  ["/", "/rankings", "/search", "/compare", "/admin", "/admin/logs"].forEach((path) => revalidatePath(path));
  return NextResponse.json(payload);
}
