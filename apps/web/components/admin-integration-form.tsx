"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

type IntegrationSettings = {
  providers: Record<string, Record<string, unknown>>;
  feature_flags: Record<string, unknown>;
};

type AdminIntegrationFormProps = {
  initialSettings: IntegrationSettings;
};

const providerMeta: Record<string, { title: string; copy: string }> = {
  blizzard: {
    title: "Blizzard Battle.net",
    copy: "Armory, guild profile, character summary, and official Mythic+ data.",
  },
  raiderio: {
    title: "Raider.IO",
    copy: "Public score, roster, progression race, and competitive activity signals.",
  },
  warcraftlogs: {
    title: "Warcraft Logs",
    copy: "OAuth + GraphQL for parses, zone rankings, and raid performance signals.",
  },
};

function cloneSettings(settings: IntegrationSettings): IntegrationSettings {
  return JSON.parse(JSON.stringify(settings)) as IntegrationSettings;
}

export function AdminIntegrationForm({ initialSettings }: AdminIntegrationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isWorking, setIsWorking] = useState(false);
  const [form, setForm] = useState<IntegrationSettings>(() => cloneSettings(initialSettings));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError(payload?.detail || payload?.error || "Falha ao salvar integracoes.");
      setIsWorking(false);
      return;
    }

    setForm(cloneSettings(payload));
    setMessage("Integracoes salvas. Os proximos syncs ja passam a usar a configuracao nova.");
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
            <p className="eyebrow">External integrations</p>
            <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              Provider vault
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
              Secrets are not rendered back to the browser. If a secret field stays empty, the current stored value is preserved.
            </p>
          </div>
          <button type="submit" disabled={isPending || isWorking} className="arcane-button min-h-[48px] px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60">
            {isPending || isWorking ? "Salvando..." : "Salvar integracoes"}
          </button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          {Object.entries(form.providers).map(([providerKey, provider]) => {
            const secretConfigured = Boolean(provider.client_secret_configured);
            return (
              <section key={providerKey} className="data-slab space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {providerMeta[providerKey]?.title ?? providerKey}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/60">{providerMeta[providerKey]?.copy ?? "External integration."}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/70">
                    <input
                      type="checkbox"
                      checked={Boolean(provider.enabled)}
                      onChange={(event) => updateProvider(providerKey, "enabled", event.target.checked)}
                    />
                    Enabled
                  </label>
                </div>

                {"region" in provider ? (
                  <label className="block space-y-2">
                    <span className="text-[0.68rem] uppercase tracking-[0.28em] text-gold/75">Region</span>
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
                    <span className="text-[0.68rem] uppercase tracking-[0.28em] text-gold/75">API base URL</span>
                    <input
                      value={String(provider.api_base_url ?? "")}
                      onChange={(event) => updateProvider(providerKey, "api_base_url", event.target.value)}
                      className="min-h-[46px] w-full rounded-[1rem] border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-gold/40"
                    />
                  </label>
                ) : null}

                {"client_id" in provider ? (
                  <label className="block space-y-2">
                    <span className="text-[0.68rem] uppercase tracking-[0.28em] text-gold/75">Client ID</span>
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
                      <span className="text-[0.68rem] uppercase tracking-[0.28em] text-gold/75">Client secret</span>
                      <input
                        type="password"
                        value={String(provider.client_secret ?? "")}
                        placeholder={secretConfigured ? "Secret already stored" : "Paste a new secret"}
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
                      <span className="rune-pill">{secretConfigured ? "Secret configured" : "No secret stored"}</span>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(provider.clear_client_secret)}
                          onChange={(event) => updateProvider(providerKey, "clear_client_secret", event.target.checked)}
                        />
                        Clear stored secret
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
        <p className="eyebrow">Observability</p>
        <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
          Logging controls
        </h2>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
          <div>
            <div className="text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              Request logging
            </div>
            <p className="mt-2 text-sm text-white/60">Records API calls into `AuditLog`, including request id, route, latency, and status.</p>
          </div>
          <label className="flex items-center gap-3 text-sm text-white/80">
            <input
              type="checkbox"
              checked={Boolean(form.feature_flags.request_logging)}
              onChange={(event) => updateFeatureFlag("request_logging", event.target.checked)}
            />
            Enable request logs
          </label>
        </div>
      </div>

      {message ? <p className="text-sm uppercase tracking-[0.16em] text-emerald-200/80">{message}</p> : null}
      {error ? <p className="text-sm uppercase tracking-[0.16em] text-rose-200/80">{error}</p> : null}
    </form>
  );
}
