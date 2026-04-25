import { resolveInternalApiBaseUrl } from "@/lib/api";

export function getAdminProxyConfig() {
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) {
    return null;
  }

  return {
    adminToken,
    apiBaseUrl: resolveInternalApiBaseUrl(),
  };
}
