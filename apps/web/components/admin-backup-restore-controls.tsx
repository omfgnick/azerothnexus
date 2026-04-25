"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminBackupRestoreControlsProps = {
  filename: string;
};

export function AdminBackupRestoreControls({ filename }: AdminBackupRestoreControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isWorking, setIsWorking] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [createBackupBeforeRestore, setCreateBackupBeforeRestore] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRestore() {
    const confirmed = window.confirm(`Restore backup "${filename}"? This can replace current data.`);
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
      setError(payload?.detail || payload?.error || "Restore failed.");
      return;
    }

    setMessage(
      payload?.safety_backup?.filename
        ? `Restore complete. Safety backup: ${payload.safety_backup.filename}`
        : "Restore complete.",
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
          Replace current data
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={createBackupBeforeRestore}
            onChange={(event) => setCreateBackupBeforeRestore(event.target.checked)}
          />
          Create safety backup first
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRestore}
          disabled={isPending || isWorking}
          className="arcane-button min-h-[46px] px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending || isWorking ? "Restoring..." : "Restore backup"}
        </button>
        <a href={`/api/admin/backups/${encodeURIComponent(filename)}`} className="arcane-button-secondary min-h-[46px] px-5 py-3">
          Download backup
        </a>
      </div>

      {message ? <p className="text-xs uppercase tracking-[0.16em] text-emerald-200/80">{message}</p> : null}
      {error ? <p className="text-xs uppercase tracking-[0.16em] text-rose-200/80">{error}</p> : null}
    </div>
  );
}
