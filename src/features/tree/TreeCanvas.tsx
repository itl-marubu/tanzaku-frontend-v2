import { type DisplayTanzaku, getRecentTanzaku } from "@/api/client";
import { TanzakuCanvas } from "@/components/TanzakuCanvas";
import { ACTIVE_MODE, IS_SAKURA } from "@/lib/activeMode";
import {
  FETCH_INTERVAL_MS,
  type Position,
  SAKURA_CARD_LIMIT,
  SAKURA_CARD_WIDTH_VW,
  SAKURA_FALLBACK_BG_HEIGHT,
  SAKURA_FALLBACK_BG_WIDTH,
  TANABATA_CARD_LIMIT,
  generateSakuraPositions,
  tanabataPositions,
} from "@/lib/treeLayout";
import { useEffect, useRef, useState } from "react";

// 旧 t2i.tsx (TanzakuToImage) の移植。配置計算は lib/treeLayout の
// 純粋関数へ委譲し、背景描画・ポーリングをここで担う。
export const TreeCanvas: React.FC = () => {
  const mode = ACTIVE_MODE;
  const isSakura = IS_SAKURA;
  const cardLimit = isSakura ? SAKURA_CARD_LIMIT : TANABATA_CARD_LIMIT;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tanzakuArray, setTanzakuArray] = useState<DisplayTanzaku[]>([]);
  const [sakuraPositions, setSakuraPositions] = useState<Position[]>([]);

  useEffect(() => {
    const fetchTanzaku = async () => {
      try {
        const tanzakuData = await getRecentTanzaku(cardLimit);
        if (!tanzakuData) {
          throw new Error("データの取得に失敗しました");
        }
        setTanzakuArray(tanzakuData);
      } catch (error) {
        console.error("短冊データの取得に失敗しました:", error);
        alert("問題が発生しました。\n エラーコード: geterr2");
      }
    };

    fetchTanzaku();
    const interval = setInterval(fetchTanzaku, FETCH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [cardLimit]);

  useEffect(() => {
    if (!isSakura || tanzakuArray.length === 0) return;
    setSakuraPositions(
      generateSakuraPositions(tanzakuArray.length, {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      }),
    );
  }, [isSakura, tanzakuArray]);

  useEffect(() => {
    setImageLoaded(false);
    setImage(null);

    let active = true;
    const bgImage = new Image();
    bgImage.onload = () => {
      if (!active) return;
      setImage(bgImage);
      setImageLoaded(true);
    };
    // sakura-tree.webp がない場合でも描画を続行する
    bgImage.onerror = () => {
      if (!active) return;
      setImageLoaded(true);
    };
    bgImage.src = isSakura ? "/sakura-tree.webp" : "/sasa.webp";

    // キャッシュ済み画像でイベントを取りこぼすケースを吸収
    if (bgImage.complete) {
      if (bgImage.naturalWidth > 0) {
        setImage(bgImage);
      }
      setImageLoaded(true);
    }

    return () => {
      active = false;
    };
  }, [isSakura]);

  useEffect(() => {
    if (imageLoaded && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        if (image) {
          const width = image.width;
          const height = image.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(image, 0, 0, width, height);
        } else if (isSakura) {
          // sakura-tree.webp がない場合は桜色の背景で代替
          canvas.width = SAKURA_FALLBACK_BG_WIDTH;
          canvas.height = SAKURA_FALLBACK_BG_HEIGHT;
          const gradient = ctx.createLinearGradient(
            0,
            0,
            0,
            SAKURA_FALLBACK_BG_HEIGHT,
          );
          gradient.addColorStop(0, "#fff0f5");
          gradient.addColorStop(1, "#fce4ec");
          ctx.fillStyle = gradient;
          ctx.fillRect(
            0,
            0,
            SAKURA_FALLBACK_BG_WIDTH,
            SAKURA_FALLBACK_BG_HEIGHT,
          );
        }
      }
    }
  }, [image, imageLoaded, isSakura]);

  const positionArray = isSakura ? sakuraPositions : tanabataPositions;
  const canPlaceCards = !isSakura || positionArray.length > 0;

  return (
    <>
      <canvas
        ref={canvasRef}
        width={1000}
        height={1000}
        className="absolute bottom-0 left-0 block h-screen w-auto"
      />
      {canPlaceCards &&
        tanzakuArray.map((tanzaku, index) => {
          const positionIndex = index % positionArray.length;
          return (
            <TanzakuCanvas
              key={tanzaku.id}
              mode={mode}
              textLine1={tanzaku.textLine1}
              textLine2={tanzaku.textLine2}
              nameLine={tanzaku.userName ?? ""}
              style={{
                position: "absolute",
                ...(isSakura
                  ? { width: `${SAKURA_CARD_WIDTH_VW}vw`, height: "auto" }
                  : { height: "220px", width: "auto" }),
                left: positionArray[positionIndex].x,
                top: positionArray[positionIndex].y,
              }}
            />
          );
        })}
    </>
  );
};
