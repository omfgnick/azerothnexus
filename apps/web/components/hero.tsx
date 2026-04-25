"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { ArchiveSigilIcon, IconFrame, NexusCrestIcon, WarboardSigilIcon } from "@/components/nexus-icons";
import { SearchCommandPalette } from "@/components/search-command-palette";

const observatoryReadings = [
  { label: "Guild war rooms", value: "18.4K", detail: "Tracked entities primed for scouting" },
  { label: "Constellation pulse", value: "Live", detail: "Raid, Mythic+, and roster signals updated" },
  { label: "Runes in motion", value: "24/7", detail: "Search, rankings, and progression under watch" }
];

export function Hero() {
  return (
    <section className="panel panel-section-lg section-grid">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(110,203,255,0.14),transparent_0_24%),radial-gradient(circle_at_82%_18%,rgba(214,190,144,0.14),transparent_0_24%),radial-gradient(circle_at_70%_68%,rgba(122,104,255,0.12),transparent_0_28%)]" />
      <div className="pointer-events-none absolute -right-24 top-10 hidden h-[28rem] w-[28rem] rounded-full border border-gold/15 xl:block" />
      <div className="pointer-events-none absolute -right-12 top-24 hidden h-[20rem] w-[20rem] rounded-full border border-sky-300/15 xl:block" />
      <div className="pointer-events-none absolute right-20 top-28 hidden h-2 w-2 rounded-full bg-gold shadow-[0_0_24px_rgba(212,168,79,0.8)] xl:block" />

      <div className="relative grid gap-10 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
        <div className="max-w-4xl">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="eyebrow">
            Arcane Observatory
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-6 display-title"
          >
            Azeroth Nexus charts the currents of Azeroth before the realm can name them.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-6 max-w-3xl lead-copy"
          >
            An epic observatory for guild momentum, raid progression, Mythic+ shifts, and character power. The interface now has places, artifacts, and signatures that feel like they belong to Azeroth Nexus instead of a generic dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-8 grid gap-4 md:grid-cols-3"
          >
            {observatoryReadings.map((reading) => (
              <div key={reading.label} className="data-slab">
                <div className="text-[0.7rem] uppercase tracking-[0.32em] text-gold/75">{reading.label}</div>
                <div className="mt-3 score-number tone-gold">{reading.value}</div>
                <p className="mt-3 text-sm text-white/60">{reading.detail}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
            <SearchCommandPalette compact />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="panel overflow-hidden">
            <div className="relative min-h-[24rem] md:min-h-[30rem]">
              <Image
                src="/images/nexus-observatory-hero.png"
                alt="Moonlit Azeroth Nexus observatory overlooking arcane beams and a celestial skyline."
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 48vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,9,18,0.12),rgba(6,9,18,0.42)_38%,rgba(6,9,18,0.9)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(214,190,144,0.2),transparent_0_24%),radial-gradient(circle_at_80%_18%,rgba(110,203,255,0.24),transparent_0_22%),radial-gradient(circle_at_54%_92%,rgba(122,104,255,0.18),transparent_0_26%)]" />

              <div className="relative z-10 flex h-full flex-col justify-between gap-8 p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Azeroth Nexus</p>
                    <h2 className="mt-5 section-title max-w-lg">A signature observatory with real places, art, and iconography.</h2>
                  </div>
                  <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="gold">
                    <NexusCrestIcon className="h-8 w-8" />
                  </IconFrame>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="data-slab border-gold/20 bg-[#08101f]/80 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <IconFrame className="h-12 w-12 rounded-[1rem]" tone="gold">
                        <WarboardSigilIcon className="h-5 w-5" />
                      </IconFrame>
                      <div>
                        <div className="text-[0.62rem] uppercase tracking-[0.34em] text-gold/70">Warboard focus</div>
                        <div className="mt-3 text-2xl text-gold" style={{ fontFamily: "var(--font-display)" }}>
                          Guild Radar
                        </div>
                        <p className="mt-3 text-sm text-white/60">Runic trails and strongholds make the ranking layer feel like a live command chamber.</p>
                      </div>
                    </div>
                  </div>

                  <div className="data-slab border-sky-300/20 bg-[#08101f]/80 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <IconFrame className="h-12 w-12 rounded-[1rem]" tone="arcane">
                        <ArchiveSigilIcon className="h-5 w-5" />
                      </IconFrame>
                      <div>
                        <div className="text-[0.62rem] uppercase tracking-[0.34em] text-sky-200/80">Archive focus</div>
                        <div className="mt-3 text-2xl text-sky-100" style={{ fontFamily: "var(--font-display)" }}>
                          Scrying Desk
                        </div>
                        <p className="mt-3 text-sm text-white/60">Search now reads like a ritual library, not a plain utility form dropped into the page.</p>
                      </div>
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
