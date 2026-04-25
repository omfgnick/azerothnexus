import Link from "next/link";
import { ReactNode } from "react";

import { LocaleToggle } from "@/components/locale-toggle";
import {
  ChampionSigilIcon,
  CompareSigilIcon,
  GuildSigilIcon,
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
    { href: "/", label: "Home", icon: NexusCrestIcon },
    { href: "/rankings", label: copy.nav.rankings, icon: WarboardSigilIcon },
    { href: "/search", label: copy.nav.search, icon: SearchSigilIcon },
    { href: "/compare", label: copy.nav.compare, icon: CompareSigilIcon },
    { href: "/search?type=guild", label: copy.nav.guilds, icon: GuildSigilIcon },
    { href: "/search?type=character", label: copy.nav.characters, icon: ChampionSigilIcon },
    { href: "/admin", label: copy.nav.admin, icon: NexusCrestIcon },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)]">
      <div className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(4,7,16,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="mr-2 flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-gold/20 bg-[linear-gradient(135deg,rgba(193,147,64,0.2),rgba(193,147,64,0.06))]">
              <NexusCrestIcon className="h-4 w-4 text-gold" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[0.8rem] uppercase tracking-[0.24em] text-gold">Azeroth Nexus</div>
              <div className="hidden truncate text-xs text-white/38 md:block">{copy.summary}</div>
            </div>
          </Link>

          <nav className="flex min-w-0 flex-1 snap-x items-center gap-2 overflow-x-auto pb-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-[40px] min-w-max items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:border-white/14 hover:bg-white/[0.06] hover:text-white"
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/48">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
              <span>{copy.status}</span>
            </div>
            <Link
              href="/search"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:border-white/14 hover:bg-white/[0.06] hover:text-white"
            >
              <SearchSigilIcon className="h-4 w-4" />
              <span>Search</span>
              <kbd className="rounded border border-white/12 bg-white/[0.04] px-1.5 py-0.5 font-['Space_Mono',monospace] text-[10px] text-white/55">/</kbd>
            </Link>
            <LocaleToggle locale={locale} />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
