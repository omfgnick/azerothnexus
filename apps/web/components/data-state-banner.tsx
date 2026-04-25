type DataStateBannerProps = {
  title?: string;
  description: string;
  error?: string | null;
  detailLabel?: string;
};

export function DataStateBanner({
  title,
  description,
  error,
  detailLabel = "Detalhe tecnico",
}: DataStateBannerProps) {
  return (
    <div className="rounded-[18px] border border-amber-400/20 bg-amber-500/8 px-4 py-4 text-sm text-white/78 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
      {title ? <div className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-amber-100/85">{title}</div> : null}
      <p className={`${title ? "mt-3" : ""} leading-7`}>{description}</p>
      {error ? <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/45">{detailLabel}: {error}</p> : null}
    </div>
  );
}
