"use client";

import type { FestivalMode } from "@/lib/festivalMode";
import { forwardRef, useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";

type TanzakuProps = {
  textLine1: string;
  textLine2?: string;
  nameLine: string;
  mode?: FestivalMode;
} & React.HTMLAttributes<HTMLCanvasElement>;

export const CreateTanzaku = forwardRef<HTMLCanvasElement, TanzakuProps>(
  function CreateTanzaku(
    { textLine1, textLine2, nameLine, mode = "tanabata", ...props },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    const isSakura = mode === "sakura";

    useEffect(() => {
      if (isSakura) {
        // 桜モードは画像不要・即描画
        setImageLoaded(true);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      const random = Math.floor(Math.random() * 7);
      img.src = `/tanzaku/${random}.webp`;
      img.onload = () => {
        setImage(img);
        setImageLoaded(true);
      };
    }, [isSakura]);

    useEffect(() => {
      if (!imageLoaded) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (isSakura) {
        drawSakuraCard(ctx, textLine1, textLine2, nameLine);
      } else {
        drawTanabataCard(ctx, image, textLine1, textLine2, nameLine);
      }
    }, [textLine1, textLine2, nameLine, image, imageLoaded, isSakura]);

    if (isSakura) {
      return (
        <canvas
          ref={(node) => {
            canvasRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          width={500}
          height={300}
          className={styles.sakuraFloat}
          {...props}
        />
      );
    }

    return (
      <canvas
        ref={(node) => {
          canvasRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        width={300}
        height={500}
        className={styles.animated}
        {...props}
      />
    );
  },
);

function drawTanabataCard(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  textLine1: string,
  textLine2: string | undefined,
  nameLine: string,
) {
  if (!image) return;
  ctx.drawImage(image, 0, 0, 300, 500);
  ctx.save();
  ctx.translate(45, 100);
  ctx.rotate((85 * Math.PI) / 180);
  ctx.font = "50px Yuji Syuku, HG正楷書体-PRO, serif";
  ctx.fillStyle = "black";
  ctx.fillText(textLine1, 25, -110);
  ctx.fillText(textLine2 || "", 40, -50);
  ctx.font = "30px Yuji Syuku, HG正楷書体-PRO, serif";
  ctx.fillText(nameLine, 150, -10);
  ctx.restore();
}

function drawSakuraCard(
  ctx: CanvasRenderingContext2D,
  textLine1: string,
  textLine2: string | undefined,
  nameLine: string,
) {
  // 背景グラデーション
  const gradient = ctx.createLinearGradient(0, 0, 500, 300);
  gradient.addColorStop(0, "#fff0f5");
  gradient.addColorStop(1, "#ffd6e7");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 500, 300);

  // 枠線
  ctx.strokeStyle = "#e8a0b4";
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, 484, 284);

  // 桜の花びら装飾
  const petals = [
    { x: 30, y: 25, r: 10 },
    { x: 60, y: 15, r: 7 },
    { x: 90, y: 30, r: 9 },
    { x: 15, y: 55, r: 6 },
    { x: 430, y: 20, r: 9 },
    { x: 460, y: 35, r: 7 },
    { x: 485, y: 15, r: 8 },
    { x: 470, y: 60, r: 6 },
    { x: 20, y: 260, r: 8 },
    { x: 50, y: 278, r: 6 },
    { x: 455, y: 265, r: 9 },
    { x: 480, y: 280, r: 7 },
    { x: 250, y: 18, r: 5 },
    { x: 270, y: 275, r: 5 },
  ];

  for (const p of petals) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 150, 180, 0.6)";
    ctx.fill();
    // 花びらの内側（白い中心）
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 230, 240, 0.8)";
    ctx.fill();
  }

  // テキスト
  ctx.textAlign = "center";
  ctx.fillStyle = "#3a1a2e";

  const hasLine2 = textLine2 && textLine2.length > 0;
  const line1Y = hasLine2 ? 120 : 145;

  ctx.font = "bold 36px Yuji Syuku, HG正楷書体-PRO, serif";
  ctx.fillText(textLine1, 250, line1Y);

  if (hasLine2) {
    ctx.fillText(textLine2, 250, 170);
  }

  ctx.font = "22px Yuji Syuku, HG正楷書体-PRO, serif";
  ctx.fillStyle = "#6b3a5a";
  ctx.fillText(nameLine, 250, 240);
}
