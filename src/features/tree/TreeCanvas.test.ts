import { describe, expect, it } from "vitest";
import { isLatestRequest } from "./TreeCanvas";

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
