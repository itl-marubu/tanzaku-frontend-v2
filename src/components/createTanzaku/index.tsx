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
    // フォント準備状態は「どのテキストに対して準備できたか」で管理する。
    // テキストが変わると新しいサブセットが必要になるため、未準備扱いに戻す。
    const [fontReadyFor, setFontReadyFor] = useState<string | null>(null);

    const isTanzaku = mode === "tanabata";

    const sample = `${textLine1}${textLine2 ?? ""}${nameLine}`;
    const fontReady = fontReadyFor === sample;

    // canvasはビットマップで、描画後にフォントが届いても再描画されない。
    // 描画前にWebフォントの読み込み完了を待つ（失敗時もフォールバックで描画）。
    // Yuji Syukuはunicode-rangeでサブセット分割されているため、実際に描画する
    // テキストを渡して必要な全サブセットの読み込みを待つ。
    useEffect(() => {
      let active = true;
      document.fonts
        .load(`50px "Yuji Syuku"`, sample)
        .then(() => active && setFontReadyFor(sample))
        .catch(() => active && setFontReadyFor(sample));
      return () => {
        active = false;
      };
    }, [sample]);

    useEffect(() => {
      if (!isTanzaku) {
        // 桜モードは画像不要・即描画
        setImageLoaded(true);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      // 背景画像は 1.webp〜7.webp が存在する（0.webp は無い）
      const random = Math.floor(Math.random() * 7) + 1;
      img.src = `/tanzaku/${random}.webp`;
      img.onload = () => {
        setImage(img);
        setImageLoaded(true);
      };
    }, [isTanzaku]);

    useEffect(() => {
      if (!imageLoaded || !fontReady) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (isTanzaku) {
        drawTanabataCard(ctx, image, textLine1, textLine2, nameLine);
      } else {
        drawSakuraCard(ctx, textLine1, textLine2, nameLine);
      }
    }, [
      textLine1,
      textLine2,
      nameLine,
      image,
      imageLoaded,
      fontReady,
      isTanzaku,
    ]);

    if (isTanzaku) {
      return (
        <canvas
          {...props}
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
          className={[styles.animated, props.className]
            .filter(Boolean)
            .join(" ")}
        />
      );
    }

    return (
      <canvas
        {...props}
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
  ctx.canvas.style.writingMode = "vertical-rl";
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
  // 短冊モードで設定された縦書きが要素に残らないよう明示的に横書きへ戻す
  ctx.canvas.style.writingMode = "horizontal-tb";

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
