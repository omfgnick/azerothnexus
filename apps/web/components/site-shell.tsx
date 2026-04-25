import Link from "next/link";
import { ReactNode } from "react";

import { LocaleToggle } from "@/components/locale-toggle";
import {
  ChampionSigilIcon,
  CompareSigilIcon,
  GuildSigilIcon,
  IconFrame,
  NexusCrestIcon,
  SearchSigilIcon,
  WarboardSigilIcon,
} from "@/components/nexus-icons";
import type { SupportedLocale } from "@/lib/locale";

type SiteShellProps = {
  children: ReactNode;
  locale: SupportedLocale;
  copy: {
    eyebrow: string;
    summary: string;
    status: string;
    charterTitle: string;
    charterDescription: string;
    nav: {
      rankings: string;
      search: string;
      compare: string;
      guilds: string;
      characters: string;
      admin: string;
    };
  };
};

export function SiteShell({ children, locale, copy }: SiteShellProps) {
  const navLinks = [
    { href: "/rankings", label: copy.nav.rankings, icon: WarboardSigilIcon },
    { href: "/search", label: copy.nav.search, icon: SearchSigilIcon },
    { href: "/compare", label: copy.nav.compare, icon: CompareSigilIcon },
    { href: "/guild/us/stormrage/void-vanguard", label: copy.nav.guilds, icon: GuildSigilIcon },
    { href: "/character/us/stormrage/Aethryl", label: copy.nav.characters, icon: ChampionSigilIcon },
    { href: "/admin", label: copy.nav.admin, icon: NexusCrestIcon },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-28rem] h-[56rem] w-[56rem] -translate-x-1/2 rounded-full border border-gold/10" />
        <div className="absolute left-1/2 top-[-22rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full border border-sky-300/10" />
        <div className="absolute left-[-10rem] top-24 h-[24rem] w-[24rem] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute right-[-12rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/55 to-transparent" />
      </div>

      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="panel panel-legendary legend-frame overflow-visible">
            <div className="absolute inset-x-24 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
            <div className="relative px-4 py-4 sm:px-5 sm:py-5 lg:px-8">
              <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
                <Link href="/" className="group relative block">
                  <div className="flex items-start gap-3 sm:gap-5">
                    <div className="relative shrink-0">
                      <span className="pointer-events-none absolute inset-[-16px] rounded-full border border-gold/10" />
                      <span className="pointer-events-none absolute inset-[-30px] rounded-full border border-sky-300/10" />
                      <IconFrame className="h-14 w-14 rounded-[1.2rem] sm:h-20 sm:w-20 sm:rounded-[1.7rem]" tone="gold">
                        <NexusCrestIcon className="h-7 w-7 transition duration-300 group-hover:scale-105 sm:h-10 sm:w-10" />
                      </IconFrame>
                    </div>

                    <div className="min-w-0">
                      <div className="eyebrow text-[0.56rem] sm:text-[0.62rem]">{copy.eyebrow}</div>
                      <div
                        className="mt-3 text-[clamp(1.45rem,7vw,3.3rem)] leading-none tracking-[0.16em] text-gold sm:mt-4 sm:tracking-[0.28em]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        AZEROTH NEXUS
                      </div>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68 md:text-base md:leading-7">{copy.summary}</p>
                    </div>
                  </div>
                </Link>

                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-[1.1fr_auto] md:items-center">
                    <div className="data-slab min-h-[7rem] sm:min-h-[8.25rem]">
                      <div className="text-[0.62rem] uppercase tracking-[0.34em] text-gold/70">Celestial charter</div>
                      <div
                        className="mt-3 text-[1.15rem] leading-tight text-white sm:text-[1.4rem] md:text-[1.75rem]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {copy.charterTitle}
                      </div>
                      <p className="mt-3 hidden text-sm leading-7 text-white/62 sm:block">{copy.charterDescription}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <div className="rune-pill">{copy.status}</div>
                      <LocaleToggle locale={locale} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="ornate-divider mt-6" />

              <nav className="-mx-1 mt-6 flex snap-x gap-2 overflow-x-auto px-1 pb-1 xl:mx-0 xl:grid xl:grid-cols-6 xl:overflow-visible xl:px-0 xl:pb-0">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="nav-link min-h-[52px] min-w-[168px] shrink-0 snap-start justify-start px-3 sm:min-w-[188px] sm:px-4 xl:min-h-[58px] xl:min-w-0">
                    <span className="inline-flex items-center gap-2 sm:gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <link.icon className="h-4 w-4 opacity-90" />
                      </span>
                      <span>{link.label}</span>
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
