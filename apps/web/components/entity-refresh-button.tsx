"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useLocaleCopy } from "@/components/locale-provider";

type EntityRefreshButtonProps = {
  entityType: "guild" | "character";
  region: string;
  realm: string;
  name: string;
  pathName: string;
};

export function EntityRefreshButton({ entityType, region, realm, name, pathName }: EntityRefreshButtonProps) {
  const { copy } = useLocaleCopy();
  const labels = copy.adminComponents;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entityType,
        region,
        realm,
        name,
        pathName,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload?.detail || payload?.error || labels.entityRefreshError);
      return;
    }

    setMessage(payload?.external_refresh_performed ? labels.entityRefreshProviders : labels.entityRefreshSnapshots);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isPending}
        className="arcane-button-secondary min-h-[44px] px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? labels.entityRefreshWorking : labels.entityRefreshButton}
      </button>
      {message ? <p className="text-xs uppercase tracking-[0.16em] text-emerald-200/80">{message}</p> : null}
      {error ? <p className="text-xs uppercase tracking-[0.16em] text-rose-200/80">{error}</p> : null}
    </div>
  );
}
