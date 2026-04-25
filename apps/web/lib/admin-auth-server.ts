import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE_NAME, isAdminSessionValueValid } from "@/lib/admin-auth";

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return isAdminSessionValueValid(cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value);
}
