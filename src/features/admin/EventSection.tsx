import type { ManageEvent } from "@/api/adminClient";
import { useState } from "react";

type EventSectionProps = {
  events: ManageEvent[];
  onCreate: (name: string, description: string) => Promise<void>;
  onActivate: (id: string) => void;
  onDeactivateAll: () => void;
  onValidationError: (message: string) => void;
};

const thClass = "bg-[#34495e] p-4 text-left font-semibold text-white";

export const EventSection: React.FC<EventSectionProps> = ({
  events,
  onCreate,
  onActivate,
  onDeactivateAll,
  onValidationError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const activeEvent = events.find((e) => e.isActive) ?? null;

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      onValidationError("イベント名は必須です");
      return;
    }
    await onCreate(name, newDescription.trim());
    setNewName("");
    setNewDescription("");
  };

  return (
    <div className="mb-8 overflow-hidden rounded-lg bg-white shadow">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-4 bg-[#34495e] px-6 py-4 text-white select-none"
      >
        <h2 className="text-base font-semibold">イベント管理</h2>
        <span className="text-sm opacity-85">
          アクティブ:{" "}
          {activeEvent ? activeEvent.name : "なし（レガシーデータ表示中）"}
        </span>
        <span className="ml-auto">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div>
          <div className="flex flex-wrap items-center gap-2 border-b border-[#ecf0f1] px-6 py-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="イベント名（例: 七夕2025）"
              className="w-[180px] rounded border border-[#bdc3c7] p-2 text-sm focus:border-[#3498db] focus:outline-none"
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="説明（任意）"
              className="w-[240px] rounded border border-[#bdc3c7] p-2 text-sm focus:border-[#3498db] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreate}
              className="cursor-pointer rounded bg-[#3498db] px-4 py-2 text-sm text-white hover:opacity-80"
            >
              作成
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thClass}>イベント名</th>
                <th className={thClass}>説明</th>
                <th className={thClass}>短冊数</th>
                <th className={thClass}>状態</th>
                <th className={thClass}>作成日時</th>
                <th className={thClass}>操作</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#7f8c8d]">
                    イベントがありません
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-[#ecf0f1] hover:bg-[#f8f9fa]"
                  >
                    <td className="p-4">{event.name}</td>
                    <td className="p-4">{event.description || "-"}</td>
                    <td className="p-4">{event._count.tanzakus}件</td>
                    <td className="p-4">
                      {event.isActive && (
                        <span className="rounded-xl bg-[#d4edda] px-2 py-1 text-xs font-semibold text-[#155724]">
                          アクティブ
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {new Date(event.createdAt).toLocaleString("ja-JP")}
                    </td>
                    <td className="p-4">
                      {event.isActive ? (
                        <button
                          type="button"
                          onClick={onDeactivateAll}
                          className="cursor-pointer rounded bg-[#f39c12] px-4 py-2 text-sm text-white hover:opacity-80"
                        >
                          無効にする
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onActivate(event.id)}
                          className="cursor-pointer rounded bg-[#3498db] px-4 py-2 text-sm text-white hover:opacity-80"
                        >
                          アクティブにする
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
