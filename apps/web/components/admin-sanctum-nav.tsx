"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLocaleCopy } from "@/components/locale-provider";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import {
  CompareSigilIcon,
  GuildSigilIcon,
  NexusCrestIcon,
  SearchSigilIcon,
  WarboardSigilIcon,
} from "@/components/nexus-icons";

type AdminSanctumNavProps = {
  labels: {
    overview: string;
    integrations: string;
    backups: string;
    logs: string;
    controls: string;
    logout: string;
  };
};

export function AdminSanctumNav({ labels }: AdminSanctumNavProps) {
  const { copy } = useLocaleCopy();
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: labels.overview, icon: NexusCrestIcon },
    { href: "/admin/integrations", label: labels.integrations, icon: SearchSigilIcon },
    { href: "/admin/backups", label: labels.backups, icon: GuildSigilIcon },
    { href: "/admin/logs", label: labels.logs, icon: CompareSigilIcon },
  ];

  return (
    <nav className="panel panel-section flex flex-wrap gap-2">
      {links.map((link) => {
        const isActive = link.href === "/admin" ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${isActive ? "border-gold/40 bg-[linear-gradient(180deg,rgba(214,190,144,0.18),rgba(110,203,255,0.08))] text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)]" : ""}`}
          >
            <link.icon className="h-4 w-4 opacity-90" />
            {link.label}
          </Link>
        );
      })}

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[0.66rem] uppercase tracking-[0.28em] text-white/50 lg:inline-flex">
          <WarboardSigilIcon className="h-4 w-4 text-gold/80" />
          {labels.controls}
        </div>
        <AdminLogoutButton label={labels.logout} workingLabel={copy.adminComponents.logoutWorking} />
      </div>
    </nav>
  );
}
