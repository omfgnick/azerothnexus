"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

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
    home: string;
    charterTitle: string;
    charterDescription: string;
    footerNote: string;
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
  const pathname = usePathname();
  const navLinks = [
    { href: "/", matchPath: "/", label: copy.home, icon: NexusCrestIcon },
    { href: "/rankings", matchPath: "/rankings", label: copy.nav.rankings, icon: WarboardSigilIcon },
    { href: "/search?type=guild", matchPath: "/search", label: copy.nav.guilds, icon: GuildSigilIcon },
    { href: "/search?type=character", matchPath: "/search", label: copy.nav.characters, icon: ChampionSigilIcon },
    { href: "/compare", matchPath: "/compare", label: copy.nav.compare, icon: CompareSigilIcon },
    { href: "/search", matchPath: "/search", label: copy.nav.search, icon: SearchSigilIcon },
  ];

  return (
    <div className="page">
      <nav className="an-nav">
        <div className="an-nav-inner">
          <Link href="/" className="an-nav-brand">
            <div className="an-nav-brand-crest">
              <NexusCrestIcon className="h-[14px] w-[14px] text-gold" />
            </div>
            <span className="an-nav-brand-text">Azeroth Nexus</span>
          </Link>

          <ul className="an-nav-links">
            {navLinks.map((link) => {
              const isActive =
                link.matchPath === "/"
                  ? pathname === "/"
                  : pathname === link.matchPath || pathname.startsWith(`${link.matchPath}/`);

              return (
                <li key={link.href}>
                  <Link href={link.href} className={isActive ? "active" : undefined}>
                    <link.icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="an-nav-right">
            <div className="an-nav-status" title={copy.status}>
              <div className="an-nav-status-dot" />
            </div>
            <Link href="/search" className="an-nav-search-btn">
              <SearchSigilIcon className="h-3.5 w-3.5" />
              <span>{copy.nav.search}</span>
              <kbd>/</kbd>
            </Link>
            <div className="an-locale-wrap">
              <LocaleToggle locale={locale} />
            </div>
          </div>
        </div>
      </nav>

      <main className="an-main">{children}</main>

      <footer className="an-footer">
        <div className="an-footer-inner">
          <span className="an-footer-brand">Azeroth Nexus</span>
          <ul className="an-footer-links">
            <li>
              <Link href="/rankings">{copy.nav.rankings}</Link>
            </li>
            <li>
              <Link href="/search">{copy.nav.search}</Link>
            </li>
            <li>
              <Link href="/compare">{copy.nav.compare}</Link>
            </li>
            <li>
              <Link href="/admin">{copy.nav.admin}</Link>
            </li>
          </ul>
          <span className="an-footer-note">{copy.footerNote}</span>
        </div>
      </footer>
    </div>
  );
}
