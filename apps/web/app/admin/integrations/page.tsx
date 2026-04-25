import { AdminIntegrationForm } from "@/components/admin-integration-form";
import { IconFrame, NexusCrestIcon, SearchSigilIcon } from "@/components/nexus-icons";
import { getAdminDashboard, getAdminIntegrations } from "@/lib/api";

export default async function AdminIntegrationsPage() {
  const [settings, dashboard] = await Promise.all([getAdminIntegrations(), getAdminDashboard()]);
  const providers = dashboard.providers ?? [];

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["Providers visíveis", String(Object.keys(settings.providers ?? {}).length)],
          ["Providers prontos", String((providers as Array<Record<string, unknown>>).filter((provider) => Boolean(provider.configured)).length)],
          ["Request logging", settings.feature_flags?.request_logging ? "Ativo" : "Desligado"],
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
            {(providers as Array<Record<string, unknown>>).map((provider) => (
              <div key={String(provider.provider)} className="data-slab">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {String(provider.provider)}
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      {provider.configured ? "Ready for sync" : "Blocked or disabled"}
                    </div>
                  </div>
                  <div className="rune-pill">{provider.configured ? "Ready" : "Blocked"}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 data-slab">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Runtime behavior
                </div>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  Toda alteração salva aqui passa a valer nos próximos refreshes manuais e no ciclo automático de 10 minutos.
                </p>
              </div>
              <IconFrame className="h-12 w-12 rounded-[1rem]" tone="gold">
                <NexusCrestIcon className="h-6 w-6" />
              </IconFrame>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
