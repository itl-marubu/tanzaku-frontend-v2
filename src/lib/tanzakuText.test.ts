import { describe, expect, it } from "vitest";
import { splitTanzakuText } from "./tanzakuText";

describe("splitTanzakuText", () => {
  it("7文字以下は1行目のみ", () => {
    expect(splitTanzakuText("こんにちは")).toEqual({
      line1: "こんにちは",
      line2: "",
    });
  });

  it("ちょうど7文字は1行目のみ", () => {
    expect(splitTanzakuText("あいうえおかき")).toEqual({
      line1: "あいうえおかき",
      line2: "",
    });
  });

  it("8文字以上は7文字で分割", () => {
    expect(splitTanzakuText("あいうえおかきく")).toEqual({
      line1: "あいうえおかき",
      line2: "く",
    });
  });

  it("最大14文字は7文字ずつ2行", () => {
    expect(splitTanzakuText("あいうえおかきくけこさしすせ")).toEqual({
      line1: "あいうえおかき",
      line2: "くけこさしすせ",
    });
  });

  it("空文字は両行とも空", () => {
    expect(splitTanzakuText("")).toEqual({ line1: "", line2: "" });
  });
});
