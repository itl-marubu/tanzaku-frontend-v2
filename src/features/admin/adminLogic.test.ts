import type { ManageEvent, ManageTanzaku } from "@/api/adminClient";
import { describe, expect, it } from "vitest";
import { buildCsvFilename, buildTanzakuCsv } from "./csvExport";
import { computeStats, filterTanzakus, sortTanzakus } from "./tanzakuFilters";

const makeTanzaku = (
  overrides: Partial<ManageTanzaku> & { id: string },
): ManageTanzaku => ({
  content: "テスト",
  userName: "太郎",
  validationResult: 0,
  logicalDelete: false,
  createdAt: "2026-07-01T00:00:00.000Z",
  eventId: null,
  event: null,
  ...overrides,
});

const makeEvent = (
  overrides: Partial<ManageEvent> & { id: string },
): ManageEvent => ({
  name: "七夕2026",
  description: null,
  isActive: false,
  createdAt: "2026-06-01T00:00:00.000Z",
  _count: { tanzakus: 0 },
  ...overrides,
});

const list: ManageTanzaku[] = [
  makeTanzaku({ id: "a", content: "願いごと", userName: "花子" }),
  makeTanzaku({ id: "b", validationResult: 1 }),
  makeTanzaku({ id: "c", logicalDelete: true }),
  makeTanzaku({
    id: "d",
    eventId: "ev1",
    event: { id: "ev1", name: "七夕2026" },
    createdAt: "2026-07-02T00:00:00.000Z",
  }),
];

describe("filterTanzakus", () => {
  it("all は全件", () => {
    expect(filterTanzakus(list, "all", "all", "")).toHaveLength(4);
  });

  it("valid は適切かつ未削除のみ", () => {
    const result = filterTanzakus(list, "valid", "all", "");
    expect(result.map((t) => t.id)).toEqual(["a", "d"]);
  });

  it("invalid は不適切かつ未削除のみ", () => {
    expect(filterTanzakus(list, "invalid", "all", "").map((t) => t.id)).toEqual(
      ["b"],
    );
  });

  it("deleted は論理削除のみ", () => {
    expect(filterTanzakus(list, "deleted", "all", "").map((t) => t.id)).toEqual(
      ["c"],
    );
  });

  it("イベントフィルタ null はレガシーのみ", () => {
    expect(filterTanzakus(list, "all", "null", "")).toHaveLength(3);
  });

  it("イベントフィルタ ID 指定", () => {
    expect(filterTanzakus(list, "all", "ev1", "").map((t) => t.id)).toEqual([
      "d",
    ]);
  });

  it("検索は content / userName の部分一致（大文字小文字無視）", () => {
    expect(filterTanzakus(list, "all", "all", "願い").map((t) => t.id)).toEqual(
      ["a"],
    );
    expect(filterTanzakus(list, "all", "all", "花子").map((t) => t.id)).toEqual(
      ["a"],
    );
  });
});

describe("sortTanzakus", () => {
  it("createdAt 降順（デフォルト表示順）", () => {
    const sorted = sortTanzakus(list, "createdAt", "desc");
    expect(sorted[0].id).toBe("d");
  });

  it("event 列はイベント名でソート（なしは空文字）", () => {
    const sorted = sortTanzakus(list, "event", "desc");
    expect(sorted[0].id).toBe("d");
  });

  it("元の配列を破壊しない", () => {
    const original = [...list];
    sortTanzakus(list, "id", "asc");
    expect(list).toEqual(original);
  });
});

describe("computeStats", () => {
  it("アクティブイベントなしはレガシー分を集計", () => {
    const stats = computeStats(list, [makeEvent({ id: "ev1" })]);
    expect(stats.total).toBe(3);
    expect(stats.valid).toBe(1);
    expect(stats.invalid).toBe(1);
    expect(stats.deleted).toBe(1);
    expect(stats.scopeLabel).toContain("レガシー");
  });

  it("アクティブイベントありはそのイベントのみ集計", () => {
    const stats = computeStats(list, [
      makeEvent({ id: "ev1", isActive: true }),
    ]);
    expect(stats.total).toBe(1);
    expect(stats.valid).toBe(1);
    expect(stats.scopeLabel).toContain("七夕2026");
  });
});

describe("buildTanzakuCsv", () => {
  it("BOM付き・日本語ヘッダー", () => {
    const csv = buildTanzakuCsv([list[0]]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("ID,内容,ユーザー名,バリデーション結果");
    expect(csv).toContain('"願いごと"');
  });

  it("ダブルクォートをエスケープ", () => {
    const csv = buildTanzakuCsv([
      makeTanzaku({ id: "q", content: 'say "hi"' }),
    ]);
    expect(csv).toContain('"say ""hi"""');
  });
});

describe("buildCsvFilename", () => {
  it("tanzaku_data_YYYYMMDD_HHMM.csv 形式", () => {
    const name = buildCsvFilename(new Date(2026, 6, 7, 9, 5));
    expect(name).toBe("tanzaku_data_20260707_0905.csv");
  });
});
