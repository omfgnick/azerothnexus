"use client";

import { useEffect, useState } from "react";

import { EntityRefreshButton } from "@/components/entity-refresh-button";

type AdminEntityRefreshSlotProps = {
  entityType: "guild" | "character";
  region: string;
  realm: string;
  name: string;
  pathName: string;
};

export function AdminEntityRefreshSlot({ entityType, region, realm, name, pathName }: AdminEntityRefreshSlotProps) {
  const [canRefresh, setCanRefresh] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({}))) as { authenticated?: boolean };
        if (isMounted) {
          setCanRefresh(Boolean(payload.authenticated));
        }
      } catch {
        if (isMounted) {
          setCanRefresh(false);
        }
      }
    }

    void loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!canRefresh) {
    return null;
  }

  return <EntityRefreshButton entityType={entityType} region={region} realm={realm} name={name} pathName={pathName} />;
}
