import { MetaInfo } from "@/features/tree/MetaInfo";
import { SakuraPetalParticles } from "@/features/tree/SakuraPetalParticles";
import { TreeCanvas } from "@/features/tree/TreeCanvas";
import { useFestivalMode } from "@/lib/activeMode";
import { MODE_CONFIG } from "@/lib/festivalMode";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/tree")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: TanzakuShow,
});

function TanzakuShow() {
  const { mode } = useFestivalMode();
  const isSakura = mode === "sakura";

  // ポーリングでモードが切り替わった際、タブのタイトルも追従させる
  // （このルートは head() で title を固定していないため上書きの心配がない）。
  useEffect(() => {
    document.title = MODE_CONFIG[mode].eventName;
  }, [mode]);

  return (
    <main
      className={`relative grid h-screen grid-cols-2 gap-[50px] overflow-hidden font-[Noto_Sans_JP,sans-serif] ${
        isSakura ? "bg-[#fff0f5] text-[#3a1a2e]" : "bg-black text-white"
      }`}
    >
      {isSakura && <SakuraPetalParticles />}
      <div
        className={`absolute bottom-0 left-0 h-screen w-[110vh] origin-[0%_100%] ${
          isSakura ? "" : "animate-sway"
        }`}
      >
        <TreeCanvas />
      </div>
      <MetaInfo />
    </main>
  );
}
