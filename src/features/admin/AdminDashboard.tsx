import {
  AdminApiError,
  type ManageEvent,
  type ManageTanzaku,
  getEvents,
  getTanzakus,
} from "@/api/adminClient";
import { useAdminAuth } from "@/lib/adminAuth";
import { useCallback, useEffect, useState } from "react";

export type AdminMessage = {
  type: "success" | "error" | "info";
  text: string;
} | null;

const messageClass = {
  success: "bg-[#d4edda] text-[#155724]",
  error: "bg-[#f8d7da] text-[#721c24]",
  info: "bg-[#d1ecf1] text-[#0c5460]",
} as const;

export const AdminDashboard: React.FC = () => {
  const { credentials, logout } = useAdminAuth();
  const [allTanzaku, setAllTanzaku] = useState<ManageTanzaku[]>([]);
  const [allEvents, setAllEvents] = useState<ManageEvent[]>([]);
  const [message, setMessage] = useState<AdminMessage>(null);

  const showMessage = useCallback(
    (type: "success" | "error" | "info", text: string) => {
      setMessage({ type, text });
      setTimeout(() => setMessage(null), 3000);
    },
    [],
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
      if (error instanceof AdminApiError && error.status === 401) {
        // 資格情報が無効になった場合は破棄してログインフォームへ戻す
        logout();
        return;
      }
      showMessage(
        "error",
        `エラー: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [credentials, logout, showMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <div className="rounded-lg bg-white p-6 shadow">
          <p>
            短冊 {allTanzaku.length} 件 / イベント {allEvents.length} 件
          </p>
          <button
            type="button"
            onClick={loadData}
            className="mt-4 cursor-pointer rounded bg-[#3498db] px-4 py-2 text-sm text-white hover:opacity-80"
          >
            データ更新
          </button>
        </div>
      </div>
    </div>
  );
};
