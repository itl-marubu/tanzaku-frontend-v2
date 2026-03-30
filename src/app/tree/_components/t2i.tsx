"use client";

import { getRecentTanzaku } from "@/api/client";
import { CreateTanzaku } from "@/components/createTanzaku";
import { festivalModeAtom } from "@/lib/festivalModeAtom";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";

type TanzakuItem = {
  id: string;
  textLine1: string;
  textLine2?: string;
  userName: string;
};

type Position = { x: string; y: string };
type SakuraCell = {
  col: number;
  row: number;
  centerXVw: number;
  centerYVh: number;
  allowed: boolean;
};

const SAKURA_CARD_WIDTH_VW = 10.5;
const SAKURA_CARD_ASPECT_RATIO = 225 / 375;
const SAKURA_CARD_LIMIT = 14;
const TANABATA_CARD_LIMIT = 10;
const FETCH_INTERVAL_MS = 60_000;
const SAKURA_FALLBACK_BG_WIDTH = 1200;
const SAKURA_FALLBACK_BG_HEIGHT = 1000;
const SAKURA_POSITION_JITTER_RATIO = 0.7;

const squaredDistance = (a: SakuraCell, b: SakuraCell) => {
  const dx = a.centerXVw - b.centerXVw;
  const dy = a.centerYVh - b.centerYVh;
  return dx * dx + dy * dy;
};

// カードのアスペクト比: 375:225 = 5:3
// ビューポートサイズに応じてカード高さ(vh)を動的計算し、セルサイズを決定する
function generateSakuraPositions(count: number): Position[] {
  const cardWvw = SAKURA_CARD_WIDTH_VW;
  const cardWpx = (window.innerWidth * cardWvw) / 100;
  const cardHpx = cardWpx * SAKURA_CARD_ASPECT_RATIO;
  const cardHvh = (cardHpx / window.innerHeight) * 100;

  const marginVw = 2;
  const marginVh = 2;
  const cellW = cardWvw + marginVw; // カード幅 + 左右余白
  const cellH = cardHvh + marginVh; // 実測カード高さ + マージン

  // 右パネル(ロゴ・QRコード)が width:35% で固定されているため左 60vw 以内に収める
  const maxWidthVw = 60;
  // 枝葉が多い上側に寄せ、太い幹・下側の余白には置かない
  const canopyMaxYVh = 66;
  const trunkMinXVw = 24;
  const trunkMaxXVw = 40;
  const trunkMinYVh = 30;

  const cols = Math.floor(maxWidthVw / cellW);
  const rows = Math.floor(100 / cellH);

  const cells: SakuraCell[] = Array.from({ length: cols * rows }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const centerXVw = col * cellW + cardWvw / 2;
    const centerYVh = row * cellH + cardHvh / 2;

    const inCanopy = centerYVh <= canopyMaxYVh;
    const inTrunk =
      centerXVw >= trunkMinXVw &&
      centerXVw <= trunkMaxXVw &&
      centerYVh >= trunkMinYVh;
    const inTopLeftBlockedCell = col === 0 && row === 0;
    const inTopRightBlockedCell = col === cols - 1 && row === 0;

    return {
      col,
      row,
      centerXVw,
      centerYVh,
      allowed:
        inCanopy &&
        !inTrunk &&
        !inTopLeftBlockedCell &&
        !inTopRightBlockedCell,
    };
  });

  const allowedCells = cells.filter((cell) => cell.allowed);
  const candidateCells = allowedCells.length > 0 ? allowedCells : cells;
  const targetCount = Math.min(count, candidateCells.length);

  if (targetCount === 0) {
    return [];
  }

  const remaining = [...candidateCells];
  const selected: SakuraCell[] = [];

  // 1枚目はランダムに選び、以降は既存カード群から最も離れるセルを優先する
  const firstIndex = Math.floor(Math.random() * remaining.length);
  selected.push(remaining.splice(firstIndex, 1)[0]);

  while (selected.length < targetCount && remaining.length > 0) {
    let bestIndex = 0;
    let bestScore = -1;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      let minDistSq = Number.POSITIVE_INFINITY;

      for (const placed of selected) {
        const distSq = squaredDistance(candidate, placed);
        if (distSq < minDistSq) {
          minDistSq = distSq;
        }
      }

      // 同スコアが続く場合に毎回同じ形になりすぎないよう微小ランダムを加える
      const score = minDistSq + Math.random() * 0.0001;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    selected.push(remaining.splice(bestIndex, 1)[0]);
  }

  // ジッターは margin の範囲内に収めるので重なりは発生しない
  return selected.map(({ col, row }) => ({
    x: `${col * cellW + Math.random() * (marginVw * SAKURA_POSITION_JITTER_RATIO)}vw`,
    y: `${row * cellH + Math.random() * (marginVh * SAKURA_POSITION_JITTER_RATIO)}vh`,
  }));
}

const tanabataPositions = [
  { x: "900px", y: "80px" },
  { x: "1000px", y: "300px" },
  { x: "720px", y: "230px" },
  { x: "460px", y: "460px" },
  { x: "620px", y: "393px" },
  { x: "730px", y: "460px" },
  { x: "160px", y: "600px" },
  { x: "380px", y: "650px" },
  { x: "560px", y: "650px" },
  { x: "500px", y: "810px" },
];

export const TanzakuToImage: React.FC = () => {
  const mode = useAtomValue(festivalModeAtom);
  const isSakura = mode === "sakura";
  const cardLimit = isSakura ? SAKURA_CARD_LIMIT : TANABATA_CARD_LIMIT;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tanzakuArray, setTanzakuArray] = useState<TanzakuItem[]>([]);
  const [sakuraPositions, setSakuraPositions] = useState<Position[]>([]);

  useEffect(() => {
    const fetchTanzaku = async () => {
      try {
        const tanzakuData = await getRecentTanzaku(cardLimit);
        if (!tanzakuData) {
          throw new Error("データの取得に失敗しました");
        }
        setTanzakuArray(tanzakuData as TanzakuItem[]);
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
    setSakuraPositions(generateSakuraPositions(tanzakuArray.length));
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
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "auto",
          height: "100vh",
          display: "block",
        }}
      />
      {canPlaceCards &&
        tanzakuArray.map((tanzaku, index) => {
          const positionIndex = index % positionArray.length;
          return (
            <CreateTanzaku
              key={tanzaku.id}
              mode={mode}
              textLine1={tanzaku.textLine1}
              textLine2={tanzaku.textLine2}
              nameLine={tanzaku.userName}
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
