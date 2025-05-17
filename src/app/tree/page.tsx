"use client";
import dynamic from "next/dynamic";
import { MetaInfo } from "./_components/meta";
import { TanzakuToImage } from "./_components/t2i";
import styles from "./page.module.scss";

export default function TanzakuShow({ params }: { params: { id: string } }) {
  const MetaInfo = dynamic(
    () => import("./_components/meta").then((mod) => mod.MetaInfo),
    {
      ssr: false,
    },
  );
  return (
    <main className={styles.main}>
      <div className={styles.sasa}>
        <TanzakuToImage id={params.id} />
      </div>
      <MetaInfo id={params.id} />
    </main>
  );
}
