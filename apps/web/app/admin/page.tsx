export default function AdminPage() {
  return (
    <div className="page-shell space-y-8">
      <section className="panel panel-section-lg">
        <p className="eyebrow">Operations sanctum</p>
        <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.8rem)]">Protected maintenance and sync controls for the observatory.</h1>
        <p className="mt-6 max-w-3xl lead-copy">
          Azeroth Nexus remains public for visitors, while operational endpoints stay protected for credentials, sync cadence, cache actions, diagnostics, and queue visibility through the shared admin token.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Provider credentials", "Blizzard, Raider.IO, and Warcraft Logs access points."],
          ["Sync scheduler", "Cadence, retries, and backoff control for background pulls."],
          ["Queue monitoring", "Worker, cache, and sync visibility inside the operations flow."],
          ["Protected ops", "Use X-Admin-Token with /api/admin/* endpoints."]
        ].map(([title, text]) => (
          <div key={title} className="data-slab">
            <h2 className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h2>
            <p className="mt-3 text-sm text-white/60">{text}</p>
          </div>
        ))}
      </section>

      <div className="panel panel-section">
        <p className="eyebrow">Access ward</p>
        <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
          Example header
        </h2>
        <pre className="mt-5 overflow-x-auto rounded-[1.6rem] border border-white/10 bg-black/30 p-4 text-sm text-white/80">{`X-Admin-Token: your-ops-token`}</pre>
      </div>
    </div>
  );
}
