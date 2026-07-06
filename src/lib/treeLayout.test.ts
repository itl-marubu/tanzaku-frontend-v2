import { describe, expect, it } from "vitest";
import {
  SAKURA_CARD_LIMIT,
  generateSakuraPositions,
  tanabataPositions,
} from "./treeLayout";

// 再現可能な簡易乱数（mulberry32）
function seededRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FHD = { innerWidth: 1920, innerHeight: 1080 };

describe("generateSakuraPositions", () => {
  it("count=0 なら空配列", () => {
    expect(generateSakuraPositions(0, FHD, seededRng(1))).toEqual([]);
  });

  it("要求枚数分の座標を返す（セルが足りる場合）", () => {
    const positions = generateSakuraPositions(
      SAKURA_CARD_LIMIT,
      FHD,
      seededRng(42),
    );
    expect(positions).toHaveLength(SAKURA_CARD_LIMIT);
  });

  it("座標は vw/vh 単位の文字列", () => {
    const positions = generateSakuraPositions(3, FHD, seededRng(7));
    for (const p of positions) {
      expect(p.x).toMatch(/vw$/);
      expect(p.y).toMatch(/vh$/);
    }
  });

  it("カードは左60vw以内・上側66vh以内に収まる", () => {
    const positions = generateSakuraPositions(
      SAKURA_CARD_LIMIT,
      FHD,
      seededRng(3),
    );
    for (const p of positions) {
      expect(Number.parseFloat(p.x)).toBeLessThanOrEqual(60);
      // セル上端がキャノピー領域（中心66vh以下）に対応する範囲に収まる
      expect(Number.parseFloat(p.y)).toBeLessThanOrEqual(66);
    }
  });

  it("同じシードなら同じ結果（決定的）", () => {
    const a = generateSakuraPositions(5, FHD, seededRng(99));
    const b = generateSakuraPositions(5, FHD, seededRng(99));
    expect(a).toEqual(b);
  });

  it("セルの重複はない", () => {
    const positions = generateSakuraPositions(
      SAKURA_CARD_LIMIT,
      FHD,
      seededRng(11),
    );
    const keys = positions.map((p) => `${p.x}/${p.y}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("tanabataPositions", () => {
  it("七夕モードは固定10枠", () => {
    expect(tanabataPositions).toHaveLength(10);
  });
});
