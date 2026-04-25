import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type RefreshRequest = {
  entityType?: "guild" | "character";
  region?: string;
  realm?: string;
  name?: string;
  pathName?: string;
};

function resolveApiBaseUrl() {
  const candidates = [
    process.env.INTERNAL_API_BASE_URL,
    process.env.API_BASE_URL_INTERNAL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "http://localhost:8000",
  ];

  for (const candidate of candidates) {
    if (candidate && /^https?:\/\//.test(candidate)) {
      return candidate.replace(/\/$/, "");
    }
  }

  return "http://localhost:8000";
}

function pathsToRevalidate(entityType: "guild" | "character", region: string, realm: string, pathName: string) {
  const specific =
    entityType === "guild"
      ? `/guild/${region}/${realm}/${encodeURIComponent(pathName)}`
      : `/character/${region}/${realm}/${encodeURIComponent(pathName)}`;

  return [specific, "/", "/rankings", "/search", "/compare"];
}

export async function POST(request: Request) {
  const body = (await request.json()) as RefreshRequest;
  const entityType = body.entityType;
  const region = body.region?.trim().toLowerCase();
  const realm = body.realm?.trim().toLowerCase();
  const name = body.name?.trim();
  const pathName = body.pathName?.trim();

  if (!entityType || !region || !realm || !name || !["guild", "character"].includes(entityType)) {
    return NextResponse.json({ error: "Invalid refresh payload." }, { status: 400 });
  }
  const resolvedPathName = pathName || name;

  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ error: "ADMIN_API_TOKEN is not configured in the web app." }, { status: 503 });
  }

  const apiBaseUrl = resolveApiBaseUrl();
  const backendUrl = `${apiBaseUrl}/api/admin/refresh/${entityType}/${encodeURIComponent(region)}/${encodeURIComponent(realm)}/${encodeURIComponent(name)}`;
  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": adminToken,
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  for (const path of pathsToRevalidate(entityType, region, realm, resolvedPathName)) {
    revalidatePath(path);
  }

  return NextResponse.json(payload);
}
