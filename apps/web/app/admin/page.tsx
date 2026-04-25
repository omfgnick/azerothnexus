import Link from "next/link";

import { AdminBackupControls } from "@/components/admin-backup-controls";
import { DataStateBanner } from "@/components/data-state-banner";
import { AdminRefreshAllButton } from "@/components/admin-refresh-all-button";
import { getAdminDashboard, isFallbackData } from "@/lib/api";

function formatTime(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export default async function AdminPage() {
  const dashboard = await getAdminDashboard();
  const integrationEntries = Object.values(dashboard.integrations?.providers ?? {}) as Array<Record<string, unknown>>;
  const configuredProviders = integrationEntries.filter((provider) => Boolean(provider.configured)).length;
  const latestBackup = (dashboard.backups?.latest ?? null) as Record<string, unknown> | null;

  return (
    <div className="space-y-8">
      {isFallbackData(dashboard) ? (
        <DataStateBanner
          title="Admin dashboard indisponivel"
          description="O frontend admin nao conseguiu buscar o dashboard protegido neste ciclo. Revise o login e a configuracao operacional do web server."
          error={dashboard._requestError}
        />
      ) : null}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Tracked guilds", String(dashboard.tracked_counts.guilds)],
          ["Tracked characters", String(dashboard.tracked_counts.characters)],
          ["Configured providers", String(configuredProviders)],
          ["Backups", String(dashboard.backups?.count ?? 0)],
        ].map(([title, text]) => (
          <div key={title} className="data-slab">
            <h2 className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h2>
            <p className="mt-3 text-sm text-white/60">{text}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="panel panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Provider health</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                External services
              </h2>
            </div>
            <div className="rune-pill">{dashboard.providers.length} providers</div>
          </div>

          <div className="mt-6 space-y-3">
            {dashboard.providers.map((provider: Record<string, unknown>) => (
              <div key={String(provider.provider)} className="data-slab">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {String(provider.provider)}
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      {provider.configured ? "Configured and ready" : "Blocked, disabled, or missing credentials"}
                    </div>
                  </div>
                  <div className="rune-pill">{provider.configured ? "Ready" : "Blocked"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Auto refresh</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Scheduler status
              </h2>
            </div>
            <div className="rune-pill">{dashboard.auto_refresh.latest_cycle_status}</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Latest cycle</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {formatTime(dashboard.auto_refresh.latest_cycle_at)}
              </div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Last error</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {formatTime(dashboard.auto_refresh.last_error_at)}
              </div>
            </div>
          </div>

          {dashboard.auto_refresh.last_error_payload ? (
            <pre className="mt-5 overflow-x-auto rounded-[1.6rem] border border-white/10 bg-black/30 p-4 text-sm text-white/80">
              {JSON.stringify(dashboard.auto_refresh.last_error_payload, null, 2)}
            </pre>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="panel panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Latest jobs</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Provider and internal activity
              </h2>
            </div>
            <div className="rune-pill">{dashboard.latest_jobs.length} recent jobs</div>
          </div>

          <div className="mt-6 space-y-3">
            {dashboard.latest_jobs.map((job: Record<string, unknown>, index: number) => (
              <div key={`${String(job.provider)}-${String(job.job_type)}-${index}`} className="data-slab">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {String(job.provider)} / {String(job.job_type)}
                    </div>
                    <div className="mt-2 text-sm text-white/60">{formatTime(String(job.created_at))}</div>
                  </div>
                  <div className="rune-pill">{String(job.status)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Quick actions</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Operational runes
              </h2>
            </div>
            <div className="rune-pill">{Math.round((dashboard.auto_refresh.interval_seconds ?? 600) / 60)} min cadence</div>
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row">
            <AdminRefreshAllButton />
            <AdminBackupControls label="Gerar backup imediato" />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { href: "/admin/integrations", label: "Integrations", copy: "Configurar Blizzard, Raider.IO e Warcraft Logs." },
              { href: "/admin/backups", label: "Backups", copy: "Gerar, listar e baixar snapshots completos do banco." },
              { href: "/admin/logs", label: "Logs", copy: "Timeline unificada de requests, acoes admin e jobs de sync." },
            ].map((entry) => (
              <Link key={entry.href} href={entry.href} className="data-slab transition hover:border-gold/30 hover:bg-white/[0.05]">
                <div className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {entry.label}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/60">{entry.copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="panel panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Snapshots and rankings</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Latest ladder rebuilds
              </h2>
            </div>
            <div className="rune-pill">{dashboard.latest_snapshots.length} recent snapshots</div>
          </div>

          <div className="mt-6 space-y-3">
            {dashboard.latest_snapshots.map((snapshot: Record<string, unknown>, index: number) => (
              <div key={`${String(snapshot.ladder_type)}-${index}`} className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{String(snapshot.scope)}</div>
                <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {String(snapshot.ladder_type)}
                </div>
                <p className="mt-3 text-sm text-white/60">{formatTime(String(snapshot.created_at))}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Backup and audit</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Control archive
              </h2>
            </div>
            <div className="rune-pill">{dashboard.audit_summary?.total_recent ?? 0} recent log entries</div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Latest backup</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {String(latestBackup?.filename ?? "None yet")}
              </div>
              <p className="mt-3 text-sm text-white/60">{formatTime(String(latestBackup?.created_at ?? ""))}</p>
            </div>

            {[
              ["Request logs", String(dashboard.audit_summary?.request_logs ?? 0)],
              ["Admin actions", String(dashboard.audit_summary?.admin_actions ?? 0)],
              ["Backup events", String(dashboard.audit_summary?.backup_actions ?? 0)],
            ].map(([label, value]) => (
              <div key={label} className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{label}</div>
                <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="panel panel-section">
        <p className="eyebrow">Access ward</p>
        <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
          Protected header
        </h2>
        <pre className="mt-5 overflow-x-auto rounded-[1.6rem] border border-white/10 bg-black/30 p-4 text-sm text-white/80">{`X-Admin-Token: your-ops-token`}</pre>
      </div>
    </div>
  );
}
