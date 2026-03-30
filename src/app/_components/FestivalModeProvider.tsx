"use client";

import { useSetAtom } from "jotai";
import { useEffect } from "react";
import type { FestivalMode } from "@/lib/festivalMode";
import { festivalModeAtom } from "@/lib/festivalModeAtom";

export const FestivalModeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const setMode = useSetAtom(festivalModeAtom);

  useEffect(() => {
    const fetchMode = async () => {
      try {
        const res = await fetch("/api/mode");
        const data = (await res.json()) as { mode: FestivalMode };
        setMode(data.mode);
      } catch (error) {
        console.error("Failed to fetch festival mode:", error);
      }
    };

    fetchMode();
    const interval = setInterval(fetchMode, 30000);
    return () => clearInterval(interval);
  }, [setMode]);

  return <>{children}</>;
};
