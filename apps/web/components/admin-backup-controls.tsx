"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useLocaleCopy } from "@/components/locale-provider";

type AdminBackupControlsProps = {
  label?: string;
};

export function AdminBackupControls({ label }: AdminBackupControlsProps) {
  const { copy } = useLocaleCopy();
  const labels = copy.adminComponents;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isWorking, setIsWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBackup() {
    setMessage(null);
    setError(null);
    setIsWorking(true);

    const response = await fetch("/api/admin/backups", {
      method: "POST",
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload?.detail || payload?.error || labels.backupError);
      setIsWorking(false);
      return;
    }

    setMessage(payload?.filename ? `${labels.backupCreated}: ${payload.filename}` : `${labels.backupCreated}.`);
    startTransition(() => {
      router.refresh();
      setIsWorking(false);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={handleBackup} disabled={isPending || isWorking} className="arcane-button min-h-[48px] px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending || isWorking ? labels.backupWorking : label ?? labels.backupNow}
      </button>
      {message ? <p className="text-xs uppercase tracking-[0.16em] text-emerald-200/80">{message}</p> : null}
      {error ? <p className="text-xs uppercase tracking-[0.16em] text-rose-200/80">{error}</p> : null}
    </div>
  );
}
