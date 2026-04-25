import Link from "next/link";

import { AdminBackupControls } from "@/components/admin-backup-controls";
import { DataStateBanner } from "@/components/data-state-banner";
import { AdminRefreshAllButton } from "@/components/admin-refresh-all-button";
import { getAdminDashboard, isFallbackData } from "@/lib/api";
import { formatDateTime, getDictionary } from "@/lib/locale";

export default async function AdminPage() {
  const { locale, copy } = await getDictionary();
  const labels = copy.adminOverview;
  const dashboard = await getAdminDashboard();
  const integrationEntries = Object.values(dashboard.integrations?.providers ?? {}) as Array<Record<string, unknown>>;
  const configuredProviders = integrationEntries.filter((provider) => Boolean(provider.configured)).length;
  const latestBackup = (dashboard.backups?.latest ?? null) as Record<string, unknown> | null;

  return (
    <div className="space-y-8">
      {isFallbackData(dashboard) ? (
        <DataStateBanner
          title={labels.bannerTitle}
          description={labels.bannerDescription}
          error={dashboard._requestError}
          detailLabel={copy.dataState.technicalDetail}
        />
      ) : null}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          [labels.trackedGuilds, String(dashboard.tracked_counts.guilds)],
          [labels.trackedCharacters, String(dashboard.tracked_counts.characters)],
          [labels.configuredProviders, String(configuredProviders)],
          [labels.backups, String(dashboard.backups?.count ?? 0)],
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
              <p className="eyebrow">{labels.providerHealthEyebrow}</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.providerHealthTitle}
              </h2>
            </div>
            <div className="rune-pill">{dashboard.providers.length} {labels.providersCount}</div>
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
                      {provider.configured ? labels.configuredAndReady : labels.blockedOrMissing}
                    </div>
                  </div>
                  <div className="rune-pill">{provider.configured ? labels.ready : labels.blocked}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">{labels.autoRefreshEyebrow}</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.autoRefreshTitle}
              </h2>
            </div>
            <div className="rune-pill">{dashboard.auto_refresh.latest_cycle_status}</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.latestCycle}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {formatDateTime(dashboard.auto_refresh.latest_cycle_at, locale, labels.notAvailable)}
              </div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.lastError}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {formatDateTime(dashboard.auto_refresh.last_error_at, locale, labels.notAvailable)}
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
              <p className="eyebrow">{labels.latestJobsEyebrow}</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.latestJobsTitle}
              </h2>
            </div>
            <div className="rune-pill">{dashboard.latest_jobs.length} {labels.recentJobs}</div>
          </div>

          <div className="mt-6 space-y-3">
            {dashboard.latest_jobs.map((job: Record<string, unknown>, index: number) => (
              <div key={`${String(job.provider)}-${String(job.job_type)}-${index}`} className="data-slab">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {String(job.provider)} / {String(job.job_type)}
                    </div>
                    <div className="mt-2 text-sm text-white/60">{formatDateTime(String(job.created_at), locale, labels.notAvailable)}</div>
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
              <p className="eyebrow">{labels.quickActionsEyebrow}</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.quickActionsTitle}
              </h2>
            </div>
            <div className="rune-pill">{Math.round((dashboard.auto_refresh.interval_seconds ?? 600) / 60)} min {labels.cadence}</div>
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row">
            <AdminRefreshAllButton />
            <AdminBackupControls label={labels.generateBackup} />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { href: "/admin/integrations", label: labels.integrations, copy: labels.integrationsCopy },
              { href: "/admin/backups", label: labels.backups, copy: labels.backupsCopy },
              { href: "/admin/logs", label: labels.logs, copy: labels.logsCopy },
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
              <p className="eyebrow">{labels.snapshotsEyebrow}</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.snapshotsTitle}
              </h2>
            </div>
            <div className="rune-pill">{dashboard.latest_snapshots.length} {labels.recentSnapshots}</div>
          </div>

          <div className="mt-6 space-y-3">
            {dashboard.latest_snapshots.map((snapshot: Record<string, unknown>, index: number) => (
              <div key={`${String(snapshot.ladder_type)}-${index}`} className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{String(snapshot.scope)}</div>
                <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {String(snapshot.ladder_type)}
                </div>
                <p className="mt-3 text-sm text-white/60">{formatDateTime(String(snapshot.created_at), locale, labels.notAvailable)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">{labels.backupAuditEyebrow}</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.backupAuditTitle}
              </h2>
            </div>
            <div className="rune-pill">{dashboard.audit_summary?.total_recent ?? 0} {labels.recentLogEntries}</div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.latestBackup}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {String(latestBackup?.filename ?? copy.shared.noneYet)}
              </div>
              <p className="mt-3 text-sm text-white/60">{formatDateTime(String(latestBackup?.created_at ?? ""), locale, labels.notAvailable)}</p>
            </div>

            {[
              [labels.requestLogs, String(dashboard.audit_summary?.request_logs ?? 0)],
              [labels.adminActions, String(dashboard.audit_summary?.admin_actions ?? 0)],
              [labels.backupEvents, String(dashboard.audit_summary?.backup_actions ?? 0)],
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
        <p className="eyebrow">{labels.accessWardEyebrow}</p>
        <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
          {labels.accessWardTitle}
        </h2>
        <pre className="mt-5 overflow-x-auto rounded-[1.6rem] border border-white/10 bg-black/30 p-4 text-sm text-white/80">{`X-Admin-Token: your-ops-token`}</pre>
      </div>
    </div>
  );
}
