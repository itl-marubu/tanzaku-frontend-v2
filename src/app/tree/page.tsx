"use client";
import { festivalModeAtom } from "@/lib/festivalModeAtom";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { SakuraPetalParticles } from "./_components/SakuraPetalParticles";
import { TanzakuToImage } from "./_components/t2i";
import styles from "./page.module.scss";

export default function TanzakuShow() {
  const mode = useAtomValue(festivalModeAtom);
  const MetaInfo = dynamic(
    () => import("./_components/meta").then((mod) => mod.MetaInfo),
    {
      ssr: false,
    },
  );
  return (
    <main className={clsx(styles.main, mode === "sakura" && styles.sakura)}>
      {mode === "sakura" && <SakuraPetalParticles />}
      <div
        className={styles.sasa}
        style={mode === "sakura" ? { animation: "none" } : undefined}
      >
        <TanzakuToImage />
      </div>
      <MetaInfo />
    </main>
  );
}
