import {
  AdminApiError,
  type ManageEvent,
  type ManageTanzaku,
  getEvents,
  getTanzakus,
} from "@/api/adminClient";
import { useAdminAuth } from "@/lib/adminAuth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StatsCards } from "./StatsCards";
import { TanzakuTable } from "./TanzakuTable";
import { downloadTanzakuCsv } from "./csvExport";
import {
  type EventFilter,
  type SortColumn,
  type SortDirection,
  type StatusFilter,
  computeStats,
  filterTanzakus,
  sortTanzakus,
} from "./tanzakuFilters";

export type AdminMessage = {
  type: "success" | "error" | "info";
  text: string;
} | null;

const messageClass = {
  success: "bg-[#d4edda] text-[#155724]",
  error: "bg-[#f8d7da] text-[#721c24]",
  info: "bg-[#d1ecf1] text-[#0c5460]",
} as const;

const primaryBtn =
  "cursor-pointer rounded bg-[#3498db] px-4 py-2 text-sm text-white transition-all hover:opacity-80";
const warningBtn =
  "cursor-pointer rounded bg-[#f39c12] px-4 py-2 text-sm text-white transition-all hover:opacity-80";

export const AdminDashboard: React.FC = () => {
  const { credentials, logout } = useAdminAuth();
  const [allTanzaku, setAllTanzaku] = useState<ManageTanzaku[]>([]);
  const [allEvents, setAllEvents] = useState<ManageEvent[]>([]);
  const [message, setMessage] = useState<AdminMessage>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [sortColumn, setSortColumn] = useState<SortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const showMessage = useCallback(
    (type: "success" | "error" | "info", text: string) => {
      setMessage({ type, text });
      setTimeout(() => setMessage(null), 3000);
    },
    [],
  );

  const handleError = useCallback(
    (error: unknown, fallback: string) => {
      if (error instanceof AdminApiError && error.status === 401) {
        // 資格情報が無効になった場合は破棄してログインフォームへ戻す
        logout();
        return;
      }
      console.error(error);
      showMessage("error", fallback);
    },
    [logout, showMessage],
  );

  const loadData = useCallback(async () => {
    if (!credentials) return;
    try {
      showMessage("info", "データを読み込み中...");
      const [tanzakus, events] = await Promise.all([
        getTanzakus(credentials),
        getEvents(credentials),
      ]);
      setAllTanzaku(tanzakus);
      setAllEvents(events);
      showMessage("success", "データを更新しました");
    } catch (error) {
      handleError(error, "エラー: データの取得に失敗しました");
    }
  }, [credentials, handleError, showMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTanzaku = useMemo(
    () => filterTanzakus(allTanzaku, statusFilter, eventFilter, searchTerm),
    [allTanzaku, statusFilter, eventFilter, searchTerm],
  );

  const sortedTanzaku = useMemo(
    () => sortTanzakus(filteredTanzaku, sortColumn, sortDirection),
    [filteredTanzaku, sortColumn, sortDirection],
  );

  const stats = useMemo(
    () => computeStats(allTanzaku, allEvents),
    [allTanzaku, allEvents],
  );

  const handleSortBy = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleExportCsv = () => {
    if (filteredTanzaku.length === 0) {
      showMessage("error", "出力するデータがありません");
      return;
    }
    downloadTanzakuCsv(sortedTanzaku);
    showMessage(
      "success",
      `${filteredTanzaku.length}件のデータをCSVで出力しました`,
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#333]">
      <div className="flex items-center justify-between bg-[#2c3e50] px-8 py-4 text-white shadow">
        <h1 className="text-2xl font-semibold">短冊管理画面</h1>
        <button
          type="button"
          onClick={logout}
          className="cursor-pointer rounded bg-[#95a5a6] px-4 py-2 text-sm text-white hover:opacity-80"
        >
          ログアウト
        </button>
      </div>

      <div className="mx-auto max-w-[1200px] p-8">
        {message && (
          <div className={`mb-4 rounded p-4 ${messageClass[message.type]}`}>
            {message.text}
          </div>
        )}

        <StatsCards stats={stats} />

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="内容またはユーザー名で検索..."
              className="w-[300px] rounded border border-[#bdc3c7] p-2 text-sm focus:border-[#3498db] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="cursor-pointer p-2 text-[#7f8c8d] hover:text-[#3498db]"
            >
              ✕
            </button>
            {searchTerm && (
              <span className="ml-4 text-sm text-[#7f8c8d]">
                {filteredTanzaku.length}件の結果
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={loadData} className={primaryBtn}>
              データ更新
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className={primaryBtn}
            >
              CSV出力
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={warningBtn}
            >
              全て表示
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("valid")}
              className={warningBtn}
            >
              適切のみ
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("invalid")}
              className={warningBtn}
            >
              不適切のみ
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("deleted")}
              className={warningBtn}
            >
              削除済みのみ
            </button>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="ml-2 rounded border border-[#bdc3c7] bg-white p-2 text-sm"
            >
              <option value="all">イベント: すべて</option>
              <option value="null">レガシー（なし）</option>
              {allEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                  {ev.isActive ? " ★" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <TanzakuTable
            tanzakus={sortedTanzaku}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSortBy={handleSortBy}
          />
        </div>
      </div>
    </div>
  );
};
