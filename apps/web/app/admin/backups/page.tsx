import { AdminBackupControls } from "@/components/admin-backup-controls";
import { AdminBackupRestoreControls } from "@/components/admin-backup-restore-controls";
import { IconFrame, GuildSigilIcon } from "@/components/nexus-icons";
import { getAdminBackups } from "@/lib/api";

function formatTime(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

function formatBytes(value?: number) {
  const size = Number(value ?? 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default async function AdminBackupsPage() {
  const backups = await getAdminBackups();
  const backupItems = (backups.items ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["Backup files", String(backups.count ?? 0)],
          ["Directory", String(backups.directory ?? "/var/backups/azerothnexus")],
          ["Latest file", String(backupItems[0]?.filename ?? "None yet")],
        ].map(([title, value]) => (
          <div key={title} className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{title}</div>
            <div className="mt-3 text-2xl text-white break-all" style={{ fontFamily: "var(--font-display)" }}>
              {value}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="panel panel-section">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Snapshot control</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Database exports
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                Cada backup gera um JSON completo com todas as tabelas conhecidas do Azeroth Nexus. Agora o painel tambem permite restaurar um snapshot listado com backup de seguranca opcional antes da troca.
              </p>
            </div>
            <IconFrame className="hidden h-14 w-14 rounded-[1.2rem] md:inline-flex" tone="gold">
              <GuildSigilIcon className="h-7 w-7" />
            </IconFrame>
          </div>

          <div className="mt-6">
            <AdminBackupControls />
          </div>
        </div>

        <div className="panel panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Archive list</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Persisted snapshots
              </h2>
            </div>
            <div className="rune-pill">{backups.count ?? 0} files</div>
          </div>

          <div className="mt-6 space-y-3">
            {backupItems.length ? (
              backupItems.map((item) => (
                <div key={String(item.filename)} className="data-slab">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-xl text-white break-all" style={{ fontFamily: "var(--font-display)" }}>
                        {String(item.filename)}
                      </div>
                      <div className="mt-2 text-sm text-white/60">
                        {formatTime(String(item.created_at))} • {formatBytes(Number(item.size_bytes ?? 0))}
                      </div>
                      <div className="mt-3 text-xs uppercase tracking-[0.16em] text-white/45 break-all">{String(item.sha256)}</div>
                    </div>
                    <AdminBackupRestoreControls filename={String(item.filename)} />
                  </div>
                </div>
              ))
            ) : (
              <div className="data-slab">
                <div className="text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  No backups yet
                </div>
                <p className="mt-3 text-sm leading-6 text-white/60">Gere o primeiro snapshot para começar a manter exportações completas do banco.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
