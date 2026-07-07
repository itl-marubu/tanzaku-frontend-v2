import { describe, expect, it, vi } from "vitest";
import { resolveEnvMode, resolveMode } from "./activeMode";

describe("resolveEnvMode", () => {
  it("未設定ならデフォルト(tanabata)", () => {
    expect(resolveEnvMode(undefined)).toBe("tanabata");
  });

  it("既知の値はそのまま採用", () => {
    expect(resolveEnvMode("tanabata")).toBe("tanabata");
    expect(resolveEnvMode("sakura")).toBe("sakura");
  });

  it("不正な値は console.error してデフォルトへフォールバック", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(resolveEnvMode("nazo")).toBe("tanabata");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("VITE_FESTIVAL_MODE");
    expect(spy.mock.calls[0][0]).toContain("nazo");
    spy.mockRestore();
  });
});

describe("resolveMode", () => {
  it("APIから未取得(undefined)なら現状を維持", () => {
    expect(resolveMode(undefined, "sakura")).toBe("sakura");
    expect(resolveMode(undefined, "tanabata")).toBe("tanabata");
  });

  it("既知の値なら上書きする", () => {
    expect(resolveMode("sakura", "tanabata")).toBe("sakura");
    expect(resolveMode("tanabata", "sakura")).toBe("tanabata");
  });

  it("未知の値は console.error して現状を維持する", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(resolveMode("nazo", "sakura")).toBe("sakura");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("nazo");
    expect(spy.mock.calls[0][0]).toContain("sakura");
    spy.mockRestore();
  });
});
