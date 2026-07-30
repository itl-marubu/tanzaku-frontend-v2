import { describe, expect, it } from "vitest";
import { isAbortError, isLatestRequest } from "./TreeCanvas";

describe("isLatestRequest", () => {
  it("採番したIDが依然として最新なら採用する", () => {
    expect(isLatestRequest(1, 1)).toBe(true);
  });

  it("後続のリクエストが発行済みなら古いレスポンスとして破棄する", () => {
    // 窓kのfetch(id=1)より先に窓k+1のfetch(id=2)が解決したケース
    expect(isLatestRequest(1, 2)).toBe(false);
  });

  it("effectクリーンアップでIDが進められた後は破棄する", () => {
    // アンマウント/依存変更のクリーンアップで latestRequestId が
    // 進められた場合、進行中だったfetchの応答は最新扱いされない
    expect(isLatestRequest(3, 4)).toBe(false);
  });
});

describe("isAbortError", () => {
  it("タイムアウト(TimeoutError)は中断扱いにする", () => {
    expect(isAbortError(new DOMException("timed out", "TimeoutError"))).toBe(
      true,
    );
  });

  it("中断(AbortError)は中断扱いにする", () => {
    expect(isAbortError(new DOMException("aborted", "AbortError"))).toBe(true);
  });

  it("通常のエラーは中断扱いにしない（alertで運営に気付かせる）", () => {
    expect(isAbortError(new Error("データの取得に失敗しました"))).toBe(false);
    expect(isAbortError(new DOMException("boom", "SyntaxError"))).toBe(false);
  });
});
