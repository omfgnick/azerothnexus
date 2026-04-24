import "./globals.css";
import { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "Azeroth Nexus",
  description: "Public World of Warcraft progression, ranking, guild, and character analytics."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
