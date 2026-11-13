import { describe, expect, it } from "vitest";
import { verticalGlyph } from "./canvasDraw";

describe("verticalGlyph", () => {
  it("漢字・かなは正立させ、ずらさない", () => {
    for (const ch of ["健", "あ", "ア", "！", "？", "：", "Ｖ"]) {
      expect(verticalGlyph(ch)).toEqual({
        kind: "upright",
        shiftUp: 0,
        shiftRight: 0,
      });
    }
  });

  it("伸ばし棒・波ダッシュ・括弧・三点リーダは横倒しのまま", () => {
    for (const ch of ["ー", "～", "〜", "（", "）", "「", "」", "…"]) {
      expect(verticalGlyph(ch).kind).toBe("sideways");
    }
  });

  it("半角英数・記号は横倒しのまま", () => {
    for (const ch of ["a", "Z", "1", "!", " ", "["]) {
      expect(verticalGlyph(ch).kind).toBe("sideways");
    }
  });

  it("句読点と小書き文字は正立のまま右上へ寄せる", () => {
    for (const ch of ["、", "。", "ょ", "ッ"]) {
      const glyph = verticalGlyph(ch);
      expect(glyph.kind).toBe("upright");
      if (glyph.kind === "upright") {
        expect(glyph.shiftUp).toBeGreaterThan(0);
        expect(glyph.shiftRight).toBeGreaterThan(0);
      }
    }
  });
});
