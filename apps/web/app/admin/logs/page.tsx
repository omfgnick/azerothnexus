import { IconFrame, WarboardSigilIcon } from "@/components/nexus-icons";
import { getAdminLogs } from "@/lib/api";

function formatTime(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export default async function AdminLogsPage() {
  const logs = await getAdminLogs();

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-4">
        {[
          ["Recent entries", String(logs.summary?.total_recent ?? 0)],
          ["Request logs", String(logs.summary?.request_logs ?? 0)],
          ["Admin actions", String(logs.summary?.admin_actions ?? 0)],
          ["Backup actions", String(logs.summary?.backup_actions ?? 0)],
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
            <p className="eyebrow">Unified timeline</p>
            <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              Audit and sync stream
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
              Esta timeline mistura logs de request, ações administrativas e jobs de sync, tudo em ordem cronológica reversa.
            </p>
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
                      {formatTime(String(entry.created_at))} • {String(entry.actor ?? "system")}
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
                No log entries yet
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">Assim que o sistema receber requests, syncs ou ações administrativas, a timeline começa a preencher.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
