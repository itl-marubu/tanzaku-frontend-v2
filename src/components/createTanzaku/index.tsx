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
          width={375}
          height={225}
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
  const scale = 0.75;
  const cardWidth = 500 * scale;
  const cardHeight = 300 * scale;

  // 背景グラデーション
  const gradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
  gradient.addColorStop(0, "#fff0f5");
  gradient.addColorStop(1, "#ffd6e7");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, cardWidth, cardHeight);

  // 枠線
  ctx.strokeStyle = "#e8a0b4";
  ctx.lineWidth = 3;
  ctx.strokeRect(8 * scale, 8 * scale, 484 * scale, 284 * scale);

  // 桜の花びら装飾
  const petals = [
    { x: 30 * scale, y: 25 * scale, r: 10 * scale },
    { x: 60 * scale, y: 15 * scale, r: 7 * scale },
    { x: 90 * scale, y: 30 * scale, r: 9 * scale },
    { x: 15 * scale, y: 55 * scale, r: 6 * scale },
    { x: 430 * scale, y: 20 * scale, r: 9 * scale },
    { x: 460 * scale, y: 35 * scale, r: 7 * scale },
    { x: 485 * scale, y: 15 * scale, r: 8 * scale },
    { x: 470 * scale, y: 60 * scale, r: 6 * scale },
    { x: 20 * scale, y: 260 * scale, r: 8 * scale },
    { x: 50 * scale, y: 278 * scale, r: 6 * scale },
    { x: 455 * scale, y: 265 * scale, r: 9 * scale },
    { x: 480 * scale, y: 280 * scale, r: 7 * scale },
    { x: 250 * scale, y: 18 * scale, r: 5 * scale },
    { x: 270 * scale, y: 275 * scale, r: 5 * scale },
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
  const line1Y = hasLine2 ? 120 * scale : 145 * scale;

  ctx.font = "bold 36px Yuji Syuku, HG正楷書体-PRO, serif";
  ctx.fillText(textLine1, 250 * scale, line1Y);

  if (hasLine2) {
    ctx.fillText(textLine2, 250 * scale, 170 * scale);
  }

  ctx.font = "22px Yuji Syuku, HG正楷書体-PRO, serif";
  ctx.fillStyle = "#6b3a5a";
  ctx.fillText(nameLine, 250 * scale, 240 * scale);
}
