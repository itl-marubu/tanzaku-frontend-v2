import { ACTIVE_MODE, IS_SAKURA } from "@/lib/activeMode";
import { MODE_CONFIG } from "@/lib/festivalMode";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { QrCode } from "./QrCode";

export const MetaInfo: React.FC = () => {
  const config = MODE_CONFIG[ACTIVE_MODE];
  const songUrl = IS_SAKURA ? "/song-sakura.webm" : "/song.webm";

  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初回ユーザーインタラクション待機
  useEffect(() => {
    if (hasInteracted) return;

    const handleInteraction = () => {
      setHasInteracted(true);
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [hasInteracted]);

  // モードが変わったら音楽を切り替え
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(songUrl);
    audio.loop = true;
    audioRef.current = audio;

    if (hasInteracted) {
      audio.play().catch((error) => {
        console.error("audio play error:", error);
      });
    }

    return () => {
      audio.pause();
    };
  }, [songUrl, hasInteracted]);

  // QR にプロトコルを含めないと URL として認識されない端末があるため origin を使用
  const currentOrigin = location.origin;
  return (
    <div
      className="fixed top-0 right-0 box-border flex h-screen w-[40vw] flex-col items-center justify-center px-[1.2vw] py-[4vh] text-center"
      style={{
        // 空白を詰めた分の再センタリングを打ち消し、ロゴを約5%下げつつ
        // QRコード下端の位置は変えないために全体を下方向へずらす
        transform: "translateY(2.5vh)",
      }}
    >
      {IS_SAKURA ? (
        <img
          src="/sakura-rogo.svg"
          alt="短冊の会　ロゴ"
          className="h-auto max-w-full object-contain"
          style={{ width: "min(33vw, 700px)" }}
        />
      ) : (
        <Logo
          logoColor="#fff"
          width={750}
          height={300}
          className="h-auto max-w-full"
          style={{ width: "min(28vw, 560px)" }}
        />
      )}
      <p className="mt-[3.5vh] text-[2rem] font-bold">
        時間経過で{config.itemName}が切り替わります。
        <br />
        どなたでもご参加ください！
      </p>
      <div
        className="mt-[3.5vh] flex flex-col items-center"
        style={{
          // QRコードと案内文を画面比率で約3%分下へ移動
          transform: "translateY(3vh)",
        }}
      >
        <h2 className="mb-2.5 text-[2rem]">
          {config.itemName}の投稿はこちらから↓
        </h2>
        <QrCode url={`${currentOrigin}`} />
      </div>
    </div>
  );
};
