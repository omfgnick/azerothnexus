import { AdminBackupControls } from "@/components/admin-backup-controls";
import { AdminBackupRestoreControls } from "@/components/admin-backup-restore-controls";
import { IconFrame, GuildSigilIcon } from "@/components/nexus-icons";
import { getAdminBackups } from "@/lib/api";
import { formatDateTime, getDictionary } from "@/lib/locale";

function formatBytes(value?: number) {
  const size = Number(value ?? 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default async function AdminBackupsPage() {
  const { locale, copy } = await getDictionary();
  const labels = copy.adminBackups;
  const backups = await getAdminBackups();
  const backupItems = (backups.items ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-3">
        {[
          [labels.backupFiles, String(backups.count ?? 0)],
          [labels.directory, String(backups.directory ?? "/var/backups/azerothnexus")],
          [labels.latestFile, String(backupItems[0]?.filename ?? copy.shared.noneYet)],
        ].map(([title, value]) => (
          <div key={title} className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{title}</div>
            <div className="mt-3 break-all text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {value}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="panel panel-section">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{labels.snapshotControlEyebrow}</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.snapshotControlTitle}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">{labels.snapshotControlDescription}</p>
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
              <p className="eyebrow">{labels.archiveListEyebrow}</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.archiveListTitle}
              </h2>
            </div>
            <div className="rune-pill">{backups.count ?? 0} {labels.files}</div>
          </div>

          <div className="mt-6 space-y-3">
            {backupItems.length ? (
              backupItems.map((item) => (
                <div key={String(item.filename)} className="data-slab">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="break-all text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                        {String(item.filename)}
                      </div>
                      <div className="mt-2 text-sm text-white/60">
                        {formatDateTime(String(item.created_at), locale)} · {formatBytes(Number(item.size_bytes ?? 0))}
                      </div>
                      <div className="mt-3 break-all text-xs uppercase tracking-[0.16em] text-white/45">{String(item.sha256)}</div>
                    </div>
                    <AdminBackupRestoreControls filename={String(item.filename)} />
                  </div>
                </div>
              ))
            ) : (
              <div className="data-slab">
                <div className="text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {labels.noBackups}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/60">{labels.noBackupsDescription}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
