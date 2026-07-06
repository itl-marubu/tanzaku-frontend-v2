// 桜モードのカード配置アルゴリズム（旧 t2i.tsx から移植）。
// viewport と乱数生成器を注入することでテスト可能な純粋関数にしている。
// セル分割・幹回避・最遠セル貪欲選択・ジッターのロジックは旧実装と同一。

export type Position = { x: string; y: string };

export type Viewport = {
  innerWidth: number;
  innerHeight: number;
};

export type Rng = () => number;

type SakuraCell = {
  col: number;
  row: number;
  centerXVw: number;
  centerYVh: number;
  allowed: boolean;
};

export const SAKURA_CARD_WIDTH_VW = 10.5;
export const SAKURA_CARD_ASPECT_RATIO = 225 / 375;
export const SAKURA_CARD_LIMIT = 14;
export const TANABATA_CARD_LIMIT = 10;
export const FETCH_INTERVAL_MS = 60_000;
export const SAKURA_FALLBACK_BG_WIDTH = 1200;
export const SAKURA_FALLBACK_BG_HEIGHT = 1000;
const SAKURA_POSITION_JITTER_RATIO = 0.7;
const SAKURA_MARGIN_TOP_VH = 5;
const SAKURA_MARGIN_LEFT_VH = 5;

const squaredDistance = (a: SakuraCell, b: SakuraCell) => {
  const dx = a.centerXVw - b.centerXVw;
  const dy = a.centerYVh - b.centerYVh;
  return dx * dx + dy * dy;
};

// カードのアスペクト比: 375:225 = 5:3
// ビューポートサイズに応じてカード高さ(vh)を動的計算し、セルサイズを決定する
export function generateSakuraPositions(
  count: number,
  viewport: Viewport,
  rng: Rng = Math.random,
): Position[] {
  const cardWvw = SAKURA_CARD_WIDTH_VW;
  const cardWpx = (viewport.innerWidth * cardWvw) / 100;
  const cardHpx = cardWpx * SAKURA_CARD_ASPECT_RATIO;
  const cardHvh = (cardHpx / viewport.innerHeight) * 100;
  const leftMarginVw =
    ((viewport.innerHeight * SAKURA_MARGIN_LEFT_VH) /
      100 /
      viewport.innerWidth) *
    100;
  const topMarginVh = SAKURA_MARGIN_TOP_VH;

  const marginVw = 2;
  const marginVh = 2;
  const cellW = cardWvw + marginVw; // カード幅 + 左右余白
  const cellH = cardHvh + marginVh; // 実測カード高さ + マージン

  // 右パネル(ロゴ・QRコード)が width:35% で固定されているため左 60vw 以内に収める
  const maxWidthVw = 60 - leftMarginVw;
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
    const centerXVw = leftMarginVw + col * cellW + cardWvw / 2;
    const centerYVh = topMarginVh + row * cellH + cardHvh / 2;

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
        inCanopy && !inTrunk && !inTopLeftBlockedCell && !inTopRightBlockedCell,
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
  const firstIndex = Math.floor(rng() * remaining.length);
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
      const score = minDistSq + rng() * 0.0001;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    selected.push(remaining.splice(bestIndex, 1)[0]);
  }

  // ジッターは margin の範囲内に収めるので重なりは発生しない
  return selected.map(({ col, row }) => ({
    x: `${leftMarginVw + col * cellW + rng() * (marginVw * SAKURA_POSITION_JITTER_RATIO)}vw`,
    y: `${topMarginVh + row * cellH + rng() * (marginVh * SAKURA_POSITION_JITTER_RATIO)}vh`,
  }));
}

// 七夕モードの固定配置（笹画像の形に合わせた手調整値）
export const tanabataPositions: Position[] = [
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
