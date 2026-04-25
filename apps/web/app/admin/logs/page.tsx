import { IconFrame, WarboardSigilIcon } from "@/components/nexus-icons";
import { getAdminLogs } from "@/lib/api";
import { formatDateTime, getDictionary } from "@/lib/locale";

export default async function AdminLogsPage() {
  const { locale, copy } = await getDictionary();
  const labels = copy.adminLogs;
  const logs = await getAdminLogs();

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-4">
        {[
          [labels.recentEntries, String(logs.summary?.total_recent ?? 0)],
          [labels.requestLogs, String(logs.summary?.request_logs ?? 0)],
          [labels.adminActions, String(logs.summary?.admin_actions ?? 0)],
          [labels.backupActions, String(logs.summary?.backup_actions ?? 0)],
        ].map(([title, value]) => (
          <div key={title} className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{title}</div>
            <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {value}
            </div>
          </div>
        ))}
      </section>

      <section className="panel panel-section">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{labels.timelineEyebrow}</p>
            <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {labels.timelineTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">{labels.timelineDescription}</p>
          </div>
          <IconFrame className="hidden h-14 w-14 rounded-[1.2rem] md:inline-flex" tone="violet">
            <WarboardSigilIcon className="h-7 w-7" />
          </IconFrame>
        </div>

        <div className="mt-6 space-y-3">
          {(logs.timeline ?? []).length ? (
            logs.timeline.map((entry: Record<string, unknown>, index: number) => (
              <div key={`${String(entry.kind)}-${String(entry.id)}-${index}`} className="data-slab">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                        {String(entry.action)}
                      </div>
                      <div className="rune-pill">{String(entry.kind)}</div>
                      {"status" in entry ? <div className="rune-pill">{String(entry.status)}</div> : null}
                    </div>
                    <div className="mt-3 text-sm text-white/60">
                      {formatDateTime(String(entry.created_at), locale)} · {String(entry.actor ?? labels.systemActor)}
                    </div>
                  </div>
                </div>

                <pre className="mt-5 overflow-x-auto rounded-[1.3rem] border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/78">
                  {JSON.stringify(entry.details ?? {}, null, 2)}
                </pre>
              </div>
            ))
          ) : (
            <div className="data-slab">
              <div className="text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.noEntries}
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">{labels.noEntriesDescription}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
