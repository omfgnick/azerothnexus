"use client";

import { motion } from "framer-motion";

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

      <div className="relative grid gap-10 xl:grid-cols-[1.18fr_0.82fr] xl:items-center">
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
            Chart the currents of Azeroth before the realm can name them.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-6 max-w-3xl lead-copy"
          >
            Azeroth Nexus now feels less like a dashboard and more like a celestial war room: dramatic, rune-lit, and built for leaders who want guild momentum, raid progression, Mythic+ shifts, and character power at a glance.
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
          className="relative hidden xl:block"
        >
          <div className="relative mx-auto flex aspect-square max-w-[30rem] items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-gold/15" />
            <div className="absolute inset-10 rounded-full border border-sky-300/15" />
            <div className="absolute inset-20 rounded-full border border-violet-300/15" />
            <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(110,203,255,0.18),rgba(122,104,255,0.1),transparent_72%)] blur-2xl" />

            <div className="absolute left-6 top-16 max-w-[12rem] rounded-[1.6rem] border border-gold/15 bg-[#08101f]/90 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.34)]">
              <div className="text-[0.62rem] uppercase tracking-[0.34em] text-gold/70">Celestial focus</div>
              <div className="mt-3 text-2xl text-gold" style={{ fontFamily: "var(--font-display)" }}>
                Guild Radar
              </div>
              <p className="mt-3 text-sm text-white/55">Runic trails highlight the factions and rosters shaping the season.</p>
            </div>

            <div className="absolute bottom-16 right-4 max-w-[12rem] rounded-[1.6rem] border border-sky-300/15 bg-[#08101f]/90 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.34)]">
              <div className="text-[0.62rem] uppercase tracking-[0.34em] text-sky-200/80">Astral scan</div>
              <div className="mt-3 text-2xl text-sky-100" style={{ fontFamily: "var(--font-display)" }}>
                Mythic Pulse
              </div>
              <p className="mt-3 text-sm text-white/55">Meta shifts, timed keys, and raid pressure surface inside the observatory.</p>
            </div>

            <div className="relative z-10 flex h-52 w-52 flex-col items-center justify-center rounded-full border border-gold/25 bg-[radial-gradient(circle,rgba(214,190,144,0.16),rgba(110,203,255,0.08),rgba(3,6,14,0.9))] text-center shadow-[0_0_60px_rgba(110,203,255,0.18)]">
              <div className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/85">Observatory core</div>
              <div className="mt-4 text-3xl text-gold" style={{ fontFamily: "var(--font-display)" }}>
                Ascendant
              </div>
              <p className="mt-3 max-w-[10rem] text-sm text-white/60">A home page with more ritual, hierarchy, and raid-night drama.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
