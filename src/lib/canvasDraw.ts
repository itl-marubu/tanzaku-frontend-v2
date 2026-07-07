// 短冊カードのCanvas描画（旧 createTanzaku/index.tsx から移植した純粋関数）。
// 座標・回転85°・フォント指定は掲示物の見た目そのものなので変更しない。

export const TANABATA_CANVAS = { width: 300, height: 500 } as const;
export const SAKURA_CANVAS = { width: 375, height: 225 } as const;

export const TANZAKU_FONT = "Yuji Syuku, HG正楷書体-PRO, serif";

export type TanzakuTextInput = {
  textLine1: string;
  textLine2?: string;
  nameLine: string;
};

export function drawTanabataCard(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  { textLine1, textLine2, nameLine }: TanzakuTextInput,
) {
  if (!image) return;
  ctx.drawImage(image, 0, 0, 300, 500);
  ctx.save();
  ctx.translate(45, 100);
  ctx.rotate((85 * Math.PI) / 180);
  ctx.canvas.style.writingMode = "vertical-rl";
  ctx.font = `50px ${TANZAKU_FONT}`;
  ctx.fillStyle = "black";
  ctx.fillText(textLine1, 25, -110);
  ctx.fillText(textLine2 || "", 40, -50);
  ctx.font = `30px ${TANZAKU_FONT}`;
  ctx.fillText(nameLine, 150, -10);
  ctx.restore();
}

export function drawSakuraCard(
  ctx: CanvasRenderingContext2D,
  { textLine1, textLine2, nameLine }: TanzakuTextInput,
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

  ctx.font = `bold 36px ${TANZAKU_FONT}`;
  ctx.fillText(textLine1, 250 * scale, line1Y);

  if (hasLine2) {
    ctx.fillText(textLine2, 250 * scale, 170 * scale);
  }

  ctx.font = `22px ${TANZAKU_FONT}`;
  ctx.fillStyle = "#6b3a5a";
  ctx.fillText(nameLine, 250 * scale, 240 * scale);
}
