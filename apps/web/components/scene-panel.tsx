import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

type ScenePanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  icon: ReactNode;
  badge?: string;
  href?: string;
  actionLabel?: string;
  layout?: "wide" | "portrait";
  priority?: boolean;
  className?: string;
};

export function ScenePanel({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  icon,
  badge,
  href,
  actionLabel,
  layout = "wide",
  priority = false,
  className = "",
}: ScenePanelProps) {
  const minHeight = layout === "portrait" ? "min-h-[27rem] md:min-h-[31rem]" : "min-h-[24rem] md:min-h-[28rem]";

  const panel = (
    <article className={`panel panel-legendary group relative h-full overflow-hidden ${className}`}>
      <div className={`relative ${minHeight}`}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          quality={96}
          sizes={layout === "portrait" ? "(max-width: 1024px) 100vw, 32vw" : "(max-width: 1024px) 100vw, 58vw"}
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,6,14,0.08),rgba(4,6,14,0.26)_24%,rgba(4,6,14,0.72)_58%,rgba(4,6,14,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(214,190,144,0.24),transparent_0_24%),radial-gradient(circle_at_78%_18%,rgba(110,203,255,0.24),transparent_0_24%),radial-gradient(circle_at_52%_100%,rgba(122,104,255,0.18),transparent_0_28%)]" />
        <div className="pointer-events-none absolute bottom-6 left-6 hidden h-24 w-24 rounded-full border border-gold/15 shadow-[0_0_0_16px_rgba(110,203,255,0.04)] md:block" />

        <div className="relative z-10 flex h-full flex-col justify-between gap-8 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-xl">
              <p className="eyebrow">{eyebrow}</p>
              <h3 className="mt-5 section-title max-w-xl">{title}</h3>
            </div>
            {icon}
          </div>

          <div className="max-w-2xl">
            {badge ? <div className="rune-pill">{badge}</div> : null}
            <p className="mt-5 text-sm leading-7 text-white/75 md:text-base">{description}</p>
            {actionLabel ? (
              <div className="mt-6 inline-flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-gold/85">
                {actionLabel}
                <span aria-hidden="true">+</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="group block h-full">
        {panel}
      </Link>
    );
  }

  return panel;
}
