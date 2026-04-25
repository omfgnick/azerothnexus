"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { SupportedLocale } from "@/lib/locale";

export function LocaleToggle({ locale }: { locale: SupportedLocale }) {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);

  async function handleChange(nextLocale: SupportedLocale) {
    setIsWorking(true);
    await fetch("/api/locale", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locale: nextLocale }),
    });
    router.refresh();
    setIsWorking(false);
  }

  return (
    <div className="flex items-center gap-2">
      {(["pt-BR", "en"] as SupportedLocale[]).map((option) => {
        const isActive = option === locale;
        return (
          <button
            key={option}
            type="button"
            disabled={isWorking}
            onClick={() => handleChange(option)}
            className={`nav-link min-h-[38px] px-4 py-2 text-[0.68rem] ${isActive ? "border-gold/35 bg-[linear-gradient(180deg,rgba(214,190,144,0.16),rgba(110,203,255,0.06))] text-white" : ""}`}
          >
            {option === "pt-BR" ? "PT" : "EN"}
          </button>
        );
      })}
    </div>
  );
}
