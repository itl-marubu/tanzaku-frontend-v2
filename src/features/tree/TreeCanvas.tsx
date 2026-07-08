import { type DisplayTanzaku, getRecentTanzaku } from "@/api/client";
import { TanzakuCanvas } from "@/components/TanzakuCanvas";
import { useFestivalMode } from "@/lib/activeMode";
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

// 七夕モード限定: 短冊の1枚を特別イラストに差し替える演出（origin/main由来）
const TANABATA_ITHIEL_IMAGE_SRC = "/tanabata-ithiel.png";

// リクエストIDガード: fetch開始時に採番したIDが、応答適用時点での「最新の
// リクエストID」と一致する場合のみ採用する。60秒ポーリングで遅延した古い
// レスポンス(窓k)が新しいレスポンス(窓k+1)より後に解決しても、この判定で
// 古いバッチによる上書き（壁面表示の巻き戻り）を防げる。
export function isLatestRequest(
  requestId: number,
  latestRequestId: number,
): boolean {
  return requestId === latestRequestId;
}

// 旧 t2i.tsx (TanzakuToImage) の移植。配置計算は lib/treeLayout の
// 純粋関数へ委譲し、背景描画・ポーリングをここで担う。
export const TreeCanvas: React.FC = () => {
  const { mode, refresh } = useFestivalMode();
  const isSakura = mode === "sakura";
  const cardLimit = isSakura ? SAKURA_CARD_LIMIT : TANABATA_CARD_LIMIT;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tanzakuArray, setTanzakuArray] = useState<DisplayTanzaku[]>([]);
  const [sakuraPositions, setSakuraPositions] = useState<Position[]>([]);
  const [ithielCardIndex, setIthielCardIndex] = useState<number | null>(null);

  // クライアント駆動カーソル: seed はマウント時に一度だけ生成（リロード = 新seed
  // = 即・別バッチ）。window は0起点でフェッチのたびにインクリメントする。
  // どちらも useRef のためモード切替の effect 再実行を跨いで維持される。
  const seedRef = useRef(Math.random().toString(36).slice(2, 10));
  const windowRef = useRef(0);
  // 単調増加のリクエストID。fetch開始時に採番し、応答適用直前に
  // isLatestRequest で「今も最新か」を確認する（古ければ破棄）。
  const latestRequestRef = useRef(0);

  useEffect(() => {
    const fetchTanzaku = async () => {
      const requestId = ++latestRequestRef.current;
      try {
        const tanzakuData = await getRecentTanzaku(cardLimit, {
          window: windowRef.current,
          seed: seedRef.current,
        });
        if (!tanzakuData) {
          throw new Error("データの取得に失敗しました");
        }
        if (!isLatestRequest(requestId, latestRequestRef.current)) return;
        setTanzakuArray(tanzakuData);
      } catch (error) {
        if (!isLatestRequest(requestId, latestRequestRef.current)) return;
        console.error("短冊データの取得に失敗しました:", error);
        alert("問題が発生しました。\n エラーコード: geterr2");
      }
    };

    // 短冊の再取得と同じ周期でフェスティバルモード(/config)も再取得し、
    // 管理画面からの切り替えがリロードなしで反映されるようにする。
    fetchTanzaku();
    refresh();
    const interval = setInterval(() => {
      windowRef.current += 1;
      fetchTanzaku();
      refresh();
    }, FETCH_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      // 依存変更(モード切替)やアンマウントで effect が終了する際、進行中の
      // fetch が残っていれば ID を進めて「最新ではない」ものとして無効化する。
      // これにより isLatestRequest ガード1つで巻き戻り・クリーンアップ後の
      // setState の両方を防げる。
      latestRequestRef.current += 1;
    };
  }, [cardLimit, refresh]);

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
    if (isSakura || tanzakuArray.length === 0) {
      setIthielCardIndex(null);
      return;
    }

    setIthielCardIndex(Math.floor(Math.random() * tanzakuArray.length));
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
          const cardStyle = {
            position: "absolute" as const,
            ...(isSakura
              ? { width: `${SAKURA_CARD_WIDTH_VW}vw`, height: "auto" }
              : { height: "220px", width: "auto" }),
            left: positionArray[positionIndex].x,
            top: positionArray[positionIndex].y,
          };

          if (!isSakura && index === ithielCardIndex) {
            return (
              <img
                key={`${tanzaku.id}-ithiel`}
                src={TANABATA_ITHIEL_IMAGE_SRC}
                alt=""
                aria-hidden="true"
                className="animate-yureru"
                style={{
                  ...cardStyle,
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
              />
            );
          }

          return (
            <TanzakuCanvas
              key={tanzaku.id}
              mode={mode}
              textLine1={tanzaku.textLine1}
              textLine2={tanzaku.textLine2}
              nameLine={tanzaku.userName ?? ""}
              style={cardStyle}
            />
          );
        })}
    </>
  );
};
