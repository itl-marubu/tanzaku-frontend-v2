import { MetaInfo } from "@/features/tree/MetaInfo";
import { SakuraPetalParticles } from "@/features/tree/SakuraPetalParticles";
import { TreeCanvas } from "@/features/tree/TreeCanvas";
import { IS_SAKURA } from "@/lib/activeMode";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tree")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: TanzakuShow,
});

function TanzakuShow() {
  return (
    <main
      className={`relative grid h-screen grid-cols-2 gap-[50px] overflow-hidden font-[Noto_Sans_JP,sans-serif] ${
        IS_SAKURA ? "bg-[#fff0f5] text-[#3a1a2e]" : "bg-black text-white"
      }`}
    >
      {IS_SAKURA && <SakuraPetalParticles />}
      <div
        className={`absolute bottom-0 left-0 h-screen w-[110vh] origin-[0%_100%] ${
          IS_SAKURA ? "" : "animate-sway"
        }`}
      >
        <TreeCanvas />
      </div>
      <MetaInfo />
    </main>
  );
}
