import { AdminIntegrationForm } from "@/components/admin-integration-form";
import { AdminRefreshAllButton } from "@/components/admin-refresh-all-button";
import { DataStateBanner } from "@/components/data-state-banner";
import { IconFrame, NexusCrestIcon, SearchSigilIcon, WarboardSigilIcon } from "@/components/nexus-icons";
import { getAdminDashboard, getAdminIntegrations, isFallbackData } from "@/lib/api";
import { getDictionary } from "@/lib/locale";

function statusTone(enabled: boolean, configured: boolean) {
  if (!enabled) {
    return "border-white/10 bg-white/5 text-white/60";
  }
  if (configured) {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
  }
  return "border-amber-400/30 bg-amber-500/10 text-amber-100";
}

export default async function AdminIntegrationsPage() {
  const { copy } = await getDictionary();
  const labels = copy.adminIntegrations;
  const [settings, dashboard] = await Promise.all([getAdminIntegrations(), getAdminDashboard()]);
  const providers = (dashboard.providers ?? []) as Array<Record<string, unknown>>;
  const visibleProviders = Object.keys(settings.providers ?? {}).length;
  const readyProviders = providers.filter((provider) => Boolean(provider.configured) && Boolean(provider.enabled ?? true)).length;
  const autoRefreshStatus = String(dashboard.auto_refresh?.latest_cycle_status ?? "unknown");

  return (
    <div className="space-y-8">
      {isFallbackData(settings) || isFallbackData(dashboard) ? (
        <DataStateBanner
          title={labels.bannerTitle}
          description={labels.bannerDescription}
          error={settings._requestError ?? dashboard._requestError}
          detailLabel={copy.dataState.technicalDetail}
        />
      ) : null}
      <section className="grid gap-5 md:grid-cols-4">
        {[
          [labels.visibleProviders, String(visibleProviders)],
          [labels.readyProviders, String(readyProviders)],
          [labels.requestLogging, settings.feature_flags?.request_logging ? labels.active : labels.disabled],
          [labels.autoRefresh, autoRefreshStatus],
        ].map(([title, value]) => (
          <div key={title} className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{title}</div>
            <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {value}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <AdminIntegrationForm initialSettings={settings} />

        <div className="space-y-6">
          <div className="panel panel-section">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{labels.operationalEyebrow}</p>
                <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {labels.operationalTitle}
                </h2>
              </div>
              <IconFrame className="hidden h-14 w-14 rounded-[1.2rem] md:inline-flex" tone="gold">
                <NexusCrestIcon className="h-7 w-7" />
              </IconFrame>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.visitorExperience}</div>
                <p className="mt-3 text-sm leading-7 text-white/62">{labels.visitorExperienceDescription}</p>
              </div>
              <div className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.credentialModel}</div>
                <p className="mt-3 text-sm leading-7 text-white/62">{labels.credentialModelDescription}</p>
              </div>
              <div className="data-slab">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.syncControl}</div>
                    <p className="mt-3 text-sm leading-7 text-white/62">{labels.syncControlDescription}</p>
                  </div>
                  <AdminRefreshAllButton />
                </div>
              </div>
            </div>
          </div>

          <div className="panel panel-section">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{labels.runtimeEyebrow}</p>
                <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {labels.runtimeTitle}
                </h2>
              </div>
              <IconFrame className="hidden h-14 w-14 rounded-[1.2rem] md:inline-flex" tone="arcane">
                <SearchSigilIcon className="h-7 w-7" />
              </IconFrame>
            </div>

            <div className="mt-6 space-y-3">
              {providers.length ? (
                providers.map((provider) => {
                  const key = String(provider.provider);
                  const meta = labels.providerLabels[key] ?? {
                    label: key,
                    auth: copy.adminComponents.serverSideOnly,
                    requirements: copy.adminComponents.requirements,
                  };
                  const enabled = Boolean(provider.enabled ?? true);
                  const configured = Boolean(provider.configured);
                  return (
                    <div key={key} className="data-slab">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                              {meta.label}
                            </div>
                            <div className="mt-2 text-sm text-white/60">
                              {configured ? labels.readyForSync : enabled ? labels.enabledMissingSetup : labels.disabledProvider}
                            </div>
                          </div>
                          <div className={`rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] ${statusTone(enabled, configured)}`}>
                            {!enabled ? labels.disabledState : configured ? labels.readyState : labels.needsSetupState}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="rune-chip">{meta.auth}</span>
                          <span className="rune-chip">{meta.requirements}</span>
                          {"region" in provider && provider.region ? <span className="rune-chip">{labels.region} {String(provider.region).toUpperCase()}</span> : null}
                          {"base_url" in provider && provider.base_url ? <span className="rune-chip">{String(provider.base_url)}</span> : null}
                          {"api_base" in provider && provider.api_base ? <span className="rune-chip">{String(provider.api_base)}</span> : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="data-slab">
                  <p className="text-sm leading-7 text-white/62">{labels.unavailableProviderHealth}</p>
                </div>
              )}
            </div>
          </div>

          <div className="panel panel-section">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{labels.postureEyebrow}</p>
                <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {labels.postureTitle}
                </h2>
              </div>
              <IconFrame className="hidden h-14 w-14 rounded-[1.2rem] md:inline-flex" tone="gold">
                <WarboardSigilIcon className="h-7 w-7" />
              </IconFrame>
            </div>

            <div className="mt-6 space-y-4">
              <div className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.autoRefreshCadence}</div>
                <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {Math.max(1, Math.round(Number(dashboard.auto_refresh?.interval_seconds ?? 600) / 60))} min
                </div>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  {labels.latestCycleStatus}: {autoRefreshStatus}. {labels.latestCycleAt}: {dashboard.auto_refresh?.latest_cycle_at ?? copy.shared.unknown}.
                </p>
              </div>

              {dashboard.auto_refresh?.last_error_payload ? (
                <div className="data-slab border-rose-400/20">
                  <div className="text-[0.66rem] uppercase tracking-[0.34em] text-rose-200/80">{labels.latestAutoRefreshError}</div>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    {JSON.stringify(dashboard.auto_refresh.last_error_payload)}
                  </p>
                </div>
              ) : (
                <div className="data-slab">
                  <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.currentPosture}</div>
                  <p className="mt-3 text-sm leading-7 text-white/62">{labels.currentPostureDescription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
