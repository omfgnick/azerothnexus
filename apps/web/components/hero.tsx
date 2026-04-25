"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { ArchiveSigilIcon, IconFrame, NexusCrestIcon, WarboardSigilIcon } from "@/components/nexus-icons";
import { SearchCommandPalette } from "@/components/search-command-palette";

type HeroProps = {
  copy: {
    eyebrow: string;
    title: string;
    description: string;
    readings: Array<{ label: string; detail: string }>;
    observatoryEyebrow: string;
    observatoryTitle: string;
    warboardLabel: string;
    warboardDetail: string;
    archiveLabel: string;
    archiveDetail: string;
    signatureLabel: string;
    signatureTitle: string;
    signatureDescription: string;
    commandLabel: string;
    commandDescription: string;
    warboardValue: string;
    archiveValue: string;
  };
};

const readingValues = ["18.4K", "Live", "24/7"];

export function Hero({ copy }: HeroProps) {
  return (
    <section className="panel panel-section-lg panel-legendary section-grid nexus-hero-shell">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(110,203,255,0.14),transparent_0_24%),radial-gradient(circle_at_82%_16%,rgba(214,190,144,0.16),transparent_0_24%),radial-gradient(circle_at_72%_76%,rgba(122,104,255,0.14),transparent_0_28%)]" />
      <div className="relative grid gap-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="legend-frame">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="mt-5 display-title sm:mt-6">{copy.title}</h1>
            <p className="mt-5 max-w-3xl lead-copy sm:mt-6">{copy.description}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-6 citadel-grid sm:grid-cols-2 xl:grid-cols-3"
          >
            {copy.readings.map((reading, index) => (
              <div key={reading.label} className="data-slab min-h-[10.5rem] sm:min-h-[12rem]">
                <div className="text-[0.64rem] uppercase tracking-[0.34em] text-gold/72">{reading.label}</div>
                <div
                  className={`mt-4 score-number ${index === 1 ? "tone-arcane" : "tone-gold"}`}
                  style={index === 2 ? { color: "rgba(196, 243, 225, 0.95)" } : undefined}
                >
                  {readingValues[index] ?? "Live"}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/64 sm:leading-7">{reading.detail}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 grid gap-4 md:grid-cols-[0.82fr_1.18fr]"
          >
            <div className="data-slab flex min-h-[11rem] flex-col justify-between sm:min-h-[12rem]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[0.62rem] uppercase tracking-[0.34em] text-gold/72">{copy.signatureLabel}</div>
                  <div
                    className="mt-3 text-[1.35rem] leading-tight text-white sm:mt-4 sm:text-[1.65rem]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {copy.signatureTitle}
                  </div>
                </div>
                <IconFrame className="h-11 w-11 rounded-[1rem] sm:h-12 sm:w-12" tone="gold">
                  <NexusCrestIcon className="h-5 w-5" />
                </IconFrame>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/62 sm:mt-4 sm:leading-7">{copy.signatureDescription}</p>
            </div>

            <div className="data-slab ritual-stripe min-h-[11rem] sm:min-h-[12rem]">
              <div className="text-[0.62rem] uppercase tracking-[0.34em] text-sky-200/72">{copy.commandLabel}</div>
              <p className="mt-3 text-sm leading-6 text-white/66 sm:mt-4 sm:leading-7">{copy.commandDescription}</p>
              <div className="mt-4 sm:mt-5">
                <SearchCommandPalette compact />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.16 }}
          className="relative"
        >
          <div className="nexus-stage">
            <div className="relative min-h-[24rem] overflow-hidden rounded-[28px] sm:min-h-[28rem] md:min-h-[39rem]">
              <Image
                src="/images/nexus-observatory-hero.png"
                alt="Moonlit Azeroth Nexus observatory overlooking arcane beams and a celestial skyline."
                fill
                priority
                quality={96}
                sizes="(max-width: 1280px) 100vw, 52vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,18,0.06),rgba(7,10,18,0.3)_24%,rgba(7,10,18,0.72)_62%,rgba(7,10,18,0.94)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(214,190,144,0.22),transparent_0_22%),radial-gradient(circle_at_78%_18%,rgba(110,203,255,0.26),transparent_0_24%),radial-gradient(circle_at_56%_100%,rgba(122,104,255,0.16),transparent_0_28%)]" />
              <div className="orbit-ring hidden md:block" />

              <div className="absolute left-5 right-5 top-5 z-10 flex items-start justify-between gap-4 sm:left-6 sm:right-6 sm:top-6 md:left-8 md:right-8 md:top-8">
                <div className="max-w-xl">
                  <p className="eyebrow">{copy.observatoryEyebrow}</p>
                  <h2 className="mt-4 section-title max-w-lg sm:mt-5">{copy.observatoryTitle}</h2>
                </div>
                <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] sm:inline-flex" tone="gold">
                  <NexusCrestIcon className="h-8 w-8" />
                </IconFrame>
              </div>

              <div className="absolute inset-x-4 bottom-4 z-10 grid gap-3 sm:inset-x-6 sm:bottom-6 sm:gap-4 md:inset-x-8 md:bottom-8 md:grid-cols-[1.08fr_0.92fr]">
                <div className="data-slab border-gold/20 bg-[#08101f]/78 backdrop-blur-md">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <IconFrame className="h-11 w-11 rounded-[1rem] sm:h-12 sm:w-12" tone="gold">
                      <WarboardSigilIcon className="h-5 w-5" />
                    </IconFrame>
                    <div className="min-w-0">
                      <div className="text-[0.62rem] uppercase tracking-[0.34em] text-gold/72">{copy.warboardLabel}</div>
                      <div className="mt-3 text-[1.4rem] leading-none text-gold sm:mt-4 sm:text-[1.85rem]" style={{ fontFamily: "var(--font-display)" }}>{copy.warboardValue}</div>
                      <p className="mt-3 text-sm leading-6 text-white/64 sm:mt-4 sm:leading-7">{copy.warboardDetail}</p>
                    </div>
                  </div>
                </div>

                <div className="data-slab border-sky-300/20 bg-[#08101f]/78 backdrop-blur-md">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <IconFrame className="h-11 w-11 rounded-[1rem] sm:h-12 sm:w-12" tone="arcane">
                      <ArchiveSigilIcon className="h-5 w-5" />
                    </IconFrame>
                    <div className="min-w-0">
                      <div className="text-[0.62rem] uppercase tracking-[0.34em] text-sky-200/80">{copy.archiveLabel}</div>
                      <div
                        className="mt-3 text-[1.4rem] leading-none text-sky-100 sm:mt-4 sm:text-[1.85rem]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {copy.archiveValue}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/64 sm:mt-4 sm:leading-7">{copy.archiveDetail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
