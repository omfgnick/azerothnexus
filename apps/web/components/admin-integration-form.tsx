"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { useLocaleCopy } from "@/components/locale-provider";

type IntegrationSettings = {
  providers: Record<string, Record<string, unknown>>;
  feature_flags: Record<string, unknown>;
};

type AdminIntegrationFormProps = {
  initialSettings: IntegrationSettings;
};

function cloneSettings(settings: IntegrationSettings): IntegrationSettings {
  return JSON.parse(JSON.stringify(settings)) as IntegrationSettings;
}

function statusTone(enabled: boolean, configured: boolean) {
  if (!enabled) {
    return "border-white/10 bg-white/5 text-white/60";
  }
  if (configured) {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
  }
  return "border-amber-400/30 bg-amber-500/10 text-amber-100";
}

export function AdminIntegrationForm({ initialSettings }: AdminIntegrationFormProps) {
  const { locale, copy } = useLocaleCopy();
  const labels = copy.adminComponents;
  const providerLabels = copy.adminIntegrations.providerLabels;
  const isPt = locale === "pt-BR";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isWorking, setIsWorking] = useState(false);
  const [form, setForm] = useState<IntegrationSettings>(() => cloneSettings(initialSettings));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const providerMeta: Record<
    string,
    {
      title: string;
      copy: string;
      authMode: string;
      visitorModel: string;
      requirements: string;
      notes: string[];
    }
  > = {
    blizzard: {
      title: providerLabels.blizzard.label,
      copy: isPt
        ? "Armory, perfil de guilda, resumo de personagem, equipamentos, talentos e dados oficiais de Mythic+."
        : "Armory, guild profile, character summary, equipment, talents, and official Mythic+ data.",
      authMode: providerLabels.blizzard.auth,
      visitorModel: labels.publicConsultation,
      requirements: providerLabels.blizzard.requirements,
      notes: isPt
        ? [
            "Visitantes nao autenticam. Apenas o servidor usa as credenciais da Blizzard.",
            "Se um personagem estiver desatualizado na Blizzard, o proximo refresh do servidor tenta novamente.",
          ]
        : [
            "Visitors do not authenticate. Only the server uses Blizzard credentials.",
            "If a character profile is stale on Blizzard, the next server refresh will retry automatically.",
          ],
    },
    raiderio: {
      title: providerLabels.raiderio.label,
      copy: isPt
        ? "Score publico, roster, race de raid, progressao e sinais competitivos de atividade."
        : "Public score, roster, raid race, progression, and competitive activity signals.",
      authMode: providerLabels.raiderio.auth,
      visitorModel: labels.publicConsultation,
      requirements: providerLabels.raiderio.requirements,
      notes: isPt
        ? [
            "Nenhum segredo e exigido no fluxo atual de integracao.",
            "Os dados retornados ainda dependem da visibilidade publica do lado do jogador.",
          ]
        : [
            "No secret is required in the current integration flow.",
            "Returned data still depends on public player visibility.",
          ],
    },
    warcraftlogs: {
      title: providerLabels.warcraftlogs.label,
      copy: isPt
        ? "Medias publicas de parse, rankings por zona e sinais de performance de raid."
        : "Public parse averages, zone rankings, and raid performance signals.",
      authMode: providerLabels.warcraftlogs.auth,
      visitorModel: labels.publicConsultation,
      requirements: providerLabels.warcraftlogs.requirements,
      notes: isPt
        ? [
            "O site continua publico. Apenas o servidor autentica no Warcraft Logs.",
            "Logs privados continuam dependendo das permissoes configuradas na origem.",
          ]
        : [
            "The site remains public. Only your server authenticates against Warcraft Logs.",
            "Private logs still depend on source permissions defined in Warcraft Logs.",
          ],
    },
  };

  function updateProvider(provider: string, field: string, value: unknown) {
    setForm((current) => ({
      ...current,
      providers: {
        ...current.providers,
        [provider]: {
          ...current.providers[provider],
          [field]: value,
        },
      },
    }));
  }

  function updateFeatureFlag(flag: string, value: boolean) {
    setForm((current) => ({
      ...current,
      feature_flags: {
        ...current.feature_flags,
        [flag]: value,
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsWorking(true);

    const response = await fetch("/api/admin/integrations", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload?.detail || payload?.error || labels.saveError);
      setIsWorking(false);
      return;
    }

    setForm(cloneSettings(payload));
    setMessage(labels.saveSuccess);
    startTransition(() => {
      router.refresh();
      setIsWorking(false);
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="panel panel-section">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">{labels.externalIntegrations}</p>
            <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {labels.providerVault}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">{labels.providerVaultDescription}</p>
          </div>
          <button
            type="submit"
            disabled={isPending || isWorking}
            className="arcane-button min-h-[48px] px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending || isWorking ? labels.saveWorking : labels.saveIntegrations}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.visitorModel}</div>
            <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {labels.visitorModelValue}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/60">{labels.visitorModelDescription}</p>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.secretHandling}</div>
            <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {labels.secretHandlingValue}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/60">{labels.secretHandlingDescription}</p>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.syncModel}</div>
            <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {labels.syncModelValue}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/60">{labels.syncModelDescription}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          {Object.entries(form.providers).map(([providerKey, provider]) => {
            const meta = providerMeta[providerKey] ?? {
              title: providerKey,
              copy: isPt ? "Integracao externa." : "External integration.",
              authMode: labels.serverSideOnly,
              visitorModel: labels.publicConsultation,
              requirements: labels.requirements,
              notes: [isPt ? "Esta integracao e gerenciada pelo sanctum admin." : "This integration is managed from the admin sanctum."],
            };
            const enabled = Boolean(provider.enabled);
            const configured = Boolean(provider.configured);
            const secretConfigured = Boolean(provider.client_secret_configured);

            return (
              <section key={providerKey} className="data-slab space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {meta.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/60">{meta.copy}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/70">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(event) => updateProvider(providerKey, "enabled", event.target.checked)}
                    />
                    {labels.enabled}
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] ${statusTone(enabled, configured)}`}>
                    {!enabled ? copy.adminIntegrations.disabledState : configured ? labels.configured : labels.needsSetup}
                  </span>
                  <span className="rune-chip">{meta.visitorModel}</span>
                  <span className="rune-chip">{meta.authMode}</span>
                </div>

                <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
                  <div className="text-[0.66rem] uppercase tracking-[0.3em] text-gold/75">{labels.requirements}</div>
                  <div className="mt-3 text-lg text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {meta.requirements}
                  </div>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-white/58">
                    {meta.notes.map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </div>
                </div>

                {"region" in provider ? (
                  <label className="block space-y-2">
                    <span className="text-[0.68rem] uppercase tracking-[0.28em] text-gold/75">{labels.region}</span>
                    <select
                      value={String(provider.region ?? "us")}
                      onChange={(event) => updateProvider(providerKey, "region", event.target.value)}
                      className="min-h-[46px] w-full rounded-[1rem] border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-gold/40"
                    >
                      <option value="us">US</option>
                      <option value="eu">EU</option>
                      <option value="kr">KR</option>
                      <option value="tw">TW</option>
                    </select>
                  </label>
                ) : null}

                {"api_base_url" in provider ? (
                  <label className="block space-y-2">
                    <span className="text-[0.68rem] uppercase tracking-[0.28em] text-gold/75">{labels.apiBaseUrl}</span>
                    <input
                      value={String(provider.api_base_url ?? "")}
                      onChange={(event) => updateProvider(providerKey, "api_base_url", event.target.value)}
                      className="min-h-[46px] w-full rounded-[1rem] border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-gold/40"
                    />
                  </label>
                ) : null}

                {"client_id" in provider ? (
                  <label className="block space-y-2">
                    <span className="text-[0.68rem] uppercase tracking-[0.28em] text-gold/75">{labels.clientId}</span>
                    <input
                      value={String(provider.client_id ?? "")}
                      onChange={(event) => updateProvider(providerKey, "client_id", event.target.value)}
                      className="min-h-[46px] w-full rounded-[1rem] border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-gold/40"
                    />
                  </label>
                ) : null}

                {"client_secret" in provider ? (
                  <div className="space-y-3">
                    <label className="block space-y-2">
                      <span className="text-[0.68rem] uppercase tracking-[0.28em] text-gold/75">{labels.clientSecret}</span>
                      <input
                        type="password"
                        value={String(provider.client_secret ?? "")}
                        placeholder={secretConfigured ? labels.secretAlreadyStored : labels.pasteNewSecret}
                        onChange={(event) => {
                          updateProvider(providerKey, "client_secret", event.target.value);
                          if (event.target.value) {
                            updateProvider(providerKey, "clear_client_secret", false);
                          }
                        }}
                        className="min-h-[46px] w-full rounded-[1rem] border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-gold/40"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/55">
                      <span className="rune-pill">{secretConfigured ? labels.secretConfigured : labels.noSecretStored}</span>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(provider.clear_client_secret)}
                          onChange={(event) => updateProvider(providerKey, "clear_client_secret", event.target.checked)}
                        />
                        {labels.clearStoredSecret}
                      </label>
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>

      <div className="panel panel-section">
        <p className="eyebrow">{labels.observabilityEyebrow}</p>
        <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
          {labels.observabilityTitle}
        </h2>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
          <div>
            <div className="text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {labels.requestLoggingTitle}
            </div>
            <p className="mt-2 text-sm text-white/60">{labels.requestLoggingDescription}</p>
          </div>
          <label className="flex items-center gap-3 text-sm text-white/80">
            <input
              type="checkbox"
              checked={Boolean(form.feature_flags.request_logging)}
              onChange={(event) => updateFeatureFlag("request_logging", event.target.checked)}
            />
            {labels.enableRequestLogs}
          </label>
        </div>
      </div>

      {message ? <p className="text-sm uppercase tracking-[0.16em] text-emerald-200/80">{message}</p> : null}
      {error ? <p className="text-sm uppercase tracking-[0.16em] text-rose-200/80">{error}</p> : null}
    </form>
  );
}
