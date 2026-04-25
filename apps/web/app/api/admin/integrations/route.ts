import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminProxyConfig } from "@/app/api/admin/shared";

export async function PUT(request: Request) {
  const config = getAdminProxyConfig();
  if (!config) {
    return NextResponse.json({ error: "ADMIN_API_TOKEN is not configured in the web app." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const response = await fetch(`${config.apiBaseUrl}/api/admin/settings/integrations`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": config.adminToken,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/integrations");
  revalidatePath("/admin/logs");
  return NextResponse.json(payload);
}
