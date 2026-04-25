"use client";

import { createContext, ReactNode, useContext } from "react";

import type { Dictionary, SupportedLocale } from "@/lib/locale";

type LocaleContextValue = {
  locale: SupportedLocale;
  copy: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  copy,
  children,
}: {
  locale: SupportedLocale;
  copy: Dictionary;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={{ locale, copy }}>{children}</LocaleContext.Provider>;
}

export function useLocaleCopy() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleCopy must be used inside LocaleProvider.");
  }
  return context;
}
