"use client";
import { useEffect, useState } from "react";
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
  const songUrl = "/song.webm";
  const [projectData, setProjectData] = useState({} as projectData);

  useEffect(() => {
    const audio = new Audio(songUrl);
    audio.loop = true;

    const handleUserInteraction = () => {
      audio.play().catch((error) => {
        console.error("error", error);
      });
      // イベントリスナーを一度だけ実行するために削除
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    // ユーザーインタラクションを待機
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    return () => {
      audio.pause();
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

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
        <Logo logoColor="#fff" style={{ marginTop: "100px" }} />
        <p style={{ fontSize: "2rem", fontWeight: 700, marginTop: "80px" }}>
          時間経過で短冊が切り替わります。
          <br />
          どなたでもご参加ください！
        </p>
        <div style={{ position: "fixed", bottom: "20px", right: "390px" }}>
          <h2
            className={css({
              marginBottom: "10px",
            })}
          >
            短冊の投稿はこちらから↓
          </h2>
          <div style={{ marginBottom: "80px" }}>
            <QrCode url={`${currentDomain}`} />
          </div>
        </div>
      </div>
    </>
  );
};
