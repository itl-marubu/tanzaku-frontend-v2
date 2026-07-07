// 管理画面の一覧フィルタ・ソート・統計の純粋ロジック
// （旧 manage.ts インラインJSの挙動を移植）

import type { ManageEvent, ManageTanzaku } from "@/api/adminClient";

export type StatusFilter = "all" | "valid" | "invalid" | "deleted";
export type EventFilter = "all" | "null" | string;
export type SortColumn =
  | "id"
  | "content"
  | "userName"
  | "validationResult"
  | "event"
  | "createdAt";
export type SortDirection = "asc" | "desc";

export function filterTanzakus(
  list: ManageTanzaku[],
  status: StatusFilter,
  eventFilter: EventFilter,
  searchTerm: string,
): ManageTanzaku[] {
  let result = list;

  if (status === "valid") {
    result = result.filter((t) => t.validationResult === 0 && !t.logicalDelete);
  } else if (status === "invalid") {
    result = result.filter((t) => t.validationResult === 1 && !t.logicalDelete);
  } else if (status === "deleted") {
    result = result.filter((t) => t.logicalDelete);
  }

  if (eventFilter === "null") {
    result = result.filter((t) => t.eventId == null);
  } else if (eventFilter !== "all") {
    result = result.filter((t) => t.eventId === eventFilter);
  }

  const term = searchTerm.toLowerCase();
  if (term) {
    result = result.filter(
      (t) =>
        t.content.toLowerCase().includes(term) ||
        t.userName.toLowerCase().includes(term),
    );
  }

  return result;
}

export function sortTanzakus(
  list: ManageTanzaku[],
  column: SortColumn,
  direction: SortDirection,
): ManageTanzaku[] {
  return list.slice().sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;
    if (column === "event") {
      aVal = a.event ? a.event.name : "";
      bVal = b.event ? b.event.name : "";
    } else {
      aVal = a[column] ?? "";
      bVal = b[column] ?? "";
    }
    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

export type TanzakuStats = {
  total: number;
  valid: number;
  invalid: number;
  deleted: number;
  scopeLabel: string;
};

// 統計はアクティブなイベントの短冊だけを集計する。
// アクティブなイベントが無い場合は、公開ウォール側の挙動に合わせて
// レガシー分（eventId が無い短冊）を集計する。
export function computeStats(
  list: ManageTanzaku[],
  events: ManageEvent[],
): TanzakuStats {
  const activeEvent = events.find((e) => e.isActive) ?? null;
  const activeEventId = activeEvent ? activeEvent.id : null;
  const scoped = list.filter((t) => (t.eventId ?? null) === activeEventId);

  return {
    total: scoped.length,
    valid: scoped.filter((t) => t.validationResult === 0 && !t.logicalDelete)
      .length,
    invalid: scoped.filter((t) => t.validationResult === 1 && !t.logicalDelete)
      .length,
    deleted: scoped.filter((t) => t.logicalDelete).length,
    scopeLabel: activeEvent
      ? `集計対象: ${activeEvent.name}（アクティブイベント）`
      : "集計対象: レガシー分（アクティブイベントなし）",
  };
}
