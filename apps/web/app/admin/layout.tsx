import { headers } from "next/headers";
import { ReactNode } from "react";

import { AdminSanctumNav } from "@/components/admin-sanctum-nav";
import { IconFrame, NexusCrestIcon, WarboardSigilIcon } from "@/components/nexus-icons";
import { ScenePanel } from "@/components/scene-panel";
import { getDictionary } from "@/lib/locale";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const adminPathname = requestHeaders.get("x-admin-pathname");
  const { copy } = await getDictionary();

  if (adminPathname === "/admin/login") {
    return children;
  }

  return (
    <div className="page-shell space-y-8">
      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="panel panel-section-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{copy.adminLayout.eyebrow}</p>
              <h1 className="mt-6 display-title text-[clamp(2.7rem,4.4vw,4.5rem)]">{copy.adminLayout.title}</h1>
              <p className="mt-6 max-w-3xl lead-copy">{copy.adminLayout.description}</p>
            </div>
            <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] md:inline-flex" tone="violet">
              <NexusCrestIcon className="h-8 w-8" />
            </IconFrame>
          </div>
        </div>

        <ScenePanel
          eyebrow={copy.adminLayout.sceneEyebrow}
          title={copy.adminLayout.sceneTitle}
          description={copy.adminLayout.sceneDescription}
          imageSrc="/images/admin-ops-scene.png"
          imageAlt="Arcane Azeroth operations chamber with magical consoles, floating crystals, and secure vault architecture."
          icon={
            <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="violet">
              <WarboardSigilIcon className="h-8 w-8" />
            </IconFrame>
          }
          badge={copy.adminLayout.sceneBadge}
        />
      </section>

      <AdminSanctumNav labels={copy.adminLayout.nav} />
      {children}
    </div>
  );
}
