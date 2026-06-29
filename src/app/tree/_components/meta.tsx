"use client";
import { MODE_CONFIG } from "@/lib/festivalMode";
import { festivalModeAtom } from "@/lib/festivalModeAtom";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { css } from "styled-system/css";
import { Logo } from "./Logo";
import { QrCode } from "./qrcode";

type projectData = {
  name: string;
  description: string;
  noticeLarge?: string;
  noticeQR?: string;
};

export const MetaInfo: React.FC = () => {
  const mode = useAtomValue(festivalModeAtom);
  const config = MODE_CONFIG[mode];
  const songUrl = mode === "sakura" ? "/song-sakura.webm" : "/song.webm";

  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [projectData, setProjectData] = useState({} as projectData);

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
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "40vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "4vh 1.2vw",
          boxSizing: "border-box",
          // 空白を詰めた分の再センタリングを打ち消し、ロゴを約5%下げつつ
          // QRコード下端の位置は変えないために全体を下方向へずらす
          transform: "translateY(2.5vh)",
        }}
      >
        {mode === "sakura" ? (
          <img
            src="/sakura-rogo.svg"
            alt="短冊の会　ロゴ"
            style={{
              width: "min(33vw, 700px)",
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        ) : (
          <Logo
            logoColor="#fff"
            width={750}
            height={300}
            style={{
              width: "min(28vw, 560px)",
              maxWidth: "100%",
              height: "auto",
            }}
          />
        )}
        <p style={{ fontSize: "2rem", fontWeight: 700, marginTop: "3.5vh" }}>
          時間経過で{config.itemName}が切り替わります。
          <br />
          どなたでもご参加ください！
        </p>
        <div
          style={{
            marginTop: "3.5vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // QRコードと案内文を画面比率で約3%分下へ移動
            transform: "translateY(3vh)",
          }}
        >
          <h2
            className={css({
              marginBottom: "10px",
              // 既存より約2倍の大きさに（preflight reset で実質1rem のため）
              fontSize: "2rem",
            })}
          >
            {config.itemName}の投稿はこちらから↓
          </h2>
          <QrCode url={`${currentOrigin}`} />
        </div>
      </div>
    </>
  );
};
