import { headers } from "next/headers";
import { ReactNode } from "react";

import { AdminSanctumNav } from "@/components/admin-sanctum-nav";
import { IconFrame, NexusCrestIcon, WarboardSigilIcon } from "@/components/nexus-icons";
import { ScenePanel } from "@/components/scene-panel";
import { getLocale } from "@/lib/locale";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const adminPathname = requestHeaders.get("x-admin-pathname");
  const locale = await getLocale();

  if (adminPathname === "/admin/login") {
    return children;
  }

  const navLabels =
    locale === "pt-BR"
      ? {
          overview: "Visao geral",
          integrations: "Integracoes",
          backups: "Backups",
          logs: "Logs",
          controls: "Controles do sanctum",
          logout: "Sair",
        }
      : {
          overview: "Overview",
          integrations: "Integrations",
          backups: "Backups",
          logs: "Logs",
          controls: "Sanctum controls",
          logout: "Logout",
        };

  return (
    <div className="page-shell space-y-8">
      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="panel panel-section-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Azeroth Nexus administration</p>
              <h1 className="mt-6 display-title text-[clamp(2.7rem,4.4vw,4.5rem)]">Command, backups, logs, and provider vaults in one protected sanctum.</h1>
              <p className="mt-6 max-w-3xl lead-copy">
                A nova área administrativa separa operação diária, observabilidade, backups e integrações externas sem perder a identidade épica do sistema.
              </p>
            </div>
            <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] md:inline-flex" tone="violet">
              <NexusCrestIcon className="h-8 w-8" />
            </IconFrame>
          </div>
        </div>

        <ScenePanel
          eyebrow="Ops nexus"
          title="Uma câmara de controle que parece parte legítima de Azeroth."
          description="O admin agora abre como um sanctum separado, com navegação própria para overview, integrações externas, backups persistidos e timeline de logs."
          imageSrc="/images/admin-ops-scene.png"
          imageAlt="Arcane Azeroth operations chamber with magical consoles, floating crystals, and secure vault architecture."
          icon={
            <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="violet">
              <WarboardSigilIcon className="h-8 w-8" />
            </IconFrame>
          }
          badge="Protected operations"
        />
      </section>

      <AdminSanctumNav labels={navLabels} />
      {children}
    </div>
  );
}
