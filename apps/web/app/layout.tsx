import "./globals.css";
import { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";
import { getDictionary } from "@/lib/locale";

export const metadata = {
  title: "Azeroth Nexus",
  description: "Public World of Warcraft progression, ranking, guild, and character analytics."
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, copy } = await getDictionary();

  return (
    <html lang={locale}>
      <body>
        <SiteShell locale={locale} copy={copy.shell}>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
