"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useLocaleCopy } from "@/components/locale-provider";

type AdminBackupRestoreControlsProps = {
  filename: string;
};

export function AdminBackupRestoreControls({ filename }: AdminBackupRestoreControlsProps) {
  const { copy } = useLocaleCopy();
  const labels = copy.adminComponents;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isWorking, setIsWorking] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [createBackupBeforeRestore, setCreateBackupBeforeRestore] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRestore() {
    const confirmed = window.confirm(`${labels.restoreConfirm}\n\n${filename}`);
    if (!confirmed) {
      return;
    }

    setIsWorking(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/backups/restore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename,
        replace_existing: replaceExisting,
        create_backup_before_restore: createBackupBeforeRestore,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setIsWorking(false);
      setError(payload?.detail || payload?.error || labels.restoreError);
      return;
    }

    setMessage(
      payload?.safety_backup?.filename
        ? `${labels.restoreComplete} ${payload.safety_backup.filename}`
        : labels.restoreComplete,
    );
    startTransition(() => {
      router.refresh();
      setIsWorking(false);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-white/55">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={replaceExisting} onChange={(event) => setReplaceExisting(event.target.checked)} />
          {labels.replaceCurrentData}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={createBackupBeforeRestore}
            onChange={(event) => setCreateBackupBeforeRestore(event.target.checked)}
          />
          {labels.createSafetyBackup}
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRestore}
          disabled={isPending || isWorking}
          className="arcane-button min-h-[46px] px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending || isWorking ? labels.restoreWorking : labels.restoreButton}
        </button>
        <a href={`/api/admin/backups/${encodeURIComponent(filename)}`} className="arcane-button-secondary min-h-[46px] px-5 py-3">
          {labels.downloadBackup}
        </a>
      </div>

      {message ? <p className="text-xs uppercase tracking-[0.16em] text-emerald-200/80">{message}</p> : null}
      {error ? <p className="text-xs uppercase tracking-[0.16em] text-rose-200/80">{error}</p> : null}
    </div>
  );
}
