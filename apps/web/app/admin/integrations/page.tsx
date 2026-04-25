import { AdminIntegrationForm } from "@/components/admin-integration-form";
import { AdminRefreshAllButton } from "@/components/admin-refresh-all-button";
import { DataStateBanner } from "@/components/data-state-banner";
import { IconFrame, NexusCrestIcon, SearchSigilIcon, WarboardSigilIcon } from "@/components/nexus-icons";
import { getAdminDashboard, getAdminIntegrations, isFallbackData } from "@/lib/api";

const providerCopy: Record<string, { label: string; auth: string; requirements: string }> = {
  blizzard: {
    label: "Blizzard Battle.net",
    auth: "Server-side OAuth app credentials",
    requirements: "Client ID + Client Secret",
  },
  raiderio: {
    label: "Raider.IO",
    auth: "Public API",
    requirements: "Base URL only",
  },
  warcraftlogs: {
    label: "Warcraft Logs",
    auth: "Server-side OAuth client credentials",
    requirements: "Client ID + Client Secret",
  },
};

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
  const [settings, dashboard] = await Promise.all([getAdminIntegrations(), getAdminDashboard()]);
  const providers = (dashboard.providers ?? []) as Array<Record<string, unknown>>;
  const visibleProviders = Object.keys(settings.providers ?? {}).length;
  const readyProviders = providers.filter((provider) => Boolean(provider.configured) && Boolean(provider.enabled ?? true)).length;
  const autoRefreshStatus = String(dashboard.auto_refresh?.latest_cycle_status ?? "unknown");

  return (
    <div className="space-y-8">
      {isFallbackData(settings) || isFallbackData(dashboard) ? (
        <DataStateBanner
          title="Integracoes indisponiveis"
          description="O painel nao conseguiu carregar toda a configuracao protegida nesta leitura. Isso nao revela segredos, mas indica falha no proxy admin ou token ausente no servidor web."
          error={settings._requestError ?? dashboard._requestError}
        />
      ) : null}
      <section className="grid gap-5 md:grid-cols-4">
        {[
          ["Providers visiveis", String(visibleProviders)],
          ["Providers prontos", String(readyProviders)],
          ["Request logging", settings.feature_flags?.request_logging ? "Ativo" : "Desligado"],
          ["Auto refresh", autoRefreshStatus],
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
                <p className="eyebrow">Operational model</p>
                <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Public site, private operations
                </h2>
              </div>
              <IconFrame className="hidden h-14 w-14 rounded-[1.2rem] md:inline-flex" tone="gold">
                <NexusCrestIcon className="h-7 w-7" />
              </IconFrame>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Visitor experience</div>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Visitors only search and consult. They never authenticate against Blizzard, Raider.IO, or Warcraft Logs through the browser.
                </p>
              </div>
              <div className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Credential model</div>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Secrets stay in the admin vault and are used only by server-side refresh jobs, manual admin refreshes, and the 10-minute sync cycle.
                </p>
              </div>
              <div className="data-slab">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Sync control</div>
                    <p className="mt-3 text-sm leading-7 text-white/62">
                      Save integration changes here, then trigger a refresh immediately or let the automatic cycle absorb the new configuration.
                    </p>
                  </div>
                  <AdminRefreshAllButton />
                </div>
              </div>
            </div>
          </div>

          <div className="panel panel-section">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Live provider health</p>
                <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Runtime wards
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
                  const meta = providerCopy[key] ?? {
                    label: key,
                    auth: "Server-side integration",
                    requirements: "Configuration required",
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
                              {configured ? "Ready for sync" : enabled ? "Enabled but missing setup" : "Disabled"}
                            </div>
                          </div>
                          <div className={`rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] ${statusTone(enabled, configured)}`}>
                            {!enabled ? "Disabled" : configured ? "Ready" : "Needs setup"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="rune-chip">{meta.auth}</span>
                          <span className="rune-chip">{meta.requirements}</span>
                          {"region" in provider && provider.region ? <span className="rune-chip">Region {String(provider.region).toUpperCase()}</span> : null}
                          {"base_url" in provider && provider.base_url ? <span className="rune-chip">{String(provider.base_url)}</span> : null}
                          {"api_base" in provider && provider.api_base ? <span className="rune-chip">{String(provider.api_base)}</span> : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="data-slab">
                  <p className="text-sm leading-7 text-white/62">Provider health is unavailable right now. Check `ADMIN_API_TOKEN` in the web environment.</p>
                </div>
              )}
            </div>
          </div>

          <div className="panel panel-section">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Recent pressure</p>
                <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Sync posture
                </h2>
              </div>
              <IconFrame className="hidden h-14 w-14 rounded-[1.2rem] md:inline-flex" tone="gold">
                <WarboardSigilIcon className="h-7 w-7" />
              </IconFrame>
            </div>

            <div className="mt-6 space-y-4">
              <div className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Auto refresh cadence</div>
                <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Every {Math.max(1, Math.round(Number(dashboard.auto_refresh?.interval_seconds ?? 600) / 60))} minutes
                </div>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  Latest cycle status: {autoRefreshStatus}. Latest cycle at: {dashboard.auto_refresh?.latest_cycle_at ?? "unknown"}.
                </p>
              </div>

              {dashboard.auto_refresh?.last_error_payload ? (
                <div className="data-slab border-rose-400/20">
                  <div className="text-[0.66rem] uppercase tracking-[0.34em] text-rose-200/80">Latest auto-refresh error</div>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    {JSON.stringify(dashboard.auto_refresh.last_error_payload)}
                  </p>
                </div>
              ) : (
                <div className="data-slab">
                  <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Current posture</div>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    No recent auto-refresh error is recorded. Save integration changes here and use the manual refresh control above if you want immediate confirmation.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
