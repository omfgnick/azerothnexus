const DEFAULT_PUBLIC_API_BASE_URL = "http://localhost:8000";

export function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

export function isAbsoluteUrl(value: string) {
  return /^https?:\/\//.test(value);
}

export function joinApiUrl(baseUrl: string | undefined | null, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const rawBase = (baseUrl ?? "").trim();

  if (!rawBase) {
    return normalizedPath;
  }

  const normalizedBase = normalizeBaseUrl(rawBase);
  if (normalizedBase === "/api" && normalizedPath.startsWith("/api/")) {
    return normalizedPath;
  }

  if (normalizedBase.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${normalizedBase}${normalizedPath.slice(4)}`;
  }

  return `${normalizedBase}${normalizedPath}`;
}

export function resolvePublicApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_PUBLIC_API_BASE_URL;
}
