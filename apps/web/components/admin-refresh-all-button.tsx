"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function AdminRefreshAllButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isWorking, setIsWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRefreshAll() {
    setMessage(null);
    setError(null);
    setIsWorking(true);

    const response = await fetch("/api/admin/refresh-all", {
      method: "POST",
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload?.detail || payload?.error || "Falha ao atualizar entidades rastreadas.");
      setIsWorking(false);
      return;
    }

    const guilds = Number(payload?.refreshed?.guilds ?? 0);
    const characters = Number(payload?.refreshed?.characters ?? 0);
    setMessage(`Refresh concluido: ${guilds} guilds e ${characters} personagens.`);
    startTransition(() => {
      router.refresh();
      setIsWorking(false);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleRefreshAll}
        disabled={isPending || isWorking}
        className="arcane-button-secondary min-h-[48px] px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending || isWorking ? "Sincronizando..." : "Atualizar tudo agora"}
      </button>
      {message ? <p className="text-xs uppercase tracking-[0.16em] text-emerald-200/80">{message}</p> : null}
      {error ? <p className="text-xs uppercase tracking-[0.16em] text-rose-200/80">{error}</p> : null}
    </div>
  );
}
