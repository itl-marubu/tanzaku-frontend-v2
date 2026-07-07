import {
  AdminApiError,
  type ManageEvent,
  type ManageTanzaku,
  type TanzakuOperation,
  activateEvent,
  createEvent,
  createManageTanzaku,
  deactivateAllEvents,
  editTanzakus,
  getEvents,
  getTanzakus,
} from "@/api/adminClient";
import { useAdminAuth } from "@/lib/adminAuth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EditModal, type TanzakuFormValues } from "./EditModal";
import { EventSection } from "./EventSection";
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
const dangerBtn =
  "cursor-pointer rounded bg-[#e74c3c] px-4 py-2 text-sm text-white transition-all hover:opacity-80";
const smallBtn = "px-2 py-1 text-xs";

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; tanzaku: ManageTanzaku }
  | null;

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState>(null);

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

  // ---- 更新系操作 ----

  const runOperations = useCallback(
    async (operations: TanzakuOperation[], successText: string) => {
      if (!credentials) return;
      try {
        await editTanzakus(credentials, operations);
        showMessage("success", successText);
        setSelectedIds(new Set());
        await loadData();
      } catch (error) {
        handleError(error, "エラー: 更新に失敗しました");
      }
    },
    [credentials, handleError, loadData, showMessage],
  );

  const handleDelete = (id: string) => {
    if (!confirm("この短冊を削除しますか？")) return;
    runOperations([{ id, operation: "delete" }], "削除しました");
  };

  const handleHardDelete = (id: string) => {
    if (!confirm("この短冊を完全削除しますか？この操作は元に戻せません。"))
      return;
    runOperations([{ id, operation: "hardDelete" }], "完全削除しました");
  };

  const handleToggleValidation = (tanzaku: ManageTanzaku) => {
    runOperations(
      [
        {
          id: tanzaku.id,
          operation: "update",
          validationResult: tanzaku.validationResult === 0 ? 1 : 0,
        },
      ],
      "バリデーション結果を更新しました",
    );
  };

  const selectedList = [...selectedIds];

  const handleBulkDelete = () => {
    if (selectedList.length === 0) return;
    if (!confirm(`${selectedList.length}件の短冊を削除しますか？`)) return;
    runOperations(
      selectedList.map((id) => ({ id, operation: "delete" as const })),
      `${selectedList.length}件を削除しました`,
    );
  };

  const handleBulkHardDelete = () => {
    if (selectedList.length === 0) return;
    if (
      !confirm(
        `${selectedList.length}件の短冊を完全削除しますか？この操作は元に戻せません。`,
      )
    )
      return;
    runOperations(
      selectedList.map((id) => ({ id, operation: "hardDelete" as const })),
      `${selectedList.length}件を完全削除しました`,
    );
  };

  const handleBulkMarkValid = () => {
    if (selectedList.length === 0) return;
    runOperations(
      selectedList.map((id) => ({
        id,
        operation: "update" as const,
        validationResult: 0,
      })),
      `${selectedList.length}件を適切に設定しました`,
    );
  };

  const handleBulkMarkInvalid = () => {
    if (selectedList.length === 0) return;
    runOperations(
      selectedList.map((id) => ({
        id,
        operation: "update" as const,
        validationResult: 1,
      })),
      `${selectedList.length}件を不適切に設定しました`,
    );
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allSelected =
    sortedTanzaku.length > 0 &&
    sortedTanzaku.every((t) => selectedIds.has(t.id));

  const handleToggleSelectAll = () => {
    setSelectedIds(
      allSelected ? new Set() : new Set(sortedTanzaku.map((t) => t.id)),
    );
  };

  // ---- イベント管理 ----

  const handleCreateEvent = async (name: string, description: string) => {
    if (!credentials) return;
    try {
      await createEvent(
        credentials,
        description ? { name, description } : { name },
      );
      showMessage("success", "イベントを作成しました");
      await loadData();
    } catch (error) {
      handleError(error, "エラー: 作成に失敗しました");
    }
  };

  const handleActivateEvent = async (id: string) => {
    if (!credentials) return;
    try {
      await activateEvent(credentials, id);
      showMessage("success", "イベントを切り替えました");
      await loadData();
    } catch (error) {
      handleError(error, "エラー: 切り替えに失敗しました");
    }
  };

  const handleDeactivateAll = async () => {
    if (!credentials) return;
    try {
      await deactivateAllEvents(credentials);
      showMessage("success", "イベントを無効にしました");
      await loadData();
    } catch (error) {
      handleError(error, "エラー: 無効化に失敗しました");
    }
  };

  const handleModalSubmit = async (values: TanzakuFormValues) => {
    if (!credentials || !modal) return;
    try {
      if (modal.mode === "edit") {
        await editTanzakus(credentials, [
          {
            id: modal.tanzaku.id,
            operation: "update",
            content: values.content,
            userName: values.userName,
            validationResult: values.validationResult,
            eventId: values.eventId,
          },
        ]);
        showMessage("success", "短冊を更新しました");
      } else {
        await createManageTanzaku(credentials, {
          content: values.content,
          userName: values.userName,
          validationResult: values.validationResult,
          eventId: values.eventId,
        });
        showMessage("success", "新しい短冊を作成しました");
      }
      setModal(null);
      await loadData();
    } catch (error) {
      handleError(
        error,
        modal.mode === "edit"
          ? "エラー: 更新に失敗しました"
          : "エラー: 作成に失敗しました",
      );
    }
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

        <EventSection
          events={allEvents}
          onCreate={handleCreateEvent}
          onActivate={handleActivateEvent}
          onDeactivateAll={handleDeactivateAll}
          onValidationError={(text) => showMessage("error", text)}
        />

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
              onClick={() => setModal({ mode: "create" })}
              className={primaryBtn}
            >
              新規作成
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
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-[#bdc3c7] bg-[#ecf0f1] p-4">
              <label className="mr-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleSelectAll}
                />
                全選択
              </label>
              <button
                type="button"
                onClick={handleBulkDelete}
                className={dangerBtn}
              >
                選択項目を削除
              </button>
              <button
                type="button"
                onClick={handleBulkHardDelete}
                className={dangerBtn}
              >
                選択項目を完全削除
              </button>
              <button
                type="button"
                onClick={handleBulkMarkValid}
                className={primaryBtn}
              >
                選択項目を適切にする
              </button>
              <button
                type="button"
                onClick={handleBulkMarkInvalid}
                className={warningBtn}
              >
                選択項目を不適切にする
              </button>
            </div>
          )}
          <TanzakuTable
            tanzakus={sortedTanzaku}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSortBy={handleSortBy}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            renderActions={(tanzaku) => (
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setModal({ mode: "edit", tanzaku })}
                  className={`${primaryBtn} ${smallBtn}`}
                >
                  編集
                </button>
                {!tanzaku.logicalDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(tanzaku.id)}
                    className={`${dangerBtn} ${smallBtn}`}
                  >
                    削除
                  </button>
                )}
                {tanzaku.logicalDelete && (
                  <button
                    type="button"
                    onClick={() => handleHardDelete(tanzaku.id)}
                    className={`${dangerBtn} ${smallBtn}`}
                  >
                    完全削除
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleToggleValidation(tanzaku)}
                  className={`${primaryBtn} ${smallBtn}`}
                >
                  {tanzaku.validationResult === 0
                    ? "不適切にする"
                    : "適切にする"}
                </button>
              </div>
            )}
          />
        </div>
      </div>

      {modal && (
        <EditModal
          title={modal.mode === "edit" ? "短冊を編集" : "新規短冊作成"}
          submitLabel={modal.mode === "edit" ? "更新" : "作成"}
          initial={
            modal.mode === "edit"
              ? {
                  content: modal.tanzaku.content,
                  userName: modal.tanzaku.userName,
                  validationResult: modal.tanzaku.validationResult,
                  eventId: modal.tanzaku.eventId,
                }
              : {
                  content: "",
                  userName: "",
                  validationResult: 0,
                  eventId: null,
                }
          }
          events={allEvents}
          onClose={() => setModal(null)}
          onSubmit={handleModalSubmit}
          onValidationError={(text) => showMessage("error", text)}
        />
      )}
    </div>
  );
};
