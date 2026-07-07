import {
  SAKURA_CANVAS,
  TANABATA_CANVAS,
  drawSakuraCard,
  drawTanabataCard,
} from "@/lib/canvasDraw";
import type { FestivalMode } from "@/lib/festivalMode";
import { type Ref, useEffect, useRef, useState } from "react";

type TanzakuCanvasProps = {
  textLine1: string;
  textLine2?: string;
  nameLine: string;
  mode?: FestivalMode;
  ref?: Ref<HTMLCanvasElement>;
  // canvasへの描画完了後に呼ばれる。フォント読み込み待ちで描画が
  // 遅延するため、toDataURL等のキャプチャはこのコールバック経由で行う。
  onDraw?: () => void;
} & React.HTMLAttributes<HTMLCanvasElement>;

export function TanzakuCanvas({
  textLine1,
  textLine2,
  nameLine,
  mode = "tanabata",
  ref,
  onDraw,
  ...props
}: TanzakuCanvasProps) {
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
    // Font Loading API 非対応環境では即座にフォールバック描画へ進める
    // （document.fonts.load は未対応だと同期例外になり .catch で拾えない）。
    if (!document.fonts?.load) {
      setFontReadyFor(sample);
      return;
    }

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
      drawTanabataCard(ctx, image, { textLine1, textLine2, nameLine });
    } else {
      drawSakuraCard(ctx, { textLine1, textLine2, nameLine });
    }

    // 描画完了を通知（キャプチャ等のために遅延描画後に呼ぶ）
    onDraw?.();
  }, [
    textLine1,
    textLine2,
    nameLine,
    image,
    imageLoaded,
    fontReady,
    isTanzaku,
    onDraw,
  ]);

  const setRefs = (node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  if (isTanzaku) {
    return (
      <canvas
        {...props}
        ref={setRefs}
        width={TANABATA_CANVAS.width}
        height={TANABATA_CANVAS.height}
        className={["animate-yureru", props.className]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }

  return (
    <canvas
      {...props}
      ref={setRefs}
      width={SAKURA_CANVAS.width}
      height={SAKURA_CANVAS.height}
    />
  );
}
