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
    <div className="relative isolate min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-20 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-1/3 h-[26rem] w-[26rem] rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute left-1/2 top-[-20rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full border border-white/5" />
        <div className="absolute left-1/2 top-[-15rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full border border-gold/10" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </div>

      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="panel overflow-visible">
            <div className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
            <div className="relative flex flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <Link href="/" className="group flex items-center gap-4">
                <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="gold">
                  <NexusCrestIcon className="h-9 w-9 transition group-hover:scale-105" />
                </IconFrame>
                <div>
                  <div className="eyebrow text-[0.64rem]">{copy.eyebrow}</div>
                  <div
                    className="mt-3 text-xl tracking-[0.34em] text-gold sm:text-2xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    AZEROTH NEXUS
                  </div>
                  <p className="mt-2 max-w-xl text-sm text-white/60">{copy.summary}</p>
                </div>
              </Link>

              <div className="flex flex-col gap-3 lg:items-end">
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <div className="rune-pill">{copy.status}</div>
                  <LocaleToggle locale={locale} />
                </div>
                <nav className="flex flex-wrap gap-2 lg:justify-end">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="nav-link">
                      <link.icon className="h-4 w-4 opacity-90" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
