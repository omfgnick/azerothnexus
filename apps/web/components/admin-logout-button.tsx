"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);

  async function handleLogout() {
    setIsWorking(true);
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isWorking}
      className="nav-link disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isWorking ? "Leaving..." : label}
    </button>
  );
}
