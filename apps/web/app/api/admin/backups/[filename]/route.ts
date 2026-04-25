import { NextResponse } from "next/server";

import { getAdminProxyConfig } from "@/app/api/admin/shared";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const config = getAdminProxyConfig();
  if (!config) {
    return NextResponse.json({ error: "ADMIN_API_TOKEN is not configured in the web app." }, { status: 503 });
  }

  const { filename } = await context.params;
  const response = await fetch(`${config.apiBaseUrl}/api/admin/backups/${encodeURIComponent(filename)}`, {
    headers: {
      "X-Admin-Token": config.adminToken,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      "Content-Disposition": response.headers.get("content-disposition") ?? `attachment; filename="${filename}"`,
    },
  });
}
