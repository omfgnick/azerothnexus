import { AdminLoginForm } from "@/components/admin-login-form";
import { IconFrame, NexusCrestIcon } from "@/components/nexus-icons";
import { ScenePanel } from "@/components/scene-panel";
import { getDictionary } from "@/lib/locale";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const resolved = await searchParams;
  const { copy } = await getDictionary();

  return (
    <div className="page-shell space-y-8">
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="panel panel-section-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{copy.admin.loginEyebrow}</p>
              <h1 className="mt-6 display-title text-[clamp(2.8rem,4.5vw,4.6rem)]">{copy.admin.loginTitle}</h1>
              <p className="mt-6 max-w-2xl lead-copy">{copy.admin.loginDescription}</p>
            </div>
            <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] md:inline-flex" tone="violet">
              <NexusCrestIcon className="h-8 w-8" />
            </IconFrame>
          </div>

          <div className="mt-8 max-w-xl">
            <AdminLoginForm
              nextPath={resolved.next ?? "/admin"}
              labels={{
                username: copy.admin.loginUsername,
                password: copy.admin.loginPassword,
                submit: copy.admin.loginButton,
                entering: copy.admin.entering,
                invalid: copy.admin.loginInvalid,
                unavailable: copy.admin.loginUnavailable,
                genericError: copy.admin.loginFailed,
              }}
            />
          </div>
        </div>

        <ScenePanel
          eyebrow={copy.admin.loginEyebrow}
          title={copy.admin.loginSceneTitle}
          description={copy.admin.loginSceneDescription}
          imageSrc="/images/admin-ops-scene.png"
          imageAlt="A luminous operations gate inside a Warcraft-inspired arcane command chamber."
          icon={
            <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="violet">
              <NexusCrestIcon className="h-8 w-8" />
            </IconFrame>
          }
          badge={copy.admin.loginSceneBadge}
          priority
        />
      </section>
    </div>
  );
}
