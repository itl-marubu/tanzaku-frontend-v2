import { createSingleFlight } from "@/lib/singleFlight";
import { describe, expect, it } from "vitest";

// 手動で解決できる Promise（レイテンシがポーリング間隔を超える状況の再現用）
function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("createSingleFlight", () => {
  it("実行中に呼ばれた分は task を起動せず見送る", async () => {
    const runExclusive = createSingleFlight();
    const first = deferred();
    let calls = 0;

    const running = runExclusive(async () => {
      calls += 1;
      await first.promise;
    });

    // ポーリング間隔が来ても前回が未完了なので起動しない
    const countUp = async () => {
      calls += 1;
    };
    await expect(runExclusive(countUp)).resolves.toBe(false);
    await expect(runExclusive(countUp)).resolves.toBe(false);
    expect(calls).toBe(1);

    first.resolve();
    await expect(running).resolves.toBe(true);
  });

  it("完了後は再び起動できる（見送りが続いても回復する）", async () => {
    const runExclusive = createSingleFlight();
    const first = deferred();
    let calls = 0;

    const countUp = async () => {
      calls += 1;
    };
    const running = runExclusive(async () => {
      calls += 1;
      await first.promise;
    });
    await expect(runExclusive(countUp)).resolves.toBe(false);

    first.resolve();
    await running;

    await expect(runExclusive(countUp)).resolves.toBe(true);
    expect(calls).toBe(2);
  });

  it("task が失敗しても次回の起動をブロックしない", async () => {
    const runExclusive = createSingleFlight();

    await expect(
      runExclusive(async () => {
        throw new Error("network down");
      }),
    ).rejects.toThrow("network down");

    let called = false;
    await expect(
      runExclusive(async () => {
        called = true;
      }),
    ).resolves.toBe(true);
    expect(called).toBe(true);
  });
});
