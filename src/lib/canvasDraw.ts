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
  // 回転後の座標系は +x が行の進む向き（短冊の下方向）。縦書きは
  // fillVerticalText で一文字ずつ正立させて描く（理由は同関数のコメント参照）。
  ctx.fillStyle = "black";
  fillVerticalText(ctx, textLine1, 25, -110, 50);
  fillVerticalText(ctx, textLine2 || "", 40, -50, 50);
  fillVerticalText(ctx, nameLine, 150, -10, 30);
  ctx.restore();
}

// 縦書きでも横倒しのまま描く文字（伸ばし棒・ダッシュ・括弧類など）
const SIDEWAYS_CHARS = /[ー－―—‐~～〜…‥()（）「」『』【】［］[\]〔〕＜＞<>＝=]/;
// 縦書きで字面の右上に寄せる文字
const SMALL_KANA = /[ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶ]/;
const PUNCTUATION = /[、。，．]/;
const HALF_WIDTH = /^[\x20-\x7e]$/;

export type VerticalGlyph =
  | { kind: "sideways" }
  | { kind: "upright"; shiftUp: number; shiftRight: number };

// 1文字を縦書きでどう置くかを決める純粋関数。shift は文字サイズに対する比率。
export function verticalGlyph(ch: string): VerticalGlyph {
  if (HALF_WIDTH.test(ch) || SIDEWAYS_CHARS.test(ch)) {
    return { kind: "sideways" };
  }
  if (PUNCTUATION.test(ch)) {
    return { kind: "upright", shiftUp: 0.55, shiftRight: 0.55 };
  }
  if (SMALL_KANA.test(ch)) {
    return { kind: "upright", shiftUp: 0.08, shiftRight: 0.12 };
  }
  return { kind: "upright", shiftUp: 0, shiftRight: 0 };
}

// 回転済み座標系（+x = 行の進む向き）に、text を縦書きで描く。
//
// 以前は canvas 要素に CSS writing-mode: vertical-rl を付けて fillText の
// 向きを縦にしていたが、これは Chrome 固有の挙動で、Chrome 158 では
// canvas の文字の向きに writing-mode が効かず、文字が横倒しになる
// （Canvas API の文字描画は仕様上つねに横書き）。そこで writing-mode には
// 頼らず、全角文字は1文字ずつ -90° 回して正立させ、伸ばし棒や半角英数は
// 縦書き本来の向き（横倒し）のまま並べる。
// (x, y) は旧実装の fillText と同じ値を受け取り、見た目が旧実装の縦書きと
// 重なるよう列の中心を 0.32 文字ぶん右へ寄せている。
export function fillVerticalText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();
  ctx.font = `${size}px ${TANZAKU_FONT}`;
  ctx.textBaseline = "middle";
  const center = y - size * 0.32;
  let pos = x;
  for (const ch of Array.from(text)) {
    const glyph = verticalGlyph(ch);
    if (glyph.kind === "sideways") {
      const isHalfWidth = HALF_WIDTH.test(ch);
      ctx.textAlign = "left";
      ctx.fillText(ch, pos, center);
      pos += isHalfWidth ? ctx.measureText(ch).width : size;
      continue;
    }
    ctx.save();
    ctx.translate(
      pos + size / 2 - size * glyph.shiftUp,
      center - size * glyph.shiftRight,
    );
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    pos += size;
  }
  ctx.restore();
}

export function drawSakuraCard(
  ctx: CanvasRenderingContext2D,
  { textLine1, textLine2, nameLine }: TanzakuTextInput,
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

  ctx.font = `bold 36px ${TANZAKU_FONT}`;
  ctx.fillText(textLine1, 250 * scale, line1Y);

  if (hasLine2) {
    ctx.fillText(textLine2, 250 * scale, 170 * scale);
  }

  ctx.font = `22px ${TANZAKU_FONT}`;
  ctx.fillStyle = "#6b3a5a";
  ctx.fillText(nameLine, 250 * scale, 240 * scale);
}
