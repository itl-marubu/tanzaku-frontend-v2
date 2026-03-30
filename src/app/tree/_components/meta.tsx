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

  const currentDomain = location.hostname;
  return (
    <>
      <div
        style={{
          position: "fixed",
          width: "35%",
          top: "10vh",
          right: "10px",
        }}
      >
        {mode === "sakura" ? (
          <img
            src="/sakura-rogo.svg"
            alt="短冊の会　ロゴ"
            style={{
              width: 750,
              height: 300,
              marginTop: "100px",
              objectFit: "contain",
            }}
          />
        ) : (
          <Logo
            logoColor="#fff"
            width={750}
            height={300}
            style={{ marginTop: "100px" }}
          />
        )}
        <p style={{ fontSize: "2rem", fontWeight: 700, marginTop: "80px" }}>
          時間経過で{config.itemName}が切り替わります。
          <br />
          どなたでもご参加ください！
        </p>
        <div style={{ position: "fixed", bottom: "20px", right: "390px" }}>
          <h2
            className={css({
              marginBottom: "10px",
            })}
          >
            {config.itemName}の投稿はこちらから↓
          </h2>
          <div style={{ marginBottom: "80px" }}>
            <QrCode url={`${currentDomain}`} />
          </div>
        </div>
      </div>
    </>
  );
};
