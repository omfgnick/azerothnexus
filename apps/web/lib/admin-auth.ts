export const ADMIN_SESSION_COOKIE_NAME = "azeroth_nexus_admin_session";

type AdminCredentials = {
  username: string;
  password: string;
  sessionSecret: string;
};

export function getAdminCredentials(): AdminCredentials {
  return {
    username: process.env.ADMIN_USERNAME?.trim() || "",
    password: process.env.ADMIN_PASSWORD?.trim() || "",
    sessionSecret: process.env.ADMIN_SESSION_SECRET?.trim() || "",
  };
}

export function isAdminLoginConfigured(): boolean {
  const credentials = getAdminCredentials();
  return Boolean(credentials.username && credentials.password && credentials.sessionSecret);
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const credentials = getAdminCredentials();
  return Boolean(
    credentials.username &&
      credentials.password &&
      username.trim() === credentials.username &&
      password === credentials.password,
  );
}

export function isAdminSessionValueValid(value: string | null | undefined): boolean {
  const credentials = getAdminCredentials();
  return Boolean(credentials.sessionSecret && value && value === credentials.sessionSecret);
}

export function getAdminSessionCookieValue(): string {
  return getAdminCredentials().sessionSecret;
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}
